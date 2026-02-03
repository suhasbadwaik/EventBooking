import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '../lib/api';
import { useAuth } from '../state/auth';
import { ErrorBanner } from '../components/ErrorBanner';
import { fromIsoLike } from '../lib/datetime';
import { openRazorpayCheckout } from '../lib/razorpay';
import type { AvailabilityResponse } from '../lib/types';

const RAZORPAY_KEY = (import.meta as any).env?.VITE_RAZORPAY_KEY ?? '';

export function VenueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const auth = useAuth();
  const qc = useQueryClient();
  const [bookingSlot, setBookingSlot] = useState<AvailabilityResponse | null>(null);
  const [error, setError] = useState<unknown>(null);

  const venueId = id != null ? Number(id) : NaN;
  const canBook = auth.hasRole('CUSTOMER');

  const venueQ = useQuery({
    queryKey: ['venue', venueId],
    queryFn: () => api.getVenueById(venueId, auth.token),
    enabled: Number.isInteger(venueId) && !!auth.token,
  });

  const slotsQ = useQuery({
    queryKey: ['availabilities', 'public', venueId],
    queryFn: () => api.getPublicAvailabilities(venueId),
    enabled: Number.isInteger(venueId),
  });

  const handleBook = async (slot: AvailabilityResponse) => {
    if (!auth.token || !auth.user) {
      nav('/login', { replace: true, state: { from: `/venues/${venueId}` } });
      return;
    }
    if (!canBook) {
      setError(new Error('Only customers can book slots. Log in as a customer to book.'));
      return;
    }
    if (!RAZORPAY_KEY) {
      setError(new Error('Razorpay is not configured. Set VITE_RAZORPAY_KEY.'));
      return;
    }

    setError(null);
    setBookingSlot(slot);

    try {
      const booking = await api.createBooking(auth.token, { availabilityId: slot.id });
      const orderId = booking.razorpayOrderId ?? '';
      const amountInPaise = Math.round((booking.totalAmount ?? 0) * 100);

      if (!orderId || amountInPaise <= 0) {
        throw new Error('Invalid booking response: missing order or amount');
      }

      const rzp = await openRazorpayCheckout({
        key: RAZORPAY_KEY,
        orderId,
        amountInPaise,
        name: 'EventBooking',
        description: `Booking: ${booking.venueName} – ${format(fromIsoLike(booking.startTime) ?? new Date(), 'PPp')}`,
        prefill: { name: `${auth.user.firstName} ${auth.user.lastName}`, email: auth.user.email },
      });

      await api.confirmPayment(auth.token, {
        razorpayOrderId: rzp.razorpay_order_id,
        razorpayPaymentId: rzp.razorpay_payment_id,
        razorpaySignature: rzp.razorpay_signature,
      });

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['availabilities', 'public', venueId] }),
        qc.invalidateQueries({ queryKey: ['bookings', 'my'] }),
      ]);
      nav('/my-bookings');
    } catch (err) {
      setError(err);
    } finally {
      setBookingSlot(null);
    }
  };

  const venue = venueQ.data;
  const slots = slotsQ.data ?? [];
  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE');

  if (venueQ.isLoading || !venue) {
    return (
      <div className="grid">
        {venueQ.error && <ErrorBanner error={venueQ.error} />}
        <div className="card" style={{ gridColumn: 'span 12' }}>
          <div className="subtle">{venueQ.isLoading ? 'Loading…' : 'Venue not found.'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="cardHeader">
          <div>
            <h2 className="title">{venue.name}</h2>
            <div className="subtle">{venue.description}</div>
          </div>
        </div>
        <div className="row" style={{ marginBottom: 16 }}>
          <div className="subtle">
            {venue.address}, {venue.city}, {venue.state} {venue.zipCode}
          </div>
          <div className="subtle">
            ₹{venue.pricePerHour}/hr · Capacity {venue.capacity} · Owner: {venue.ownerName}
          </div>
        </div>
      </div>

      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="cardHeader">
          <h3 className="title">Available slots</h3>
        </div>
        {(venueQ.error || slotsQ.error || error) && (
          <ErrorBanner error={venueQ.error ?? slotsQ.error ?? error} />
        )}
        {slotsQ.isLoading ? (
          <div className="subtle">Loading slots…</div>
        ) : availableSlots.length === 0 ? (
          <div className="subtle">No available slots.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Start</th>
                <th>End</th>
                <th>Venue</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {availableSlots.map((s) => {
                const start = fromIsoLike(s.startTime);
                const end = fromIsoLike(s.endTime);
                const busy = bookingSlot?.id === s.id;
                return (
                  <tr key={s.id}>
                    <td>{start ? format(start, 'PPp') : s.startTime}</td>
                    <td>{end ? format(end, 'PPp') : s.endTime}</td>
                    <td>{s.venueName}</td>
                    <td>
                      {auth.token && canBook ? (
                        <button
                          className="btn btnPrimary"
                          disabled={busy}
                          onClick={() => handleBook(s)}
                        >
                          {busy ? 'Processing…' : 'Book'}
                        </button>
                      ) : !auth.token ? (
                        <Link className="btn btnPrimary" to="/login" state={{ from: `/venues/${venueId}` }}>
                          Login to book
                        </Link>
                      ) : (
                        <span className="subtle">Only customers can book. Log in as a customer.</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

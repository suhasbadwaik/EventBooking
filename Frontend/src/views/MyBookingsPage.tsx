import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '../lib/api';
import { useAuth } from '../state/auth';
import { ErrorBanner } from '../components/ErrorBanner';
import { fromIsoLike } from '../lib/datetime';
import type { BookingStatus } from '../lib/types';

export function MyBookingsPage() {
  const auth = useAuth();
  const qc = useQueryClient();
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const token = auth.token!;

  const bookingsQ = useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: () => api.getMyBookings(token),
  });

  const cancelMu = useMutation({
    mutationFn: (id: number) => api.cancelBooking(token, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings', 'my'] });
      setCancellingId(null);
    },
    onError: () => setCancellingId(null),
  });

  const handleCancel = (id: number) => {
    if (!window.confirm('Cancel this booking? The slot will be released.')) return;
    setCancellingId(id);
    cancelMu.mutate(id);
  };

  const bookings = bookingsQ.data ?? [];
  const canCancel = (s: BookingStatus) => s === 'PENDING' || s === 'CONFIRMED';

  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="cardHeader">
          <h2 className="title">My bookings</h2>
          <div className="subtle">View and manage your venue bookings</div>
        </div>
        <ErrorBanner error={bookingsQ.error ?? cancelMu.error} />
        {bookingsQ.isLoading ? (
          <div className="subtle">Loading…</div>
        ) : bookings.length === 0 ? (
          <div className="subtle">
            No bookings yet. <Link to="/venues">Browse venues</Link> to book a slot.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>Start</th>
                <th>End</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const start = fromIsoLike(b.startTime);
                const end = fromIsoLike(b.endTime);
                const busy = cancellingId === b.id;
                return (
                  <tr key={b.id}>
                    <td>
                      <Link to={`/venues/${b.venueId}`}>{b.venueName}</Link>
                    </td>
                    <td>{start ? format(start, 'PPp') : String(b.startTime)}</td>
                    <td>{end ? format(end, 'PPp') : String(b.endTime)}</td>
                    <td>₹{b.totalAmount}</td>
                    <td>
                      <span
                        className={
                          b.status === 'CONFIRMED' || b.status === 'COMPLETED'
                            ? 'badge badgeOk'
                            : b.status === 'PENDING'
                              ? 'badge badgeWarn'
                              : 'badge badgeBad'
                        }
                      >
                        {b.status}
                      </span>
                    </td>
                    <td>{b.paymentStatus ?? '–'}</td>
                    <td>
                      {canCancel(b.status) && (
                        <button
                          className="btn btnDanger"
                          disabled={busy}
                          onClick={() => handleCancel(b.id)}
                        >
                          {busy ? 'Cancelling…' : 'Cancel'}
                        </button>
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

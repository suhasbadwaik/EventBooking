import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '../lib/api';
import { useAuth } from '../state/auth';
import { ErrorBanner } from '../components/ErrorBanner';
import { fromIsoLike } from '../lib/datetime';
import type { VenueRequest, VenueResponse, AvailabilityResponse } from '../lib/types';

const emptyVenueForm: VenueRequest = {
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  pricePerHour: 0,
  capacity: 0,
};

export function OwnerDashboard() {
  const auth = useAuth();
  const qc = useQueryClient();
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [venueForm, setVenueForm] = useState<VenueRequest>(emptyVenueForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<VenueRequest>(emptyVenueForm);
  const [expandedVenueId, setExpandedVenueId] = useState<number | null>(null);
  const [slotForm, setSlotForm] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [error, setError] = useState<unknown>(null);

  const token = auth.token!;

  const venuesQ = useQuery({
    queryKey: ['venues', 'my'],
    queryFn: () => api.getMyVenues(token),
  });

  const createVenueMu = useMutation({
    mutationFn: (body: VenueRequest) => api.createVenue(token, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venues', 'my'] });
      setShowAddVenue(false);
      setVenueForm(emptyVenueForm);
      setError(null);
    },
    onError: (e) => setError(e),
  });

  const updateVenueMu = useMutation({
    mutationFn: ({ id, body }: { id: number; body: VenueRequest }) => api.updateVenue(token, id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venues', 'my'] });
      setEditingId(null);
      setEditForm(emptyVenueForm);
      setError(null);
    },
    onError: (e) => setError(e),
  });

  const deleteVenueMu = useMutation({
    mutationFn: (id: number) => api.deleteVenue(token, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venues', 'my'] });
      if (expandedVenueId) setExpandedVenueId(null);
      setError(null);
    },
    onError: (e) => setError(e),
  });

  const createSlotMu = useMutation({
    mutationFn: ({ venueId, start, end }: { venueId: number; start: string; end: string }) => {
      const startTime = start.length === 16 ? `${start}:00` : start;
      const endTime = end.length === 16 ? `${end}:00` : end;
      return api.createAvailability(token, { venueId, startTime, endTime });
    },
    onSuccess: (_, { venueId }) => {
      qc.invalidateQueries({ queryKey: ['availabilities', 'venue', venueId] });
      setSlotForm({ start: '', end: '' });
      setError(null);
    },
    onError: (e) => setError(e),
  });

  const deleteSlotMu = useMutation({
    mutationFn: ({ id }: { id: number; venueId: number }) => api.deleteAvailability(token, id),
    onSuccess: (_, { venueId }) => {
      qc.invalidateQueries({ queryKey: ['availabilities', 'venue', venueId] });
      setError(null);
    },
    onError: (e) => setError(e),
  });

  const venues = venuesQ.data ?? [];

  const startEdit = (v: VenueResponse) => {
    setEditingId(v.id);
    setEditForm({
      name: v.name,
      description: v.description,
      address: v.address,
      city: v.city,
      state: v.state,
      zipCode: v.zipCode,
      pricePerHour: v.pricePerHour,
      capacity: v.capacity,
    });
  };

  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="cardHeader">
          <h2 className="title">Owner dashboard</h2>
          <div className="subtle">Manage your venues and availability slots</div>
        </div>
        <ErrorBanner error={venuesQ.error ?? error} />
        <div className="actions" style={{ marginBottom: 16 }}>
          <button className="btn btnPrimary" onClick={() => setShowAddVenue((x) => !x)}>
            {showAddVenue ? 'Cancel' : 'Add venue'}
          </button>
        </div>

        {showAddVenue && (
          <div className="card" style={{ background: 'var(--panel2)', marginBottom: 16 }}>
            <h3 className="title">New venue</h3>
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                createVenueMu.mutate(venueForm);
              }}
            >
              <div className="field">
                <label>Name</label>
                <input value={venueForm.name} onChange={(e) => setVenueForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={venueForm.description} onChange={(e) => setVenueForm((f) => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="field">
                <label>Address</label>
                <input value={venueForm.address} onChange={(e) => setVenueForm((f) => ({ ...f, address: e.target.value }))} required />
              </div>
              <div className="field">
                <label>City</label>
                <input value={venueForm.city} onChange={(e) => setVenueForm((f) => ({ ...f, city: e.target.value }))} required />
              </div>
              <div className="field">
                <label>State</label>
                <input value={venueForm.state} onChange={(e) => setVenueForm((f) => ({ ...f, state: e.target.value }))} required />
              </div>
              <div className="field">
                <label>ZIP</label>
                <input value={venueForm.zipCode} onChange={(e) => setVenueForm((f) => ({ ...f, zipCode: e.target.value }))} required />
              </div>
              <div className="field">
                <label>Price per hour (₹)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={venueForm.pricePerHour || ''}
                  onChange={(e) => setVenueForm((f) => ({ ...f, pricePerHour: Number(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="field">
                <label>Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={venueForm.capacity || ''}
                  onChange={(e) => setVenueForm((f) => ({ ...f, capacity: Number(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="actions" style={{ gridColumn: 'span 12' }}>
                <button className="btn btnPrimary" disabled={createVenueMu.isPending} type="submit">
                  {createVenueMu.isPending ? 'Creating…' : 'Create venue'}
                </button>
              </div>
            </form>
          </div>
        )}

        {venues.length === 0 && !showAddVenue ? (
          <div className="subtle">No venues yet. Add one above.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>City</th>
                <th>₹/hr</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <React.Fragment key={v.id}>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 700 }}>{v.name}</div>
                      <div className="subtle">{v.description}</div>
                    </td>
                    <td>{v.city}, {v.state}</td>
                    <td>₹{v.pricePerHour}</td>
                    <td>{v.capacity}</td>
                    <td>
                      <div className="actions">
                        <Link className="btn" to={`/venues/${v.id}`}>View</Link>
                        {editingId === v.id ? (
                          <>
                            <button className="btn" onClick={() => setEditingId(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn" onClick={() => startEdit(v)}>Edit</button>
                            <button
                              className="btn btnDanger"
                              onClick={() => window.confirm('Delete this venue?') && deleteVenueMu.mutate(v.id)}
                              disabled={deleteVenueMu.isPending}
                            >
                              Delete
                            </button>
                            <button className="btn btnPrimary" onClick={() => setExpandedVenueId((x) => (x === v.id ? null : v.id))}>
                              {expandedVenueId === v.id ? 'Hide slots' : 'Slots'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {editingId === v.id && (
                    <tr>
                      <td colSpan={5}>
                        <div className="card" style={{ background: 'var(--panel2)' }}>
                          <h4 className="title">Edit venue</h4>
                          <form
                            className="row"
                            onSubmit={(e) => {
                              e.preventDefault();
                              updateVenueMu.mutate({ id: v.id, body: editForm });
                            }}
                          >
                            <div className="field">
                              <label>Name</label>
                              <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div className="field">
                              <label>Description</label>
                              <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} required />
                            </div>
                            <div className="field">
                              <label>Address</label>
                              <input value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} required />
                            </div>
                            <div className="field">
                              <label>City</label>
                              <input value={editForm.city} onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))} required />
                            </div>
                            <div className="field">
                              <label>State</label>
                              <input value={editForm.state} onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))} required />
                            </div>
                            <div className="field">
                              <label>ZIP</label>
                              <input value={editForm.zipCode} onChange={(e) => setEditForm((f) => ({ ...f, zipCode: e.target.value }))} required />
                            </div>
                            <div className="field">
                              <label>Price per hour (₹)</label>
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={editForm.pricePerHour || ''}
                                onChange={(e) => setEditForm((f) => ({ ...f, pricePerHour: Number(e.target.value) || 0 }))}
                                required
                              />
                            </div>
                            <div className="field">
                              <label>Capacity</label>
                              <input
                                type="number"
                                min={1}
                                value={editForm.capacity || ''}
                                onChange={(e) => setEditForm((f) => ({ ...f, capacity: Number(e.target.value) || 0 }))}
                                required
                              />
                            </div>
                            <div className="actions" style={{ gridColumn: 'span 12' }}>
                              <button className="btn btnPrimary" type="submit" disabled={updateVenueMu.isPending}>
                                {updateVenueMu.isPending ? 'Saving…' : 'Save'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                  {expandedVenueId === v.id && (
                    <tr>
                      <td colSpan={5}>
                        <VenueSlots
                          venueId={v.id}
                          token={token}
                          slotForm={slotForm}
                          setSlotForm={setSlotForm}
                          onAddSlot={(start, end) => createSlotMu.mutate({ venueId: v.id, start, end })}
                          onDeleteSlot={(id) => deleteSlotMu.mutate({ id, venueId: v.id })}
                          addPending={createSlotMu.isPending}
                          deletePending={deleteSlotMu.isPending}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function VenueSlots({
  venueId,
  token,
  slotForm,
  setSlotForm,
  onAddSlot,
  onDeleteSlot,
  addPending,
  deletePending,
}: {
  venueId: number;
  token: string;
  slotForm: { start: string; end: string };
  setSlotForm: (f: { start: string; end: string }) => void;
  onAddSlot: (start: string, end: string) => void;
  onDeleteSlot: (id: number) => void;
  addPending: boolean;
  deletePending: boolean;
}) {
  const slotsQ = useQuery({
    queryKey: ['availabilities', 'venue', venueId],
    queryFn: () => api.getAllSlotsForVenue(token, venueId),
  });
  const slots = slotsQ.data ?? [];

  return (
    <div className="card" style={{ background: 'var(--panel2)' }}>
      <h4 className="title">Availability slots</h4>
      <form
        className="row"
        style={{ marginBottom: 16 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (slotForm.start && slotForm.end) onAddSlot(slotForm.start, slotForm.end);
        }}
      >
        <div className="field">
          <label>Start (datetime)</label>
          <input
            type="datetime-local"
            value={slotForm.start}
            onChange={(e) => setSlotForm((f) => ({ ...f, start: e.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label>End (datetime)</label>
          <input
            type="datetime-local"
            value={slotForm.end}
            onChange={(e) => setSlotForm((f) => ({ ...f, end: e.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label>&nbsp;</label>
          <div className="actions">
            <button className="btn btnPrimary" type="submit" disabled={addPending}>
              {addPending ? 'Adding…' : 'Add slot'}
            </button>
          </div>
        </div>
      </form>
      {slotsQ.isLoading ? (
        <div className="subtle">Loading…</div>
      ) : slots.length === 0 ? (
        <div className="subtle">No slots. Add one above.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => {
              const start = fromIsoLike(s.startTime);
              const end = fromIsoLike(s.endTime);
              const canDelete = s.status === 'AVAILABLE';
              return (
                <tr key={s.id}>
                  <td>{start ? format(start, 'PPp') : s.startTime}</td>
                  <td>{end ? format(end, 'PPp') : s.endTime}</td>
                  <td>
                    <span className={s.status === 'AVAILABLE' ? 'badge badgeOk' : s.status === 'BOOKED' ? 'badge badgeWarn' : 'badge badgeBad'}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {canDelete && (
                      <button
                        className="btn btnDanger"
                        disabled={deletePending}
                        onClick={() => window.confirm('Remove this slot?') && onDeleteSlot(s.id)}
                      >
                        Delete
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
  );
}

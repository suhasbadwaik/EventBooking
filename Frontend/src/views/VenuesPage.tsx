import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ErrorBanner } from '../components/ErrorBanner';

export function VenuesPage() {
  const [city, setCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const queryKey = useMemo(() => ['venues', { city, searchTerm }], [city, searchTerm]);
  const venuesQ = useQuery({
    queryKey,
    queryFn: () => api.getPublicVenues({ city: city || undefined, searchTerm: searchTerm || undefined }),
  });

  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="cardHeader">
          <div>
            <h2 className="title">Venues</h2>
            <div className="subtle">Public listing from `GET /api/venues/public/all`</div>
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" />
          </div>
          <div className="field">
            <label>Search</label>
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="name / keywords" />
          </div>
        </div>
      </div>

      {venuesQ.error && <ErrorBanner error={venuesQ.error} />}

      <div className="card" style={{ gridColumn: 'span 12' }}>
        {venuesQ.isLoading ? (
          <div className="subtle">Loading…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>City</th>
                <th>Price/hr</th>
                <th>Capacity</th>
                <th>Owner</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(venuesQ.data ?? []).map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{v.name}</div>
                    <div className="subtle">{v.description}</div>
                  </td>
                  <td>
                    {v.city}, {v.state}
                  </td>
                  <td>₹{v.pricePerHour}</td>
                  <td>{v.capacity}</td>
                  <td>{v.ownerName}</td>
                  <td>
                    <Link className="btn btnPrimary" to={`/venues/${v.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {(venuesQ.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="subtle">
                    No venues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


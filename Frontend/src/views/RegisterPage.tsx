import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { UserRole } from '../lib/types';
import { ErrorBanner } from '../components/ErrorBanner';

export function RegisterPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="cardHeader">
          <div>
            <h2 className="title">Register</h2>
            <div className="subtle">Creates a user via `POST /api/auth/register`</div>
          </div>
        </div>

        {success && (
          <div className="card" style={{ borderColor: 'rgba(45,212,191,0.55)', background: 'rgba(45,212,191,0.08)' }}>
            <div className="subtle" style={{ color: 'rgba(45,212,191,0.95)' }}>
              {success}
            </div>
          </div>
        )}
        <ErrorBanner error={error} />

        <form
          className="row"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSuccess(null);
            setLoading(true);
            try {
              await api.register({ email, password, firstName, lastName, phoneNumber, role });
              setSuccess('Registered successfully. You can now log in.');
              nav('/login');
            } catch (err) {
              setError(err);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="field">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="CUSTOMER">Customer</option>
              <option value="VENUE_OWNER">Venue owner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <div className="field">
            <label>First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Mishika" />
          </div>

          <div className="field">
            <label>Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sharma" />
          </div>

          <div className="field">
            <label>Phone number</label>
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="9876543210" />
          </div>

          <div className="actions" style={{ gridColumn: 'span 12' }}>
            <button className="btn btnPrimary" disabled={loading}>
              {loading ? 'Creating…' : 'Register'}
            </button>
            <button type="button" className="btn" onClick={() => nav('/login')} disabled={loading}>
              Go to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../state/auth';
import { ErrorBanner } from '../components/ErrorBanner';

export function LoginPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? '/venues';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="cardHeader">
          <div>
            <h2 className="title">Login</h2>
            <div className="subtle">Bearer token auth (JWT) against `http://localhost:8080`</div>
          </div>
        </div>

        <ErrorBanner error={error} />

        <form
          className="row"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            try {
              const resp = await api.login({ email, password });
              auth.login(resp);
              nav(from, { replace: true });
            } catch (err) {
              setError(err);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="actions" style={{ gridColumn: 'span 12' }}>
            <button className="btn btnPrimary" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


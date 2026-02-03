import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../state/auth';
import { ErrorBanner } from '../components/ErrorBanner';

export function ProfilePage() {
  const auth = useAuth();
  const userId = auth.user?.userId;
  const token = auth.token!;

  const userQ = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUserById(token, userId!),
    enabled: !!userId,
  });

  const user = userQ.data;
  const display = user ?? auth.user;

  if (!userId) return null;

  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="cardHeader">
          <h2 className="title">Profile</h2>
          <div className="subtle">Your account details</div>
        </div>
        <ErrorBanner error={userQ.error} />
        {userQ.isLoading && !user ? (
          <div className="subtle">Loading…</div>
        ) : (
          <div className="row">
            <div className="field">
              <label>Name</label>
              <div>
                {display?.firstName} {display?.lastName}
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <div>{display?.email}</div>
            </div>
            <div className="field">
              <label>Role</label>
              <div>{display?.role}</div>
            </div>
            {user && (
              <div className="field">
                <label>Phone</label>
                <div>{user.phoneNumber}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

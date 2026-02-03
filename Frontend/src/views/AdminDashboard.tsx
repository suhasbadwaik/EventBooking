import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../state/auth';
import { ErrorBanner } from '../components/ErrorBanner';
import type { UserRequest, UserResponse, UserRole } from '../lib/types';

const emptyUserForm: UserRequest = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'CUSTOMER',
  phoneNumber: '',
};

export function AdminDashboard() {
  const auth = useAuth();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<UserRequest>(emptyUserForm);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [editForm, setEditForm] = useState<UserRequest>(emptyUserForm);
  const [error, setError] = useState<unknown>(null);

  const token = auth.token!;

  const query = useMemo(
    () => ({ searchTerm: searchTerm || undefined, role: role || undefined }),
    [searchTerm, role],
  );

  const usersQ = useQuery({
    queryKey: ['users', query],
    queryFn: () => api.getUsers(token, query),
  });

  const createMu = useMutation({
    mutationFn: (body: UserRequest) => api.createUser(token, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowCreate(false);
      setForm(emptyUserForm);
      setError(null);
    },
    onError: (e) => setError(e),
  });

  const updateMu = useMutation({
    mutationFn: ({ id, body }: { id: number; body: UserRequest }) => api.updateUser(token, id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setEditing(null);
      setEditForm(emptyUserForm);
      setError(null);
    },
    onError: (e) => setError(e),
  });

  const deleteMu = useMutation({
    mutationFn: (id: number) => api.deleteUser(token, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setError(null);
    },
    onError: (e) => setError(e),
  });

  const users = usersQ.data ?? [];

  const startEdit = (u: UserResponse) => {
    setEditing(u);
    setEditForm({
      email: u.email,
      password: '',
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      phoneNumber: u.phoneNumber,
    });
  };

  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="cardHeader">
          <h2 className="title">Admin dashboard</h2>
          <div className="subtle">Manage users</div>
        </div>
        <ErrorBanner error={usersQ.error ?? createMu.error ?? updateMu.error ?? deleteMu.error ?? error} />

        <div className="row" style={{ marginBottom: 16 }}>
          <div className="field">
            <label>Search</label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users…"
            />
          </div>
          <div className="field">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole | '')}>
              <option value="">All</option>
              <option value="CUSTOMER">Customer</option>
              <option value="VENUE_OWNER">Venue owner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <div className="actions">
              <button className="btn btnPrimary" onClick={() => setShowCreate((x) => !x)}>
                {showCreate ? 'Cancel' : 'Create user'}
              </button>
            </div>
          </div>
        </div>

        {showCreate && (
          <div className="card" style={{ background: 'var(--panel2)', marginBottom: 16 }}>
            <h3 className="title">New user</h3>
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                createMu.mutate(form);
              }}
            >
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>First name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Last name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENUE_OWNER">Venue owner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="field">
                <label>Phone</label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="actions" style={{ gridColumn: 'span 12' }}>
                <button className="btn btnPrimary" type="submit" disabled={createMu.isPending}>
                  {createMu.isPending ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {usersQ.isLoading ? (
          <div className="subtle">Loading…</div>
        ) : users.length === 0 ? (
          <div className="subtle">No users match.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <React.Fragment key={u.id}>
                  <tr>
                    <td>
                      {u.firstName} {u.lastName}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge">{u.role}</span>
                    </td>
                    <td>{u.phoneNumber}</td>
                    <td>{u.active ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="actions">
                        {editing?.id === u.id ? (
                          <button className="btn" onClick={() => setEditing(null)}>
                            Cancel
                          </button>
                        ) : (
                          <>
                            <button className="btn" onClick={() => startEdit(u)}>
                              Edit
                            </button>
                            <button
                              className="btn btnDanger"
                              disabled={u.id === auth.user?.userId}
                              onClick={() =>
                                window.confirm(`Delete user ${u.email}?`) && deleteMu.mutate(u.id)
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {editing?.id === u.id && (
                    <tr>
                      <td colSpan={6}>
                        <div className="card" style={{ background: 'var(--panel2)' }}>
                          <h4 className="title">Edit user</h4>
                          <form
                            className="row"
                            onSubmit={(e) => {
                              e.preventDefault();
                              updateMu.mutate({ id: u.id, body: editForm });
                            }}
                          >
                            <div className="field">
                              <label>Email</label>
                              <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="field">
                              <label>New password (required for update)</label>
                              <input
                                type="password"
                                value={editForm.password}
                                onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                                placeholder="Enter new password"
                                required
                              />
                            </div>
                            <div className="field">
                              <label>First name</label>
                              <input
                                value={editForm.firstName}
                                onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="field">
                              <label>Last name</label>
                              <input
                                value={editForm.lastName}
                                onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="field">
                              <label>Role</label>
                              <select
                                value={editForm.role}
                                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                              >
                                <option value="CUSTOMER">Customer</option>
                                <option value="VENUE_OWNER">Venue owner</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            </div>
                            <div className="field">
                              <label>Phone</label>
                              <input
                                value={editForm.phoneNumber}
                                onChange={(e) => setEditForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="actions" style={{ gridColumn: 'span 12' }}>
                              <button className="btn btnPrimary" type="submit" disabled={updateMu.isPending}>
                                {updateMu.isPending ? 'Saving…' : 'Save'}
                              </button>
                            </div>
                          </form>
                        </div>
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

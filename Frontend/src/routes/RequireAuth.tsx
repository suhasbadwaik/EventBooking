import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { UserRole } from '../lib/types';
import { useAuth } from '../state/auth';

export function RequireAuth({ roles }: { roles?: UserRole[] }) {
  const auth = useAuth();
  const loc = useLocation();

  if (!auth.token || !auth.user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (roles && roles.length > 0 && !roles.includes(auth.user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}


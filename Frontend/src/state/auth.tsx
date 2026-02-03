import React, { createContext, useContext, useMemo, useState } from 'react';
import type { LoginResponse, UserRole } from '../lib/types';

type AuthState = {
  token: string | null;
  user: LoginResponse | null;
};

type AuthContextValue = AuthState & {
  login: (resp: LoginResponse) => void;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
};

const STORAGE_KEY = 'eventbooking.auth';

function loadInitial(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed?.token || !parsed?.user) return { token: null, user: null };
    return parsed;
  } catch {
    return { token: null, user: null };
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => loadInitial());

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      login: (resp) => {
        const next = { token: resp.token, user: resp };
        setState(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      },
      logout: () => {
        setState({ token: null, user: null });
        localStorage.removeItem(STORAGE_KEY);
      },
      hasRole: (...roles) => {
        const role = state.user?.role;
        return !!role && roles.includes(role);
      },
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


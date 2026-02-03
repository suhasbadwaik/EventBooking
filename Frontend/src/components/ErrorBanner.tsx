import React from 'react';
import { ApiError } from '../lib/api';

export function ErrorBanner({ error }: { error: unknown }) {
  if (!error) return null;
  const msg = error instanceof ApiError ? `${error.message} (HTTP ${error.status})` : error instanceof Error ? error.message : String(error);
  return (
    <div className="card" style={{ borderColor: 'rgba(255,77,109,0.55)', background: 'rgba(255,77,109,0.08)' }}>
      <div className="subtle" style={{ color: 'rgba(255,77,109,0.95)' }}>
        {msg}
      </div>
    </div>
  );
}


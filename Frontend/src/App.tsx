import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { RequireAuth } from './routes/RequireAuth';
import { LoginPage } from './views/LoginPage';
import { RegisterPage } from './views/RegisterPage';
import { VenuesPage } from './views/VenuesPage';
import { VenueDetailsPage } from './views/VenueDetailsPage';
import { OwnerDashboard } from './views/OwnerDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { MyBookingsPage } from './views/MyBookingsPage';
import { ProfilePage } from './views/ProfilePage';

export default function App() {
  return (
    <>
      <NavBar />
      <div className="container page">
        <Routes>
          <Route path="/" element={<Navigate to="/venues" replace />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/venues/:id" element={<VenueDetailsPage />} />

          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth roles={['CUSTOMER', 'ADMIN']} />}>
            <Route path="/my-bookings" element={<MyBookingsPage />} />
          </Route>

          <Route element={<RequireAuth roles={['VENUE_OWNER', 'ADMIN']} />}>
            <Route path="/owner" element={<OwnerDashboard />} />
          </Route>

          <Route element={<RequireAuth roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/me" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/venues" replace />} />
        </Routes>
      </div>
    </>
  );
}


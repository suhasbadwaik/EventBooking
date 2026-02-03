import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';

export function NavBar() {
  const auth = useAuth();
  const nav = useNavigate();

  const role = auth.user?.role ?? null;

  return (
    <div className="nav">
      <div className="container navInner">
        <Link className="brand" to="/">
          <span>EventBooking</span>
          <span className="pill">{role ?? 'PUBLIC'}</span>
        </Link>

        <div className="navLinks">
          <NavLink className="linkBtn" to="/venues">
            Venues
          </NavLink>

          {!auth.token ? (
            <>
              <NavLink className="linkBtn" to="/register">
                Register
              </NavLink>
              <NavLink className="linkBtn" to="/login">
                Login
              </NavLink>
            </>
          ) : (
            <>
              {auth.hasRole('CUSTOMER', 'ADMIN') && (
                <NavLink className="linkBtn" to="/my-bookings">
                  My bookings
                </NavLink>
              )}
              {auth.hasRole('VENUE_OWNER', 'ADMIN') && (
                <NavLink className="linkBtn" to="/owner">
                  Owner
                </NavLink>
              )}
              {auth.hasRole('ADMIN') && (
                <NavLink className="linkBtn" to="/admin">
                  Admin
                </NavLink>
              )}
              <NavLink className="linkBtn" to="/me">
                Profile
              </NavLink>
              <button
                className="btn"
                onClick={() => {
                  auth.logout();
                  nav('/login');
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


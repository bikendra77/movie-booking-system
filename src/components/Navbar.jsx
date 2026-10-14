import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Film, LogOut, Shield, Ticket, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

const CityPicker = ({ mobile = false }) => {
  const { cities, selectedCity, setSelectedCity, loadingCities, cityError } = useLocation();
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: mobile ? '100%' : '190px' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>City</span>
      <select
        aria-label="Select your city"
        value={selectedCity}
        disabled={loadingCities || cities.length === 0}
        onChange={event => setSelectedCity(event.target.value)}
        className="city-select-animate"
        style={{ flex: 1, minWidth: 0, minHeight: '48px', padding: '0.65rem 0.8rem', backgroundColor: 'var(--bg-secondary)' }}
      >
        {cities.length === 0 && <option value="">{loadingCities ? 'Loading cities...' : 'No cities available'}</option>}
        {cities.map(city => <option key={city} value={city}>{city}</option>)}
      </select>
      {cityError && <span role="status" style={{ display: 'none' }}>{cityError}</span>}
    </label>
  );
};

export const Navbar = () => {
  const { user, isAdmin, logout, error: authError } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinkStyle = ({ isActive }) => ({
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? '#ffffff' : 'var(--text-muted)',
    fontWeight: isActive ? 600 : 500,
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.92rem'
  });

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(8, 11, 18, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(229, 9, 20, 0.4)'
          }}>
            <Film size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #ffffff 40%, #e2e8f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              CINE<span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>WAVE</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} className="d-none d-md-flex">
          <CityPicker />
          <NavLink to="/" style={navLinkStyle}>Home</NavLink>
          <NavLink to="/movies" style={navLinkStyle}>Movies</NavLink>
          <NavLink to="/my-tickets" style={navLinkStyle}>
            <Ticket size={16} /> My Tickets
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                ...navLinkStyle({ isActive }),
                color: '#fbbf24',
                backgroundColor: isActive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)'
              })}
            >
              <Shield size={15} /> Admin Portal
            </NavLink>
          )}
        </nav>

        {/* Account and session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>

          {/* User Auth Info */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  {user.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}
                </span>
                <span className="d-none d-lg-inline" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out"
                style={{ padding: '0.45rem', borderRadius: '50%' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm d-none d-sm-inline-flex">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="d-md-none btn btn-secondary btn-sm"
            style={{ padding: '0.5rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '1rem 1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }} className="d-md-none">
          <CityPicker mobile />
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>Home</NavLink>
          <NavLink to="/movies" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>Movies</NavLink>
          <NavLink to="/my-tickets" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
            <Ticket size={16} /> My Tickets
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                ...navLinkStyle({ isActive }),
                color: '#fbbf24',
                backgroundColor: 'rgba(245, 158, 11, 0.1)'
              })}
            >
              <Shield size={16} /> Admin Portal
            </NavLink>
          )}
          {!user && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {authError && (
        <div role="status" style={{
          padding: '0.45rem 1rem',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          color: '#fbbf24',
          fontSize: '0.78rem',
          textAlign: 'center'
        }}>
          {authError}
        </div>
      )}
    </header>
  );
};

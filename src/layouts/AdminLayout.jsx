import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Film, Calendar, TicketCheck, ArrowLeft, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminNavStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.65rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#ffffff' : 'var(--text-muted)',
    backgroundColor: isActive ? 'rgba(229, 9, 20, 0.18)' : 'transparent',
    border: isActive ? '1px solid rgba(229, 9, 20, 0.3)' : '1px solid transparent',
    transition: 'all 0.15s ease'
  });

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="app-container" style={{ backgroundColor: '#060911' }}>
      {/* Admin Top Bar */}
      <header style={{
        backgroundColor: '#0c1220',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.86rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <ArrowLeft size={14} /> Back to Website
          </Link>
          <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}>
              ADMIN
            </span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>CineWave Control Center</span>
          </div>
        </div>

        {/* Admin user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>{user?.name} (Admin)</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" aria-label="Log out of admin account">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Admin Nav Sub-header / Tabs */}
      <div style={{
        backgroundColor: '#0a0f1c',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.5rem 1.5rem',
        overflowX: 'auto'
      }}>
        <div className="container" style={{ padding: 0 }}>
          <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
            <NavLink to="/admin" end style={adminNavStyle}>
              <LayoutDashboard size={16} /> Dashboard Overview
            </NavLink>
            <NavLink to="/admin/movies" style={adminNavStyle}>
              <Film size={16} /> Manage Movies
            </NavLink>
            <NavLink to="/admin/showtimes" style={adminNavStyle}>
              <Calendar size={16} /> Manage Showtimes
            </NavLink>
            <NavLink to="/admin/cinemas" style={adminNavStyle}>
              <MapPin size={16} /> Cities & Cinemas
            </NavLink>
            <NavLink to="/admin/bookings" style={adminNavStyle}>
              <TicketCheck size={16} /> Manage Bookings
            </NavLink>
          </div>
        </div>
      </div>

      {/* Main Admin Outlet */}
      <div className="main-content" style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

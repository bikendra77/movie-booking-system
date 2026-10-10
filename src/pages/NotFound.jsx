import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="container" style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 1.25rem'
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        backgroundColor: 'rgba(229, 9, 20, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        marginBottom: '1.5rem'
      }}>
        <Film size={36} />
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.8rem', color: 'var(--text-main)' }}>
        Scene Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '2rem', lineHeight: 1.6 }}>
        The reel you are looking for does not exist, has been archived, or was moved to another auditorium.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Return Home
        </Link>
        <Link to="/movies" className="btn btn-secondary">
          Browse Movies
        </Link>
      </div>
    </div>
  );
};

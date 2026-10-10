import React from 'react';

export const LoadingSpinner = ({ text = 'Loading cinema experience...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
      gap: '1rem',
      width: '100%'
    }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.02em' }}>{text}</p>
    </div>
  );
};

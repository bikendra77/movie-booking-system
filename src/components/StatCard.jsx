import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = '#e50914' }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{
        width: '54px',
        height: '54px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: `${color}18`,
        border: `1px solid ${color}35`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0
      }}>
        {Icon && <Icon size={26} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
          {title}
        </p>
        <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
          {value}
        </h3>
        {subtitle && (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

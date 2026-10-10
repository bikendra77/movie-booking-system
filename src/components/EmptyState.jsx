import React from 'react';
import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Film,
  title = "No results found",
  message = "We couldn't find what you were looking for.",
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 1.5rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px dashed var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      maxWidth: '520px',
      margin: '2rem auto'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem',
        color: 'var(--text-muted)'
      }}>
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
        {message}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};

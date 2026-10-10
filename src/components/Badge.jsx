import React from 'react';

export const Badge = ({ children, variant = 'neutral', icon: Icon, className = '' }) => {
  const variantClass = {
    primary: 'badge-primary',
    gold: 'badge-gold',
    blue: 'badge-blue',
    green: 'badge-green',
    neutral: 'badge-neutral'
  }[variant] || 'badge-neutral';

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

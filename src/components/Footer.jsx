import React from 'react';
import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';

export const Footer = () => {
  const { cities } = useLocation();
  return <footer className="site-footer">
    <div className="container">
      <div className="footer-content">
        <div>
          <Link to="/" className="footer-brand" aria-label="CineWave home">
            <span className="footer-brand-icon"><Film size={18} /></span>
            <span>CINE<span style={{ color: 'var(--primary)' }}>WAVE</span></span>
          </Link>
          <p className="footer-copy">
            Movie listings and screening details are managed by registered cinemas.
          </p>
        </div>

        <div>
          <h2 className="footer-heading">Explore</h2>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link to="/">Home</Link>
            <Link to="/movies">Movies</Link>
            <Link to="/my-tickets">My Tickets</Link>
          </nav>
        </div>

        <div>
          <h2 className="footer-heading">Cinema cities</h2>
          <p className="footer-copy">
            {cities.length ? cities.join(' · ') : 'No cinema cities registered yet.'}
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        Reservations are payable at the cinema counter. Online payments are not enabled.
      </div>
    </div>
  </footer>;
};

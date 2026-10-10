import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Ticket } from 'lucide-react';
import { Badge } from './Badge';

export const MovieCard = ({ movie }) => {
  return (
    <div
      className="card card-hoverable"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Poster Container */}
      <div
        style={{
          position: 'relative',
          paddingTop: '142%', // 1:1.42 aspect ratio standard movie poster
          backgroundColor: '#1a2234',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
      >
        <Link to={`/movies/${movie.id}`} aria-label={`View details for ${movie.title}`}>
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.25s ease'
            }}
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          right: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          {movie.status === 'now_showing' ? (
            <Badge variant="primary">Now Showing</Badge>
          ) : (
            <Badge variant="blue">Coming Soon</Badge>
          )}
        </div>

        {/* Bottom subtle gradient over poster */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(to top, rgba(20, 29, 48, 0.95), transparent)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Card Body */}
      <div style={{
        padding: '1.1rem 1.1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}>
        <div>
          {/* Metadata chips */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--text-dim)',
            fontSize: '0.78rem',
            marginBottom: '0.4rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={13} /> {movie.duration}
            </span>
            <span>•</span>
            <span>{movie.certificate}</span>
            <span>•</span>
            <span>{movie.language}</span>
          </div>

          <Link
            to={`/movies/${movie.id}`}
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              marginBottom: '0.4rem',
              lineHeight: 1.3,
              color: 'var(--text-main)',
              display: 'block'
            }}
          >
            {movie.title}
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
            {movie.genre?.slice(0, 2).map((g, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)'
                }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          {movie.status === 'now_showing' ? (
            <Link
              to={`/booking/showtimes/${movie.id}`}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <Ticket size={14} /> Choose Showtime
            </Link>
          ) : (
            <Link
              to={`/movies/${movie.id}`}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

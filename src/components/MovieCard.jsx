import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Ticket } from 'lucide-react';
import { Badge } from './Badge';

export const MovieCard = ({ movie }) => {
  const hasUnverified = /not verified|unavailable|not claimed/i.test(movie.dataNotes || '');

  return (
    <article className="movie-card card card-hoverable">
      <div className="movie-card-poster">
        <Link to={`/movies/${movie.id}`} aria-label={`View details for ${movie.title}`}>
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            loading="lazy"
          />
        </Link>

        <div className="movie-card-badges">
          {movie.status === 'now_showing' ? (
            <Badge variant="primary">Now Showing</Badge>
          ) : (
            <Badge variant="blue">Coming Soon</Badge>
          )}
          {hasUnverified && <Badge variant="neutral">Partial data</Badge>}
        </div>
      </div>

      <div className="movie-card-body">
        <div>
          <div className="movie-card-meta">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={13} /> {movie.duration}
            </span>
            <span>·</span>
            <span>{movie.certificate}</span>
            <span>·</span>
            <span>{movie.language}</span>
          </div>

          <Link to={`/movies/${movie.id}`} className="movie-card-title">
            {movie.title}
          </Link>

          <div className="movie-card-genres">
            {movie.genre?.slice(0, 2).map((g) => (
              <span key={g}>{g}</span>
            ))}
          </div>
        </div>

        {movie.status === 'now_showing' ? (
          <Link to={`/booking/showtimes/${movie.id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            <Ticket size={14} /> Find Showtimes
          </Link>
        ) : (
          <Link to={`/movies/${movie.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            View Details
          </Link>
        )}
      </div>
    </article>
  );
};

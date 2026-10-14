import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Ticket, ArrowLeft, Share2 } from 'lucide-react';
import { movieService } from '../services/movieService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';

export const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const data = await movieService.getMovieById(id);
        setMovie(data);
      } catch (err) {
        setError(err.message || 'Movie details are temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading movie details..." />;
  }

  if (error || !movie) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Movie Details Unavailable</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          {error || "The movie you are looking for does not exist."}
        </p>
        <Link to="/movies" className="btn btn-primary">
          Browse All Movies
        </Link>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingBottom: '4rem' }}>
      
      {/* 1. CINEMATIC BACKDROP BANNER */}
      <div style={{
        position: 'relative',
        height: '420px',
        overflow: 'hidden',
        backgroundColor: '#0a0e17'
      }}>
        <img
          src={movie.backdrop}
          alt={`${movie.title} backdrop`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            opacity: 0.35
          }}
        />
        {/* Soft edge gradients */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(8, 11, 18, 0.7) 60%, rgba(8, 11, 18, 0.9) 100%)'
        }} />
      </div>

      {/* 2. MAIN DETAILS CONTENT OVERLAY */}
      <div className="container" style={{ marginTop: '-240px', position: 'relative', zIndex: 10 }}>
        
        {/* Back navigation & Share */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(6px)'
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: copiedNotification ? '#34d399' : 'var(--text-muted)',
              fontSize: '0.85rem',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(6px)'
            }}
          >
            <Share2 size={15} />
            <span>{copiedNotification ? 'Link Copied!' : 'Share Movie'}</span>
          </button>
        </div>

        {/* Poster + Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Poster card */}
          <div style={{ maxWidth: '340px', margin: '0 auto', width: '100%' }}>
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#111827'
            }}>
              <img
                src={movie.poster}
                alt={`${movie.title} poster`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Book tickets Primary CTA below poster on mobile/desktop */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {movie.status === 'now_showing' ? (
                <Link
                  to={`/booking/showtimes/${movie.id}`}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                >
                  <Ticket size={20} /> Select Showtime & Seats
                </Link>
              ) : (
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: '#38bdf8',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  No showtimes are currently listed for this title.
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Detailed Movie Info */}
          <div style={{ flex: 1 }}>
            
            {/* Status & Format tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <Badge variant={movie.status === 'now_showing' ? 'primary' : 'blue'}>
                {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
              </Badge>

              {movie.formats?.map((fmt, idx) => (
                <Badge key={idx} variant="gold">{fmt}</Badge>
              ))}

              <span style={{
                border: '1px solid var(--border-light)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)'
              }}>
                {movie.certificate}
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '0.5rem'
            }}>
              {movie.title}
            </h1>

            {/* Tagline */}
            {movie.tagline && (
              <p style={{
                color: 'var(--primary)',
                fontStyle: 'italic',
                fontSize: '1.05rem',
                marginBottom: '1.25rem',
                fontWeight: 500
              }}>
                "{movie.tagline}"
              </p>
            )}

            {/* Movie facts */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Clock size={16} />
                <span>{movie.duration}</span>
              </div>

              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {movie.language}
              </div>
            </div>

            {/* Genre tags */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                Genres
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {movie.genre?.map((g, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                      fontWeight: 500
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                Synopsis
              </h4>
              <p style={{ color: 'var(--text-main)', fontSize: '0.98rem', lineHeight: 1.7 }}>
                {movie.synopsis}
              </p>
            </div>

            {(movie.director || movie.cast?.length > 0) && (
              <div style={{ marginBottom: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                {movie.director && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                    <strong style={{ color: '#fff' }}>Director:</strong> {movie.director}
                  </p>
                )}
                {movie.cast?.length > 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                    <strong style={{ color: '#fff' }}>Cast:</strong> {movie.cast.join(', ')}
                  </p>
                )}
                {movie.releaseDate && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                    <strong style={{ color: '#fff' }}>Release:</strong> {movie.releaseDate} (listed date)
                  </p>
                )}
              </div>
            )}

            {movie.dataNotes && (
              <div className="data-notes" role="note">
                <strong style={{ color: 'var(--accent-gold)' }}>Data notes:</strong> {movie.dataNotes}
                {movie.posterSource && (
                  <>
                    {' '}Poster source: <a href={movie.posterSource} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)' }}>{movie.posterSource}</a>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};

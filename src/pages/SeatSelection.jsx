import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Ticket, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { showtimeService } from '../services/showtimeService';
import { movieService } from '../services/movieService';
import { useBooking } from '../context/BookingContext';
import { SeatGrid } from '../components/SeatGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatNPR } from '../utils/currency';
import { getKathmanduDateLabel } from '../utils/dates';

export const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const {
    selectedMovie,
    selectedShowtime,
    selectedSeats,
    selectMovie,
    selectShowtime,
    toggleSeat,
    clearSeats,
    calculateTotals
  } = useBooking();

  const [loading, setLoading] = useState(true);
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchShowtimeDetails = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const st = await showtimeService.getShowtimeById(showtimeId);
        setShowtime(st);
        selectShowtime(st);

        if (st.movieId) {
          const mov = await movieService.getMovieById(st.movieId);
          setMovie(mov);
          selectMovie(mov);
        }
      } catch (err) {
        console.error('Failed to load showtime:', err);
        setLoadError(err.message || 'The seat map is temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimeDetails();
  }, [showtimeId]);

  if (loading) {
    return <LoadingSpinner text="Loading the seat map..." />;
  }

  if (!showtime) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h3>{loadError ? 'Seat map unavailable' : 'Showtime not found'}</h3>
        {loadError && <p role="alert" style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>{loadError}</p>}
        <Link to="/movies" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Movies
        </Link>
      </div>
    );
  }

  const { seatCount, subtotal } = calculateTotals();

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    navigate('/booking/summary');
  };

  return (
    <div style={{ paddingBottom: '7rem' }}>
      <div className="container" style={{ padding: '2rem 1.25rem 2rem' }}>
        
        {/* Stepper Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '1.75rem',
          fontSize: '0.84rem'
        }}>
          <span style={{ color: 'var(--text-dim)' }}>1. Showtimes</span>
          <ChevronRight size={14} color="var(--text-dim)" />
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>2. Seats</span>
          <ChevronRight size={14} color="var(--text-dim)" />
          <span style={{ color: 'var(--text-dim)' }}>3. Summary</span>
          <ChevronRight size={14} color="var(--text-dim)" />
          <span style={{ color: 'var(--text-dim)' }}>4. Pass</span>
        </div>

        {/* Showtime Info Ribbon */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(`/booking/showtimes/${showtime.movieId}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)'
              }}
              title="Change Showtime"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {movie?.title || 'Selected Movie'}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                flexWrap: 'wrap',
                marginTop: '0.2rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={13} color="var(--primary)" /> {showtime.theaterName}
                </span>
                <span>•</span>
                <span>{showtime.screenName}</span>
                <span>•</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{showtime.screenFormat}</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem' }}>
              <Calendar size={15} color="var(--primary)" />
              <span>{getKathmanduDateLabel(showtime.date)}</span>
            </div>
            <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', fontWeight: 700 }}>
              <Clock size={15} color="#34d399" />
              <span>{showtime.time}</span>
            </div>
          </div>
        </div>

        {/* Notice Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: '#bae6fd',
          marginBottom: '2rem'
        }}>
          <AlertCircle size={16} color="#38bdf8" />
          <span>Select available seats. Seat prices are shown below; the total is payable at the cinema counter.</span>
        </div>

        {/* The Seating Chart */}
        <div className="card" style={{ padding: '2rem 1.5rem', marginBottom: '2rem' }}>
          <SeatGrid
            bookedSeatIds={showtime.bookedSeats || []}
            selectedSeats={selectedSeats}
            onToggleSeat={toggleSeat}
            basePrice={showtime.basePrice}
          />
        </div>

      </div>

      {/* Floating Bottom Live Summary Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(11, 16, 27, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-light)',
        padding: '1rem 0',
        zIndex: 40,
        boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.6)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Left summary details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Selected Seats ({seatCount})
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.2rem', minHeight: '26px' }}>
                {selectedSeats.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>None selected yet</span>
                ) : (
                  selectedSeats.map(s => (
                    <span
                      key={s.id}
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#10b981',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.78rem'
                      }}
                    >
                      {s.id}
                    </span>
                  ))
                )}
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <button
                onClick={clearSeats}
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Right: Subtotal & Proceed button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Ticket subtotal
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                {formatNPR(subtotal)}
              </div>
            </div>

            <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className="btn btn-primary btn-lg"
              style={{
                boxShadow: selectedSeats.length > 0 ? '0 0 20px rgba(229, 9, 20, 0.5)' : 'none'
              }}
            >
              <Ticket size={18} /> Proceed to Summary
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

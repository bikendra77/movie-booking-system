import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Ticket, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { showtimeService } from '../services/showtimeService';
import { movieService } from '../services/movieService';
import { useBooking } from '../context/BookingContext';
import { SeatGrid } from '../components/SeatGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatNPR } from '../utils/currency';
import { getKathmanduDateLabel, isKathmanduShowtimeInFuture } from '../utils/dates';

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
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const { seatCount, subtotal, bookingFee, tax, totalAmount } = calculateTotals();
  const showtimeIsBookable = isKathmanduShowtimeInFuture(showtime, new Date(currentTime));

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    if (!isKathmanduShowtimeInFuture(showtime, new Date())) {
      setCurrentTime(Date.now());
      return;
    }
    navigate('/booking/summary');
  };

  return (
    <div className="page-enter" style={{ paddingBottom: '8.5rem' }}>
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
              <span>{showtime.time} Nepal time</span>
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

        {!showtimeIsBookable && (
          <div role="alert" style={{ color: '#fca5a5', marginBottom: '1rem' }}>
            This showtime has started and is no longer available. Choose another screening.
          </div>
        )}

        {showtimeIsBookable && (
          <div className="card seat-map-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Select your seats</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Base ticket from {formatNPR(showtime.basePrice)} · Prices in NPR · Final total confirmed by the server
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Selected · {seatCount}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{formatNPR(totalAmount)}</div>
              </div>
            </div>
            <SeatGrid
              bookedSeatIds={showtime.bookedSeats || []}
              selectedSeats={selectedSeats}
              onToggleSeat={toggleSeat}
              basePrice={showtime.basePrice}
            />
          </div>
        )}

      </div>

      <div className="seat-summary-bar">
        <div className="container seat-summary-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Selected seats ({seatCount})
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.35rem', minHeight: '28px' }}>
                {selectedSeats.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Tap a seat to begin</span>
                ) : (
                  selectedSeats.map(s => (
                    <span key={s.id} className="seat-chip anim-pop">{s.id}</span>
                  ))
                )}
              </div>
            </div>
            {selectedSeats.length > 0 && (
              <button type="button" onClick={clearSeats} className="link-muted">
                Clear all
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <div>Tickets {formatNPR(subtotal)} · Fee {formatNPR(bookingFee)} · VAT {formatNPR(tax)}</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>
                Est. total {formatNPR(totalAmount)}
              </div>
            </div>
            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedSeats.length === 0 || !showtimeIsBookable}
              className="btn btn-primary btn-lg"
            >
              <Ticket size={18} /> Proceed to Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

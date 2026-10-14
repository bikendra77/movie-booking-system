import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { movieService } from '../services/movieService';
import { showtimeService } from '../services/showtimeService';
import { useBooking } from '../context/BookingContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { getKathmanduDate, getKathmanduDateLabel } from '../utils/dates';
import { formatNPR } from '../utils/currency';
import { useLocation } from '../context/LocationContext';

export const ShowtimeSelection = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { selectMovie, selectShowtime } = useBooking();
  const { selectedCity } = useLocation();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Generate the next 5 days for date tabs
  const availableDates = Array.from({ length: 5 }, (_, i) => {
    const dateString = getKathmanduDate(i);
    return {
      dateString,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : getKathmanduDateLabel(dateString, { weekday: 'short' }),
      dayNumber: getKathmanduDateLabel(dateString, { day: 'numeric' }),
      month: getKathmanduDateLabel(dateString, { month: 'short' })
    };
  });

  const [selectedDate, setSelectedDate] = useState(availableDates[0].dateString);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const [mov, allTheaters] = await Promise.all([
          movieService.getMovieById(movieId),
          showtimeService.getTheaters()
        ]);
        setMovie(mov);
        selectMovie(mov);
        setTheaters(allTheaters);

        // Fetch showtimes for this movie
        const stList = await showtimeService.getShowtimes({ movieId });
        setShowtimes(stList);
      } catch (err) {
        console.error('Failed to load showtime data:', err);
        setLoadError(err.message || 'Showtimes are temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [movieId]);

  const handleSelectShowtime = (showtime) => {
    selectShowtime(showtime);
    navigate(`/booking/seats/${showtime.id}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading showtimes..." />;
  }

  if (!movie) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h3>{loadError ? 'Showtimes unavailable' : 'Movie not found'}</h3>
        {loadError && <p role="alert" style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>{loadError}</p>}
        <Link to="/movies" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Movies
        </Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container" role="alert" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h3>Showtimes unavailable</h3>
        <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1rem' }}>{loadError}</p>
        <Link to={`/booking/showtimes/${movieId}`} className="btn btn-primary">Try Again</Link>
      </div>
    );
  }

  // Filter showtimes for the currently active date
  const dateFilteredShowtimes = showtimes.filter(st => st.date === selectedDate);

  // Group showtimes by theater
  const theaterGroups = theaters.filter(theater => !selectedCity || theater.city === selectedCity).map(theater => {
    const matchingShowtimes = dateFilteredShowtimes.filter(st => st.theaterId === theater.id);
    return {
      ...theater,
      showtimes: matchingShowtimes
    };
  }).filter(group => group.showtimes.length > 0);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 5rem' }}>
      
      {/* 1. BOOKING STEPPER INDICATOR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '2rem',
        fontSize: '0.84rem'
      }}>
        <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          1. Showtimes
        </span>
        <ChevronRight size={14} color="var(--text-dim)" />
        <span style={{ color: 'var(--text-dim)' }}>2. Seats</span>
        <ChevronRight size={14} color="var(--text-dim)" />
        <span style={{ color: 'var(--text-dim)' }}>3. Summary</span>
        <ChevronRight size={14} color="var(--text-dim)" />
        <span style={{ color: 'var(--text-dim)' }}>4. Pass</span>
      </div>

      {/* 2. MOVIE HEADER SNAPSHOT */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <img
          src={movie.poster}
          alt={`${movie.title} poster`}
          style={{ width: '65px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{movie.title}</h2>
            <Badge variant="gold">{movie.certificate}</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.86rem', flexWrap: 'wrap' }}>
            <span>{movie.duration}</span>
            <span>•</span>
            <span>{movie.genre?.join(', ')}</span>
            <span>•</span>
            <span>{movie.language}</span>
          </div>
        </div>
        <Link to={`/movies/${movie.id}`} className="btn btn-secondary btn-sm d-none d-sm-inline-flex">
          Movie Details
        </Link>
      </div>

      {/* 3. DATE SELECTOR TABS */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} color="var(--primary)" /> Select Date
        </h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '0.8rem' }}>
          Dates and showtimes are displayed in Nepal time (Asia/Kathmandu).
        </p>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {availableDates.map(item => {
            const isSelected = item.dateString === selectedDate;
            return (
              <button
                key={item.dateString}
                onClick={() => setSelectedDate(item.dateString)}
                style={{
                  minWidth: '108px',
                  minHeight: '116px',
                  padding: '0.9rem 0.7rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 15px rgba(229, 9, 20, 0.4)' : 'none'
                }}
              >
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--text-dim)', fontWeight: 600 }}>
                  {item.dayName}
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {item.dayNumber}
                </span>
                <span style={{ fontSize: '0.72rem', color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)' }}>
                  {item.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. THEATER VENUES & SHOWTIMES LIST */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} color="var(--primary)" /> Available Theaters & Showtimes
        </h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '-0.8rem', marginBottom: '1rem' }}>
          {selectedCity ? `Showing cinemas in ${selectedCity}.` : 'Select a city to see nearby cinemas.'}
        </p>

        {theaterGroups.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No Nepal showtimes for this date"
            message={selectedCity
              ? `No screenings are scheduled in ${selectedCity} for this date. CineWave does not invent local cinema availability — an admin must add confirmed showtimes.`
              : 'Select a city in the header, or ask an admin to schedule confirmed Nepal showtimes for this title.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {theaterGroups.map(group => (
              <div
                key={group.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                {/* Theater Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1rem'
                }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>
                      {group.name}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> {group.location}
                    </p>
                  </div>
                </div>

                {/* Showtimes Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {group.showtimes.map(st => (
                    <button
                      key={st.id}
                      onClick={() => handleSelectShowtime(st)}
                      style={{
                        minHeight: '116px',
                        padding: '1.15rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid var(--border-subtle)',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.12)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                          {st.time}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#34d399',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px'
                        }}>
                          {formatNPR(st.basePrice)}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 600 }}>
                        {st.screenFormat}
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                        {st.screenName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

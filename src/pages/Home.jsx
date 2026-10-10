import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Ticket, ArrowRight, Film } from 'lucide-react';
import { movieService } from '../services/movieService';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { useLocation } from '../context/LocationContext';
import { showtimeService } from '../services/showtimeService';

export const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [locationStats, setLocationStats] = useState({ cityCount: 0, cinemaCount: 0 });
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();
  const { selectedCity } = useLocation();

  const genres = ['All', ...new Set(nowShowing.flatMap(movie => movie.genre || []))];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const [featured, showing, upcoming, locations] = await Promise.all([
          movieService.getFeaturedMovies(selectedCity),
          movieService.getMovies({ status: 'now_showing', city: selectedCity }),
          movieService.getMovies({ status: 'coming_soon', city: selectedCity }),
          showtimeService.getLocationStats()
        ]);
        setFeaturedMovies(featured);
        setNowShowing(showing);
        setComingSoon(upcoming);
        setLocationStats(locations);
      } catch (err) {
        console.error('Failed to load home page movies:', err);
        setLoadError(err.message || 'Could not load the movie catalogue.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reloadKey, selectedCity]);

  const currentHero = featuredMovies[activeHeroIndex] || featuredMovies[0];

  const filteredNowShowing = selectedGenre === 'All'
    ? nowShowing
    : nowShowing.filter(m => m.genre && m.genre.includes(selectedGenre));

  if (loading) {
    return <LoadingSpinner text="Loading movies..." />;
  }

  if (loadError) {
    return (
      <div className="container" role="alert" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>We couldn’t load the cinema listings</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>{loadError}</p>
        <button className="btn btn-primary" onClick={() => setReloadKey(value => value + 1)}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      
      {/* 1. HERO SHOWCASE */}
      {currentHero && (
        <section style={{
          position: 'relative',
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: '#070a12'
        }}>
          {/* Backdrop Image with Multi-layer Gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${currentHero.backdrop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            opacity: 0.42,
            transition: 'background-image 0.5s ease-in-out'
          }} />

          {/* Deep Cinematic Gradients */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, #080b12 0%, rgba(8, 11, 18, 0.85) 45%, rgba(8, 11, 18, 0.4) 100%), linear-gradient(to top, #080b12 0%, transparent 60%)'
          }} />

          {/* Hero Content */}
          <div className="container" style={{ position: 'relative', zIndex: 10, padding: '4rem 1.25rem' }}>
            <div style={{ maxWidth: '680px' }}>
              
              {/* Badges strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <Badge variant="primary">Now showing</Badge>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• {currentHero.duration}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• {currentHero.language}</span>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '0.8rem',
                textShadow: '0 4px 20px rgba(0,0,0,0.8)'
              }}>
                {currentHero.title}
              </h1>

              {/* Tagline */}
              {currentHero.tagline && (
                <p style={{
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  marginBottom: '1rem',
                  letterSpacing: '0.02em'
                }}>
                  “{currentHero.tagline}”
                </p>
              )}

              {/* Synopsis */}
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '1rem',
                lineHeight: 1.6,
                marginBottom: '2rem',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {currentHero.synopsis}
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to={`/booking/showtimes/${currentHero.id}`}
                  className="btn btn-primary btn-lg"
                >
                  <Ticket size={18} /> Choose a Showtime
                </Link>
                <Link
                  to={`/movies/${currentHero.id}`}
                  className="btn btn-secondary btn-lg"
                >
                  View Details
                </Link>
              </div>

              {/* Hero Switcher Indicators */}
              {featuredMovies.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2.5rem', alignItems: 'center' }}>
                  {featuredMovies.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveHeroIndex(idx)}
                      style={{
                        height: '6px',
                        width: activeHeroIndex === idx ? '32px' : '12px',
                        borderRadius: '3px',
                        backgroundColor: activeHeroIndex === idx ? 'var(--primary)' : 'rgba(255, 255, 255, 0.25)',
                        transition: 'all 0.3s ease'
                      }}
                      title={m.title}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* 2. NOW SHOWING SECTION WITH GENRE TABS */}
      <section className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Film color="var(--primary)" /> Now Showing
            </h2>
            <p className="section-subtitle">
              Movies and screenings available in {selectedCity || 'your selected city'} · {locationStats.cityCount} cities · {locationStats.cinemaCount} cinemas
            </p>
          </div>
          
          <Link to="/movies" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--primary)',
            fontSize: '0.92rem',
            fontWeight: 600
          }}>
            Explore All <ArrowRight size={16} />
          </Link>
        </div>

        {/* Genre Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '2rem'
        }}>
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: selectedGenre === g ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                color: selectedGenre === g ? '#fff' : 'var(--text-muted)',
                border: selectedGenre === g ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                transition: 'all 0.15s ease'
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Movies Grid */}
        <div className="grid-movies">
          {filteredNowShowing.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 4. COMING SOON SECTION */}
      {comingSoon.length > 0 && (
        <section className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Calendar color="#38bdf8" /> Coming Soon
              </h2>
              <p className="section-subtitle">Upcoming movies available in {selectedCity || 'your selected city'}.</p>
            </div>
          </div>

          <div className="grid-movies">
            {comingSoon.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

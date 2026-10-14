import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const { selectedCity } = useLocation();

  const genres = ['All', ...new Set(nowShowing.flatMap(movie => movie.genre || []))];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        // Catalogue is worldwide; city only affects showtimes, not inventing local availability.
        const [featured, showing, upcoming, locations] = await Promise.all([
          movieService.getFeaturedMovies(),
          movieService.getMovies({ status: 'now_showing' }),
          movieService.getMovies({ status: 'coming_soon' }),
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
  }, [reloadKey]);

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
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>

      {!currentHero && (
        <section className="container" style={{ padding: '5rem 1.25rem 2rem', textAlign: 'center' }}>
          <p className="brand-mark">CINEWAVE</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0.75rem 0' }}>Nepal’s cinema booking desk</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '36rem', margin: '0 auto 1.5rem' }}>
            The catalogue is empty. An administrator can add movies and Nepal showtimes from the admin portal.
          </p>
          <Link to="/movies" className="btn btn-primary">Browse Movies</Link>
        </section>
      )}
      
      {/* 1. HERO SHOWCASE */}
      {currentHero && (
        <section className="hero-cinema">
          <div
            className="hero-cinema-bg"
            style={{ backgroundImage: `url(${currentHero.backdrop})` }}
          />
          <div className="hero-cinema-shade" />

          <div className="container hero-cinema-content">
            <div style={{ maxWidth: '640px' }}>
              <p className="brand-mark anim-fade-up">CINEWAVE</p>
              <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap', animationDelay: '60ms' }}>
                <Badge variant="primary">Now showing worldwide</Badge>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{currentHero.duration}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{currentHero.language}</span>
              </div>

              <h1 className="hero-title anim-fade-up" style={{ animationDelay: '100ms' }}>
                {currentHero.title}
              </h1>

              {currentHero.tagline && (
                <p className="hero-tagline anim-fade-up" style={{ animationDelay: '140ms' }}>
                  “{currentHero.tagline}”
                </p>
              )}

              <p className="hero-synopsis anim-fade-up" style={{ animationDelay: '180ms' }}>
                {currentHero.synopsis}
              </p>

              <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', animationDelay: '220ms' }}>
                <Link to={`/booking/showtimes/${currentHero.id}`} className="btn btn-primary btn-lg">
                  <Ticket size={18} /> Find Showtimes
                </Link>
                <Link to={`/movies/${currentHero.id}`} className="btn btn-secondary btn-lg">
                  View Details
                </Link>
              </div>

              {featuredMovies.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2.5rem', alignItems: 'center' }}>
                  {featuredMovies.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveHeroIndex(idx)}
                      className="hero-dot"
                      style={{ width: activeHeroIndex === idx ? '32px' : '12px', backgroundColor: activeHeroIndex === idx ? 'var(--primary)' : 'rgba(255, 255, 255, 0.25)' }}
                      title={m.title}
                      aria-label={`Show ${m.title}`}
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
              Recent worldwide releases · Nepal showtimes listed only when scheduled · {selectedCity || 'Pick a city'} · {locationStats.cityCount} cities · {locationStats.cinemaCount} cinemas
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
              <p className="section-subtitle">Upcoming titles in the catalogue. Local Nepal showtimes are added by cinema admins only when confirmed.</p>
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

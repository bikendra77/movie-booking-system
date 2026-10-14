import React, { useState, useEffect } from 'react';
import { Search, Film, X } from 'lucide-react';
import { movieService } from '../services/movieService';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useLocation } from '../context/LocationContext';

export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | now_showing | coming_soon
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('title_asc');
  const { selectedCity } = useLocation();

  const genres = ['All', ...new Set(movies.flatMap(movie => movie.genre || []))];

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await movieService.getMovies();
        setMovies(data);
      } catch (err) {
        console.error('Failed to load movies:', err);
        setLoadError(err.message || 'Could not load the movie catalogue.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [reloadKey]);

  // Filter & sort logic
  const filteredMovies = movies
    .filter(movie => {
      // Status filter
      if (statusFilter !== 'all' && movie.status !== statusFilter) return false;
      // Genre filter
      if (selectedGenre !== 'All' && (!movie.genre || !movie.genre.includes(selectedGenre))) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = movie.title.toLowerCase().includes(q);
        const matchesSynopsis = movie.synopsis?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSynopsis) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      return 0;
    });

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedGenre('All');
    setSortBy('title_asc');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || selectedGenre !== 'All';

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Explore Movies
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Browse the worldwide catalogue. Showtimes in {selectedCity || 'your city'} appear only when a cinema has scheduled them.
        </p>
      </div>

      {/* Filter and Search Controls Bar */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Top Row: Search + Sort */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)'
              }}
            />
            <input
              type="text"
              placeholder="Search movie titles or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.8rem',
                backgroundColor: 'rgba(15, 23, 42, 0.8)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', minWidth: '150px' }}
            >
              <option value="title_asc">Title (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Status tabs & Genre chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1rem'
        }}>
          {/* Status Segmented Buttons */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'now_showing', label: 'Now Showing' },
              { id: 'coming_soon', label: 'Coming Soon' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: statusFilter === tab.id ? 'var(--primary)' : 'transparent',
                  color: statusFilter === tab.id ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Genre select or reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', minWidth: '130px' }}
            >
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Movies Count indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing <strong style={{ color: '#fff' }}>{filteredMovies.length}</strong> {filteredMovies.length === 1 ? 'movie' : 'movies'}
        </p>
      </div>

      {/* Movies Listing Grid */}
      {loading ? (
        <LoadingSpinner text="Loading movies..." />
      ) : loadError ? (
        <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{loadError}</p>
          <button className="btn btn-primary" onClick={() => setReloadKey(value => value + 1)}>
            Try Again
          </button>
        </div>
      ) : filteredMovies.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No movies found"
          message="No films matched your search criteria or filter combinations. Try resetting filters to explore all available films."
          actionText="Clear All Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid-movies">
          {filteredMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

    </div>
  );
};

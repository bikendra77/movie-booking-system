import React, { useState, useEffect } from 'react';
import { Film, Plus, Edit, Trash2, Search, Clock, AlertCircle } from 'lucide-react';
import { movieService } from '../services/movieService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { getKathmanduDate } from '../utils/dates';

export const ManageMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [deleteConfirmMovie, setDeleteConfirmMovie] = useState(null);

  const initialFormState = {
    title: '',
    tagline: '',
    poster: '',
    backdrop: '',
    genre: '',
    rating: 0,
    duration: '',
    releaseDate: getKathmanduDate(),
    language: 'Nepali',
    certificate: 'U',
    status: 'now_showing',
    director: '',
    cast: '',
    synopsis: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const loadMovies = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const data = await movieService.getMovies();
      setMovies(data);
    } catch (err) {
      console.error('Failed to load movies:', err);
      setLoadError(err.message || 'Movie catalogue is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMovie(null);
    setFormData(initialFormState);
    setModalOpen(true);
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '',
      tagline: movie.tagline || '',
      poster: movie.poster || '',
      backdrop: movie.backdrop || '',
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || '',
      rating: movie.rating || 0,
      duration: movie.duration || '',
      releaseDate: movie.releaseDate || '',
      language: movie.language || 'Nepali',
      certificate: movie.certificate || 'U',
      status: movie.status || 'now_showing',
      director: movie.director || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
      synopsis: movie.synopsis || ''
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(',').map(s => s.trim()).filter(Boolean),
        cast: formData.cast.split(',').map(s => s.trim()).filter(Boolean)
      };
      if (editingMovie) {
        await movieService.updateMovie(editingMovie.id, payload);
      } else {
        await movieService.createMovie(payload);
      }
      setModalOpen(false);
      await loadMovies();
    } catch (err) {
      setSaveError(err.message || 'Movie could not be saved.');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmMovie) return;
    try {
      await movieService.deleteMovie(deleteConfirmMovie.id);
      setDeleteConfirmMovie(null);
      await loadMovies();
    } catch (err) {
      alert('Error deleting movie: ' + err.message);
    }
  };

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.director?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header & Add Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Theatrical Catalog</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Add or update the movie information shown to customers.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={16} /> Add New Movie
        </button>
      </div>

      {/* Search Input Bar */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '450px'
      }}>
        <Search size={18} color="var(--text-dim)" />
        <input
          type="text"
          placeholder="Filter catalog by movie title or director..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', background: 'none', border: 'none', padding: 0 }}
        />
      </div>

      {/* Movies Table */}
      {loading ? (
        <LoadingSpinner text="Loading movie management inventory..." />
      ) : loadError ? (
        <div role="alert" style={{ color: '#fca5a5', padding: '2rem' }}>{loadError}</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Movie</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Genre</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Duration & Cert</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map(movie => (
                  <tr key={movie.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img
                          src={movie.poster}
                          alt={`${movie.title} poster`}
                          style={{ width: '38px', height: '54px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{movie.title}</div>
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>Dir: {movie.director || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      <div>{movie.duration}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{movie.certificate}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge variant={movie.status === 'now_showing' ? 'primary' : 'blue'}>
                        {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(movie)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
                          title="Edit movie"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmMovie(movie)}
                          className="btn btn-sm btn-outline"
                          style={{ padding: '0.35rem 0.6rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                          title="Delete movie"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {saveError && <div role="alert" className="form-error">{saveError}</div>}

      {/* Add / Edit Movie Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMovie ? `Edit Movie: ${editingMovie.title}` : 'Add New Movie to Catalog'}
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Movie Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Poster Image URL *
              </label>
              <input
                type="url"
                name="poster"
                required
                placeholder="https://cinema.example/poster.jpg"
                value={formData.poster}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Backdrop Banner URL *
              </label>
              <input
                type="url"
                name="backdrop"
                required
                placeholder="https://cinema.example/backdrop.jpg"
                value={formData.backdrop}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Duration (e.g. 2h 20m)
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              >
                <option value="now_showing">Now Showing</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Genres (comma separated)
              </label>
              <input
                type="text"
                name="genre"
                placeholder="Drama, Family"
                value={formData.genre}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Director
              </label>
              <input
                type="text"
                name="director"
                value={formData.director}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Cast Members (comma separated)
            </label>
            <input
              type="text"
              name="cast"
              placeholder="Cast names (comma separated)"
              value={formData.cast}
              onChange={handleFormChange}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Synopsis Summary
            </label>
            <textarea
              name="synopsis"
              rows={3}
              value={formData.synopsis}
              onChange={handleFormChange}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              {editingMovie ? 'Save Changes' : 'Create Movie'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmMovie}
        onClose={() => setDeleteConfirmMovie(null)}
        title="Remove Movie from Catalog"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: '#fff' }}>
            Are you sure you want to remove <strong>{deleteConfirmMovie?.title}</strong>?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            This will take the title out of active screenings and home page listings.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={() => setDeleteConfirmMovie(null)} className="btn btn-secondary btn-sm">
              Keep Movie
            </button>
            <button onClick={handleDelete} className="btn btn-danger btn-sm">
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

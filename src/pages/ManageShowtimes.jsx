import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Clock, MapPin, Film, Search, Edit } from 'lucide-react';
import { showtimeService } from '../services/showtimeService';
import { movieService } from '../services/movieService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { formatNPR } from '../utils/currency';
import { getKathmanduDate, getKathmanduDateLabel } from '../utils/dates';

export const ManageShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [deleteConfirmSt, setDeleteConfirmSt] = useState(null);
  const [formError, setFormError] = useState('');

  const initialFormState = {
    movieId: '',
    theaterId: '',
    date: getKathmanduDate(),
    time: '07:00 PM',
    screenFormat: '2D',
    screenName: 'Screen 1',
    basePrice: 500
  };

  const [formData, setFormData] = useState(initialFormState);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [stList, movList, thList] = await Promise.all([
        showtimeService.getShowtimes(),
        movieService.getMovies(),
        showtimeService.getTheaters()
      ]);
      setShowtimes(stList);
      setMovies(movList);
      setTheaters(thList);

      if (movList.length > 0 && !formData.movieId) {
        setFormData(prev => ({
          ...prev,
          movieId: movList[0].id,
          theaterId: thList[0]?.id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load showtimes:', err);
      setLoadError(err.message || 'Showtimes are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingShowtime(null);
    setFormError('');
    setFormData({
      ...initialFormState,
      movieId: movies[0]?.id || '',
      theaterId: theaters[0]?.id || ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (showtime) => {
    setEditingShowtime(showtime);
    setFormError('');
    setFormData({
      movieId: showtime.movieId,
      theaterId: showtime.theaterId,
      date: showtime.date,
      time: showtime.time,
      screenFormat: showtime.screenFormat,
      screenName: showtime.screenName,
      basePrice: showtime.basePrice
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedTheater = theaters.find(t => t.id === formData.theaterId) || theaters[0];

      const payload = {
        ...formData,
        theaterName: selectedTheater?.name || ''
      };
      if (editingShowtime) await showtimeService.updateShowtime(editingShowtime.id, payload);
      else await showtimeService.createShowtime(payload);

      setModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Showtime could not be saved.');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmSt) return;
    try {
      await showtimeService.deleteShowtime(deleteConfirmSt.id);
      setDeleteConfirmSt(null);
      await loadData();
    } catch (err) {
      alert('Error deleting showtime: ' + err.message);
    }
  };

  // Associate movie details for display
  const enrichedShowtimes = showtimes.map(st => {
    const movie = movies.find(m => m.id === st.movieId);
    return {
      ...st,
      movieTitle: movie?.title || 'Unknown Title',
      moviePoster: movie?.poster
    };
  });

  const filteredShowtimes = enrichedShowtimes.filter(st =>
    st.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.theaterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.time.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Showtimes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage screening times and NPR ticket prices for registered cinemas.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Schedule Showtime
        </button>
      </div>

      {/* Filter Bar */}
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
          placeholder="Filter by movie, theater name, or slot..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', background: 'none', border: 'none', padding: 0 }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving auditorium schedules..." />
      ) : loadError ? (
        <div role="alert" style={{ color: '#fca5a5', padding: '2rem' }}>{loadError}</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Movie Title</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Theater & Screen</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Screening Slot</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Format</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Base Price</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Occupancy</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredShowtimes.map(st => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {st.moviePoster && (
                          <img
                            src={st.moviePoster}
                            alt={st.movieTitle}
                            style={{ width: '32px', height: '46px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                        <span style={{ fontWeight: 700, color: '#fff' }}>{st.movieTitle}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      <div>{st.theaterName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{st.screenName}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{getKathmanduDateLabel(st.date)}</div>
                      <div style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 700 }}>{st.time}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge variant="blue">{st.screenFormat}</Badge>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fbbf24' }}>
                      {formatNPR(st.basePrice)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{st.bookedSeats?.length || 0}</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}> / 70 booked</span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEdit(st)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.6rem', marginRight: '0.4rem' }}
                        title="Edit showtime"
                        aria-label={`Edit ${st.movieTitle} showtime`}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSt(st)}
                        className="btn btn-sm btn-outline"
                        style={{ padding: '0.35rem 0.6rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                        title="Delete showtime"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Showtime Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingShowtime ? 'Edit Showtime' : 'Schedule Showtime Slot'}
        maxWidth="580px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && <div role="alert" className="form-error">{formError}</div>}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Select Movie *
            </label>
            <select
              name="movieId"
              required
              value={formData.movieId}
              onChange={handleFormChange}
              style={{ width: '100%' }}
            >
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Select Cinema Theater *
            </label>
            <select
              name="theaterId"
              required
              value={formData.theaterId}
              onChange={handleFormChange}
              style={{ width: '100%' }}
            >
              {theaters.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.location})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Date (YYYY-MM-DD) *
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Time (e.g. 07:30 PM) *
              </label>
              <input
                type="text"
                name="time"
                required
                value={formData.time}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Screen Format
              </label>
              <select
                name="screenFormat"
                value={formData.screenFormat}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              >
                <option value="2D">2D</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Auditorium
              </label>
              <input
                type="text"
                name="screenName"
                value={formData.screenName}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Base Price (NPR)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={movies.length === 0 || theaters.length === 0}>
              {editingShowtime ? 'Save Changes' : 'Schedule Showtime'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmSt}
        onClose={() => setDeleteConfirmSt(null)}
        title="Delete Scheduled Showtime"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: '#fff' }}>
            Are you sure you want to remove the screening for <strong>{deleteConfirmSt?.movieTitle}</strong> on {deleteConfirmSt?.date && getKathmanduDateLabel(deleteConfirmSt.date)} at {deleteConfirmSt?.time} Nepal time?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={() => setDeleteConfirmSt(null)} className="btn btn-secondary btn-sm">
              Keep Slot
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

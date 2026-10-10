import React, { useEffect, useState } from 'react';
import { Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useLocation } from '../context/LocationContext';
import { showtimeService } from '../services/showtimeService';

const emptyForm = { name: '', city: '', location: '', screens: '', amenities: '' };
const toList = value => value.split(',').map(item => item.trim()).filter(Boolean);

export const ManageTheaters = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTheater, setEditingTheater] = useState(null);
  const [deletingTheater, setDeletingTheater] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const { refreshCities } = useLocation();

  const loadTheaters = async () => {
    try {
      setLoading(true);
      setLoadError('');
      setTheaters(await showtimeService.getTheaters());
    } catch (error) {
      setLoadError(error.message || 'Cinema locations could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheaters();
  }, []);

  const openAdd = () => {
    setEditingTheater(null);
    setFormData(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = theater => {
    setEditingTheater(theater);
    setFormData({
      name: theater.name || '',
      city: theater.city || '',
      location: theater.location || '',
      screens: theater.screens?.join(', ') || '',
      amenities: theater.amenities?.join(', ') || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleChange = event => setFormData(previous => ({ ...previous, [event.target.name]: event.target.value }));

  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = { ...formData, screens: toList(formData.screens), amenities: toList(formData.amenities) };
    try {
      if (editingTheater) await showtimeService.updateTheater(editingTheater.id, payload);
      else await showtimeService.createTheater(payload);
      setModalOpen(false);
      await Promise.all([loadTheaters(), refreshCities()]);
    } catch (error) {
      setFormError(error.message || 'Cinema could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTheater) return;
    setFormError('');
    try {
      await showtimeService.deleteTheater(deletingTheater.id);
      setDeletingTheater(null);
      await Promise.all([loadTheaters(), refreshCities()]);
    } catch (error) {
      setFormError(error.message || 'Cinema could not be deleted.');
      setDeletingTheater(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Cities & Cinemas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Locations are stored in the booking database.</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Cinema</button>
      </div>

      {formError && <div role="alert" className="form-error">{formError}</div>}
      {loading ? <LoadingSpinner text="Loading cinema locations..." /> : loadError ? (
        <div role="alert" className="form-error">{loadError}</div>
      ) : theaters.length === 0 ? (
        <div className="card" style={{ padding: '2rem' }}>No cinemas have been registered yet.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Cinema</th>
                <th style={{ padding: '1rem' }}>City</th>
                <th style={{ padding: '1rem' }}>Screens</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr></thead>
              <tbody>{theaters.map(theater => (
                <tr key={theater.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700 }}>{theater.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{theater.location}</div>
                  </td>
                  <td style={{ padding: '1rem' }}><Badge variant="blue"><MapPin size={13} /> {theater.city}</Badge></td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{theater.screens?.join(', ') || 'Not specified'}</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(theater)} className="btn btn-secondary btn-sm" title={`Edit ${theater.name}`} aria-label={`Edit ${theater.name}`}><Edit size={15} /></button>
                      <button onClick={() => setDeletingTheater(theater)} className="btn btn-outline btn-sm" title={`Delete ${theater.name}`} aria-label={`Delete ${theater.name}`}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTheater ? 'Edit Cinema' : 'Add Cinema'} maxWidth="620px">
        <form onSubmit={handleSubmit} className="form-stack">
          {formError && <div role="alert" className="form-error">{formError}</div>}
          {[
            ['name', 'Cinema name'],
            ['city', 'City'],
            ['location', 'Address or neighborhood']
          ].map(([name, label]) => (
            <label key={name} className="field-label">{label}
              <input name={name} required maxLength={120} value={formData[name]} onChange={handleChange} />
            </label>
          ))}
          <label className="field-label">Screens, comma separated
            <input name="screens" maxLength={500} value={formData.screens} onChange={handleChange} placeholder="Screen 1, Screen 2" />
          </label>
          <label className="field-label">Amenities, comma separated
            <input name="amenities" maxLength={500} value={formData.amenities} onChange={handleChange} placeholder="Accessible seating, Parking" />
          </label>
          <div className="form-actions">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Cinema'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deletingTheater} onClose={() => setDeletingTheater(null)} title="Delete Cinema">
        <p>Delete <strong>{deletingTheater?.name}</strong>? Cinemas with showtimes cannot be removed.</p>
        <div className="form-actions">
          <button onClick={() => setDeletingTheater(null)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn btn-danger">Delete Cinema</button>
        </div>
      </Modal>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { TicketCheck, Search, Filter, CheckCircle2, XCircle, Printer, Eye } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { formatNPR } from '../utils/currency';
import { getKathmanduDateLabel } from '../utils/dates';

export const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setLoadError(err.message || 'Bookings are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      await loadBookings();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = b.customerName?.toLowerCase().includes(q);
      const matchEmail = b.customerEmail?.toLowerCase().includes(q);
      const matchMovie = b.movieTitle?.toLowerCase().includes(q);
      const matchId = b.id?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchMovie && !matchId) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Customer Bookings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Review reservations, seat selections, customer details and amounts payable at the cinema counter.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flex: 1,
          minWidth: '260px'
        }}>
          <Search size={18} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search by customer name, email, ref code or movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'none', border: 'none', padding: 0 }}
          />
        </div>

        {/* Status segmented controls */}
        <div style={{
          display: 'inline-flex',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'Confirmed', label: 'Confirmed' },
            { id: 'Cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: statusFilter === tab.id ? 'var(--primary)' : 'transparent',
                color: statusFilter === tab.id ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving booking transactions..." />
      ) : loadError ? (
        <div role="alert" style={{ color: '#fca5a5', padding: '2rem' }}>{loadError}</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Booking Code</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Movie & Auditorium</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Slot</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Seats</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Total</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: '#fbbf24' }}>
                      #{b.id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{b.customerName}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>{b.customerEmail}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{b.movieTitle}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {b.theaterName} • {b.screenFormat}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#fff', fontSize: '0.84rem' }}>{getKathmanduDateLabel(b.date)}</div>
                      <div style={{ color: '#38bdf8', fontSize: '0.78rem', fontWeight: 600 }}>{b.time} Nepal time</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {b.seats?.map(s => (
                          <span
                            key={s}
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '3px',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              fontWeight: 700
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>
                      {formatNPR(b.totalAmount)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: b.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: b.status === 'Confirmed' ? '#34d399' : '#f87171',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Confirmed" style={{ background: '#1e293b', color: '#fff' }}>Confirmed</option>
                        <option value="Cancelled" style={{ background: '#1e293b', color: '#fff' }}>Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedBookingDetails(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                        title="View Full Details"
                      >
                        <Eye size={14} /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      <Modal
        isOpen={!!selectedBookingDetails}
        onClose={() => setSelectedBookingDetails(null)}
        title={`Booking Pass Reference #${selectedBookingDetails?.id}`}
        maxWidth="500px"
      >
        {selectedBookingDetails && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              {selectedBookingDetails.moviePoster && (
                <img
                  src={selectedBookingDetails.moviePoster}
                  alt={selectedBookingDetails.movieTitle}
                  style={{ width: '60px', height: '85px', objectFit: 'cover', borderRadius: '4px' }}
                />
              )}
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  {selectedBookingDetails.movieTitle}
                </h4>
                <p style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600 }}>
                  {selectedBookingDetails.screenFormat} • {selectedBookingDetails.screenName}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {selectedBookingDetails.theaterName}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Customer</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{selectedBookingDetails.customerName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{selectedBookingDetails.customerEmail}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{selectedBookingDetails.customerPhone}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Showtime & Seats</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>
                  {getKathmanduDateLabel(selectedBookingDetails.date)} @ {selectedBookingDetails.time} Nepal time
                </div>
                <div style={{ color: '#10b981', fontWeight: 700, marginTop: '0.2rem' }}>
                  Seats: {selectedBookingDetails.seats?.join(', ')}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                <span>Subtotal:</span>
                <span>{formatNPR(selectedBookingDetails.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                <span>Booking fee:</span>
                <span>{formatNPR(selectedBookingDetails.bookingFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                <span>VAT:</span>
                <span>{formatNPR(selectedBookingDetails.tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#fbbf24', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                <span>Total due at counter:</span>
                <span>{formatNPR(selectedBookingDetails.totalAmount)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setSelectedBookingDetails(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

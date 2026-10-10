import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Ticket, Printer, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { formatNPR } from '../utils/currency';
import { getKathmanduDateLabel } from '../utils/dates';

export const MyTickets = () => {
  const { user } = useAuth();
  const location = useLocation();
  const newlyBookedId = location.state?.newlyBookedId;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all | active | cancelled
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setLoadError('');
      setBookings(await bookingService.getBookings());
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setLoadError(err.message || 'Tickets are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      setCancelling(true);
      await bookingService.cancelBooking(cancelModalBooking.id);
      await fetchTickets();
      setCancelModalBooking(null);
    } catch (err) {
      alert('Failed to cancel ticket: ' + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const filtered = bookings.filter(b => {
    if (filterTab === 'active') return b.status === 'Confirmed';
    if (filterTab === 'cancelled') return b.status === 'Cancelled';
    return true;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      
      {/* Newly Booked Success Notice */}
      {newlyBookedId && (
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#ecfdf5'
        }}>
          <CheckCircle2 size={32} color="#10b981" />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399' }}>
              Booking Confirmed Successfully!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)' }}>
              Reservation #{newlyBookedId} is confirmed. Pay at the cinema counter; this is not a digital entry ticket.
            </p>
          </div>
        </div>
      )}

      {/* Header & Filter Tabs */}
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.3rem' }}>
              My Tickets
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Review your reservations and booking history. Payment is due at the cinema counter.
          </p>
        </div>

        {/* Filter Segmented Controls */}
        <div style={{
          display: 'inline-flex',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {[
            { id: 'all', label: 'All Tickets' },
            { id: 'active', label: 'Confirmed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: filterTab === tab.id ? 'var(--primary)' : 'transparent',
                color: filterTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <LoadingSpinner text="Loading your reservations..." />
      ) : loadError ? (
        <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{loadError}</p>
          <button className="btn btn-primary" onClick={fetchTickets}>Try Again</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No tickets found"
          message="You don't have any tickets matching this filter. Explore current screenings and book your preferred seats now."
          actionText="Browse Movies"
          actionLink="/movies"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {filtered.map(booking => {
            const isNewlyBooked = booking.id === newlyBookedId;
            const isCancelled = booking.status === 'Cancelled';

            return (
              <div
                key={booking.id}
                style={{
                  position: 'relative',
                  backgroundColor: '#0f172a',
                  border: isNewlyBooked ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Authentic Cinema Ticket Split Layout */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  alignItems: 'stretch'
                }}>
                  
                  {/* Left / Main Section of Ticket */}
                  <div style={{
                    padding: '1.75rem',
                    display: 'flex',
                    gap: '1.5rem',
                    flex: 1,
                    borderRight: '1px dashed var(--border-light)'
                  }}>
                    <img
                      src={booking.moviePoster}
                      alt={`${booking.movieTitle} poster`}
                      style={{
                        width: '85px',
                        height: '125px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        display: 'none'
                      }}
                      className="d-sm-block"
                    />

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#fbbf24',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                          }}>
                            #{booking.id}
                          </span>
                          <Badge variant={isCancelled ? 'neutral' : 'green'}>
                            {booking.status}
                          </Badge>
                          <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                            {booking.screenFormat}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.2rem' }}>
                          {booking.movieTitle}
                        </h3>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {booking.theaterName} • {booking.screenName}
                        </p>
                      </div>

                      {/* Date, Time & Seats Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '0.75rem',
                        padding: '0.85rem',
                        backgroundColor: 'rgba(5, 8, 15, 0.6)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.84rem'
                      }}>
                        <div>
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Date & Time</div>
                          <div style={{ fontWeight: 700, color: '#fff', marginTop: '0.1rem' }}>
                            {getKathmanduDateLabel(booking.date)} @ {booking.time} Nepal time
                          </div>
                        </div>

                        <div>
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Seats ({booking.seats?.length})</div>
                          <div style={{ fontWeight: 700, color: '#10b981', marginTop: '0.1rem' }}>
                            {booking.seats?.join(', ')}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Audience Pass</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            {booking.customerName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reservation reference and actions */}
                  <div style={{
                    backgroundColor: 'rgba(8, 11, 18, 0.75)',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '1rem',
                    minWidth: '220px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Due at counter
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                        {formatNPR(booking.totalAmount)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        Payment due at cinema counter
                      </div>
                    </div>

                    {/* Action buttons on stub */}
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button
                        onClick={() => window.print()}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, fontSize: '0.8rem' }}
                      >
                        <Printer size={14} /> Print
                      </button>

                      {!isCancelled && (
                        <button
                          onClick={() => setCancelModalBooking(booking)}
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelModalBooking}
        onClose={() => setCancelModalBooking(null)}
        title="Cancel Ticket Reservation"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600, color: '#fff', marginBottom: '0.3rem' }}>
                Are you sure you want to cancel booking #{cancelModalBooking?.id}?
              </p>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                This will release seats <strong>{cancelModalBooking?.seats?.join(', ')}</strong> back to the theater pool for {cancelModalBooking?.movieTitle}.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={() => setCancelModalBooking(null)}
              className="btn btn-secondary btn-sm"
              disabled={cancelling}
            >
              Keep Tickets
            </button>
            <button
              onClick={handleCancelBooking}
              className="btn btn-danger btn-sm"
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

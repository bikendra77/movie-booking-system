import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, ShieldCheck, Ticket, User } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatNPR } from '../utils/currency';
import { getKathmanduDateLabel } from '../utils/dates';

export const BookingSummary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedMovie,
    selectedShowtime,
    selectedSeats,
    contactInfo,
    setContactInfo,
    calculateTotals,
    setLastConfirmedBooking,
    resetBooking
  } = useBooking();

  const [formData, setFormData] = useState({
    name: user?.name || contactInfo.name || '',
    email: user?.email || contactInfo.email || '',
    phone: user?.phone || contactInfo.phone || ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user && !contactInfo.name) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  if (!selectedMovie || !selectedShowtime || selectedSeats.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h3>No active booking in progress</h3>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          Please select a movie, screening time, and your desired seats to continue.
        </p>
        <Link to="/movies" className="btn btn-primary">
          Explore Movies
        </Link>
      </div>
    );
  }

  const { seatCount, subtotal, bookingFee, tax, totalAmount } = calculateTotals();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (formData.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMsg('Please enter customer name and valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setContactInfo(formData);

      const bookingPayload = {
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone,
        showtimeId: selectedShowtime.id,
        seats: selectedSeats.map(s => s.id)
      };

      const confirmed = await bookingService.createBooking(bookingPayload);
      setLastConfirmedBooking(confirmed);
      resetBooking();

      // Navigate to My Tickets page with highlight on new ticket
      navigate('/my-tickets', { state: { newlyBookedId: confirmed.id } });
    } catch (err) {
      console.error('Booking failed:', err);
      setErrorMsg(err.message || 'Booking confirmation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-enter" style={{ padding: '2rem 1.25rem 5rem' }}>
      
      {/* Stepper Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '2rem',
        fontSize: '0.84rem'
      }}>
        <span style={{ color: 'var(--text-dim)' }}>1. Showtimes</span>
        <ChevronRight size={14} color="var(--text-dim)" />
        <span style={{ color: 'var(--text-dim)' }}>2. Seats</span>
        <ChevronRight size={14} color="var(--text-dim)" />
        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>3. Summary</span>
        <ChevronRight size={14} color="var(--text-dim)" />
        <span style={{ color: 'var(--text-dim)' }}>4. Pass</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: 'var(--text-muted)',
            fontSize: '0.88rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Seats
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Confirm Booking Summary</h1>
      </div>

      {errorMsg && (
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: 'var(--radius-md)',
          color: '#fca5a5',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          {errorMsg}
        </div>
      )}

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Customer details and pay-at-counter notice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Customer Details Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary)" /> Ticket Holder Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{ width: '100%' }}
                    placeholder="e.g. Asha Thapa"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Contact Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ width: '100%' }}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                  placeholder="+977-98XXXXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#38bdf8" /> Payment
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Reserve your seats now and pay in NPR at the cinema counter.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1.25rem',
              color: 'var(--text-dim)',
              fontSize: '0.78rem'
            }}>
              <ShieldCheck size={16} color="#10b981" />
              <span>Pay-at-counter reservation. Online payment is not enabled.</span>
            </div>
          </div>

        </div>

        {/* Right Column: Order Details & Price Breakdown */}
        <div className="card" style={{ border: '1px solid rgba(229, 9, 20, 0.35)' }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem'
          }}>
            <img
              src={selectedMovie.poster}
              alt={`${selectedMovie.title} poster`}
              style={{ width: '70px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
            />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                {selectedMovie.title}
              </h3>
              <p style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                {selectedShowtime.screenFormat} • {selectedShowtime.screenName}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {selectedShowtime.theaterName}
              </p>
              <p style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 600, marginTop: '0.2rem' }}>
                {getKathmanduDateLabel(selectedShowtime.date)} at {selectedShowtime.time} (Nepal time)
              </p>
            </div>
          </div>

          {/* Seat details */}
          <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.86rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Reserved Seats ({seatCount})</span>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {selectedSeats.map(s => (
                  <span
                    key={s.id}
                    style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#34d399',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}
                  >
                    {s.id}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Ticket Subtotal ({seatCount} × avg)</span>
              <span style={{ color: '#fff' }}>{formatNPR(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Booking fee (Rs. 25/ticket)</span>
              <span style={{ color: '#fff' }}>{formatNPR(bookingFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>VAT (13%)</span>
              <span style={{ color: '#fff' }}>{formatNPR(tax)}</span>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.25rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Total Amount</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Pay at the counter</div>
              </div>
              <span style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fbbf24' }}>
              {formatNPR(totalAmount)}
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmBooking}
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', fontSize: '1.05rem' }}
          >
            {submitting ? (
              'Confirming reservation...'
            ) : (
              <>
                <Ticket size={20} /> Reserve Seats
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '0.85rem' }}>
            This reserves the selected seats. Payment is due at the counter; cancellation is available from My Tickets.
          </p>
        </div>

      </div>

    </div>
  );
};

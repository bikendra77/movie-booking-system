import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Calendar, TicketCheck, DollarSign, Users, Plus, ArrowRight, MapPin } from 'lucide-react';
import { movieService } from '../services/movieService';
import { showtimeService } from '../services/showtimeService';
import { bookingService } from '../services/bookingService';
import { authService } from '../services/authService';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { formatNPR } from '../utils/currency';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalBookings: 0,
    totalUsers: 0,
    revenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [locationStats, setLocationStats] = useState({ cityCount: 0, cinemaCount: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const [movies, bookings, users, showtimes, locations] = await Promise.all([
          movieService.getMovies(),
          bookingService.getBookings(),
          authService.getAllUsers(),
          showtimeService.getShowtimes(),
          showtimeService.getLocationStats()
        ]);

        const totalRevenue = bookings
          .filter(b => b.status !== 'Cancelled')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        setStats({
          totalMovies: movies.length,
          totalBookings: bookings.length,
          totalUsers: users.length,
          revenue: totalRevenue
        });

        setRecentBookings(bookings.slice(0, 5));
        setTopMovies(movies.slice(0, 4));
        setLocationStats(locations);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        setLoadError(err.message || 'Dashboard data is temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling box-office and reservation metrics..." />;
  }

  if (loadError) {
    return <div role="alert" style={{ color: '#fca5a5', padding: '2rem' }}>{loadError}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header title & Quick actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Admin Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Database-backed catalogue and reservation overview. Reservations are payable at the cinema counter.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/movies" className="btn btn-primary btn-sm">
            <Plus size={15} /> Add Movie
          </Link>
          <Link to="/admin/showtimes" className="btn btn-secondary btn-sm">
            <Calendar size={15} /> Schedule Showtime
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1.25rem'
      }}>
        <StatCard
          title="Total Movies"
          value={stats.totalMovies}
          subtitle="Movies in the database"
          icon={Film}
          color="#e50914"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="Customer reservations"
          icon={TicketCheck}
          color="#38bdf8"
        />
        <StatCard
          title="Registered Users"
          value={stats.totalUsers}
          subtitle="Patrons on platform"
          icon={Users}
          color="#10b981"
        />
        <StatCard
          title="Reservation Value"
          value={formatNPR(stats.revenue)}
          subtitle="Payable at the cinema counter"
          icon={DollarSign}
          color="#f59e0b"
        />
        <StatCard
          title="Registered Cities"
          value={locationStats.cityCount}
          subtitle="Cities with cinemas"
          icon={MapPin}
          color="#a855f7"
        />
        <StatCard
          title="Cinema Locations"
          value={locationStats.cinemaCount}
          subtitle="Registered cinemas"
          icon={MapPin}
          color="#38bdf8"
        />
      </div>

      {/* Main Grid: Recent Bookings + Movie Showcase */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* Recent Bookings Table Preview */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Bookings</h3>
            <Link to="/admin/bookings" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
              View All Bookings <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Order Ref</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Customer</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Movie</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Seats</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Total</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', color: '#fbbf24', fontWeight: 600 }}>
                      #{b.id}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#fff', fontWeight: 500 }}>
                      {b.customerName}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                      {b.movieTitle}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#10b981', fontWeight: 600 }}>
                      {b.seats?.join(', ')}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#fff' }}>
                      {formatNPR(b.totalAmount)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <Badge variant={b.status === 'Confirmed' ? 'green' : b.status === 'Cancelled' ? 'neutral' : 'blue'}>
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Catalog Highlights */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Theatrical Catalog</h3>
            <Link to="/admin/movies" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
              Manage Movies <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {topMovies.map(mov => (
              <div
                key={mov.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  padding: '0.65rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <img
                  src={mov.poster}
                  alt={`${mov.title} poster`}
                  style={{ width: '42px', height: '58px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {mov.title}
                  </h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                    {mov.duration} • {mov.genre?.slice(0, 2).join(', ')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
                    {mov.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

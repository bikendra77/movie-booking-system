import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { LocationProvider } from './context/LocationContext';
import { ScrollToTop } from './components/ScrollToTop';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useAuth } from './context/AuthContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Core Pages
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetails } from './pages/MovieDetails';
import { ShowtimeSelection } from './pages/ShowtimeSelection';
import { SeatSelection } from './pages/SeatSelection';
import { BookingSummary } from './pages/BookingSummary';
import { MyTickets } from './pages/MyTickets';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { ManageMovies } from './pages/ManageMovies';
import { ManageShowtimes } from './pages/ManageShowtimes';
import { ManageTheaters } from './pages/ManageTheaters';
import { ManageBookings } from './pages/ManageBookings';

// 404
import { NotFound } from './pages/NotFound';

const RequireAuth = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner text="Checking your account..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <BookingProvider>
       <LocationProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Storefront Customer Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/booking/showtimes/:movieId" element={<ShowtimeSelection />} />
              <Route path="/booking/seats/:showtimeId" element={<SeatSelection />} />
              <Route path="/booking/summary" element={<RequireAuth><BookingSummary /></RequireAuth>} />
              <Route path="/my-tickets" element={<RequireAuth><MyTickets /></RequireAuth>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Admin Management Routes */}
            <Route path="/admin" element={<RequireAuth adminOnly><AdminLayout /></RequireAuth>}>
              <Route index element={<AdminDashboard />} />
              <Route path="movies" element={<ManageMovies />} />
              <Route path="showtimes" element={<ManageShowtimes />} />
              <Route path="cinemas" element={<ManageTheaters />} />
              <Route path="bookings" element={<ManageBookings />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
       </LocationProvider>
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;

import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState(null);

  const selectMovie = (movie) => {
    setSelectedMovie(movie);
  };

  const selectShowtime = (showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]); // Reset seats when changing showtime
  };

  const toggleSeat = (seatObj) => {
    setSelectedSeats(prev => {
      const exists = prev.some(s => s.id === seatObj.id);
      if (exists) {
        return prev.filter(s => s.id !== seatObj.id);
      } else {
        if (prev.length >= 8) {
          window.alert('You can select a maximum of 8 seats per booking.');
          return prev;
        }
        return [...prev, seatObj];
      }
    });
  };

  const clearSeats = () => {
    setSelectedSeats([]);
  };

  const resetBooking = () => {
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setContactInfo({ name: '', email: '', phone: '' });
  };

  // Calculations
  const calculateTotals = () => {
    const seatCount = selectedSeats.length;
    const subtotal = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    const bookingFee = seatCount * 25;
    const tax = Math.round(subtotal * 0.13);
    const totalAmount = subtotal + bookingFee + tax;

    return {
      seatCount,
      subtotal,
      bookingFee,
      tax,
      totalAmount
    };
  };

  const value = {
    selectedMovie,
    selectedShowtime,
    selectedSeats,
    contactInfo,
    lastConfirmedBooking,
    setContactInfo,
    setLastConfirmedBooking,
    selectMovie,
    selectShowtime,
    toggleSeat,
    clearSeats,
    resetBooking,
    calculateTotals
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

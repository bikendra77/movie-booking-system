import { apiRequest } from './api';

export const bookingService = {
  async getBookings() {
    return apiRequest('/bookings');
  },

  async getBookingById(id) {
    return apiRequest(`/bookings/${encodeURIComponent(id)}`);
  },

  async getUserBookings() {
    return this.getBookings();
  },

  async createBooking(bookingData) {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: bookingData.showtimeId,
        seats: bookingData.seats,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone
      })
    });
  },

  async cancelBooking(bookingId) {
    return apiRequest(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: 'PATCH'
    });
  },

  async updateBookingStatus(bookingId, newStatus) {
    return apiRequest(`/bookings/${encodeURIComponent(bookingId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
  }
};

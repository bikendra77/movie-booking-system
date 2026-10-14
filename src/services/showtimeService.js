import { apiRequest } from './api';

export const showtimeService = {
  async getTheaters(filters = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) query.set(key, value);
    }
    const suffix = query.size ? `?${query.toString()}` : '';
    return apiRequest(`/theaters${suffix}`);
  },

  async getLocationStats() {
    return apiRequest('/theaters/stats');
  },

  async createTheater(data) {
    return apiRequest('/theaters', { method: 'POST', body: JSON.stringify(data) });
  },

  async updateTheater(id, data) {
    return apiRequest(`/theaters/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async deleteTheater(id) {
    return apiRequest(`/theaters/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async getShowtimes(filters = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) query.set(key, value);
    }
    const suffix = query.size ? `?${query.toString()}` : '';
    return apiRequest(`/showtimes${suffix}`);
  },

  async getManagedShowtimes(filters = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) query.set(key, value);
    }
    const suffix = query.size ? `?${query.toString()}` : '';
    return apiRequest(`/showtimes/manage${suffix}`);
  },

  async getShowtimeById(id) {
    return apiRequest(`/showtimes/${encodeURIComponent(id)}`);
  },

  async createShowtime(data) {
    return apiRequest('/showtimes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateShowtime(id, data) {
    return apiRequest(`/showtimes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteShowtime(id) {
    return apiRequest(`/showtimes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
};

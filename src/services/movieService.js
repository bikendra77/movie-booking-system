import { apiRequest } from './api';

export const movieService = {
  async getMovies(filters = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value && value !== 'all' && value !== 'All') query.set(key, value);
    }
    const suffix = query.size ? `?${query.toString()}` : '';
    return apiRequest(`/movies${suffix}`);
  },

  async getMovieById(id) {
    return apiRequest(`/movies/${encodeURIComponent(id)}`);
  },

  async getFeaturedMovies() {
    const movies = await this.getMovies({ status: 'now_showing' });
    const featured = movies.filter(movie => movie.featured);
    return featured.length ? featured : movies.slice(0, 3);
  },

  async createMovie(movieData) {
    return apiRequest('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData)
    });
  },

  async updateMovie(id, updatedFields) {
    return apiRequest(`/movies/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields)
    });
  },

  async deleteMovie(id) {
    return apiRequest(`/movies/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
};

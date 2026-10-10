import { apiRequest, clearAuthToken, getAuthToken, saveAuthToken } from './api';

const authenticate = async (path, data) => {
  const result = await apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  saveAuthToken(result.token);
  return result.user;
};

export const authService = {
  async getCurrentUser() {
    if (!getAuthToken()) return null;
    try {
      const result = await apiRequest('/auth/me');
      return result.user;
    } catch (error) {
      if (/session|sign in/i.test(error.message)) {
        clearAuthToken();
        return null;
      }
      throw error;
    }
  },

  async login(email, password) {
    return authenticate('/auth/login', { email, password });
  },

  async register(data) {
    return authenticate('/auth/register', data);
  },

  async logout() {
    try {
      if (getAuthToken()) await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },

  async getAllUsers() {
    return apiRequest('/auth/users');
  }
};

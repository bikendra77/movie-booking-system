const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'cinewave_token';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const saveAuthToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);

export const apiRequest = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Unable to reach the CineWave API. Check that the backend and MongoDB are running.');
  }

  if (response.status === 204) return null;
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) clearAuthToken();
    throw new Error(result?.message || `Request failed (${response.status}).`);
  }
  return result;
};

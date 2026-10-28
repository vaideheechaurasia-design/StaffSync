import apiClient from './apiClient.js';

export const authService = {
  /**
   * Authenticates user against the backend API and receives an HttpOnly session cookie.
   *
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} API response payload
   */
  async login(credentials) {
    return await apiClient.post('/auth/login', credentials);
  },

  /**
   * Clears the server-side authentication cookie.
   *
   * @returns {Promise<Object>} API response payload
   */
  async logout() {
    return await apiClient.post('/auth/logout');
  },

  /**
   * Verifies the active session and retrieves authenticated user profile.
   *
   * @returns {Promise<Object>} API response payload
   */
  async getMe() {
    return await apiClient.get('/auth/me');
  }
};

export default authService;

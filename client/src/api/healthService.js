import apiClient from './apiClient.js';

export const healthService = {
  /**
   * Pings the backend health endpoint
   * @returns {Promise<Object>} Backend operational health payload
   */
  async checkHealth() {
    return await apiClient.get('/health');
  }
};


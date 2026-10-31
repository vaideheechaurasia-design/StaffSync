import apiClient from './apiClient.js';

export const healthService = {
  /**
   * Pings the backend health liveness endpoint
   * @returns {Promise<Object>} Backend operational health payload
   */
  async checkHealth() {
    return await apiClient.get('/health');
  },

  /**
   * Checks backend database readiness
   * @returns {Promise<Object>} Backend database readiness payload
   */
  async checkReadiness() {
    return await apiClient.get('/health/ready');
  }
};

export default healthService;

import apiClient from './apiClient.js';

export const departmentService = {
  /**
   * Retrieves all active organizational departments.
   *
   * @returns {Promise<Object>} API response payload { success, data: Department[] }
   */
  async getAll() {
    return await apiClient.get('/departments');
  },

  /**
   * Retrieves a single department by ID.
   *
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getById(id) {
    return await apiClient.get(`/departments/${id}`);
  },

  /**
   * Creates a new department (HR_ADMIN only).
   *
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    return await apiClient.post('/departments', data);
  }
};

export default departmentService;

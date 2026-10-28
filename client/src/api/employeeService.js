import apiClient from './apiClient.js';

export const employeeService = {
  /**
   * Retrieves list of employees with optional search and filtering.
   *
   * @param {Object} [params={}] - { search, department, status, page, limit }
   * @returns {Promise<Object>} API response payload { success, data: Employee[] }
   */
  async getAll(params = {}) {
    return await apiClient.get('/employees', { params });
  },

  /**
   * Retrieves a single employee by database ID or employeeCode.
   *
   * @param {string} id
   * @returns {Promise<Object>} API response payload { success, data: Employee }
   */
  async getById(id) {
    return await apiClient.get(`/employees/${id}`);
  },

  /**
   * Onboards a new employee and provisions their user account (HR_ADMIN only).
   *
   * @param {Object} data - Employee and account parameters
   * @returns {Promise<Object>} API response payload { success, data: Employee }
   */
  async create(data) {
    return await apiClient.post('/employees', data);
  },

  /**
   * Updates an existing employee profile (HR_ADMIN only).
   *
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>} API response payload { success, data: Employee }
   */
  async update(id, data) {
    return await apiClient.put(`/employees/${id}`, data);
  },

  /**
   * Deactivates or removes an employee record (HR_ADMIN only).
   *
   * @param {string} id
   * @param {boolean} [permanent=false]
   * @returns {Promise<Object>} API response payload { success, message }
   */
  async delete(id, permanent = false) {
    return await apiClient.delete(`/employees/${id}`, {
      params: { permanent }
    });
  }
};

export default employeeService;

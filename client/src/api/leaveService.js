import apiClient from './apiClient.js';

export const leaveService = {
  /**
   * Submits a new leave application.
   *
   * @param {Object} data - { leaveType, startDate, endDate, totalDays, reason }
   * @returns {Promise<Object>} API response payload
   */
  async apply(data) {
    return await apiClient.post('/leaves', data);
  },

  /**
   * Retrieves the current user's personal leave applications.
   *
   * @param {Object} [params={}] - { status, year }
   * @returns {Promise<Object>} { success, data: LeaveRequest[], balance: LeaveBalance }
   */
  async getMyLeaves(params = {}) {
    return await apiClient.get('/leaves/my-requests', { params });
  },

  /**
   * Retrieves current year remaining and consumed leave balances.
   *
   * @param {Object} [params={}] - { year }
   * @returns {Promise<Object>} { success, data: LeaveBalance }
   */
  async getMyBalance(params = {}) {
    return await apiClient.get('/leaves/my-balance', { params });
  },

  /**
   * Retrieves leave applications awaiting review within manager / HR scope.
   *
   * @param {Object} [params={}] - { departmentId }
   * @returns {Promise<Object>} { success, count, data: LeaveRequest[] }
   */
  async getPendingApprovals(params = {}) {
    return await apiClient.get('/leaves/pending-approvals', { params });
  },

  /**
   * Retrieves organization-wide leave records with multi-criteria filtering (HR_ADMIN only).
   *
   * @param {Object} [params={}] - { employeeId, departmentId, leaveType, status, startDate, endDate, page, limit }
   * @returns {Promise<Object>} { success, total, totalPages, data: LeaveRequest[] }
   */
  async getAll(params = {}) {
    return await apiClient.get('/leaves', { params });
  },

  /**
   * Retrieves an individual leave application by database ID.
   *
   * @param {string} id
   * @returns {Promise<Object>} API response payload
   */
  async getById(id) {
    return await apiClient.get(`/leaves/${id}`);
  },

  /**
   * Approves or rejects a pending leave application.
   *
   * @param {string} id
   * @param {Object} data - { status: 'APPROVED' | 'REJECTED', reviewComment?: string }
   * @returns {Promise<Object>} API response payload
   */
  async review(id, data) {
    return await apiClient.patch(`/leaves/${id}/status`, data);
  },

  /**
   * Cancels a pending leave application (Self-service).
   *
   * @param {string} id
   * @returns {Promise<Object>} API response payload
   */
  async cancel(id) {
    return await apiClient.delete(`/leaves/${id}`);
  }
};

export default leaveService;

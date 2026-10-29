import apiClient from './apiClient.js';

export const attendanceService = {
  /**
   * Records daily clock-in timestamp for the authenticated employee.
   *
   * @param {string} [notes] - Optional note regarding workstation or shift
   * @returns {Promise<Object>} API response payload { success, data: Attendance }
   */
  async checkIn(notes) {
    return await apiClient.post('/attendance/check-in', { notes });
  },

  /**
   * Records daily clock-out timestamp and computes total hours.
   *
   * @param {string} [notes] - Optional checkout notes
   * @returns {Promise<Object>} API response payload { success, data: Attendance }
   */
  async checkOut(notes) {
    return await apiClient.post('/attendance/check-out', { notes });
  },

  /**
   * Retrieves today's clock-in/out status for the current user.
   *
   * @returns {Promise<Object>} { success, data: { isCheckedIn, isCheckedOut, record } }
   */
  async getTodayStatus() {
    return await apiClient.get('/attendance/today');
  },

  /**
   * Retrieves personal attendance records with monthly stats.
   *
   * @param {Object} [params={}] - { month, year }
   * @returns {Promise<Object>} { success, data: Attendance[], summary }
   */
  async getMyHistory(params = {}) {
    return await apiClient.get('/attendance/my-history', { params });
  },

  /**
   * Retrieves team attendance roster for managers and HR admins.
   *
   * @param {Object} [params={}] - { date, departmentId }
   * @returns {Promise<Object>} { success, data: RosterEntry[], summary }
   */
  async getTeamAttendance(params = {}) {
    return await apiClient.get('/attendance/team', { params });
  },

  /**
   * Retrieves organization-wide attendance records with filtering and pagination (HR_ADMIN only).
   *
   * @param {Object} [params={}] - { date, startDate, endDate, status, departmentId, employeeId, page, limit }
   * @returns {Promise<Object>} { success, data: Attendance[], total, totalPages, page }
   */
  async getAllAttendance(params = {}) {
    return await apiClient.get('/attendance', { params });
  },

  /**
   * Retrieves organization-wide attendance records for today (or specified date) (HR_ADMIN only).
   *
   * @param {string} [date] - ISO date string YYYY-MM-DD (defaults to current local date)
   * @returns {Promise<Object>} API response payload { success, data: Attendance[], total }
   */
  async getAdminTodayAttendance(date) {
    let targetDate = date;
    if (!targetDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      targetDate = `${year}-${month}-${day}`;
    }
    return await apiClient.get('/attendance', { params: { date: targetDate, limit: 100 } });
  },

  /**
   * Manually creates an attendance record (HR_ADMIN only).
   *
   * @param {Object} data - { employeeId, date, checkInTime, checkOutTime, status, notes }
   * @returns {Promise<Object>} API response payload
   */
  async createRecord(data) {
    return await apiClient.post('/attendance', data);
  },

  /**
   * Modifies an existing attendance record (HR_ADMIN only).
   *
   * @param {string} id - Attendance record ID
   * @param {Object} data - { checkInTime, checkOutTime, status, notes }
   * @returns {Promise<Object>} API response payload
   */
  async updateRecord(id, data) {
    return await apiClient.put(`/attendance/${id}`, data);
  }
};

export default attendanceService;

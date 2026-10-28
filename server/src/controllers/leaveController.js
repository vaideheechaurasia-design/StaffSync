import mongoose from 'mongoose';
import { LeaveRequest, LEAVE_TYPES, LEAVE_STATUSES } from '../models/LeaveRequest.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { Employee } from '../models/Employee.js';
import { Department } from '../models/Department.js';
import { normalizeDate, getOrCreateEmployeeForUser } from './attendanceController.js';

/**
 * Calculates business days (Mon-Fri) between two dates inclusive.
 *
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number}
 */
export function calculateWorkingDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid start or end date provided.');
  }

  if (end < start) {
    throw new Error('End date cannot be earlier than start date.');
  }

  let businessDays = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getUTCDay();
    // Exclude Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Fallback to at least 1 day if requested within a weekend or single day
  return Math.max(1, businessDays);
}

/**
 * Resolves or initializes the LeaveBalance document for an employee in a given calendar year.
 *
 * @param {mongoose.Types.ObjectId|string} employeeId
 * @param {number} [year=new Date().getFullYear()]
 * @returns {Promise<Object>}
 */
export async function getOrCreateLeaveBalance(employeeId, year = new Date().getFullYear()) {
  let balance = await LeaveBalance.findOne({ employeeId, year });
  if (!balance) {
    try {
      balance = await LeaveBalance.create({
        employeeId,
        year,
        annual: { quota: 15, used: 0 },
        casual: { quota: 10, used: 0 },
        sick: { quota: 10, used: 0 },
        unpaid: { used: 0 }
      });
    } catch (err) {
      balance = await LeaveBalance.findOne({ employeeId, year });
      if (!balance) throw err;
    }
  }
  return balance;
}

/**
 * Submits a new leave application for the authenticated employee.
 *
 * @route POST /api/v1/leaves
 * @access Authenticated (All Roles)
 */
export const applyLeave = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployeeForUser(req.user);
    const { leaveType, startDate, endDate, totalDays, reason } = req.body;

    // 1. Validate mandatory fields
    if (!leaveType || !Object.values(LEAVE_TYPES).includes(leaveType)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: `Valid leave type is required. Allowed types: ${Object.values(LEAVE_TYPES).join(', ')}.`
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Start date and end date are both required.'
      });
    }

    let normStart;
    let normEnd;
    try {
      normStart = normalizeDate(startDate);
      normEnd = normalizeDate(endDate);
    } catch (e) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid start date or end date format.'
      });
    }

    if (normEnd < normStart) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'End date cannot be earlier than start date.'
      });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Reason for absence is required and must be at least 5 characters long.'
      });
    }

    // 2. Calculate requested days
    let daysRequested;
    if (typeof totalDays === 'number' && totalDays > 0) {
      daysRequested = totalDays;
    } else {
      daysRequested = calculateWorkingDays(normStart, normEnd);
    }

    // 3. Quota validation against annual balance sheet
    const currentYear = normStart.getFullYear();
    const balance = await getOrCreateLeaveBalance(employee._id, currentYear);

    if (leaveType !== LEAVE_TYPES.UNPAID) {
      const typeKey = leaveType.toLowerCase();
      const quotaObj = balance[typeKey];
      if (quotaObj) {
        const remaining = quotaObj.quota - quotaObj.used;
        if (daysRequested > remaining) {
          return res.status(400).json({
            success: false,
            statusCode: 400,
            error: 'Bad Request',
            message: `Insufficient leave balance for ${leaveType}. Remaining: ${remaining} day(s), requested: ${daysRequested} day(s).`
          });
        }
      }
    }

    // 4. Overlap & collision check
    const overlapping = await LeaveRequest.findOne({
      employeeId: employee._id,
      status: { $in: [LEAVE_STATUSES.PENDING, LEAVE_STATUSES.APPROVED] },
      startDate: { $lte: normEnd },
      endDate: { $gte: normStart }
    });

    if (overlapping) {
      const existingStart = overlapping.startDate.toISOString().split('T')[0];
      const existingEnd = overlapping.endDate.toISOString().split('T')[0];
      return res.status(409).json({
        success: false,
        statusCode: 409,
        error: 'Conflict',
        message: `You already have an active or pending leave request overlapping with this period (${existingStart} to ${existingEnd}).`
      });
    }

    // 5. Create leave request
    const newRequest = await LeaveRequest.create({
      employeeId: employee._id,
      leaveType,
      startDate: normStart,
      endDate: normEnd,
      totalDays: daysRequested,
      reason: reason.trim(),
      status: LEAVE_STATUSES.PENDING
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Leave application submitted successfully.',
      data: newRequest
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves the authenticated employee's personal leave applications.
 *
 * @route GET /api/v1/leaves/my-requests
 * @access Authenticated
 */
export const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployeeForUser(req.user);
    const { status, year } = req.query;

    const filter = { employeeId: employee._id };
    if (status && Object.values(LEAVE_STATUSES).includes(status)) {
      filter.status = status;
    }

    const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
    if (!isNaN(currentYear)) {
      const yearStart = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
      const yearEnd = new Date(Date.UTC(currentYear + 1, 0, 1, 0, 0, 0, 0));
      filter.startDate = { $gte: yearStart, $lt: yearEnd };
    }

    const [requests, balance] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('reviewedBy', 'name email role')
        .sort({ createdAt: -1 })
        .lean(),
      getOrCreateLeaveBalance(employee._id, isNaN(currentYear) ? new Date().getFullYear() : currentYear)
    ]);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: requests.length,
      data: requests,
      balance
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves remaining and consumed leave balances for the authenticated employee.
 *
 * @route GET /api/v1/leaves/my-balance
 * @access Authenticated
 */
export const getMyBalance = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployeeForUser(req.user);
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
    const balance = await getOrCreateLeaveBalance(employee._id, isNaN(year) ? new Date().getFullYear() : year);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: balance
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves leave requests awaiting review within the caller's authorized scope.
 *
 * @route GET /api/v1/leaves/pending-approvals
 * @access Authenticated (MANAGER, HR_ADMIN)
 */
export const getPendingApprovals = async (req, res, next) => {
  try {
    const filter = { status: LEAVE_STATUSES.PENDING };

    if (req.user.role === 'MANAGER') {
      const managerEmp = await getOrCreateEmployeeForUser(req.user);

      // Find subordinates assigned to manager or within manager's department
      const subordinates = await Employee.find({
        $or: [
          { managerId: managerEmp._id },
          { departmentId: managerEmp.departmentId }
        ],
        _id: { $ne: managerEmp._id } // Exclude the manager themselves
      }).select('_id');

      const subordinateIds = subordinates.map((s) => s._id);
      filter.employeeId = { $in: subordinateIds };
    } else if (req.query.departmentId && mongoose.Types.ObjectId.isValid(req.query.departmentId)) {
      const deptEmployees = await Employee.find({ departmentId: req.query.departmentId }).select('_id');
      filter.employeeId = { $in: deptEmployees.map((e) => e._id) };
    }

    const pendingRequests = await LeaveRequest.find(filter)
      .populate({
        path: 'employeeId',
        select: 'firstName lastName employeeCode designation departmentId phone',
        populate: { path: 'departmentId', select: 'name code' }
      })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: pendingRequests.length,
      data: pendingRequests
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves organization-wide leave records with multi-criteria filtering (HR_ADMIN only).
 *
 * @route GET /api/v1/leaves
 * @access Authenticated (HR_ADMIN)
 */
export const getAllLeaves = async (req, res, next) => {
  try {
    const { employeeId, departmentId, leaveType, status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
      filter.employeeId = employeeId;
    } else if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      const deptEmployees = await Employee.find({ departmentId }).select('_id');
      filter.employeeId = { $in: deptEmployees.map((e) => e._id) };
    }

    if (leaveType && Object.values(LEAVE_TYPES).includes(leaveType)) {
      filter.leaveType = leaveType;
    }

    if (status && Object.values(LEAVE_STATUSES).includes(status)) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.startDate = { $gte: normalizeDate(startDate) };
      filter.endDate = { $lte: normalizeDate(endDate) };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate({
          path: 'employeeId',
          select: 'firstName lastName employeeCode designation departmentId',
          populate: { path: 'departmentId', select: 'name code' }
        })
        .populate('reviewedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      LeaveRequest.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: requests
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves a single leave request by ID with permission checks.
 *
 * @route GET /api/v1/leaves/:id
 * @access Authenticated
 */
export const getLeaveById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid leave request ID format.'
      });
    }

    const record = await LeaveRequest.findById(id)
      .populate({
        path: 'employeeId',
        select: 'firstName lastName employeeCode designation departmentId userId',
        populate: { path: 'departmentId', select: 'name code' }
      })
      .populate('reviewedBy', 'name email role');

    if (!record) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: 'Leave request not found.'
      });
    }

    // Permission enforcement
    if (req.user.role === 'EMPLOYEE') {
      const employee = await getOrCreateEmployeeForUser(req.user);
      if (record.employeeId._id.toString() !== employee._id.toString()) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          error: 'Forbidden',
          message: 'You are not authorized to view another employee’s leave application.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: record
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Approves or rejects a pending leave application.
 *
 * @route PATCH /api/v1/leaves/:id/status
 * @access Authenticated (MANAGER, HR_ADMIN)
 */
export const reviewLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid leave request ID format.'
      });
    }

    const { status, reviewComment } = req.body;

    if (!status || ![LEAVE_STATUSES.APPROVED, LEAVE_STATUSES.REJECTED].includes(status)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Status must be set to either APPROVED or REJECTED.'
      });
    }

    if (status === LEAVE_STATUSES.REJECTED) {
      if (!reviewComment || typeof reviewComment !== 'string' || reviewComment.trim().length < 5) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          error: 'Bad Request',
          message: 'A detailed rejection comment (minimum 5 characters) is required when rejecting a request.'
        });
      }
    }

    const record = await LeaveRequest.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: 'Leave request not found.'
      });
    }

    // Prevent repeated or conflicting reviews
    if (record.status !== LEAVE_STATUSES.PENDING) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: `Leave application has already been reviewed. Current status is ${record.status}.`
      });
    }

    // Prevent self-approval
    const applicant = await Employee.findById(record.employeeId);
    if (applicant && applicant.userId.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        error: 'Forbidden',
        message: 'Self-approval is strictly prohibited. You cannot review your own leave application.'
      });
    }

    // Manager scope check
    if (req.user.role === 'MANAGER') {
      const managerEmp = await getOrCreateEmployeeForUser(req.user);
      const isDirectReport = applicant && applicant.managerId && applicant.managerId.toString() === managerEmp._id.toString();
      const isSameDepartment = applicant && applicant.departmentId && applicant.departmentId.toString() === managerEmp.departmentId.toString();

      if (!isDirectReport && !isSameDepartment) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          error: 'Forbidden',
          message: 'You are not authorized to review leave requests for employees outside your managerial scope.'
        });
      }
    }

    // Apply review outcome
    record.status = status;
    record.reviewedBy = req.user._id;
    record.reviewedAt = new Date();
    if (reviewComment) {
      record.reviewComment = reviewComment.trim();
    }

    // Decrement leave balance on approval
    if (status === LEAVE_STATUSES.APPROVED && record.leaveType !== LEAVE_TYPES.UNPAID) {
      const year = record.startDate.getFullYear();
      const balance = await getOrCreateLeaveBalance(record.employeeId, year);
      const typeKey = record.leaveType.toLowerCase();
      if (balance[typeKey]) {
        balance[typeKey].used = (balance[typeKey].used || 0) + record.totalDays;
        await balance.save();
      }
    }

    await record.save();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Leave application ${status.toLowerCase()} successfully.`,
      data: record
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Cancels a pending leave request (Applicant self-service).
 *
 * @route DELETE /api/v1/leaves/:id
 * @access Authenticated
 */
export const cancelLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid leave request ID format.'
      });
    }

    const record = await LeaveRequest.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: 'Leave request not found.'
      });
    }

    // Ownership check
    const employee = await getOrCreateEmployeeForUser(req.user);
    if (record.employeeId.toString() !== employee._id.toString() && req.user.role !== 'HR_ADMIN') {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        error: 'Forbidden',
        message: 'You can only cancel your own leave applications.'
      });
    }

    if (record.status !== LEAVE_STATUSES.PENDING) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: `Only pending leave applications can be cancelled. Current status is ${record.status}.`
      });
    }

    record.status = LEAVE_STATUSES.CANCELLED;
    await record.save();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Leave application cancelled successfully.',
      data: record
    });
  } catch (err) {
    return next(err);
  }
};

export default {
  calculateWorkingDays,
  getOrCreateLeaveBalance,
  applyLeave,
  getMyLeaves,
  getMyBalance,
  getPendingApprovals,
  getAllLeaves,
  getLeaveById,
  reviewLeave,
  cancelLeave
};

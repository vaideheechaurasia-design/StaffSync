import mongoose from 'mongoose';
import { Attendance, ATTENDANCE_STATUSES } from '../models/Attendance.js';
import { Employee } from '../models/Employee.js';
import { Department } from '../models/Department.js';

/**
 * Normalizes any valid Date or date string to midnight UTC (00:00:00.000Z).
 * Ensures consistency with the Attendance compound unique index { employeeId: 1, date: 1 }.
 *
 * @param {Date|string|number} [d=new Date()]
 * @returns {Date} Normalized Date object
 */
export function normalizeDate(d = new Date()) {
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided for attendance normalization.');
  }
  return new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Resolves the Employee document linked to the authenticated user.
 * If the user (e.g. initial HR_ADMIN or newly provisioned account) does not yet
 * have an associated Employee profile, one is created automatically so that clock-in
 * and time-tracking work immediately.
 *
 * @param {Object} user - The authenticated user from req.user
 * @returns {Promise<Object>} The linked Employee Mongoose document
 */
export async function getOrCreateEmployeeForUser(user) {
  if (!user || !user._id) {
    throw new Error('Authenticated user reference is required.');
  }

  let employee = await Employee.findOne({ userId: user._id });
  if (employee) return employee;

  // Auto-provision employee profile for administrative or newly created users
  const nameParts = (user.name || 'StaffSync User').trim().split(/\s+/);
  const firstName = nameParts[0] || 'StaffSync';
  const lastName = nameParts.slice(1).join(' ') || (user.role === 'HR_ADMIN' ? 'Admin' : 'Employee');

  // Find or create default department
  let dept = await Department.findOne({ isActive: true });
  if (!dept) {
    dept = await Department.create({
      name: 'Human Resources',
      code: 'HR',
      description: 'Human Resources & People Operations'
    });
  }

  const codeSuffix = user._id ? user._id.toString().slice(-4).toUpperCase() : Math.floor(1000 + Math.random() * 9000);
  const employeeCode = `EMP-${codeSuffix}`;

  try {
    employee = await Employee.create({
      userId: user._id,
      employeeCode,
      firstName,
      lastName,
      departmentId: dept._id,
      designation: user.role === 'HR_ADMIN' ? 'HR Administrator' : (user.role === 'MANAGER' ? 'Team Manager' : 'Staff Associate'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE'
    });
  } catch (err) {
    // In case of race condition or code collision, fetch existing
    employee = await Employee.findOne({ userId: user._id });
    if (!employee) throw err;
  }

  return employee;
}

/**
 * Records daily check-in timestamp for the authenticated employee.
 * Enforces single check-in per calendar day and evaluates late arrival threshold.
 *
 * @route POST /api/v1/attendance/check-in
 * @access Authenticated (All Roles)
 */
export const checkIn = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployeeForUser(req.user);
    const now = new Date();
    const today = normalizeDate(now);

    // 1. Double-punch protection: check for existing attendance on this date
    const existing = await Attendance.findOne({
      employeeId: employee._id,
      date: today
    });

    if (existing && existing.checkInTime) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Conflict',
        message: 'You have already clocked in for today.',
        data: existing
      });
    }

    // 2. Evaluate arrival time against expected shift start (09:30 AM local/UTC)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let status = ATTENDANCE_STATUSES.PRESENT;
    if (hours > 9 || (hours === 9 && minutes > 30)) {
      status = ATTENDANCE_STATUSES.LATE;
    }

    // 3. Create or update attendance record
    const attendance = await Attendance.create({
      employeeId: employee._id,
      date: today,
      checkInTime: now,
      status,
      notes: typeof req.body?.notes === 'string' ? req.body.notes.trim() : undefined
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Checked in successfully.',
      data: attendance
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Conflict',
        message: 'Attendance record for today already exists.'
      });
    }
    return next(err);
  }
};

/**
 * Records daily check-out timestamp and computes total working duration.
 *
 * @route POST /api/v1/attendance/check-out
 * @access Authenticated (All Roles)
 */
export const checkOut = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployeeForUser(req.user);
    const now = new Date();
    const today = normalizeDate(now);

    // 1. Locate today's attendance record
    const record = await Attendance.findOne({
      employeeId: employee._id,
      date: today
    });

    if (!record || !record.checkInTime) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'No check-in record found for today. Please clock in first.'
      });
    }

    if (record.checkOutTime) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'You have already clocked out for today.',
        data: record
      });
    }

    // 2. Compute total working duration in hours (rounded to 2 decimal places)
    const checkOutTime = now;
    const durationMs = checkOutTime.getTime() - record.checkInTime.getTime();
    const totalHours = Math.max(0, parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2)));

    record.checkOutTime = checkOutTime;
    record.totalHours = totalHours;

    // 3. If working duration is under 4.0 hours, mark as HALF_DAY
    if (totalHours < 4.0) {
      record.status = ATTENDANCE_STATUSES.HALF_DAY;
    }

    if (req.body?.notes && typeof req.body.notes === 'string') {
      const additionalNote = req.body.notes.trim();
      record.notes = record.notes ? `${record.notes} | ${additionalNote}` : additionalNote;
    }

    await record.save();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Checked out successfully.',
      data: record
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves today's clock-in/out status for the authenticated employee.
 *
 * @route GET /api/v1/attendance/today
 * @access Authenticated
 */
export const getTodayStatus = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployeeForUser(req.user);
    const today = normalizeDate();

    const record = await Attendance.findOne({
      employeeId: employee._id,
      date: today
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        isCheckedIn: Boolean(record && record.checkInTime),
        isCheckedOut: Boolean(record && record.checkOutTime),
        record: record || null
      }
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves personal attendance history for the authenticated employee with monthly summary metrics.
 *
 * @route GET /api/v1/attendance/my-history
 * @access Authenticated
 */
export const getMyHistory = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployeeForUser(req.user);
    const { month, year } = req.query;

    const filter = { employeeId: employee._id };

    if (month && year) {
      const parsedMonth = parseInt(month, 10);
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedMonth) && !isNaN(parsedYear)) {
        const startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(parsedYear, parsedMonth, 1, 0, 0, 0, 0));
        filter.date = { $gte: startDate, $lt: endDate };
      }
    }

    const records = await Attendance.find(filter).sort({ date: -1 }).limit(100);

    // Compute monthly summary statistics
    const totalDays = records.length;
    const presentCount = records.filter((r) => r.status === ATTENDANCE_STATUSES.PRESENT).length;
    const lateCount = records.filter((r) => r.status === ATTENDANCE_STATUSES.LATE).length;
    const halfDayCount = records.filter((r) => r.status === ATTENDANCE_STATUSES.HALF_DAY).length;
    const absentCount = records.filter((r) => r.status === ATTENDANCE_STATUSES.ABSENT).length;
    const totalWorkingHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const avgWorkingHours = totalDays > 0 ? parseFloat((totalWorkingHours / totalDays).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: records,
      summary: {
        totalDays,
        presentCount,
        lateCount,
        halfDayCount,
        absentCount,
        totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
        avgWorkingHours
      }
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves subordinate attendance for manager supervision.
 *
 * @route GET /api/v1/attendance/team
 * @access Authenticated (MANAGER, HR_ADMIN)
 */
export const getTeamAttendance = async (req, res, next) => {
  try {
    const { date, departmentId } = req.query;
    const queryDate = date ? normalizeDate(date) : normalizeDate();

    let subordinateQuery = { status: 'ACTIVE' };

    if (req.user.role === 'MANAGER') {
      const managerEmployee = await getOrCreateEmployeeForUser(req.user);
      subordinateQuery.$or = [
        { managerId: managerEmployee._id },
        { departmentId: managerEmployee.departmentId }
      ];
    } else if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      subordinateQuery.departmentId = departmentId;
    }

    const subordinates = await Employee.find(subordinateQuery)
      .populate('departmentId', 'name code')
      .lean();

    const subordinateIds = subordinates.map((s) => s._id);

    const attendanceRecords = await Attendance.find({
      employeeId: { $in: subordinateIds },
      date: queryDate
    }).lean();

    const recordMap = new Map();
    for (const record of attendanceRecords) {
      recordMap.set(record.employeeId.toString(), record);
    }

    // Assemble unified team roster
    const roster = subordinates.map((emp) => {
      const record = recordMap.get(emp._id.toString());
      return {
        employee: {
          _id: emp._id,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          designation: emp.designation,
          department: emp.departmentId ? emp.departmentId.name : 'Unassigned'
        },
        attendance: record || null,
        status: record ? record.status : 'NOT_PUNCHED'
      };
    });

    const present = roster.filter((r) => r.status === ATTENDANCE_STATUSES.PRESENT).length;
    const late = roster.filter((r) => r.status === ATTENDANCE_STATUSES.LATE).length;
    const halfDay = roster.filter((r) => r.status === ATTENDANCE_STATUSES.HALF_DAY).length;
    const notPunched = roster.filter((r) => r.status === 'NOT_PUNCHED').length;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      date: queryDate,
      count: roster.length,
      data: roster,
      summary: {
        total: roster.length,
        present,
        late,
        halfDay,
        notPunched
      }
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves company-wide attendance records with multi-criteria filtering and pagination.
 *
 * @route GET /api/v1/attendance
 * @access Authenticated (HR_ADMIN)
 */
export const getAllAttendance = async (req, res, next) => {
  try {
    const { date, startDate, endDate, status, departmentId, employeeId, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (date) {
      filter.date = normalizeDate(date);
    } else if (startDate && endDate) {
      filter.date = {
        $gte: normalizeDate(startDate),
        $lte: normalizeDate(endDate)
      };
    }

    if (status && Object.values(ATTENDANCE_STATUSES).includes(status)) {
      filter.status = status;
    }

    if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
      filter.employeeId = employeeId;
    } else if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      const deptEmployees = await Employee.find({ departmentId }).select('_id');
      filter.employeeId = { $in: deptEmployees.map((e) => e._id) };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate({
          path: 'employeeId',
          select: 'firstName lastName employeeCode designation departmentId',
          populate: { path: 'departmentId', select: 'name code' }
        })
        .sort({ date: -1, checkInTime: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Attendance.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: records
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Manually creates or backfills an attendance record.
 *
 * @route POST /api/v1/attendance/manual
 * @access Authenticated (HR_ADMIN)
 */
export const createAttendanceRecord = async (req, res, next) => {
  try {
    const { employeeId, date, checkInTime, checkOutTime, status, notes } = req.body;

    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Valid employee ID is required.'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Attendance calendar date is required.'
      });
    }

    const normalizedDate = normalizeDate(date);
    const inTime = checkInTime ? new Date(checkInTime) : new Date(normalizedDate.getTime() + 9 * 3600000); // Default 09:00 AM

    let outTime = null;
    let totalHours = 0;

    if (checkOutTime) {
      outTime = new Date(checkOutTime);
      if (outTime <= inTime) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          error: 'Bad Request',
          message: 'Check-out time must be after check-in time.'
        });
      }
      totalHours = parseFloat(((outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60)).toFixed(2));
    }

    const existing = await Attendance.findOne({
      employeeId,
      date: normalizedDate
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Conflict',
        message: 'An attendance record already exists for this employee on the specified date.'
      });
    }

    const newRecord = await Attendance.create({
      employeeId,
      date: normalizedDate,
      checkInTime: inTime,
      checkOutTime: outTime,
      totalHours,
      status: status || (totalHours >= 4 ? ATTENDANCE_STATUSES.PRESENT : ATTENDANCE_STATUSES.HALF_DAY),
      notes: notes ? notes.trim() : undefined
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Attendance record created successfully.',
      data: newRecord
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Conflict',
        message: 'Attendance record already exists for this employee on this date.'
      });
    }
    return next(err);
  }
};

/**
 * Modifies an existing attendance record (admin correction).
 *
 * @route PUT /api/v1/attendance/:id
 * @access Authenticated (HR_ADMIN)
 */
export const updateAttendanceRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid attendance record ID format.'
      });
    }

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: 'Attendance record not found.'
      });
    }

    const { checkInTime, checkOutTime, status, notes } = req.body;

    if (checkInTime) {
      record.checkInTime = new Date(checkInTime);
    }
    if (checkOutTime !== undefined) {
      record.checkOutTime = checkOutTime ? new Date(checkOutTime) : null;
    }

    if (record.checkInTime && record.checkOutTime) {
      if (record.checkOutTime <= record.checkInTime) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          error: 'Bad Request',
          message: 'Check-out time must be after check-in time.'
        });
      }
      record.totalHours = parseFloat(
        ((record.checkOutTime.getTime() - record.checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2)
      );
    }

    if (status && Object.values(ATTENDANCE_STATUSES).includes(status)) {
      record.status = status;
    }

    if (notes !== undefined) {
      record.notes = notes ? notes.trim() : '';
    }

    await record.save();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Attendance record updated successfully.',
      data: record
    });
  } catch (err) {
    return next(err);
  }
};

export default {
  normalizeDate,
  getOrCreateEmployeeForUser,
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getTeamAttendance,
  getAllAttendance,
  createAttendanceRecord,
  updateAttendanceRecord
};

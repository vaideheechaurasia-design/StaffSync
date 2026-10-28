import mongoose from 'mongoose';
import { Employee, EMPLOYEE_STATUSES } from '../models/Employee.js';
import { User, USER_ROLES } from '../models/User.js';
import { Department } from '../models/Department.js';

/**
 * Helper to resolve department ObjectId from an ID, name, or code string.
 */
async function resolveDepartment(deptInput) {
  if (!deptInput) {
    const firstDept = await Department.findOne({ isActive: true });
    return firstDept ? firstDept._id : null;
  }

  // If already a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(deptInput)) {
    const dept = await Department.findById(deptInput);
    if (dept) return dept._id;
  }

  // Lookup by code or name (case-insensitive)
  const deptByCode = await Department.findOne({
    $or: [
      { code: deptInput.toString().trim().toUpperCase() },
      { name: new RegExp(`^${deptInput.toString().trim()}$`, 'i') }
    ]
  });

  if (deptByCode) return deptByCode._id;

  // Fallback to first available active department
  const fallback = await Department.findOne({ isActive: true });
  return fallback ? fallback._id : null;
}

/**
 * Lists employees with search, department filtering, and status filtering.
 *
 * @route GET /api/v1/employees
 * @access Authenticated
 */
export const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status } = req.query || {};

    const filter = {};

    // 1. Text search across name, code, designation
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeCode: searchRegex },
        { designation: searchRegex }
      ];
    }

    // 2. Department filter
    if (department && department !== 'ALL') {
      const deptId = await resolveDepartment(department);
      if (deptId) {
        filter.departmentId = deptId;
      }
    }

    // 3. Status filter
    if (status && status !== 'ALL' && Object.values(EMPLOYEE_STATUSES).includes(status)) {
      filter.status = status;
    }

    const employees = await Employee.find(filter)
      .populate('userId', 'email role isActive lastLogin')
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: employees.length,
      data: employees
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves a single employee profile by ID or employeeCode.
 *
 * @route GET /api/v1/employees/:id
 * @access Authenticated
 */
export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { employeeCode: id.trim().toUpperCase() };
    }

    const employee = await Employee.findOne(query)
      .populate('userId', 'email role isActive lastLogin')
      .populate('departmentId', 'name code description')
      .populate('managerId', 'firstName lastName employeeCode designation');

    if (!employee) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Employee record "${id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: employee
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Onboards a new employee, automatically provisioning their authentication User account.
 *
 * @route POST /api/v1/employees
 * @access HR_ADMIN
 */
export const createEmployee = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      employeeCode,
      departmentId,
      designation,
      phone,
      employmentType,
      dateOfJoining,
      emergencyContact,
      address
    } = req.body || {};

    // 1. Validation of mandatory inputs
    if (!firstName || !lastName || !email || !employeeCode || !designation) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Please provide all required fields: firstName, lastName, email, employeeCode, and designation.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = employeeCode.trim().toUpperCase();

    // 2. Check for duplicate employeeCode
    const existingCode = await Employee.findOne({ employeeCode: normalizedCode });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: `Employee code "${normalizedCode}" is already assigned to another staff member.`
      });
    }

    // 3. Check for duplicate email
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const existingEmployeeWithUser = await Employee.findOne({ userId: user._id });
      if (existingEmployeeWithUser) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          error: 'Bad Request',
          message: `An employee profile already exists for email "${normalizedEmail}".`
        });
      }
    } else {
      // 4. Provision User authentication account
      const userRole = role && Object.values(USER_ROLES).includes(role) ? role : USER_ROLES.EMPLOYEE;
      const initialPassword = password && password.length >= 8 ? password : 'InitialTempPassword123!';

      user = await User.create({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: normalizedEmail,
        password: initialPassword,
        role: userRole,
        isActive: true
      });
    }

    // 5. Resolve department assignment
    const resolvedDeptId = await resolveDepartment(departmentId);
    if (!resolvedDeptId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'A valid department assignment is required. Please create a department first.'
      });
    }

    // 6. Create Employee document
    const employee = await Employee.create({
      userId: user._id,
      employeeCode: normalizedCode,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone ? phone.trim() : '',
      departmentId: resolvedDeptId,
      designation: designation.trim(),
      employmentType: employmentType || 'FULL_TIME',
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
      status: EMPLOYEE_STATUSES.ACTIVE,
      emergencyContact: emergencyContact || {},
      address: address || {}
    });

    const populated = await Employee.findById(employee._id)
      .populate('userId', 'email role isActive')
      .populate('departmentId', 'name code');

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Employee onboarded successfully',
      data: populated
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Duplicate value detected. Employee code or email is already registered.'
      });
    }
    return next(err);
  }
};

/**
 * Updates an employee's profile parameters and synchronizes User credentials.
 *
 * @route PUT /api/v1/employees/:id
 * @access HR_ADMIN
 */
export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Employee record "${id}" not found.`
      });
    }

    // Update allowable fields
    if (updates.firstName !== undefined) employee.firstName = updates.firstName.trim();
    if (updates.lastName !== undefined) employee.lastName = updates.lastName.trim();
    if (updates.phone !== undefined) employee.phone = updates.phone.trim();
    if (updates.designation !== undefined) employee.designation = updates.designation.trim();
    if (updates.employmentType !== undefined) employee.employmentType = updates.employmentType;
    if (updates.dateOfJoining !== undefined) employee.dateOfJoining = new Date(updates.dateOfJoining);
    if (updates.emergencyContact !== undefined) employee.emergencyContact = updates.emergencyContact;
    if (updates.address !== undefined) employee.address = updates.address;

    if (updates.departmentId !== undefined) {
      const resolvedDept = await resolveDepartment(updates.departmentId);
      if (resolvedDept) employee.departmentId = resolvedDept;
    }

    // Synchronize status changes with User account
    if (updates.status !== undefined && Object.values(EMPLOYEE_STATUSES).includes(updates.status)) {
      employee.status = updates.status;
      const isUserActive = updates.status === EMPLOYEE_STATUSES.ACTIVE;
      await User.findByIdAndUpdate(employee.userId, { isActive: isUserActive });
    }

    // Synchronize full name in User document
    if (updates.firstName || updates.lastName) {
      const fullName = `${employee.firstName} ${employee.lastName}`.trim();
      await User.findByIdAndUpdate(employee.userId, { name: fullName });
    }

    await employee.save();

    const populated = await Employee.findById(employee._id)
      .populate('userId', 'email role isActive')
      .populate('departmentId', 'name code');

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Employee updated successfully',
      data: populated
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Deactivates an employee (soft deletion) or permanently removes record.
 *
 * @route DELETE /api/v1/employees/:id
 * @access HR_ADMIN
 */
export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isPermanent = req.query.permanent === 'true';

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Employee record "${id}" not found.`
      });
    }

    if (isPermanent) {
      await Employee.findByIdAndDelete(id);
      await User.findByIdAndDelete(employee.userId);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Employee record permanently deleted.'
      });
    }

    // Standard Soft-Deactivation: Mark status INACTIVE and disable user account
    employee.status = EMPLOYEE_STATUSES.INACTIVE;
    await employee.save();
    await User.findByIdAndUpdate(employee.userId, { isActive: false });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Employee deactivated successfully.'
    });
  } catch (err) {
    return next(err);
  }
};

export default {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};

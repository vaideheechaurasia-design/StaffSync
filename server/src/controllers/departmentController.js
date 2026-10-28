import { Department } from '../models/Department.js';

const DEFAULT_DEPARTMENTS = [
  { name: 'Engineering', code: 'ENG', description: 'Software engineering, quality assurance, and platform infrastructure.' },
  { name: 'Human Resources', code: 'HR', description: 'Talent acquisition, employee relations, and compliance.' },
  { name: 'Sales & Marketing', code: 'MKT', description: 'Enterprise accounts, product marketing, and client growth.' },
  { name: 'Operations', code: 'OPS', description: 'Internal logistics, IT helpdesk, and corporate facilities.' }
];

/**
 * Returns all active departments, auto-initializing default organizational units if empty.
 *
 * @route GET /api/v1/departments
 * @access Authenticated
 */
export const getDepartments = async (req, res, next) => {
  try {
    let departments = await Department.find({ isActive: true }).sort({ name: 1 });

    // Auto-seed default organizational departments on first retrieval if empty
    if (!departments || departments.length === 0) {
      try {
        await Department.insertMany(DEFAULT_DEPARTMENTS, { ordered: false });
        departments = await Department.find({ isActive: true }).sort({ name: 1 });
      } catch (seedErr) {
        // Fall back to querying existing if concurrent insert occurred
        departments = await Department.find({ isActive: true }).sort({ name: 1 });
      }
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: departments.length,
      data: departments
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves a single department by ID.
 *
 * @route GET /api/v1/departments/:id
 * @access Authenticated
 */
export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Department with ID "${req.params.id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: department
    });
  } catch (err) {
    if (err && err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Department with ID "${req.params.id}" not found.`
      });
    }
    return next(err);
  }
};

/**
 * Creates a new department record.
 *
 * @route POST /api/v1/departments
 * @access HR_ADMIN
 */
export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, managerId } = req.body || {};

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Department name and department code are required.'
      });
    }

    const existingName = await Department.findOne({ name: name.trim() });
    if (existingName) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: `Department with name "${name}" already exists.`
      });
    }

    const existingCode = await Department.findOne({ code: code.trim().toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: `Department code "${code}" is already in use.`
      });
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : '',
      managerId: managerId || null,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Department created successfully',
      data: department
    });
  } catch (err) {
    return next(err);
  }
};

export default {
  getDepartments,
  getDepartmentById,
  createDepartment
};

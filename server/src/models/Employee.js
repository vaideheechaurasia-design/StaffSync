import mongoose from 'mongoose';

export const EMPLOYMENT_TYPES = Object.freeze({
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERN'
});

export const EMPLOYEE_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE'
});

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated User ID is required'],
      unique: true
    },
    employeeCode: {
      type: String,
      required: [true, 'Employee code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]+$/, 'Employee code must contain only uppercase letters, numbers, underscores or hyphens']
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phone: {
      type: String,
      trim: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department assignment is required']
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    designation: {
      type: String,
      required: [true, 'Designation / job title is required'],
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters']
    },
    dateOfJoining: {
      type: Date,
      default: Date.now
    },
    employmentType: {
      type: String,
      enum: {
        values: Object.values(EMPLOYMENT_TYPES),
        message: '{VALUE} is not a valid employment type'
      },
      default: EMPLOYMENT_TYPES.FULL_TIME
    },
    status: {
      type: String,
      enum: {
        values: Object.values(EMPLOYEE_STATUSES),
        message: '{VALUE} is not a valid employee status'
      },
      default: EMPLOYEE_STATUSES.ACTIVE
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'USA' }
    },
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for full name
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Indexes
employeeSchema.index({ departmentId: 1, status: 1 });
employeeSchema.index({ managerId: 1 });
employeeSchema.index({ lastName: 1, firstName: 1 });

export const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;

import mongoose from 'mongoose';

export const LEAVE_TYPES = Object.freeze({
  ANNUAL: 'ANNUAL',
  CASUAL: 'CASUAL',
  SICK: 'SICK',
  UNPAID: 'UNPAID'
});

export const LEAVE_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
});

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required']
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: {
        values: Object.values(LEAVE_TYPES),
        message: '{VALUE} is not a valid leave type'
      }
    },
    startDate: {
      type: Date,
      required: [true, 'Leave start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Leave end date is required']
    },
    totalDays: {
      type: Number,
      required: [true, 'Total requested days is required'],
      min: [0.5, 'Total days requested must be at least 0.5']
    },
    reason: {
      type: String,
      required: [true, 'Reason for absence is required'],
      trim: true,
      minlength: [5, 'Reason must be at least 5 characters long'],
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(LEAVE_STATUSES),
        message: '{VALUE} is not a valid leave status'
      },
      default: LEAVE_STATUSES.PENDING
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewComment: {
      type: String,
      trim: true,
      maxlength: [300, 'Review comment cannot exceed 300 characters']
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for query performance and collision detection
leaveRequestSchema.index({ employeeId: 1, status: 1 });
leaveRequestSchema.index({ status: 1, createdAt: -1 });
leaveRequestSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });
leaveRequestSchema.index({ createdAt: -1 });

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;

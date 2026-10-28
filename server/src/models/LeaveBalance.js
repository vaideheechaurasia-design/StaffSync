import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required']
    },
    year: {
      type: Number,
      required: [true, 'Calendar year is required'],
      min: [2020, 'Year must be 2020 or later'],
      max: [2100, 'Year cannot exceed 2100'],
      default: () => new Date().getFullYear()
    },
    annual: {
      quota: { type: Number, default: 15, min: 0 },
      used: { type: Number, default: 0, min: 0 }
    },
    casual: {
      quota: { type: Number, default: 10, min: 0 },
      used: { type: Number, default: 0, min: 0 }
    },
    sick: {
      quota: { type: Number, default: 10, min: 0 },
      used: { type: Number, default: 0, min: 0 }
    },
    unpaid: {
      used: { type: Number, default: 0, min: 0 }
    }
  },
  {
    timestamps: true
  }
);

leaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

export const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);
export default LeaveBalance;

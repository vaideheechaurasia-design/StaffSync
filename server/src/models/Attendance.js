import mongoose from 'mongoose';

export const ATTENDANCE_STATUSES = Object.freeze({
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  HALF_DAY: 'HALF_DAY',
  ABSENT: 'ABSENT'
});

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required']
    },
    date: {
      type: Date,
      required: [true, 'Attendance calendar date is required']
    },
    checkInTime: {
      type: Date,
      required: [true, 'Check-in timestamp is required']
    },
    checkOutTime: {
      type: Date
    },
    totalHours: {
      type: Number,
      default: 0,
      min: [0, 'Total hours cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ATTENDANCE_STATUSES),
        message: '{VALUE} is not a valid attendance status'
      },
      default: ATTENDANCE_STATUSES.PRESENT
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  },
  {
    timestamps: true
  }
);

// Compound Unique Index: strictly prevents duplicate records for same employee on same date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ employeeId: 1, date: -1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

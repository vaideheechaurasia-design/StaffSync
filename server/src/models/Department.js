import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters']
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, 'Department code cannot exceed 10 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, 'Description cannot exceed 250 characters']
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Department = mongoose.model('Department', departmentSchema);
export default Department;

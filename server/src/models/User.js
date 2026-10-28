import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = Object.freeze({
  HR_ADMIN: 'HR_ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE'
});

export const VALID_ROLES = Object.values(USER_ROLES);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Excluded from ordinary queries by default
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: VALID_ROLES,
        message: '{VALUE} is not a valid system role'
      },
      default: USER_ROLES.EMPLOYEE
    },
    isActive: {
      type: Boolean,
      default: true
    },
    passwordChangedAt: {
      type: Date
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes
userSchema.index({ role: 1 });

/**
 * Pre-save lifecycle hook to hash passwords using bcryptjs.
 * Only executes when the password field is created or modified.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Securely compares candidate password against stored bcrypt hash.
 * @param {string} candidatePassword - Plaintext candidate password
 * @returns {Promise<boolean>} True if match, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Checks whether user changed password after a given JWT timestamp.
 * @param {number} JWTTimestamp - Token issuance timestamp in seconds
 * @returns {boolean} True if password was changed after token issuance
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export const User = mongoose.model('User', userSchema);
export default User;

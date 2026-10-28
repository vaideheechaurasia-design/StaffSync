import { User } from '../models/User.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/tokenUtils.js';

/**
 * Authenticates user credentials, sets an HttpOnly JWT cookie, and returns sanitized profile.
 *
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // 1. Validate presence and type of email and password
    if (
      !email ||
      !password ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      email.trim().length === 0 ||
      password.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Query user by email, explicitly including password field for verification
    const query = User.findOne({ email: normalizedEmail });
    const user = typeof query.select === 'function' ? await query.select('+password') : await query;

    // 3. Generic invalid credentials rejection to prevent email enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    // 4. Compare candidate password against stored bcrypt hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    // 5. Reject deactivated or inactive accounts
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        error: 'Forbidden',
        message: 'Your account is deactivated. Please contact an administrator.'
      });
    }

    // 6. Update lastLogin timestamp if model supports save
    try {
      user.lastLogin = new Date();
      if (typeof user.save === 'function') {
        await user.save({ validateBeforeSave: false });
      }
    } catch (saveErr) {
      // Non-fatal: continue login even if lastLogin update fails
    }

    // 7. Issue signed JWT session token with verified claims
    const tokenPayload = {
      userId: user._id ? user._id.toString() : user.id,
      email: user.email,
      role: user.role
    };

    const token = signToken(tokenPayload);

    // 8. Attach HttpOnly secure cookie
    setAuthCookie(res, token);

    // 9. Prepare sanitized user response (strictly omit password hash)
    const sanitizedUser = user.toJSON ? user.toJSON() : { ...user };
    delete sanitizedUser.password;
    delete sanitizedUser.__v;
    if (user._id && !sanitizedUser.id) {
      sanitizedUser.id = user._id.toString();
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: sanitizedUser,
        token
      }
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Clears the authentication cookie and ends client session.
 * Does not require a valid session to clear existing cookies.
 *
 * @route POST /api/v1/auth/logout
 * @access Public
 */
export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Logged out successfully'
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Returns currently authenticated user's sanitized profile.
 *
 * @route GET /api/v1/auth/me
 * @access Protected
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication required. No active session found.'
      });
    }

    const sanitizedUser = req.user.toJSON ? req.user.toJSON() : { ...req.user };
    delete sanitizedUser.password;
    delete sanitizedUser.__v;
    if (req.user._id && !sanitizedUser.id) {
      sanitizedUser.id = req.user._id.toString();
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Current user retrieved successfully',
      data: {
        user: sanitizedUser
      }
    });
  } catch (err) {
    return next(err);
  }
};

export default {
  login,
  logout,
  getMe
};

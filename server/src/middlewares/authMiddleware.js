import { User } from '../models/User.js';
import { verifyToken as decodeAndVerifyJwt, AUTH_COOKIE_NAME } from '../utils/tokenUtils.js';

/**
 * Middleware to protect routes: verifies JWT from cookie (or Bearer auth header fallback),
 * loads user from database, checks account status and password change history, and attaches
 * sanitized user document to req.user.
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware callback
 */
export const verifyToken = async (req, res, next) => {
  let token = null;

  // 1. Read token from HTTP-only session cookie
  if (req.cookies && typeof req.cookies === 'object') {
    if (req.cookies[AUTH_COOKIE_NAME]) {
      token = req.cookies[AUTH_COOKIE_NAME];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
  }

  // 2. Fall back to Authorization: Bearer <token> header
  if (!token && req.headers && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string') {
      const parts = authHeader.trim().split(/\s+/);
      if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
        token = parts[1];
      }
    }
  }

  // 3. Reject if token is missing or empty
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication required. Please provide a valid session token.'
    });
  }

  // 4. Verify token cryptographic signature and expiration
  let decoded;
  try {
    decoded = decodeAndVerifyJwt(token.trim());
  } catch (err) {
    if (err && err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication token has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or malformed authentication token.'
    });
  }

  // 5. Extract user identifier from decoded token payload
  const userId = decoded && (decoded.userId || decoded.id || decoded._id || decoded.sub);
  if (!userId) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication token payload is invalid.'
    });
  }

  // 6. Fetch user from database
  try {
    let query = User.findById(userId);
    if (query && typeof query.select === 'function') {
      // password is excluded by default (select: false). Include passwordChangedAt for revocation check.
      query = query.select('+passwordChangedAt');
    }
    const user = await query;

    // Reject missing user
    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Reject inactive user
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'User account is deactivated. Please contact an administrator.'
      });
    }

    // Check if user changed password after token issuance
    if (
      typeof decoded.iat === 'number' &&
      typeof user.changedPasswordAfter === 'function' &&
      user.changedPasswordAfter(decoded.iat)
    ) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'User recently changed password. Please log in again.'
      });
    }

    // Attach safe user object to req.user (strictly strip password hash if present)
    if (user.password) {
      user.password = undefined;
    }
    if (user._id && !user.id) {
      user.id = user._id.toString();
    }

    req.user = user;
    return next();
  } catch (err) {
    // If invalid ObjectId format in token payload, treat as user not found
    if (err && err.name === 'CastError') {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    return next(err);
  }
};

/**
 * Standard alias for verifyToken
 */
export const protect = verifyToken;

/**
 * Middleware factory to enforce Role-Based Access Control (RBAC).
 * Asserts that the authenticated req.user matches one of the specified allowed roles.
 *
 * @param {...string|string[]} roles - One or more allowed roles (e.g. 'HR_ADMIN', 'MANAGER')
 * @returns {Function} Express middleware handler
 */
export function requireRole(...roles) {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    // 1. Assert authenticated user is attached
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication required. No authenticated user found.'
      });
    }

    // 2. Strictly check verified user's role against allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        error: 'Forbidden',
        message: 'Access denied. You do not have permission to perform this action.'
      });
    }

    return next();
  };
}

/**
 * Standard alias for requireRole
 */
export const restrictTo = requireRole;

export default {
  verifyToken,
  protect,
  requireRole,
  restrictTo
};

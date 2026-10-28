import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'token';
export const AUTH_COOKIE_MAX_AGE = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

/**
 * Returns standard security options for authentication cookies.
 * @param {Object} [overrides={}] - Optional option overrides
 * @returns {Object} Cookie options compatible with res.cookie()
 */
export function getAuthCookieOptions(overrides = {}) {
  const isProd = config.isProduction;

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: '/',
    ...overrides
  };
}

/**
 * Signs a payload into a JSON Web Token.
 * @param {Object} payload - Token claims (e.g. { userId, role, email })
 * @param {Object} [options={}] - Custom jwt.sign options (e.g. { expiresIn })
 * @returns {string} Signed JWT string
 */
export function signToken(payload, options = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('JWT payload must be a non-empty object.');
  }

  if (!config.jwtSecret || config.jwtSecret.trim().length === 0) {
    throw new Error('JWT_SECRET is missing or empty. Cannot sign token.');
  }

  const signOptions = {
    expiresIn: config.jwtExpiresIn,
    ...options
  };

  return jwt.sign(payload, config.jwtSecret, signOptions);
}

/**
 * Verifies and decodes a JSON Web Token.
 * @param {string} token - Signed JWT string
 * @param {Object} [options={}] - Custom jwt.verify options
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid, expired, or secret is missing
 */
export function verifyToken(token, options = {}) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token string is required for verification.');
  }

  if (!config.jwtSecret || config.jwtSecret.trim().length === 0) {
    throw new Error('JWT_SECRET is missing or empty. Cannot verify token.');
  }

  return jwt.verify(token, config.jwtSecret, options);
}

/**
 * Attaches the signed JWT as an HttpOnly, SameSite authentication cookie to an Express response.
 * @param {Object} res - Express response object
 * @param {string} token - Signed JWT string
 * @returns {Object} The cookie options applied
 */
export function setAuthCookie(res, token) {
  if (!res || typeof res.cookie !== 'function') {
    throw new Error('A valid Express response object is required to set authentication cookie.');
  }

  const options = getAuthCookieOptions();
  res.cookie(AUTH_COOKIE_NAME, token, options);
  return options;
}

/**
 * Clears the authentication cookie using matching path and security attributes.
 * @param {Object} res - Express response object
 * @returns {Object} The clearing options applied
 */
export function clearAuthCookie(res) {
  if (!res || typeof res.cookie !== 'function') {
    throw new Error('A valid Express response object is required to clear authentication cookie.');
  }

  const options = getAuthCookieOptions({
    maxAge: 0,
    expires: new Date(0)
  });

  res.cookie(AUTH_COOKIE_NAME, '', options);
  return options;
}

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

// In production, no default fallback is permitted.
// In non-production, a designated development fallback is used only if not set in .env.
const DEV_FALLBACK_JWT_SECRET = 'staffsync_dev_jwt_secret_min_32_chars_long_entropy_key_9988';
const jwtSecret = process.env.JWT_SECRET || (isProd ? '' : DEV_FALLBACK_JWT_SECRET);
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Safely masks database credentials from connection strings.
 * Never exposes passwords or usernames in logs.
 * @param {string} uri - Raw connection string
 * @returns {string} Masked connection string
 */
export function maskMongoUri(uri) {
  if (!uri) return 'not_configured';
  try {
    return uri.replace(/\/\/(.*?)@/, '//*****:*****@');
  } catch {
    return 'configured (masked)';
  }
}

/**
 * Validates JWT secret strength and presence.
 * @param {string} secret - Candidate secret
 * @param {boolean} [requireProductionStrength=false] - If true, enforces 32-character minimum
 * @throws {Error} If secret is invalid or insecure
 */
export function validateJwtSecret(secret, requireProductionStrength = isProd) {
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error('JWT_SECRET is required and cannot be empty.');
  }

  if (requireProductionStrength && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production for security.');
  }

  return true;
}

/**
 * Validates critical environment variables.
 * @throws {Error} If critical variables are missing or insecure in production.
 */
export function validateEnv() {
  const errors = [];

  if (isProd && !mongoUri) {
    errors.push('MONGODB_URI (or MONGO_URI) is required in production environment.');
  }

  if (isProd) {
    if (!process.env.JWT_SECRET) {
      errors.push('JWT_SECRET is required in production environment.');
    } else if (process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long in production.');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment Validation Failed: ${errors.join('; ')}`);
  }

  return true;
}

export const config = {
  env: nodeEnv,
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri,
  mongodbUri: mongoUri,
  jwtSecret,
  jwtExpiresIn,
  isProduction: isProd,
  isDevelopment: !isProd
};

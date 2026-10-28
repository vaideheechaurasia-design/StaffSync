import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';

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
 * Validates critical environment variables.
 * @throws {Error} If critical variables are missing in production.
 */
export function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const errors = [];

  if (isProd && !mongoUri) {
    errors.push('MONGODB_URI (or MONGO_URI) is required in production environment.');
  }

  if (errors.length > 0) {
    throw new Error(`Environment Validation Failed: ${errors.join('; ')}`);
  }

  return true;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri,
  mongodbUri: mongoUri,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production'
};

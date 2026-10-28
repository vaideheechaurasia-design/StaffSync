import mongoose from 'mongoose';
import { config, maskMongoUri } from './env.js';

/**
 * Maps Mongoose readyState numerical flags to human-readable strings.
 */
const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

/**
 * Validates and sanitizes a MongoDB connection URI.
 * Automatically cleans accidental angle brackets around passwords and rejects unreplaced template placeholders.
 * @param {string} rawUri - Raw connection URI
 * @returns {string} Sanitized connection URI
 */
export function sanitizeConnectionUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') {
    throw new Error('MongoDB connection string is missing. Please set MONGODB_URI (or MONGO_URI) in server/.env');
  }

  const trimmed = rawUri.trim();

  // Detect unreplaced documentation placeholders
  if (trimmed.includes(':<password>@') || trimmed.includes(':<db_password>@') || trimmed.includes('<username>')) {
    throw new Error('MongoDB connection string contains unreplaced template placeholders (<password> or <username>). Please update server/.env with your actual Atlas credentials.');
  }

  // Handle common mistake: leaving angle brackets '<>' around the real password
  if (/:<([^>]+)>@/.test(trimmed)) {
    console.log('ℹ️  Notice: Automatically sanitized angle brackets around password in MongoDB connection string.');
    return trimmed.replace(/:<([^>]+)>@/, ':$1@');
  }

  return trimmed;
}

/**
 * Returns current database connection status without exposing secrets.
 * @returns {Object} Connection diagnostic status
 */
export function getConnectionStatus() {
  const readyState = mongoose.connection.readyState;
  const status = CONNECTION_STATES[readyState] || 'unknown';

  if (readyState === 1) {
    return {
      status: 'connected',
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown',
      message: 'MongoDB Atlas connection is established and healthy.'
    };
  }

  if (readyState === 2) {
    return {
      status: 'connecting',
      message: 'Establishing connection to MongoDB Atlas...'
    };
  }

  if (readyState === 3) {
    return {
      status: 'disconnecting',
      message: 'Disconnecting from MongoDB Atlas...'
    };
  }

  return {
    status: 'disconnected',
    message: 'Database is disconnected.'
  };
}

/**
 * Connects to MongoDB Atlas using Mongoose with retry capability.
 * @param {string} [uri] - MongoDB connection string (defaults to config.mongoUri)
 * @param {Object} [options] - Additional Mongoose connection options
 * @param {number} [maxRetries=2] - Number of retry attempts on transient failures
 * @param {number} [retryDelayMs=2000] - Delay in milliseconds between retries
 * @returns {Promise<mongoose.Connection>}
 */
export async function connectDB(
  uri = config.mongoUri,
  options = {},
  maxRetries = 2,
  retryDelayMs = 2000
) {
  const sanitizedUri = sanitizeConnectionUri(uri);

  const connectionOptions = {
    serverSelectionTimeoutMS: 5000,
    autoIndex: config.isDevelopment,
    dbName: 'staffsync', // Ensures connection routes to the staffsync database
    ...options
  };

  // Configure connection event listeners once
  if (mongoose.connection.listenerCount('error') === 0) {
    mongoose.connection.on('error', (err) => {
      const sanitizedMsg = (err.message || '').replace(/\/\/.*@/, '//*****:*****@');
      console.error(`❌ MongoDB Runtime Error: ${sanitizedMsg}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully.');
    });
  }

  let attempt = 0;

  while (attempt <= maxRetries) {
    attempt++;
    try {
      await mongoose.connect(sanitizedUri, connectionOptions);
      console.log('----------------------------------------------------');
      console.log('✅ MongoDB Atlas Connected Successfully');
      console.log(`   Host:     ${mongoose.connection.host}`);
      console.log(`   Database: ${mongoose.connection.name}`);
      console.log(`   Target:   ${maskMongoUri(sanitizedUri)}`);
      console.log('----------------------------------------------------');
      return mongoose.connection;
    } catch (err) {
      const sanitizedErr = (err.message || '').replace(/\/\/.*@/, '//*****:*****@');
      const isAuthError = /auth|authentication|bad auth|credential/i.test(err.message);

      console.error(`❌ MongoDB connection attempt ${attempt} failed: ${sanitizedErr}`);

      // Do not retry on permanent, non-recoverable authentication errors
      if (isAuthError) {
        throw new Error(`MongoDB Authentication Failed: Please verify the database user and password in server/.env`);
      }

      if (attempt <= maxRetries) {
        console.log(`⏳ Retrying database connection in ${retryDelayMs / 1000}s... (${attempt}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      } else {
        throw new Error(`MongoDB connection failed after ${maxRetries + 1} attempts: ${sanitizedErr}`);
      }
    }
  }
}

/**
 * Disconnects from MongoDB cleanly.
 * @returns {Promise<void>}
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

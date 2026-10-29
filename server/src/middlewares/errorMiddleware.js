import { config } from '../config/env.js';

export const errorMiddleware = (err, req, res, next) => {
  // Handle MongoDB Atlas connection / SSL / IP whitelist failures gracefully
  const isMongoConnectionError =
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongooseServerSelectionError' ||
    (err.name === 'MongooseError' && typeof err.message === 'string' && err.message.includes('buffering timed out')) ||
    (typeof err.message === 'string' && (
      err.message.includes('SSL alert number 80') ||
      err.message.includes('tlsv1 alert internal error') ||
      err.message.includes('Could not connect to any servers') ||
      err.message.includes('buffering timed out')
    ));

  if (isMongoConnectionError) {
    const errorResponse = {
      success: false,
      statusCode: 503,
      error: 'DatabaseConnectionError',
      message: 'MongoDB Atlas connection failed. The cluster rejected the SSL/TLS connection (SSL alert 80) or connection timed out. This occurs when your current public IP address is not whitelisted in MongoDB Atlas Network Access.'
    };

    if (config.isDevelopment) {
      errorResponse.details = {
        hint: 'Log into MongoDB Atlas -> Security -> Network Access -> Add IP Address (add your current public IP or allow access from anywhere 0.0.0.0/0).',
        originalError: err.message
      };
      if (err.stack) {
        errorResponse.stack = err.stack;
      }
    }

    return res.status(503).json(errorResponse);
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  const errorResponse = {
    success: false,
    statusCode,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred.'
  };

  // Only include stack trace and details in development mode
  if (config.isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  if (err.details) {
    errorResponse.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
};


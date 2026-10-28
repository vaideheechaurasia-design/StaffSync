import { config } from '../config/env.js';

export const errorMiddleware = (err, req, res, next) => {
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


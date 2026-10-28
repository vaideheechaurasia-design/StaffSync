import app from './app.js';
import { config } from './config/env.js';

const server = app.listen(config.port, () => {
  console.log('----------------------------------------------------');
  console.log(`🚀 StaffSync API Server running in [${config.env}] mode`);
  console.log(`📡 Listening on: http://localhost:${config.port}`);
  console.log(`🩺 Health check: http://localhost:${config.port}/api/v1/health`);
  console.log('----------------------------------------------------');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle graceful termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

export default server;


import app from './app.js';
import { config, validateEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

let server;

async function startServer() {
  try {
    // 1. Validate environment configuration
    validateEnv();

    // 2. Connect to MongoDB Atlas before accepting application traffic
    await connectDB();

    // 3. Start HTTP Server listener
    server = app.listen(config.port, () => {
      console.log('----------------------------------------------------');
      console.log(`🚀 StaffSync API Server running in [${config.env}] mode`);
      console.log(`📡 Listening on: http://localhost:${config.port}`);
      console.log(`🩺 Health check: http://localhost:${config.port}/api/v1/health`);
      console.log('----------------------------------------------------');
    });
  } catch (err) {
    console.error('----------------------------------------------------');
    console.error('❌ Server startup aborted due to database connection failure:');
    console.error(`   Reason: ${err.message}`);
    console.error('   Action: Verify MONGODB_URI (or MONGO_URI) credentials and Atlas IP whitelist in server/.env');
    console.error('----------------------------------------------------');
    process.exit(1);
  }
}

// Bootstrap server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle graceful termination
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      console.log('Database connection closed.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;

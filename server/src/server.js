import app from './app.js';
import { config, validateEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

let server;

async function startServer() {
  try {
    // 1. Validate environment configuration
    validateEnv();

    // 2. Start HTTP Server listener first so health check and diagnostics are reachable
    const HOST = process.env.HOST || '0.0.0.0';
    server = app.listen(config.port, HOST, () => {
      console.log('----------------------------------------------------');
      console.log(`🚀 StaffSync API Server running in [${config.env}] mode`);
      console.log(`📡 Listening on: http://${HOST}:${config.port}`);
      console.log(`🩺 Health check: http://${HOST}:${config.port}/api/v1/health`);
      console.log('----------------------------------------------------');
    });

    // 3. Connect to MongoDB Atlas with background retry on transient network/TLS failures
    try {
      await connectDB();
    } catch (dbErr) {
      console.error('⚠️  Initial MongoDB Atlas connection attempt failed:');
      console.error(`   Reason: ${dbErr.message}`);
      if (dbErr.message.includes('SSL alert number 80') || dbErr.message.includes('tlsv1 alert internal error')) {
        console.error('   👉 ACTION REQUIRED: MongoDB Atlas rejected the TLS connection (SSL alert 80).');
        console.error('      Please whitelist your current public IP address (or allow 0.0.0.0/0) in MongoDB Atlas Network Access.');
      } else {
        console.error('   Action: Verify MONGODB_URI (or MONGO_URI) credentials and Atlas IP whitelist in server/.env');
      }
      console.log('⏳ Running in degraded mode: API is online, attempting background reconnection to Atlas every 5s...');

      const retryInterval = setInterval(async () => {
        try {
          await connectDB();
          clearInterval(retryInterval);
        } catch {
          // Keep background retry silent
        }
      }, 5000);
    }
  } catch (err) {
    console.error('❌ Server startup aborted:', err.message);
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

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundMiddleware } from './middlewares/notFoundMiddleware.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();

// Secure HTTP headers
app.use(helmet());

// CORS configuration for client origin
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy restriction: Origin ${origin} not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Cookie parser middleware (enables reading signed/unsigned cookies from req.cookies)
app.use(cookieParser());

// HTTP Request logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
}

// Request body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Mount API routes at both /api/v1 (canonical) and /api (convenience)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Root greeting
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'StaffSync HRMS API Server',
    status: 'running',
    healthCheck: '/api/v1/health'
  });
});

// 404 Not Found Handler for undefined routes
app.use(notFoundMiddleware);

// Centralized Error Handling Middleware
app.use(errorMiddleware);

export default app;

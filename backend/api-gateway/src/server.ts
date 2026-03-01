import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';

import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { initializeSocketHandlers } from './socket';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import resumeRoutes from './routes/resume.routes';
import interviewRoutes from './routes/interview.routes';
import jobRoutes from './routes/job.routes';
import analyticsRoutes from './routes/analytics.routes';
import alumniRoutes from './routes/alumni.routes';
import careerRoutes from './routes/career.routes';
import skillsRoutes from './routes/skills.routes';
import alumniAdminRoutes from './routes/alumniAdmin.routes';
import placementReportRoutes from './routes/placementReport.routes';
import placementPredictionRoutes from './routes/placementPrediction.routes';
import headhunterRoutes from './routes/headhunter.routes';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Request parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/interview', interviewRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/alumni', alumniRoutes);
app.use('/api/v1/career', careerRoutes);
app.use('/api/v1/skills', skillsRoutes);
app.use('/api/v1/admin/alumni', alumniAdminRoutes);
app.use('/api/v1/admin/reports', placementReportRoutes);
app.use('/api/v1/admin/predictions', placementPredictionRoutes);
app.use('/api/v1/headhunter', headhunterRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Initialize Socket.IO handlers
initializeSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to databases
    await connectDatabase();

    // Try to connect to Redis (optional)
    try {
      await connectRedis();
    } catch (redisError) {
      logger.warn('⚠️ Redis not available. Running without caching.');
    }

    httpServer.listen(PORT, () => {
      logger.info(`🚀 API Gateway running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();

export { app, io };

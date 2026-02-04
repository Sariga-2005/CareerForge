import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'careerforge-super-secret-key';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocketHandlers = (io: Server): void => {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join interview room
    socket.on('interview:join', (interviewId: string) => {
      socket.join(`interview:${interviewId}`);
      logger.info(`User ${socket.userId} joined interview room: ${interviewId}`);
    });

    // Leave interview room
    socket.on('interview:leave', (interviewId: string) => {
      socket.leave(`interview:${interviewId}`);
    });

    // Real-time interview metrics
    socket.on('interview:metrics', (data: { interviewId: string; metrics: any }) => {
      io.to(`interview:${data.interviewId}`).emit('metrics:update', data.metrics);
    });

    // Nervousness level update
    socket.on('interview:nervousness', (data: { interviewId: string; level: number }) => {
      io.to(`interview:${data.interviewId}`).emit('nervousness:update', {
        level: data.level,
        timestamp: new Date(),
      });
    });

    // Transcript update
    socket.on('interview:transcript', (data: { interviewId: string; text: string }) => {
      io.to(`interview:${data.interviewId}`).emit('transcript:update', {
        text: data.text,
        timestamp: new Date(),
      });
    });

    // Admin notifications
    if (socket.userRole === 'admin') {
      socket.join('admin:notifications');
    }

    // Disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Utility function to emit to specific user
  (io as any).emitToUser = (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  // Utility function to emit to admins
  (io as any).emitToAdmins = (event: string, data: any) => {
    io.to('admin:notifications').emit(event, data);
  };
};

// Export types for use in other files
export type { AuthenticatedSocket };

import { Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Resume } from '../models/Resume.model';
import { Interview } from '../models/Interview.model';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest, clearUserCache } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export class UserController {
  // Get current user's profile
  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.json({
        success: true,
        data: { user: user.toPublicJSON() },
      });
    } catch (error) {
      next(error);
    }
  };

  // Update profile
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allowedUpdates = [
        'firstName',
        'lastName',
        'phone',
        'department',
        'batch',
        'cgpa',
        'skills',
        'linkedIn',
        'currentCompany',
        'currentRole',
      ];

      const updates: Record<string, any> = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      await clearUserCache(req.userId!);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: user.toPublicJSON() },
      });
    } catch (error) {
      next(error);
    }
  };

  // Upload profile image
  uploadProfileImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Implement MinIO upload
      res.json({
        success: true,
        message: 'Profile image upload coming soon',
      });
    } catch (error) {
      next(error);
    }
  };

  // Get dashboard data
  getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      const userRole = req.user?.role;

      // Get resume count and latest analysis
      const resumes = await Resume.find({ userId, isActive: true })
        .sort({ createdAt: -1 })
        .limit(1);

      // Get interview stats
      const interviews = await Interview.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5);

      const completedInterviews = await Interview.countDocuments({
        userId,
        status: 'completed',
      });

      const latestResume = resumes[0];

      res.json({
        success: true,
        data: {
          resumeScore: latestResume?.analysis?.overallScore || null,
          skillGaps: latestResume?.analysis?.skillGaps?.slice(0, 5) || [],
          completedInterviews,
          recentInterviews: interviews.map((i) => ({
            id: i._id,
            type: i.type,
            status: i.status,
            score: i.overallEvaluation?.totalScore,
            date: i.completedAt || i.createdAt,
          })),
          placementReadiness: calculatePlacementReadiness(latestResume, interviews),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Update skills
  updateSkills = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { skills } = req.body;

      if (!Array.isArray(skills)) {
        throw new ApiError('Skills must be an array', 400);
      }

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: { skills } },
        { new: true }
      );

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      await clearUserCache(req.userId!);

      res.json({
        success: true,
        message: 'Skills updated successfully',
        data: { skills: user.skills },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get all users
  getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        department,
        batch,
        placementStatus,
        search,
      } = req.query;

      const query: Record<string, any> = {};

      if (role) query.role = role;
      if (department) query.department = department;
      if (batch) query.batch = batch;
      if (placementStatus) query.placementStatus = placementStatus;
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        User.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get user stats
  getUserStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [totalStudents, totalAlumni, placedStudents, departmentStats] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'alumni' }),
        User.countDocuments({ role: 'student', placementStatus: 'placed' }),
        User.aggregate([
          { $match: { role: 'student' } },
          {
            $group: {
              _id: '$department',
              total: { $sum: 1 },
              placed: {
                $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] },
              },
            },
          },
        ]),
      ]);

      res.json({
        success: true,
        data: {
          totalStudents,
          totalAlumni,
          placedStudents,
          placementRate: totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0,
          departmentStats,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get user by ID
  getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findById(req.params.id).select('-password');

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update user status
  updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive, placementStatus } = req.body;

      const updates: Record<string, any> = {};
      if (typeof isActive === 'boolean') updates.isActive = isActive;
      if (placementStatus) updates.placementStatus = placementStatus;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      );

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      await clearUserCache(req.params.id);

      logger.info(`User status updated by admin: ${user.email}`, updates);

      res.json({
        success: true,
        message: 'User status updated',
        data: { user: user.toPublicJSON() },
      });
    } catch (error) {
      next(error);
    }
  };
}

// Helper function
function calculatePlacementReadiness(resume: any, interviews: any[]): number {
  let score = 0;
  
  // Resume score contribution (40%)
  if (resume?.analysis?.overallScore) {
    score += (resume.analysis.overallScore / 100) * 40;
  }

  // Interview performance (40%)
  const completedInterviews = interviews.filter((i) => i.status === 'completed');
  if (completedInterviews.length > 0) {
    const avgScore = completedInterviews.reduce(
      (acc, i) => acc + (i.overallEvaluation?.totalScore || 0),
      0
    ) / completedInterviews.length;
    score += (avgScore / 100) * 40;
  }

  // Activity score (20%) - having resume and done interviews
  if (resume) score += 10;
  if (completedInterviews.length >= 3) score += 10;
  else if (completedInterviews.length > 0) score += 5;

  return Math.round(score);
}

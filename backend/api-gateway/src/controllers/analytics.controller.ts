import { Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Resume } from '../models/Resume.model';
import { Interview } from '../models/Interview.model';
import { Job } from '../models/Job.model';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { cacheGet, cacheSet } from '../config/redis';

export class AnalyticsController {
  // Student dashboard analytics
  getStudentDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;

      const [resume, interviews, recommendedJobs] = await Promise.all([
        Resume.findOne({ userId, isActive: true }).select('analysis'),
        Interview.find({ userId }).sort({ createdAt: -1 }).limit(5),
        Job.find({ status: 'active' }).limit(5),
      ]);

      const completedInterviews = await Interview.countDocuments({
        userId,
        status: 'completed',
      });

      res.json({
        success: true,
        data: {
          resumeScore: resume?.analysis?.overallScore || 0,
          skillGaps: resume?.analysis?.skillGaps || [],
          completedInterviews,
          recentInterviews: interviews,
          recommendedJobs,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Student progress over time
  getStudentProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      const { period = '30d' } = req.query;

      // Get interview scores over time
      const interviews = await Interview.find({
        userId,
        status: 'completed',
        completedAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      })
        .select('completedAt overallEvaluation.totalScore type')
        .sort({ completedAt: 1 });

      res.json({
        success: true,
        data: {
          interviewProgress: interviews.map((i) => ({
            date: i.completedAt,
            score: i.overallEvaluation?.totalScore,
            type: i.type,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Student interview analytics
  getInterviewAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;

      const interviews = await Interview.find({
        userId,
        status: 'completed',
      }).select('type overallEvaluation');

      const byType = interviews.reduce((acc: any, i) => {
        if (!acc[i.type]) {
          acc[i.type] = { count: 0, totalScore: 0 };
        }
        acc[i.type].count++;
        acc[i.type].totalScore += i.overallEvaluation?.totalScore || 0;
        return acc;
      }, {});

      Object.keys(byType).forEach((type) => {
        byType[type].avgScore = Math.round(byType[type].totalScore / byType[type].count);
      });

      res.json({
        success: true,
        data: { byType, total: interviews.length },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin dashboard
  getAdminDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Try cache first
      const cached = await cacheGet<any>('admin:dashboard');
      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      const [
        totalStudents,
        placedStudents,
        activeJobs,
        totalAlumni,
        recentPlacements,
      ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'student', placementStatus: 'placed' }),
        Job.countDocuments({ status: 'active' }),
        User.countDocuments({ role: 'alumni' }),
        User.find({ role: 'student', placementStatus: 'placed' })
          .sort({ updatedAt: -1 })
          .limit(5)
          .select('firstName lastName department'),
      ]);

      const data = {
        totalStudents,
        totalPlaced: placedStudents,
        overallPlacementRate: totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0,
        activeJobs,
        alumniEngaged: totalAlumni,
        recentPlacements,
      };

      // Cache for 5 minutes
      await cacheSet('admin:dashboard', data, 300);

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  // Placement statistics
  getPlacementStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await User.aggregate([
        { $match: { role: 'student' } },
        {
          $group: {
            _id: '$placementStatus',
            count: { $sum: 1 },
          },
        },
      ]);

      const departmentStats = await User.aggregate([
        { $match: { role: 'student' } },
        {
          $group: {
            _id: { department: '$department', status: '$placementStatus' },
            count: { $sum: 1 },
          },
        },
      ]);

      res.json({
        success: true,
        data: { overallStats: stats, departmentStats },
      });
    } catch (error) {
      next(error);
    }
  };

  // Batch analytics
  getBatchAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batch } = req.query;

      const query: Record<string, any> = { role: 'student' };
      if (batch) query.batch = batch;

      const stats = await User.aggregate([
        { $match: query },
        {
          $group: {
            _id: { batch: '$batch', status: '$placementStatus' },
            count: { $sum: 1 },
            avgCGPA: { $avg: '$cgpa' },
          },
        },
        { $sort: { '_id.batch': -1 } },
      ]);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };

  // Department analytics
  getDepartmentAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await User.aggregate([
        { $match: { role: 'student' } },
        {
          $group: {
            _id: '$department',
            total: { $sum: 1 },
            placed: {
              $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] },
            },
            avgCGPA: { $avg: '$cgpa' },
          },
        },
        {
          $addFields: {
            placementRate: {
              $multiply: [{ $divide: ['$placed', '$total'] }, 100],
            },
          },
        },
        { $sort: { placementRate: -1 } },
      ]);

      res.json({
        success: true,
        data: { departments: stats },
      });
    } catch (error) {
      next(error);
    }
  };

  // Skill gap report
  getSkillGapReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resumes = await Resume.find({ isActive: true })
        .select('analysis.skillGaps')
        .limit(500);

      const skillGapCounts: Record<string, number> = {};

      resumes.forEach((r) => {
        r.analysis?.skillGaps?.forEach((gap) => {
          skillGapCounts[gap.skill] = (skillGapCounts[gap.skill] || 0) + 1;
        });
      });

      const sortedGaps = Object.entries(skillGapCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([skill, count]) => ({ skill, count }));

      res.json({
        success: true,
        data: { skillGaps: sortedGaps },
      });
    } catch (error) {
      next(error);
    }
  };

  // Company analytics
  getCompanyAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobs = await Job.aggregate([
        { $match: { status: { $in: ['active', 'closed', 'filled'] } } },
        {
          $group: {
            _id: '$companyName',
            jobCount: { $sum: 1 },
            totalViews: { $sum: '$stats.views' },
            totalApplications: { $sum: '$stats.applications' },
            totalSelected: { $sum: '$stats.selected' },
          },
        },
        { $sort: { totalSelected: -1 } },
        { $limit: 20 },
      ]);

      res.json({
        success: true,
        data: { companies: jobs },
      });
    } catch (error) {
      next(error);
    }
  };

  // Trends
  getTrends = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { period = '6m' } = req.query;
      
      // Get monthly placement data
      const placements = await User.aggregate([
        {
          $match: {
            role: 'student',
            placementStatus: 'placed',
            updatedAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$updatedAt' },
              month: { $month: '$updatedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      res.json({
        success: true,
        data: { placementTrends: placements },
      });
    } catch (error) {
      next(error);
    }
  };

  // Generate placement report
  generatePlacementReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Generate PDF report
      res.json({
        success: true,
        message: 'Report generation coming soon',
      });
    } catch (error) {
      next(error);
    }
  };

  // Generate batch report
  generateBatchReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batch } = req.params;
      // TODO: Generate batch-specific PDF report
      res.json({
        success: true,
        message: `Report for batch ${batch} coming soon`,
      });
    } catch (error) {
      next(error);
    }
  };
}

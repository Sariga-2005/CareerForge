import { Response, NextFunction } from 'express';
import { Job } from '../models/Job.model';
import { JobApplication } from '../models/JobApplication.model';
import { User } from '../models/User.model';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export class JobController {
  // Get all jobs with filters
  getJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        level,
        department,
        location,
        isRemote,
        search,
        sortBy = 'createdAt',
        order = 'desc',
      } = req.query;

      const query: Record<string, any> = { status: 'active' };

      if (type) query.type = type;
      if (level) query.level = level;
      if (department) query['eligibility.departments'] = department;
      if (location) query.location = { $regex: location, $options: 'i' };
      if (isRemote === 'true') query.isRemote = true;
      if (search) {
        query.$text = { $search: search as string };
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sortOrder = order === 'asc' ? 1 : -1;

      const [jobs, total] = await Promise.all([
        Job.find(query)
          .select('-embedding')
          .skip(skip)
          .limit(Number(limit))
          .sort({ [sortBy as string]: sortOrder }),
        Job.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: {
          jobs,
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

  // Get job by ID
  getJobById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await Job.findById(req.params.id)
        .select('-embedding')
        .populate('referringAlumni', 'firstName lastName currentCompany');

      if (!job) {
        throw new ApiError('Job not found', 404);
      }

      // Increment views
      job.stats.views += 1;
      await job.save();

      res.json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  // Apply for job
  applyForJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.id;
      const userId = req.userId;

      const job = await Job.findById(jobId);
      if (!job) throw new ApiError('Job not found', 404);
      if (job.status !== 'active') throw new ApiError('This job is no longer accepting applications', 400);

      const existing = await JobApplication.findOne({ userId, jobId });
      if (existing) throw new ApiError('You have already applied for this job', 400);

      const application = await JobApplication.create({
        userId,
        jobId,
        coverLetter: req.body.coverLetter || '',
        resumeId: req.body.resumeId,
      });

      job.stats.applications += 1;
      await job.save();

      logger.info(`User ${userId} applied for job ${jobId}`);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get application status
  getApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const application = await JobApplication.findOne({
        userId: req.userId,
        jobId: req.params.id,
      });

      res.json({
        success: true,
        data: {
          applied: !!application,
          status: application?.status || null,
          appliedAt: application?.appliedAt || null,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get recommended jobs with match scores
  getRecommendedJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findById(req.userId).select('skills department');
      const jobs = await Job.find({ status: 'active' })
        .select('-embedding')
        .limit(20)
        .sort({ createdAt: -1 });

      const userSkills: string[] = (user as any)?.skills || [];

      const jobsWithScore = jobs.map((job) => {
        const jobObj = job.toObject();
        // Compute a simple skill-overlap match score
        const required = job.requiredSkills || [];
        const preferred = job.preferredSkills || [];
        const allJobSkills = [...required, ...preferred];
        if (allJobSkills.length === 0 || userSkills.length === 0) {
          return { ...jobObj, matchScore: 50 };
        }
        const matched = allJobSkills.filter((s) =>
          userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
        );
        const score = Math.round((matched.length / allJobSkills.length) * 100);
        return { ...jobObj, matchScore: Math.max(score, 20) };
      });

      // Sort by match score descending
      jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);

      res.json({
        success: true,
        data: { jobs: jobsWithScore },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Create job
  createJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await Job.create({
        ...req.body,
        createdBy: req.userId,
        stats: { views: 0, applications: 0, shortlisted: 0, selected: 0 },
      });

      logger.info(`Job created: ${job._id} by admin ${req.userId}`);

      res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update job
  updateJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await Job.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!job) {
        throw new ApiError('Job not found', 404);
      }

      res.json({
        success: true,
        message: 'Job updated successfully',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Delete job
  deleteJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await Job.findByIdAndDelete(req.params.id);

      if (!job) {
        throw new ApiError('Job not found', 404);
      }

      logger.info(`Job deleted: ${req.params.id} by admin ${req.userId}`);

      res.json({
        success: true,
        message: 'Job deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update job status
  updateJobStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body;

      if (!['draft', 'active', 'closed', 'filled'].includes(status)) {
        throw new ApiError('Invalid status', 400);
      }

      const job = await Job.findByIdAndUpdate(
        req.params.id,
        { $set: { status } },
        { new: true }
      );

      if (!job) {
        throw new ApiError('Job not found', 404);
      }

      res.json({
        success: true,
        message: `Job status updated to ${status}`,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get job applications
  getJobApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applications = await JobApplication.find({ jobId: req.params.id })
        .populate('userId', 'firstName lastName email department')
        .sort({ appliedAt: -1 });

      res.json({
        success: true,
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user's saved jobs
  getSavedJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findById(req.userId).select('savedJobs');
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.json({
        success: true,
        data: { savedJobs: user.savedJobs || [] },
      });
    } catch (error) {
      next(error);
    }
  };

  // Save a job
  saveJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.body;
      if (!jobId) {
        throw new ApiError('Job ID is required', 400);
      }

      const user = await User.findById(req.userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      if (!user.savedJobs) {
        user.savedJobs = [];
      }

      if (!user.savedJobs.includes(jobId)) {
        user.savedJobs.push(jobId);
        await user.save();
      }

      res.json({
        success: true,
        message: 'Job saved successfully',
        data: { savedJobs: user.savedJobs },
      });
    } catch (error) {
      next(error);
    }
  };

  // Unsave a job
  unsaveJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      if (!jobId) {
        throw new ApiError('Job ID is required', 400);
      }

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $pull: { savedJobs: jobId } },
        { new: true }
      ).select('savedJobs');

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.json({
        success: true,
        message: 'Job removed from saved',
        data: { savedJobs: user.savedJobs || [] },
      });
    } catch (error) {
      next(error);
    }
  };
}

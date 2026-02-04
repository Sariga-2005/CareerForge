import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import FormData from 'form-data';
import { Resume } from '../models/Resume.model';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

const AI_BRAIN_URL = process.env.AI_BRAIN_URL || 'http://localhost:5001';
const COGNITIVE_SCREENER_URL = process.env.COGNITIVE_SCREENER_URL || 'http://localhost:5002';

export class ResumeController {
  // Upload resume
  uploadResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ApiError('No file uploaded', 400);
      }

      const { originalname, mimetype, size, buffer } = req.file;

      // Deactivate previous resumes
      await Resume.updateMany(
        { userId: req.userId, isActive: true },
        { $set: { isActive: false } }
      );

      // Generate storage path
      const fileId = uuidv4();
      const storagePath = `resumes/${req.userId}/${fileId}-${originalname}`;

      // TODO: Upload to MinIO
      // For now, we'll just store the path

      // Create resume record with file data for re-analysis
      const resume = await Resume.create({
        userId: req.userId,
        originalName: originalname,
        storagePath,
        mimeType: mimetype,
        fileSize: size,
        fileData: buffer, // Store file data for re-analysis capability
        version: 1,
        isActive: true,
      });

      // Trigger async parsing with file buffer and mimetype
      this.triggerParsing(resume._id.toString(), buffer, originalname, mimetype).catch((err) =>
        logger.error('Resume parsing failed:', err)
      );

      logger.info(`Resume uploaded: ${resume._id} by user ${req.userId}`);

      res.status(201).json({
        success: true,
        message: 'Resume uploaded successfully. Analysis in progress.',
        data: { resume },
      });
    } catch (error) {
      next(error);
    }
  };

  // Trigger parsing via AI service
  private async triggerParsing(resumeId: string, fileBuffer: Buffer, filename: string, mimetype: string): Promise<void> {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: filename,
        contentType: mimetype,
      });

      const response = await axios.post(
        `${COGNITIVE_SCREENER_URL}/api/cognitive-screener/resume/analyze`,
        formData,
        { 
          timeout: 120000,
          headers: formData.getHeaders(),
        }
      );

      if (response.data.success) {
        // Store the complete analysis response
        const analysisData = {
          extracted_data: response.data.extracted_data,
          quality_score: response.data.quality_score,
          suggestions: response.data.suggestions,
          ats_friendly: response.data.ats_friendly,
          job_match: response.data.job_match,
        };

        const overallScore = response.data.quality_score?.percentage || 
                            response.data.quality_score?.overall_score || 
                            0;

        await Resume.findByIdAndUpdate(resumeId, {
          $set: { 
            parsedData: analysisData,
            analysisScore: overallScore,
            skills: {
              technical: response.data.extracted_data?.technical_skills || [],
              soft: response.data.extracted_data?.soft_skills || [],
            }
          },
        });
        logger.info(`Resume ${resumeId} parsed successfully with score ${overallScore}`);
      } else {
        logger.error(`Resume parsing returned error: ${response.data.error}`);
      }
    } catch (error: any) {
      logger.error('Error triggering resume parsing:', error.message || error);
    }
  }

  // Re-analyze an existing resume
  reanalyzeResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Need to select fileData explicitly since it's excluded by default
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.userId,
      }).select('+fileData');

      if (!resume) {
        throw new ApiError('Resume not found', 404);
      }

      if (!resume.fileData) {
        throw new ApiError('Resume file data not found. Please re-upload your resume.', 400);
      }

      // Trigger re-parsing
      this.triggerParsing(
        resume._id.toString(),
        resume.fileData,
        resume.originalName,
        resume.mimeType
      ).catch((err) => logger.error('Re-analysis background error:', err));

      res.json({
        success: true,
        message: 'Resume re-analysis started. Refresh in a few seconds.',
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all resumes for user
  getResumes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resumes = await Resume.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .select('-embedding');

      res.json({
        success: true,
        data: { resumes },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get resume by ID
  getResumeById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!resume) {
        throw new ApiError('Resume not found', 404);
      }

      res.json({
        success: true,
        data: { resume },
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete resume
  deleteResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resume = await Resume.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!resume) {
        throw new ApiError('Resume not found', 404);
      }

      // TODO: Delete from MinIO

      logger.info(`Resume deleted: ${resume._id}`);

      res.json({
        success: true,
        message: 'Resume deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Analyze resume with AI
  analyzeResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!resume) {
        throw new ApiError('Resume not found', 404);
      }

      // Call AI service for analysis
      try {
        const response = await axios.post(
          `${COGNITIVE_SCREENER_URL}/api/v1/analyze`,
          {
            resumeId: resume._id,
            parsedData: resume.parsedData,
          },
          { timeout: 120000 }
        );

        if (response.data.success) {
          resume.analysis = response.data.data.analysis;
          resume.embedding = response.data.data.embedding;
          await resume.save();
        }

        res.json({
          success: true,
          message: 'Analysis complete',
          data: { analysis: resume.analysis },
        });
      } catch (aiError) {
        logger.error('AI analysis error:', aiError);
        
        // Return mock analysis for development
        const mockAnalysis = {
          overallScore: 75,
          atsScore: 80,
          skillScore: 70,
          experienceScore: 72,
          formatScore: 78,
          strengths: ['Good technical skills', 'Clear formatting'],
          improvements: ['Add more quantified achievements', 'Include relevant keywords'],
          skillGaps: [
            { skill: 'Docker', priority: 'high' },
            { skill: 'AWS', priority: 'medium' },
          ],
          keywords: {
            present: ['JavaScript', 'React', 'Node.js'],
            missing: ['TypeScript', 'CI/CD', 'Agile'],
          },
        };

        resume.analysis = mockAnalysis as any;
        await resume.save();

        res.json({
          success: true,
          message: 'Analysis complete (development mode)',
          data: { analysis: mockAnalysis },
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // Get analysis results
  getAnalysis = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.userId,
      }).select('analysis');

      if (!resume) {
        throw new ApiError('Resume not found', 404);
      }

      if (!resume.analysis) {
        throw new ApiError('Analysis not yet available', 404);
      }

      res.json({
        success: true,
        data: { analysis: resume.analysis },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get skill gaps
  getSkillGaps = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.userId,
      }).select('analysis.skillGaps');

      if (!resume) {
        throw new ApiError('Resume not found', 404);
      }

      res.json({
        success: true,
        data: { skillGaps: resume.analysis?.skillGaps || [] },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get job matches based on resume
  getJobMatches = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!resume) {
        throw new ApiError('Resume not found', 404);
      }

      // Call AI service for matching
      try {
        const response = await axios.post(
          `${AI_BRAIN_URL}/api/v1/match-jobs`,
          {
            resumeEmbedding: resume.embedding,
            skills: resume.parsedData?.sections?.skills,
          },
          { timeout: 30000 }
        );

        res.json({
          success: true,
          data: { matches: response.data.data.matches },
        });
      } catch (aiError) {
        // Return mock matches for development
        res.json({
          success: true,
          data: {
            matches: [
              { jobId: '1', matchScore: 92, company: 'Google', title: 'SDE Intern' },
              { jobId: '2', matchScore: 88, company: 'Microsoft', title: 'Software Engineer' },
              { jobId: '3', matchScore: 85, company: 'Amazon', title: 'Backend Developer' },
            ],
          },
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get all resumes
  getAllResumes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [resumes, total] = await Promise.all([
        Resume.find()
          .populate('userId', 'firstName lastName email department batch')
          .select('-embedding -parsedData.rawText')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Resume.countDocuments(),
      ]);

      res.json({
        success: true,
        data: {
          resumes,
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
}

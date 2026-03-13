import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import FormData from 'form-data';
import { Resume } from '../models/Resume.model';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

const AI_BRAIN_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';
const COGNITIVE_SCREENER_URL = process.env.COGNITIVE_SERVICE_URL || 'http://localhost:5002';

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

      // Await parsing so parsedData is ready before the frontend calls analyzeResume
      const io = req.app.get('io');
      try {
        await this.triggerParsing(resume._id.toString(), buffer, originalname, mimetype, req.userId as string, io);
      } catch (err) {
        // Parsing failed — upload still succeeds, user can re-analyze later
        logger.error('Resume parsing failed:', err);
      }

      logger.info(`Resume uploaded: ${resume._id} by user ${req.userId}`);

      // Emit notification
      if (io && (io as any).emitToUser) {
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        (io as any).emitToUser(req.userId, 'notification', {
          id: `res-${resume._id}`,
          type: 'success',
          message: `Resume uploaded at ${timeString}`
        });
      }

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
  private async triggerParsing(resumeId: string, fileBuffer: Buffer, filename: string, mimetype: string, userId: string, io: any): Promise<void> {
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
            rawText: response.data.raw_text,
            analysisScore: overallScore,
            skills: {
              technical: response.data.extracted_data?.technical_skills || [],
              soft: response.data.extracted_data?.soft_skills || [],
            }
          },
        });
        logger.info(`Resume ${resumeId} parsed successfully with score ${overallScore}`);

        // Emit notification
        if (io && (io as any).emitToUser) {
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          (io as any).emitToUser(userId, 'notification', {
            id: `res-analysis-${resumeId}`,
            type: 'info',
            message: `Resume analysis completed at ${timeString}`
          });
        }
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
      const io = req.app.get('io');
      this.triggerParsing(
        resume._id.toString(),
        resume.fileData,
        resume.originalName,
        resume.mimeType,
        req.userId as string,
        io
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

  // Match resume against specific job description
  matchJobDescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobDescriptionId } = req.body;
      const targetJob = jobDescriptionId; // Normally fetch job description from DB, for now treat as raw text or role

      if (!targetJob) {
        throw new ApiError('Target job role or description is required', 400);
      }

      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!resume) {
        throw new ApiError('Resume not found', 404);
      }

      // Use rawText for matching if available, otherwise fallback to reconstruction
      let resumeText = resume.rawText;

      // Auto-repair: If rawText is missing but we have fileData, extract it now
      if (!resumeText && (resume as any).fileData) {
        try {
          logger.info(`Auto-repairing missing rawText for resume ${resume._id}`);
          const formData = new FormData();
          formData.append('file', (resume as any).fileData, {
            filename: resume.originalName,
            contentType: resume.mimeType,
          });

          const parseResponse = await axios.post(
            `${COGNITIVE_SCREENER_URL}/api/cognitive-screener/resume/analyze`,
            formData,
            { headers: { ...formData.getHeaders() }, timeout: 30000 }
          );

          if (parseResponse.data.success && parseResponse.data.raw_text) {
            resumeText = parseResponse.data.raw_text;
            
            // Save repaired data in background
            const overallScore = parseResponse.data.quality_score?.percentage || 
                               parseResponse.data.quality_score?.overall_score || 0;
            
            Resume.findByIdAndUpdate(resume._id, {
              $set: {
                rawText: resumeText,
                parsedData: parseResponse.data,
                analysisScore: overallScore,
                skills: {
                  technical: parseResponse.data.extracted_data?.technical_skills || [],
                  soft: parseResponse.data.extracted_data?.soft_skills || [],
                }
              }
            }).catch(err => logger.error('Failed to save auto-repaired resume data:', err));
          }
        } catch (repairError) {
          logger.error('Error during resume auto-repair:', repairError);
        }
      }

      const finalResumeText = resumeText || 
        (resume.parsedData?.extracted_data?.personal_info?.name
          ? JSON.stringify(resume.parsedData)
          : 'Resume data could not be extracted.');

      // Call Cognitive Screener service for matching
      try {
        const response = await axios.post(
          `${COGNITIVE_SCREENER_URL}/api/cognitive-screener/resume/job-match`,
          {
            resume_text: finalResumeText,
            job_description: targetJob,
          },
          { timeout: 30000 }
        );

        if (response.data.success) {
          const matchResult = response.data.job_match;
          res.json({
            success: true,
            matchScore: matchResult.match_score || 0,
            matchedSkills: matchResult.matched_skills || [],
            missingSkills: matchResult.missing_skills || [],
            recommendations: matchResult.recommendations || [],
          });
        } else {
          throw new Error('AI service returned unsuccessful match');
        }
      } catch (aiError) {
        logger.error('Error calling cognitive screener for job match:', aiError);
        // Fallback mock response if AI fails
        res.json({
          success: true,
          matchScore: 85,
          matchedSkills: ['JavaScript', 'React'],
          missingSkills: ['Docker'],
          recommendations: ['Consider learning Docker to improve your match score.'],
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // Match raw text against specific job description (standalone)
  matchText = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resumeText, jobDescriptionId } = req.body;
      const targetJob = jobDescriptionId;

      if (!targetJob || !resumeText) {
        throw new ApiError('Both resumeText and jobDescriptionId (target role) are required', 400);
      }

      // Call Cognitive Screener service for matching
      try {
        const response = await axios.post(
          `${COGNITIVE_SCREENER_URL}/api/cognitive-screener/resume/job-match`,
          {
            resume_text: resumeText,
            job_description: targetJob,
          },
          { timeout: 30000 }
        );

        if (response.data.success) {
          const matchResult = response.data.job_match;
          res.json({
            success: true,
            matchScore: matchResult.match_score || 0,
            matchedSkills: matchResult.matched_skills || [],
            missingSkills: matchResult.missing_skills || [],
            recommendations: matchResult.recommendations || [],
          });
        } else {
          throw new Error('AI service returned unsuccessful match');
        }
      } catch (aiError) {
        logger.error('Error calling cognitive screener for job match (standalone):', aiError);
        // Fallback mock response if AI fails
        res.json({
          success: true,
          matchScore: 85,
          matchedSkills: ['JavaScript', 'React'],
          missingSkills: ['Docker'],
          recommendations: ['Consider learning Docker to improve your match score.'],
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // Quick parse - extract personal info from resume file for form auto-fill
  quickParse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ApiError('No file uploaded', 400);
      }

      const { buffer, originalname, mimetype } = req.file;

      const formData = new FormData();
      formData.append('file', buffer, {
        filename: originalname,
        contentType: mimetype,
      });

      try {
        const response = await axios.post(
          `${COGNITIVE_SCREENER_URL}/api/cognitive-screener/resume/analyze`,
          formData,
          {
            timeout: 30000,
            headers: formData.getHeaders(),
          }
        );

        if (response.data.success) {
          const extracted = response.data.extracted_data || {};
          const personal_info = extracted.personal_info || {};
          
          // Double check URL normalization in Gateway as well
          ['linkedin', 'github'].forEach(key => {
            let url = personal_info[key];
            if (url && typeof url === 'string' && !url.startsWith('http')) {
              if (url.includes('com') || url.includes(key)) {
                personal_info[key] = `https://${url.replace(/^\/+/, '')}`;
              }
            }
          });

          res.json({
            success: true,
            personal_info: personal_info,
            technical_skills: extracted.technical_skills || [],
            soft_skills: extracted.soft_skills || [],
            education: extracted.education || [],
            cgpa: extracted.cgpa || personal_info.cgpa || null,
          });
        } else {
          res.json({ success: false, personal_info: {}, technical_skills: [], soft_skills: [], education: [] });
        }
      } catch (parseError) {
        logger.error('Quick parse failed:', parseError);
        // Don't throw — return empty so frontend gracefully falls back to manual entry
        res.json({ success: false, personal_info: {}, technical_skills: [], soft_skills: [], education: [] });
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

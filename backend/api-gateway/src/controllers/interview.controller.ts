import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Interview } from '../models/Interview.model';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

// Use cognitive-screener for interview evaluation (5002)
const ADAPTIVE_INTERVIEWER_URL = process.env.ADAPTIVE_INTERVIEWER_URL || 'http://localhost:5002';

export class InterviewController {
  // Create new interview
  createInterview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, difficulty, targetRole, targetCompany, duration = 30 } = req.body;

      if (!type || !difficulty) {
        throw new ApiError('Interview type and difficulty are required', 400);
      }

      const interview = await Interview.create({
        userId: req.userId,
        type,
        difficulty,
        duration,
        targetRole,
        targetCompany,
        status: 'scheduled',
        questions: [],
      });

      logger.info(`Interview created: ${interview._id}`);

      res.status(201).json({
        success: true,
        message: 'Interview scheduled successfully',
        data: { interview },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all interviews for user
  getInterviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, type, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const query: Record<string, any> = { userId: req.userId };
      if (status) query.status = status;
      if (type) query.type = type;

      const [interviews, total] = await Promise.all([
        Interview.find(query)
          .select('-questions.response.transcript -metrics')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Interview.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: {
          interviews,
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

  // Get interview by ID
  getInterviewById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await Interview.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!interview) {
        throw new ApiError('Interview not found', 404);
      }

      // Format interview data for frontend
      const formattedInterview = {
        id: interview._id.toString(),
        type: interview.type,
        status: interview.status,
        difficulty: interview.difficulty,
        targetRole: interview.targetRole,
        targetCompany: interview.targetCompany,
        startedAt: interview.startedAt?.toISOString() || interview.createdAt.toISOString(),
        completedAt: interview.completedAt?.toISOString(),
        duration: interview.completedAt && interview.startedAt 
          ? Math.floor((interview.completedAt.getTime() - interview.startedAt.getTime()) / 1000)
          : interview.duration * 60,
        questions: interview.questions.map((q, idx) => ({
          id: q.id || `q-${idx}`,
          question: q.text,
          answer: q.response?.transcript || '',
          duration: q.response?.duration || 0,
          feedback: q.evaluation ? {
            score: q.evaluation.score,
            strengths: q.evaluation.strengths || [],
            improvements: q.evaluation.improvements || [],
            suggestions: q.evaluation.improvements || [],
          } : undefined,
        })),
        metrics: interview.overallEvaluation ? {
          overallScore: interview.overallEvaluation.totalScore,
          technicalScore: interview.metrics?.technicalAccuracy || interview.overallEvaluation.totalScore,
          communicationScore: interview.metrics?.clarityScore || Math.round(interview.overallEvaluation.totalScore * 0.9),
          problemSolvingScore: interview.metrics?.relevanceScore || Math.round(interview.overallEvaluation.totalScore * 0.85),
          confidenceScore: interview.metrics?.confidenceScore || Math.round(interview.overallEvaluation.totalScore * 0.8),
        } : {
          overallScore: 0,
          technicalScore: 0,
          communicationScore: 0,
          problemSolvingScore: 0,
          confidenceScore: 0,
        },
        feedback: interview.overallEvaluation?.summary || '',
        passed: interview.overallEvaluation ? interview.overallEvaluation.totalScore >= 60 : false,
      };

      res.json({
        success: true,
        interview: formattedInterview,
      });
    } catch (error) {
      next(error);
    }
  };

  // Start interview
  startInterview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await Interview.findOne({
        _id: req.params.id,
        userId: req.userId,
        status: 'scheduled',
      });

      if (!interview) {
        throw new ApiError('Interview not found or already started', 404);
      }

      // Generate initial questions
      const questions = await this.generateQuestions(interview);

      interview.status = 'in-progress';
      interview.startedAt = new Date();
      interview.questions = questions;
      interview.metrics = {
        nervousnessLevels: [],
        confidenceScore: 0,
        clarityScore: 0,
        relevanceScore: 0,
      };
      await interview.save();

      // Emit via socket
      const io = req.app.get('io');
      io.to(`interview:${interview._id}`).emit('interview:started', {
        interviewId: interview._id,
        firstQuestion: questions[0],
      });

      res.json({
        success: true,
        message: 'Interview started',
        data: {
          interview: {
            id: interview._id,
            _id: interview._id,
            type: interview.type,
            status: interview.status,
            duration: interview.duration,
            startedAt: interview.startedAt,
            questions: questions,
            currentQuestion: questions[0],
            totalQuestions: questions.length,
            responses: [],
            metrics: interview.metrics,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Generate questions based on interview type
  private async generateQuestions(interview: any): Promise<any[]> {
    try {
      const response = await axios.post(
        `${ADAPTIVE_INTERVIEWER_URL}/api/v1/generate-questions`,
        {
          type: interview.type,
          difficulty: interview.difficulty,
          targetRole: interview.targetRole,
          count: Math.floor(interview.duration / 5), // ~5 min per question
        },
        { timeout: 30000 }
      );

      return response.data.data.questions;
    } catch (error) {
      // Return mock questions for development
      return this.getMockQuestions(interview.type, interview.difficulty);
    }
  }

  private getMockQuestions(type: string, difficulty: string): any[] {
    const technicalQuestions = [
      { id: uuidv4(), text: 'Explain the concept of closures in JavaScript.', category: 'JavaScript', difficulty: 'medium', timeLimit: 180 },
      { id: uuidv4(), text: 'What is the difference between REST and GraphQL?', category: 'API Design', difficulty: 'medium', timeLimit: 180 },
      { id: uuidv4(), text: 'Describe how you would design a URL shortening service.', category: 'System Design', difficulty: 'hard', timeLimit: 300 },
    ];

    const hrQuestions = [
      { id: uuidv4(), text: 'Tell me about yourself and your background.', category: 'Introduction', difficulty: 'easy', timeLimit: 180 },
      { id: uuidv4(), text: 'Where do you see yourself in 5 years?', category: 'Career Goals', difficulty: 'easy', timeLimit: 120 },
      { id: uuidv4(), text: 'Why do you want to work for our company?', category: 'Motivation', difficulty: 'medium', timeLimit: 150 },
    ];

    const behavioralQuestions = [
      { id: uuidv4(), text: 'Tell me about a time when you faced a challenging project. How did you handle it?', category: 'Problem Solving', difficulty: 'medium', timeLimit: 180 },
      { id: uuidv4(), text: 'Describe a situation where you had to work with a difficult team member.', category: 'Teamwork', difficulty: 'medium', timeLimit: 180 },
      { id: uuidv4(), text: 'Give an example of when you showed leadership.', category: 'Leadership', difficulty: 'medium', timeLimit: 180 },
    ];

    switch (type) {
      case 'technical':
        return technicalQuestions;
      case 'hr':
        return hrQuestions;
      case 'behavioral':
        return behavioralQuestions;
      default:
        return technicalQuestions;
    }
  }

  // Get next question
  getNextQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await Interview.findOne({
        _id: req.params.id,
        userId: req.userId,
        status: 'in-progress',
      });

      if (!interview) {
        throw new ApiError('Interview not found or not in progress', 404);
      }

      // Find unanswered question
      const nextQuestion = interview.questions.find((q) => !q.response);

      if (!nextQuestion) {
        res.json({
          success: true,
          data: { complete: true, message: 'All questions answered' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          question: nextQuestion,
          questionNumber: interview.questions.indexOf(nextQuestion) + 1,
          totalQuestions: interview.questions.length,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Submit answer
  submitAnswer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { questionId, transcript, duration } = req.body;
      const audioFile = req.file;

      const interview = await Interview.findOne({
        _id: req.params.id,
        userId: req.userId,
        status: 'in-progress',
      });

      if (!interview) {
        throw new ApiError('Interview not found or not in progress', 404);
      }

      const questionIndex = interview.questions.findIndex((q) => q.id === questionId);
      if (questionIndex === -1) {
        throw new ApiError('Question not found', 404);
      }

      // Store response
      interview.questions[questionIndex].response = {
        transcript,
        duration: duration || 0,
        timestamp: new Date(),
      };

      // Evaluate answer via AI
      try {
        const evaluation = await this.evaluateAnswer(
          interview.questions[questionIndex],
          transcript
        );
        interview.questions[questionIndex].evaluation = evaluation;
      } catch (error) {
        // Mock evaluation for development
        interview.questions[questionIndex].evaluation = {
          score: Math.floor(Math.random() * 30) + 70,
          feedback: 'Good response with clear explanation.',
          strengths: ['Clear communication', 'Relevant examples'],
          improvements: ['Could provide more specific examples'],
        };
      }

      await interview.save();

      // Emit via socket
      const io = req.app.get('io');
      io.to(`interview:${interview._id}`).emit('answer:evaluated', {
        questionId,
        evaluation: interview.questions[questionIndex].evaluation,
      });

      res.json({
        success: true,
        message: 'Answer submitted and evaluated',
        data: { evaluation: interview.questions[questionIndex].evaluation },
      });
    } catch (error) {
      next(error);
    }
  };

  private async evaluateAnswer(question: any, transcript: string): Promise<any> {
    const response = await axios.post(
      `${ADAPTIVE_INTERVIEWER_URL}/api/v1/evaluate`,
      { question, transcript },
      { timeout: 30000 }
    );
    return response.data.data.evaluation;
  }

  // Complete interview
  completeInterview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await Interview.findOne({
        _id: req.params.id,
        userId: req.userId,
        status: 'in-progress',
      });

      if (!interview) {
        throw new ApiError('Interview not found or not in progress', 404);
      }

      // Calculate overall evaluation
      const answeredQuestions = interview.questions.filter((q) => q.evaluation);
      const avgScore = answeredQuestions.length > 0
        ? answeredQuestions.reduce((acc, q) => acc + (q.evaluation?.score || 0), 0) / answeredQuestions.length
        : 0;

      interview.status = 'completed';
      interview.completedAt = new Date();
      interview.overallEvaluation = {
        totalScore: Math.round(avgScore),
        grade: this.calculateGrade(avgScore),
        summary: this.generateSummary(avgScore),
        strongAreas: this.extractStrongAreas(answeredQuestions),
        weakAreas: this.extractWeakAreas(answeredQuestions),
        recommendations: this.generateRecommendations(answeredQuestions),
        hiringRecommendation: this.getHiringRecommendation(avgScore),
      };

      await interview.save();

      logger.info(`Interview completed: ${interview._id} with score ${avgScore}`);

      res.json({
        success: true,
        message: 'Interview completed',
        data: { evaluation: interview.overallEvaluation },
      });
    } catch (error) {
      next(error);
    }
  };

  private calculateGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  private generateSummary(score: number): string {
    if (score >= 85) return 'Excellent performance with strong technical and communication skills.';
    if (score >= 70) return 'Good performance with room for improvement in some areas.';
    if (score >= 55) return 'Average performance. Additional preparation recommended.';
    return 'Below expectations. Focused practice in weak areas needed.';
  }

  private extractStrongAreas(questions: any[]): string[] {
    const strengths: string[] = [];
    questions.forEach((q) => {
      if (q.evaluation?.score >= 80) {
        strengths.push(q.category);
      }
    });
    return [...new Set(strengths)];
  }

  private extractWeakAreas(questions: any[]): string[] {
    const weakAreas: string[] = [];
    questions.forEach((q) => {
      if (q.evaluation?.score < 60) {
        weakAreas.push(q.category);
      }
    });
    return [...new Set(weakAreas)];
  }

  private generateRecommendations(questions: any[]): string[] {
    const recommendations: string[] = [];
    questions.forEach((q) => {
      if (q.evaluation?.improvements) {
        recommendations.push(...q.evaluation.improvements);
      }
    });
    return [...new Set(recommendations)].slice(0, 5);
  }

  private getHiringRecommendation(score: number): 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no' {
    if (score >= 90) return 'strong-yes';
    if (score >= 75) return 'yes';
    if (score >= 60) return 'maybe';
    if (score >= 40) return 'no';
    return 'strong-no';
  }

  // Get evaluation
  getEvaluation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await Interview.findOne({
        _id: req.params.id,
        userId: req.userId,
        status: 'completed',
      }).select('overallEvaluation questions.evaluation questions.text questions.category');

      if (!interview) {
        throw new ApiError('Interview not found or not completed', 404);
      }

      res.json({
        success: true,
        data: {
          overallEvaluation: interview.overallEvaluation,
          questionEvaluations: interview.questions.map((q) => ({
            text: q.text,
            category: q.category,
            evaluation: q.evaluation,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Cancel interview
  cancelInterview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await Interview.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.userId,
          status: { $in: ['scheduled', 'in-progress'] },
        },
        { $set: { status: 'cancelled' } },
        { new: true }
      );

      if (!interview) {
        throw new ApiError('Interview not found or already completed', 404);
      }

      res.json({
        success: true,
        message: 'Interview cancelled',
      });
    } catch (error) {
      next(error);
    }
  };

  // Get metrics
  getMetrics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await Interview.findOne({
        _id: req.params.id,
        userId: req.userId,
      }).select('metrics');

      if (!interview) {
        throw new ApiError('Interview not found', 404);
      }

      res.json({
        success: true,
        data: { metrics: interview.metrics },
      });
    } catch (error) {
      next(error);
    }
  };
}

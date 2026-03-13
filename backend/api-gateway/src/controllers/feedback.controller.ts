import { Request, Response } from 'express';
import Feedback from '../models/Feedback.model';
import { logger } from '../utils/logger';

export class FeedbackController {
  public submitFeedback = async (req: Request, res: Response) => {
    try {
      const { name, email, rating, category, message } = req.body;
      const userId = (req as any).user?._id;

      const feedback = new Feedback({
        userId,
        name,
        email,
        rating,
        category,
        message
      });

      await feedback.save();

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: feedback
      });
    } catch (error: any) {
      logger.error('Error submitting feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        error: error.message
      });
    }
  };

  public getAllFeedback = async (req: Request, res: Response) => {
    try {
      const feedback = await Feedback.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: feedback.length,
        data: feedback
      });
    } catch (error: any) {
      logger.error('Error fetching feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch feedback',
        error: error.message
      });
    }
  };
}

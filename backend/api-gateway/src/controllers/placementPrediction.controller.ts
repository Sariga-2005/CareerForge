import { Response, NextFunction } from 'express';
import { PlacementPrediction } from '../models/PlacementPrediction.model';
import { User } from '../models/User.model';
import { Resume } from '../models/Resume.model';
import { Interview } from '../models/Interview.model';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export class PlacementPredictionController {
    // Get all predictions
    getAllPredictions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const predictions = await PlacementPrediction.find().sort({ placementProbability: -1 });
            res.json({
                success: true,
                data: { predictions },
            });
        } catch (error) {
            next(error);
        }
    };

    // Search predictions by student email
    searchPredictions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { q } = req.query;

            if (!q || typeof q !== 'string') {
                throw new ApiError('Search query parameter is required', 400);
            }

            const predictions = await PlacementPrediction.find({
                $or: [
                    { email: { $regex: q, $options: 'i' } },
                    { studentName: { $regex: q, $options: 'i' } },
                ],
            }).sort({ placementProbability: -1 });

            res.json({
                success: true,
                data: { predictions },
            });
        } catch (error) {
            next(error);
        }
    };

    // Generate / recalculate predictions for all students
    generatePredictions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const students = await User.find({ role: 'student', isActive: true });

            const predictions = [];

            for (const student of students) {
                // Get latest resume score — analysisScore (top-level) is the primary score shown on student dashboard
                const resume = await Resume.findOne({ userId: student._id, isActive: true })
                    .select('analysis analysisScore');
                const resumeScore = resume?.analysisScore ?? resume?.analysis?.overallScore ?? 0;

                // Get average interview score — select full overallEvaluation subdoc
                const interviews = await Interview.find({
                    userId: student._id,
                    status: 'completed',
                }).select('overallEvaluation');

                const interviewScore = interviews.length > 0
                    ? Math.round(
                        interviews.reduce((sum, i) => sum + (i.overallEvaluation?.totalScore ?? 0), 0) /
                        interviews.length
                    )
                    : 0;

                // Get skill count — prefer user.skills, fall back to resume skills
                let skillCount = student.skills?.length ?? 0;
                if (skillCount === 0 && resume) {
                    // User skills array is empty, use skills extracted from resume
                    const resumeDoc = await Resume.findOne({ userId: student._id, isActive: true })
                        .select('skills');
                    skillCount = (resumeDoc?.skills?.technical?.length ?? 0) + (resumeDoc?.skills?.soft?.length ?? 0);
                }
                const cgpa = student.cgpa ?? 0;

                // Calculate placement probability (weighted formula)
                const probability = Math.min(100, Math.round(
                    cgpa * 8 +               // CGPA weight (max 80)
                    resumeScore * 0.3 +       // Resume weight (max 30)
                    interviewScore * 0.4 +    // Interview weight (max 40)
                    Math.min(skillCount * 2, 20) // Skills weight (max 20)
                ));

                // Determine risk level
                let riskLevel: 'High' | 'Medium' | 'Low';
                if (probability >= 70) riskLevel = 'Low';
                else if (probability >= 40) riskLevel = 'Medium';
                else riskLevel = 'High';

                // Predicted package estimate (simplified)
                const predictedPackage = parseFloat(
                    (3 + (probability / 100) * 12).toFixed(1)
                );

                // Generate recommendations
                const recs: string[] = [];
                if (resumeScore < 60) recs.push('Improve resume quality');
                if (interviewScore < 50) recs.push('Practice mock interviews');
                if (cgpa < 7) recs.push('Focus on academics');
                if (skillCount < 5) recs.push('Learn more in-demand skills');
                if (recs.length === 0) recs.push('On track – maintain consistency');

                predictions.push({
                    studentId: student._id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    email: student.email,
                    department: student.department || 'CSE',
                    batch: student.batch || 'N/A',
                    cgpa,
                    resumeScore,
                    interviewScore,
                    skillCount,
                    placementProbability: probability,
                    riskLevel,
                    predictedPackage,
                    recommendations: recs.join('; '),
                    lastCalculated: new Date(),
                });
            }

            // Upsert all predictions
            for (const pred of predictions) {
                await PlacementPrediction.findOneAndUpdate(
                    { studentId: pred.studentId },
                    { $set: pred },
                    { upsert: true, new: true }
                );
            }

            const allPredictions = await PlacementPrediction.find().sort({ placementProbability: -1 });

            logger.info(`Placement predictions generated for ${predictions.length} students by admin ${req.userId}`);

            res.json({
                success: true,
                message: `Predictions generated for ${predictions.length} students`,
                data: { predictions: allPredictions },
            });
        } catch (error) {
            next(error);
        }
    };

    // Create a manual prediction
    createPrediction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = req.body;

            if (data.placementProbability >= 70) data.riskLevel = 'Low';
            else if (data.placementProbability >= 40) data.riskLevel = 'Medium';
            else data.riskLevel = 'High';

            data.lastCalculated = new Date();

            const prediction = await PlacementPrediction.create(data);

            logger.info(`Manual prediction created for ${prediction.email} by admin ${req.userId}`);

            res.status(201).json({
                success: true,
                message: 'Prediction created successfully',
                data: { prediction },
            });
        } catch (error) {
            next(error);
        }
    };

    // Update prediction
    updatePrediction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (updateData.placementProbability !== undefined) {
                if (updateData.placementProbability >= 70) updateData.riskLevel = 'Low';
                else if (updateData.placementProbability >= 40) updateData.riskLevel = 'Medium';
                else updateData.riskLevel = 'High';
            }

            updateData.lastCalculated = new Date();

            const prediction = await PlacementPrediction.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!prediction) {
                throw new ApiError('Prediction not found', 404);
            }

            logger.info(`Prediction updated for ${prediction.email} by admin ${req.userId}`);

            res.json({
                success: true,
                message: 'Prediction updated successfully',
                data: { prediction },
            });
        } catch (error) {
            next(error);
        }
    };

    // Delete prediction
    deletePrediction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const prediction = await PlacementPrediction.findByIdAndDelete(id);

            if (!prediction) {
                throw new ApiError('Prediction not found', 404);
            }

            logger.info(`Prediction deleted for ${prediction.email} by admin ${req.userId}`);

            res.json({
                success: true,
                message: 'Prediction deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    };
}

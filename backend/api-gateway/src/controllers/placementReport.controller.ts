import { Response, NextFunction } from 'express';
import { PlacementReport } from '../models/PlacementReport.model';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export class PlacementReportController {
    // Get all reports
    getAllReports = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reports = await PlacementReport.find().sort({ createdAt: -1 });
            res.json({
                success: true,
                data: { reports },
            });
        } catch (error) {
            next(error);
        }
    };

    // Search reports by ID
    searchReports = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { q } = req.query;

            if (!q || typeof q !== 'string') {
                throw new ApiError('Search query parameter is required', 400);
            }

            // Search by partial _id match or by reportTitle
            const reports = await PlacementReport.find({
                $or: [
                    { reportTitle: { $regex: q, $options: 'i' } },
                    ...(q.match(/^[0-9a-fA-F]{1,24}$/) ? [{ _id: { $regex: q, $options: 'i' } }] : []),
                ],
            }).sort({ createdAt: -1 });

            res.json({
                success: true,
                data: { reports },
            });
        } catch (error) {
            next(error);
        }
    };

    // Get single report by ID
    getReportById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const report = await PlacementReport.findById(id);

            if (!report) {
                throw new ApiError('Report not found', 404);
            }

            res.json({
                success: true,
                data: { report },
            });
        } catch (error) {
            next(error);
        }
    };

    // Create report
    createReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {
                reportTitle,
                batch,
                department,
                reportType,
                minScore,
                maxScore,
                format,
                description,
                status,
                generatedBy,
            } = req.body;

            if (minScore > maxScore) {
                throw new ApiError('Minimum score cannot be greater than maximum score', 400);
            }

            const report = await PlacementReport.create({
                reportTitle,
                batch,
                department,
                reportType,
                minScore,
                maxScore,
                format,
                description: description || '',
                status: status || 'Pending',
                generatedBy,
            });

            logger.info(`Placement report created: ${report.reportTitle} by admin ${req.userId}`);

            res.status(201).json({
                success: true,
                message: 'Placement report created successfully',
                data: { report },
            });
        } catch (error) {
            next(error);
        }
    };

    // Update report
    updateReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (updateData.minScore !== undefined && updateData.maxScore !== undefined) {
                if (updateData.minScore > updateData.maxScore) {
                    throw new ApiError('Minimum score cannot be greater than maximum score', 400);
                }
            }

            const report = await PlacementReport.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!report) {
                throw new ApiError('Report not found', 404);
            }

            logger.info(`Placement report updated: ${report.reportTitle} by admin ${req.userId}`);

            res.json({
                success: true,
                message: 'Placement report updated successfully',
                data: { report },
            });
        } catch (error) {
            next(error);
        }
    };

    // Delete report
    deleteReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const report = await PlacementReport.findByIdAndDelete(id);

            if (!report) {
                throw new ApiError('Report not found', 404);
            }

            logger.info(`Placement report deleted: ${report.reportTitle} by admin ${req.userId}`);

            res.json({
                success: true,
                message: 'Placement report deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    };
}

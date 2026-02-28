import { Response, NextFunction } from 'express';
import { Alumni } from '../models/Alumni.model';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export class AlumniAdminController {
    // Get all alumni records
    getAllAlumni = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const alumni = await Alumni.find().sort({ createdAt: -1 });
            res.json({
                success: true,
                data: { alumni },
            });
        } catch (error) {
            next(error);
        }
    };

    // Search alumni by email
    searchAlumni = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email } = req.query;

            if (!email || typeof email !== 'string') {
                throw new ApiError('Email query parameter is required', 400);
            }

            const alumni = await Alumni.find({
                email: { $regex: email, $options: 'i' },
            }).sort({ createdAt: -1 });

            res.json({
                success: true,
                data: { alumni },
            });
        } catch (error) {
            next(error);
        }
    };

    // Get single alumni by ID
    getAlumniById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const alumni = await Alumni.findById(id);

            if (!alumni) {
                throw new ApiError('Alumni record not found', 404);
            }

            res.json({
                success: true,
                data: { alumni },
            });
        } catch (error) {
            next(error);
        }
    };

    // Create alumni record
    createAlumni = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {
                email,
                firstName,
                lastName,
                graduationYear,
                department,
                currentCompany,
                currentDesignation,
                phone,
                linkedIn,
                isActive,
            } = req.body;

            // Check if alumni with this email already exists
            const existingAlumni = await Alumni.findOne({ email: email.toLowerCase() });
            if (existingAlumni) {
                throw new ApiError('An alumni record with this email already exists', 409);
            }

            const alumni = await Alumni.create({
                email,
                firstName,
                lastName,
                graduationYear,
                department,
                currentCompany: currentCompany || '',
                currentDesignation: currentDesignation || '',
                phone: phone || '',
                linkedIn: linkedIn || '',
                isActive: isActive !== undefined ? isActive : true,
            });

            logger.info(`Alumni record created: ${alumni.email} by admin ${req.userId}`);

            res.status(201).json({
                success: true,
                message: 'Alumni record created successfully',
                data: { alumni },
            });
        } catch (error) {
            next(error);
        }
    };

    // Update alumni record
    updateAlumni = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // If email is being changed, check for duplicates
            if (updateData.email) {
                const existingAlumni = await Alumni.findOne({
                    email: updateData.email.toLowerCase(),
                    _id: { $ne: id },
                });
                if (existingAlumni) {
                    throw new ApiError('An alumni record with this email already exists', 409);
                }
            }

            const alumni = await Alumni.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!alumni) {
                throw new ApiError('Alumni record not found', 404);
            }

            logger.info(`Alumni record updated: ${alumni.email} by admin ${req.userId}`);

            res.json({
                success: true,
                message: 'Alumni record updated successfully',
                data: { alumni },
            });
        } catch (error) {
            next(error);
        }
    };

    // Delete alumni record
    deleteAlumni = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const alumni = await Alumni.findByIdAndDelete(id);

            if (!alumni) {
                throw new ApiError('Alumni record not found', 404);
            }

            logger.info(`Alumni record deleted: ${alumni.email} by admin ${req.userId}`);

            res.json({
                success: true,
                message: 'Alumni record deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    };
}

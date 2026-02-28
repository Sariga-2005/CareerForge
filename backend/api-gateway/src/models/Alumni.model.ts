import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAlumni extends Document {
    _id: Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    graduationYear: number;
    department: string;
    currentCompany: string;
    currentDesignation: string;
    phone: string;
    linkedIn: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const alumniSchema = new Schema<IAlumni>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters'],
        },
        graduationYear: {
            type: Number,
            required: [true, 'Graduation year is required'],
            min: [1990, 'Graduation year must be after 1990'],
            max: [2030, 'Graduation year must be before 2030'],
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'],
        },
        currentCompany: {
            type: String,
            trim: true,
            default: '',
        },
        currentDesignation: {
            type: String,
            trim: true,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        linkedIn: {
            type: String,
            trim: true,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

alumniSchema.index({ email: 1 });
alumniSchema.index({ department: 1, graduationYear: 1 });

// Virtual for full name
alumniSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

export const Alumni = mongoose.model<IAlumni>('Alumni', alumniSchema);

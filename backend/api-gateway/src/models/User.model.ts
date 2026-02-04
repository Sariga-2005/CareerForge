import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'admin' | 'alumni';
  profileImage?: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  
  // Student specific fields
  studentId?: string;
  department?: string;
  batch?: string;
  cgpa?: number;
  skills?: string[];
  placementStatus?: 'not-placed' | 'placed' | 'opted-out';
  
  // Alumni specific fields
  graduationYear?: number;
  currentCompany?: string;
  currentRole?: string;
  linkedIn?: string;
  
  // Timestamps
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): Partial<IUser>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
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
    role: {
      type: String,
      enum: ['student', 'admin', 'alumni'],
      default: 'student',
    },
    profileImage: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s-]{10,}$/, 'Please provide a valid phone number'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    
    // Student fields
    studentId: {
      type: String,
      sparse: true,
      unique: true,
    },
    department: String,
    batch: String,
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
    skills: [String],
    placementStatus: {
      type: String,
      enum: ['not-placed', 'placed', 'opted-out'],
      default: 'not-placed',
    },
    
    // Alumni fields
    graduationYear: Number,
    currentCompany: String,
    currentRole: String,
    linkedIn: String,
    
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, department: 1 });
userSchema.index({ batch: 1, placementStatus: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Return safe public JSON
userSchema.methods.toPublicJSON = function (): Partial<IUser> {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const User = mongoose.model<IUser>('User', userSchema);

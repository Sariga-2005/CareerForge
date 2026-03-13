import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  userId?: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  rating: number;
  category: 'ui' | 'features' | 'bug' | 'other';
  message: string;
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  category: { 
    type: String, 
    required: true, 
    enum: ['ui', 'features', 'bug', 'other'],
    default: 'other' 
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);

import mongoose, { Schema, Document } from 'mongoose';
import { SUBJECTS, Subject } from '../config/constants';

export interface IQuestion extends Document {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
  subject: Subject;
  topic: string;
  subTopic?: string;
  examYearAndType?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
    },
    option1: {
      type: String,
      required: [true, 'Option 1 is required'],
    },
    option2: {
      type: String,
      required: [true, 'Option 2 is required'],
    },
    option3: {
      type: String,
      required: [true, 'Option 3 is required'],
    },
    option4: {
      type: String,
      required: [true, 'Option 4 is required'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: SUBJECTS,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      lowercase: true,
    },
    subTopic: {
      type: String,
      trim: true,
      lowercase: true,
    },
    examYearAndType: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast filtering and duplicate detection
questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ question: 1, subject: 1 });

const Question = mongoose.model<IQuestion>('Question', questionSchema);

export default Question;

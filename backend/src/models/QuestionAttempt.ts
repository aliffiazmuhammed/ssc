import mongoose, { Schema, Document } from 'mongoose';
import { Subject } from '../config/constants';

export interface IQuestionAttempt extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  subject: Subject;
  topic: string;
  subTopic?: string;
  selectedOption: string | null;
  isCorrect: boolean;
  timeTaken: number; // seconds
  createdAt: Date;
  updatedAt: Date;
}

const questionAttemptSchema = new Schema<IQuestionAttempt>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'QuizSession',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      lowercase: true,
    },
    subTopic: {
      type: String,
      lowercase: true,
    },
    selectedOption: {
      type: String,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
questionAttemptSchema.index({ userId: 1, subject: 1, topic: 1 });
questionAttemptSchema.index({ userId: 1, createdAt: -1 });
questionAttemptSchema.index({ questionId: 1 });
questionAttemptSchema.index({ sessionId: 1 });

const QuestionAttempt = mongoose.model<IQuestionAttempt>('QuestionAttempt', questionAttemptSchema);

export default QuestionAttempt;

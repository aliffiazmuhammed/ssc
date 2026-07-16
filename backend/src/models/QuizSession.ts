import mongoose, { Schema, Document } from 'mongoose';
import { QUIZ_TYPES, QuizType, SUBJECTS, Subject } from '../config/constants';

export interface IQuizSession extends Document {
  userId: mongoose.Types.ObjectId;
  quizType: QuizType;
  subject?: Subject | 'All';
  topics?: string[];
  config: {
    totalQuestions: number;
    timeLimit: number; // in seconds
    timerMode: 'total' | 'per-question';
  };
  results: {
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    score: number; // percentage (0-100)
    timeTaken: number; // in seconds
    maxStreak: number;
  };
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quizSessionSchema = new Schema<IQuizSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizType: {
      type: String,
      enum: QUIZ_TYPES,
      required: true,
      default: 'practice',
    },
    subject: {
      type: String,
      // Either a valid subject or 'All' for mock tests
    },
    topics: [
      {
        type: String,
        lowercase: true,
      },
    ],
    config: {
      totalQuestions: { type: Number, required: true },
      timeLimit: { type: Number, required: true, default: 0 },
      timerMode: { type: String, enum: ['total', 'per-question'], required: true },
    },
    results: {
      correctCount: { type: Number, default: 0 },
      incorrectCount: { type: Number, default: 0 },
      unansweredCount: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      timeTaken: { type: Number, default: 0 },
      maxStreak: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizSessionSchema.index({ userId: 1, completedAt: -1 });
quizSessionSchema.index({ userId: 1, subject: 1, completedAt: -1 });
quizSessionSchema.index({ quizType: 1, subject: 1, completedAt: -1 });
quizSessionSchema.index({ status: 1 });

const QuizSession = mongoose.model<IQuizSession>('QuizSession', quizSessionSchema);

export default QuizSession;

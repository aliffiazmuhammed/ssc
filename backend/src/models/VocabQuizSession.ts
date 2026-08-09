import mongoose, { Document } from 'mongoose';

export interface IVocabQuizSession extends Document {
  userId: mongoose.Types.ObjectId;
  vocabType: 'ows' | 'synonyms-antonyms' | 'idioms-phrases';
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  score: number;
  answers: Array<{
    wordId: mongoose.Types.ObjectId;
    selectedOption: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
  completedAt: Date;
}

const VocabQuizSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vocabType: { type: String, enum: ['ows', 'synonyms-antonyms', 'idioms-phrases'], required: true },
  totalQuestions: { type: Number, required: true },
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  answers: [{
    wordId: { type: mongoose.Schema.Types.ObjectId, ref: 'VocabWord' },
    selectedOption: String,
    correctAnswer: String,
    isCorrect: Boolean,
  }],
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

VocabQuizSessionSchema.index({ userId: 1, completedAt: -1 });

export default mongoose.model<IVocabQuizSession>('VocabQuizSession', VocabQuizSessionSchema);

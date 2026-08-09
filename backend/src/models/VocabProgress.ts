import mongoose, { Document } from 'mongoose';

export interface IVocabProgress extends Document {
  userId: mongoose.Types.ObjectId;
  wordId: mongoose.Types.ObjectId;
  isStudied: boolean;
  studiedAt: Date;
}

const VocabProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: 'VocabWord', required: true },
  isStudied: { type: Boolean, default: true },
  studiedAt: { type: Date, default: Date.now },
}, { timestamps: true });

VocabProgressSchema.index({ userId: 1, wordId: 1 }, { unique: true });
VocabProgressSchema.index({ userId: 1, isStudied: 1 });

export default mongoose.model<IVocabProgress>('VocabProgress', VocabProgressSchema);

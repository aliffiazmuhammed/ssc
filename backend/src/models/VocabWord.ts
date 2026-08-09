import mongoose, { Document } from 'mongoose';

export interface IVocabWord extends Document {
  vocabType: 'ows' | 'synonyms-antonyms' | 'idioms-phrases';
  word: string;
  meaning: string;
  isTop200: boolean;
  exampleSentence?: string;
  synonyms?: string[];
  antonyms?: string[];
  uploadedBy: mongoose.Types.ObjectId;
}

const VocabWordSchema = new mongoose.Schema({
  vocabType: { type: String, enum: ['ows', 'synonyms-antonyms', 'idioms-phrases'], required: true, index: true },
  word: { type: String, required: true, trim: true },
  meaning: { type: String, required: true, trim: true },
  isTop200: { type: Boolean, default: false, index: true },
  exampleSentence: { type: String, trim: true },
  synonyms: [{ type: String, trim: true }],
  antonyms: [{ type: String, trim: true }],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

VocabWordSchema.index({ word: 1, vocabType: 1 }, { unique: true });
VocabWordSchema.index({ word: 'text' });
VocabWordSchema.index({ vocabType: 1, isTop200: 1, word: 1 });

export default mongoose.model<IVocabWord>('VocabWord', VocabWordSchema);

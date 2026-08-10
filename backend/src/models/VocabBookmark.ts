import mongoose, { Schema, Document } from 'mongoose';

export interface IVocabBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  wordId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vocabBookmarkSchema = new Schema<IVocabBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    wordId: { type: Schema.Types.ObjectId, ref: 'VocabWord', required: true },
  },
  { timestamps: true }
);

vocabBookmarkSchema.index({ userId: 1, wordId: 1 }, { unique: true });
vocabBookmarkSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IVocabBookmark>('VocabBookmark', vocabBookmarkSchema);

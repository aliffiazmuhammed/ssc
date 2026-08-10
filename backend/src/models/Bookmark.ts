import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IBookmark>('Bookmark', bookmarkSchema);

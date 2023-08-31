import mongoose, { Schema, Document } from 'mongoose';

interface Media extends Document {
  filename: string;
  contentType: string;
  fileId: mongoose.Types.ObjectId;
}

const mediaSchema = new Schema<Media>({
  filename: String,
  contentType: String,
  fileId: Schema.Types.ObjectId,
});

const MediaModel = mongoose.model<Media>('Media', mediaSchema);

export { Media, MediaModel };

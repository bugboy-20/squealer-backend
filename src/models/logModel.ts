import mongoose, { Schema, Document } from 'mongoose';

interface Log extends Document {
  path: string;
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  message: string;
}

const logSchema: Schema<Log> = new Schema<Log>({
  path: {
    type: String,
    required: true,
    format: 'url'
  },
  method: {
    type: String,
    enum: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

const LogModel = mongoose.model<Log>('Log', logSchema);

export default LogModel;

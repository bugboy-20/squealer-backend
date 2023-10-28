import mongoose, { Schema, Document } from 'mongoose';

enum ChannelType {
  Public = 'public',
  Private = 'private'
}

interface Channel extends Document {
  name: string;
  description: string;
  type: ChannelType;
  subscribed: boolean;
}

const channelSchema: Schema<Channel> = new Schema<Channel>({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [ChannelType.Public, ChannelType.Private],
    required: true
  },
  subscribed: {
    type: Boolean,
    required: false
  }
});

const ChannelModel = mongoose.model<Channel>('Channel', channelSchema);

export { Channel , ChannelModel }


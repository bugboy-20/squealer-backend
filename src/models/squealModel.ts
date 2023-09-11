import mongoose, { Schema, Document, now } from 'mongoose'; //l'ha fatto ChatGPT 

enum ContentType {
  Text = 'text',
  Media = 'media'
}

interface SquealSMM extends Document {
  receivers: string[],
  author: string,
  body: {
    type: ContentType,
    content: string
  },
  datetime: Date,
  impressions: string[],
  positive_reaction: string[],
  negative_reaction: string[],
  category: string[], //TODO a cosa serve category?
}

interface Squeal {
  receivers: string[],
  author: string,
  body: {
    type: ContentType,
    content: string
  },
  datetime: Date,
  impressions: number,
  positive_reaction: number,
  negative_reaction: number,
  category: string[], //TODO a cosa serve category?
}

interface Squeal {
  receivers: string[],
  author: string,
  body: {
    type: ContentType,
    content: string
  },
  category: string[],
}


const squealSchema: Schema<SquealSMM> = new Schema<SquealSMM>({
  author: {
    type: String,
    required: true
  },
  receivers: [{
    type: String,
    required: true
  }],
  body: {
    type: {
      type: String,
      enum: [ContentType.Media, ContentType.Text],
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  datetime: { 
    type: Date,
    required: true,
    default: now()
  },
  impressions: {
    type: [String],
    default: [],
    required: true
  },
  positive_reaction: {
    type: [String],
    default: [],
    required: true
  },
  negative_reaction: {
    type: [String],
    default: [],
    required: true
  },
  category: [{
    type: String,
    required: true,
    default: []
  }],
});

const SquealModel = mongoose.model<SquealSMM>('Squeal', squealSchema);

export {Squeal, SquealSMM,SquealModel, squealSchema}

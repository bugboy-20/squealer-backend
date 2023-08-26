import mongoose, { Schema, Document, now } from 'mongoose'; //l'ha fatto ChatGPT 

enum ContentType {
  Text = 'text',
  Media = 'media'
}

interface Squeal extends Document {
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


const squealSchema: Schema<Squeal> = new Schema<Squeal>({
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
    type: Number,
    default: 0,
    required: true
  },
  positive_reaction: {
    type: Number,
    default: 0,
    required: true
  },
  negative_reaction: {
    type: Number,
    default: 0,
    required: true
  },
  category: [{
    type: String,
    required: true,
    default: []
  }],
});

const SquealModel = mongoose.model<Squeal>('Squeal', squealSchema);

export {Squeal,SquealModel, squealSchema}

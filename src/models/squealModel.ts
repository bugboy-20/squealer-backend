import mongoose, { Schema, Document, now } from 'mongoose'; //l'ha fatto ChatGPT 

enum ContentType {
  Text = 'text',
  Media = 'media'
}

interface SquealSMM extends Document {
  _id: string,
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
  _id: string,
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

squealSchema.pre('save', function (next) {
  const uniqueElements = [...new Set(this.positive_reaction)];
  this.positive_reaction = uniqueElements;

  // Check for duplicates in the second array
  for (const element of this.negative_reaction) {
    if (uniqueElements.includes(element)) {
      return next(new Error('Duplicate elements found in the secondArray.'));
    }
  }

  next();
});
const SquealModel = mongoose.model<SquealSMM>('Squeal', squealSchema);

export {Squeal, SquealSMM,SquealModel, squealSchema}

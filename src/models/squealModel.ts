import mongoose, { Schema, Document, now } from 'mongoose';

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
  // Impedisco di avere più di una reazione per utente
  this.positive_reaction = [...new Set(this.positive_reaction)];
  this.negative_reaction = [...new Set(this.negative_reaction)];

  // Elimino eventuale doppio voto
  this.negative_reaction.filter(s => !this.positive_reaction.includes(s))

  //tolgo la quota all'utente TODO impedire il salvataggio quando ha esaurito la quota
  const quota_used = this.body.content.length
  UserModel.updateOne({ id: this.author }, { $inc: {"quote.day": quota_used, "quote.week": quota_used,"quote.month": quota_used,}})

  next();
});
const SquealModel = mongoose.model<SquealSMM>('Squeal', squealSchema);

export {Squeal, SquealSMM,SquealModel, squealSchema}

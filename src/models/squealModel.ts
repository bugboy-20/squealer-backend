import mongoose, { Schema, Document, now } from 'mongoose';
import { UserModel } from './userModel';
import { squealReadSchema } from '../validators/squealValidators';
import {getCommentsForASqueal} from '../utils/commentUtils';

const ContentEnum = {
  Text: 'text',
  Media: 'media',
  Geo: 'geo',
} as const;

type ContentType = (typeof ContentEnum)[keyof typeof ContentEnum];

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

interface SquealUser {
  id : string,
  receivers: string[],
  author: string,
  body: {
    type: ContentType,
    content: string | object //TODO vede se esiste tipo più specifico
  },
  datetime: Date,
  impressions: number,
  positive_reaction: number,
  negative_reaction: number,
  category: string[], //TODO a cosa serve category?
  comments: Comment[]
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
      enum: Object.values(ContentEnum),
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
},
);

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


interface Comment extends Omit<SquealSMM,'category'|'impressions'|'positive_reaction'|'negative_reaction'> {
  reference: string,
  comments: Comment[]
}

const commentSchema: Schema<Comment> = new Schema<Comment>({
  reference : { // squeal or comment id
    type: String,
    require: true
  }
}).add(squealSchema).remove(['category','receivers','impressions','positive_reaction','negative_reaction'])

const CommentModel = mongoose.model<Comment>('Comment', commentSchema);

export {SquealUser, SquealSMM,SquealModel, squealSchema, Comment, CommentModel, ContentEnum };

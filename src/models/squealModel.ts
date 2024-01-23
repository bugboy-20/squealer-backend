// ATTENZIONE L'ORDINE DELLE DICHIARAZIONI È IMPORTANTE!!!
import mongoose, { Schema, Document, now } from 'mongoose';
import {getReceivers} from '../utils/commentUtils';

import { consumeQuota, isPublic } from '../utils/SquealUtils';




const ContentEnum = {
  Text: 'text',
  Media: 'media',
  Geo: 'geo',
} as const;

type ContentType = (typeof ContentEnum)[keyof typeof ContentEnum];

interface Squeal extends Document {
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
  }
});


interface Comment extends Omit<Squeal, 'receivers'|'impressions'|'positive_reaction'|'negative_reaction'> {
  reference: string,
  comments: Comment[]
}

const commentSchema: Schema<Comment> = new Schema<Comment>({
  reference : { // squeal or comment id
    type: String,
    require: true
  }
}).add(squealSchema).remove(['receivers','impressions','positive_reaction','negative_reaction'])


squealSchema.pre('save', async function (next, opts) {
  if(opts?.disableMiddleware) return next();
  this.impressions = [...new Set(this.impressions)];
  // Impedisco di avere più di una reazione per utente
  this.positive_reaction = [...new Set(this.positive_reaction)];
  this.negative_reaction = [...new Set(this.negative_reaction)];

  // Elimino eventuale doppio voto
  this.negative_reaction = this.negative_reaction.filter(s => !this.positive_reaction.includes(s))

  let visibility = await isPublic(this.receivers)


  await consumeQuota(this.body, visibility, this.author)
  next();
});

const SquealModel = mongoose.model<Squeal>('Squeal', squealSchema);

commentSchema.pre('save', async function(next, opts) {
  if(opts?.disableMiddleware) return next();
  let visibility = await getReceivers(this.reference).then(r => isPublic(r))
  await consumeQuota(this.body,visibility,this.author)
next();
})

const CommentModel = mongoose.model<Comment>('Comment', commentSchema);
export { Squeal,SquealModel, squealSchema, Comment, CommentModel, ContentEnum };

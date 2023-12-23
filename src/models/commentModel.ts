import mongoose, {Schema} from 'mongoose'
import { squealSchema, Squeal, SquealSMM } from './squealModel'

interface Comment extends Omit<SquealSMM,'category'|'impressions'|'positive_reaction'|'negative_reaction'> {
  reference: string,
}

const commentSchema: Schema<Comment> = new Schema<Comment>({
  reference : { // squeal or comment id
    type: String,
    require: true
  }
}).add(squealSchema).remove('category').remove('receivers').remove('impressions').remove('positive_reaction').remove('negative_reaction')

const CommentModel = mongoose.model<Comment>('Comment', commentSchema);

export { Comment, CommentModel };

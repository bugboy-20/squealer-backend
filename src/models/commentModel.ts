import mongoose, {Schema} from 'mongoose'
import { squealSchema, SquealSMM } from './squealModel'

interface Comment extends Omit<SquealSMM,'category'> {
  reference: string,
}

const commentSchema: Schema<Comment> = new Schema<Comment>({
  reference : { // squeal or comment id
    type: String,
    require: true
  }
}).add(squealSchema).remove('category')

const CommentModel = mongoose.model<Comment>('Comment', commentSchema);

export { Comment, CommentModel };

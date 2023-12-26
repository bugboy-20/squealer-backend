import {Comment, CommentModel} from '../models/squealModel'

async function recursiveComments(comment: Comment) : Promise<Comment> {
  
  let subcomments : Comment[] = await CommentModel.find({reference: comment.id})

  let ret_comment = {
    ...comment.toObject(),
    comments : await Promise.all( subcomments.map(c => recursiveComments(c))),
    id: comment._id
  }
  return ret_comment
}

async function getCommentsForASqueal(squealID: string) : Promise<Comment[]> {
  
  let comments : Comment[] = await CommentModel.find({reference: squealID})

  return await Promise.all( comments.map(c => recursiveComments(c)))

}

export { getCommentsForASqueal }

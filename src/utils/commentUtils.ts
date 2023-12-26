import {Comment, CommentModel} from '../models/squealModel'

async function recursiveComments(comment: Comment) : Promise<Comment> {
  
  let subcomments : Comment[] = await CommentModel.find({reference: comment.id})

  comment.comments = await Promise.all( subcomments.map(c => recursiveComments(c)))
  
  return comment
}

async function getCommentsForASqueal(squealID: string) : Promise<Comment[]> {
  
  let comments : Comment[] = await CommentModel.find({reference: squealID})

  return await Promise.all( comments.map(c => recursiveComments(c)))

}

export { getCommentsForASqueal }

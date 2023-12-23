import {Comment, CommentModel} from '../models/commentModel'
import {Squeal, SquealModel} from '../models/squealModel'

async function recursiveComments(comment: Comment) : Promise<Comment> {
  
  let subcomments : Comment[] = await CommentModel.find({reference: comment.id})

  subcomments.forEach(c => recursiveComments(c))
  comment.comments = subcomments

  return comment
}

async function getCommentsForASqueal(squeal: Squeal) : Promise<Comment[]> {
  
  let comments : Comment[] = await CommentModel.find({reference: squeal.id})

  comments.forEach(c => recursiveComments(c))

  return comments

}

export { getCommentsForASqueal }

import {Comment, CommentModel, ContentEnum, SquealModel, SquealSMM} from '../models/squealModel'
import { commentReadSchema, commentRead_t } from '../validators/commentValidators'

async function recursiveComments(comment: commentRead_t) : Promise<commentRead_t> {
  
  const subcomments : Comment[] = await CommentModel.find({reference: comment.id})

  return {
    ...comment,
    comments : await Promise.all( subcomments.map(c => recursiveComments(comment4NormalUser(c)))),
  }
}

async function getCommentsForASqueal(squealID: string) : Promise<commentRead_t[]> {
  
  const comments : Comment[] = await CommentModel.find({reference: squealID})

  return await Promise.all( comments.map(c => recursiveComments(comment4NormalUser(c))))
}

const comment4NormalUser = (comment: Comment): commentRead_t => {
  const ret_comment = {
    ...comment.toObject(),
    id: comment._id.toString(),
    body: {
      type: comment.body.type,
      content:
        comment.body.type === ContentEnum.Geo
          ? JSON.parse(comment.body.content)
          : comment.body.content,
    },
    comments: []
  }
  return commentReadSchema.parse(ret_comment)
}

async function getReceivers(reference: string) : Promise<string[]> {
  let father : Comment | SquealSMM | null = await SquealModel.findOne({ _id: reference})
  if (father)
    return (father as SquealSMM).receivers

  father= await CommentModel.findOne({ _id: reference})
  if (!father)
    throw Error('reference to non existent comment')

  return getReceivers((father as Comment).reference)
}

export { getCommentsForASqueal, comment4NormalUser, getReceivers }

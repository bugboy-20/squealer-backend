import {Middleware} from "polka";
import { Comment, CommentModel } from "../models/commentModel"
import {catchServerError} from "../utils/controllersUtils";
import {send401} from "../utils/statusSenders";

const postComment : Middleware = catchServerError( async (req, res) => {
    let comment : Comment = new CommentModel(req.body)

    if(comment.reference != req.params.id)
      return send401

    const savedComment = await comment.save()

    res.status(201).json(savedComment);

  })

const getComments : Middleware = catchServerError( async (req, res) => {
    const refID = req.params.squealID;

    const comments = CommentModel.find({ reference: refID })

    res.json(await comments.exec())
})



export { postComment, getComments}

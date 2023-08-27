import {RequestHandler} from "express";
import { Comment, CommentModel } from "../models/commentModel"
import {catchServerError} from "../utils/controllersUtils";

const postComment : RequestHandler = catchServerError( async (req, res) => {
    let comment : Comment = new CommentModel(req.body)
    const savedComment = await comment.save()

    res
      .writeHead(201, {'Content-Type': 'application/json'})
      .end(JSON.stringify(savedComment));




  })

const getComments : RequestHandler = catchServerError( async (req, res) => {
    const refID = req.params.squealID;

    const comments = CommentModel.find({ reference: refID })

    let j = JSON.stringify(await comments.exec());
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    res.end(j)
})



export { postComment, getComments}

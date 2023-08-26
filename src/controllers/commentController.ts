import {RequestHandler} from "express";
import { Comment, CommentModel } from "../models/commentModel"

const postComment : RequestHandler = async (req, res) => {
  try {
    let comment : Comment = new CommentModel(req.body)
    const savedComment = await comment.save()

    res
      .writeHead(201, {'Content-Type': 'application/json'})
      .end(JSON.stringify(savedComment));




  } catch (e) {
    res.statusCode = 500
    res.end()
    console.error(e)
  }
}

const getComments : RequestHandler = async (req, res) => {
  try {
    const refID = req.params.squealID;

    const comments = CommentModel.find({ reference: refID })

    let j = JSON.stringify(await comments.exec());
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    res.end(j)
  } catch (e) {
    res.statusCode = 500
    res.end()
  }
}



export { postComment }

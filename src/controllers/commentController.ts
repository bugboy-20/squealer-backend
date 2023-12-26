import {Middleware} from "polka";
import { Comment, CommentModel } from "../models/squealModel"
import {catchServerError} from "../utils/controllersUtils";
import {send401} from "../utils/statusSenders";

const postComment : Middleware = catchServerError( async (req, res) => {
    let comment : Comment = new CommentModel(req.body)

    comment.reference = req.params.referenceID

    if(req.auth.isAuth) {
        comment.author = req.auth.username
    }

    const savedComment = await comment.save()

    res.status(201).json(savedComment);

  })

const getComments : Middleware = catchServerError( async (req, res) => { // credo sia meglio se è il 
    const refID = req.params.squealID;

    const comments = CommentModel.find()
    if ( refID )
        comments.find({ reference: refID })

    res.json(await comments.exec())
})

const deleteComment : Middleware = catchServerError( async (req, res) => {

    const id  = req.params.id

    await CommentModel.deleteOne({ _id : id})
    
    res.json({ log: `${id} deleted`})
})

export { postComment, getComments, deleteComment}

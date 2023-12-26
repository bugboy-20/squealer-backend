/*
 * PROBABILMENTE NON VOGLIO AGGIUNGERE QUESTI PERCORSI ALL'API
 */
import { Express } from "express"
import {deleteComment, getComments, postComment} from "../controllers/commentController";
import {auth, isAuth, sameUsername} from "../middleware/auth";
import {parseJWT} from "../middleware/verifyJWT";
import {send403} from "../utils/statusSenders";

const commentRoutes : (app : Express) => Express = app =>
  app
    .use('/api/comments/',parseJWT)
    .get('/api/comments/:id?', getComments)
    .post('/api/comments/:referenceID', auth(isAuth, postComment), send403)
    .delete('/api/comments/:id?', auth(sameUsername, deleteComment), send403)

export default commentRoutes;

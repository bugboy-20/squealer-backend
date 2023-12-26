import { Express } from "express"
import {getComments, postComment} from "../controllers/commentController";

import {addReceiver, changeReactions, deleteSqueal, getSqueals, postSqueal, updateSqueal} from '../controllers/squealController';
import {auth, isAuth} from "../middleware/auth";
import {escapeQuery} from "../middleware/esapeChars";
import {parseJWT} from "../middleware/verifyJWT";
import {send403, send501} from "../utils/statusSenders";

const squealRoutes : (app : Express) => Express = app =>
  app
    .use('/api/squeals/*',parseJWT)
    .get('/api/squeals/:id?', escapeQuery('channelName'), getSqueals)
    .post('/api/squeals/', postSqueal)
    .delete('/api/squeals/:id', deleteSqueal)
    .patch('/api/squeals/:id', auth(isAuth, updateSqueal), send403)
    .patch('/api/squeals/:id/receivers', addReceiver)
    .patch('/api/squeals/:id/reactions', changeReactions)
    .get('/api/squeals/:squealID/comments',getComments) // TODO restituture un 'albero'
    .post('/api/squeals/:refID/reply', postComment)


export default squealRoutes;

import { Express } from "express"
import {getComments, postComment} from "../controllers/commentController";

import {addReceiver, changeReactions, deleteSqueal, getSqueals, postSqueal, updateSqueal, getInerractions, updateTimedSqueals} from '../controllers/squealController';
import {auth, isAuth} from "../middleware/auth";
import {escapeQuery} from "../middleware/esapeChars";
import {parseJWT} from "../middleware/parseJWT";
import {send403, send501} from "../utils/statusSenders";

const squealRoutes : (app : Express) => Express = app =>
  app
    .use('/api/squeals/',parseJWT)
    .get('/api/squeals/:id?', escapeQuery('channelName'), getSqueals)
    .get('/api/squeals/:id/interactions', getInerractions)
    .post('/api/squeals/', postSqueal)
    .delete('/api/squeals/:id', deleteSqueal)
    .patch('/api/squeals/:id', auth(isAuth, updateSqueal), send403)
    .patch('/api/squeals/:id/geopoint', updateTimedSqueals)
    .patch('/api/squeals/:id/receivers', addReceiver)
    .patch('/api/squeals/:id/reactions', changeReactions)
    .get('/api/squeals/:squealID/comments',getComments)
    .post('/api/squeals/:refID/reply', postComment)


export default squealRoutes;

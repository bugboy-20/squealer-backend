import { Express } from "express"
import {getComments} from "../controllers/commentController";

import {deleteSqueal, getSqueals, postSqueal, updateSqueal} from '../controllers/squealController';
import {escapeQuery} from "../middleware/esapeChars";
import {parseJWT} from "../middleware/verifyJWT";
import {send501} from "../utils/statusSenders";

const squealRoutes : (app : Express) => Express = app =>
  app
    .use('/api/squeals/*',parseJWT)
    .get('/api/squeals/:id?', escapeQuery('channelName'), getSqueals)
    .post('/api/squeals/', postSqueal)
    .delete('/api/squeals/:id', deleteSqueal)
    .patch('/api/squeals/:id', updateSqueal)
    .get('/api/squeal/:id/comments',getComments) // TODO restituture un 'albero'
    .post('/api/squeals/:id/reply', send501)


export default squealRoutes;

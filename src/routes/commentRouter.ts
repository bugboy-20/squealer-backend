/*
 * PROBABILMENTE NON VOGLIO AGGIUNGERE QUESTI PERCORSI ALL'API
 */
import { Express } from "express"
import {getComments, postComment} from "../controllers/commentController";

import {escapeQuery} from "../middleware/esapeChars";
import {parseJWT} from "../middleware/verifyJWT";

const commentRoutes : (app : Express) => Express = app =>
  app
    .get('/api/comments/:id?', getComments)
    .post('/api/comments/:reference', postComment)

export default commentRoutes;

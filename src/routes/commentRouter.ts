/*
 * PROBABILMENTE NON VOGLIO AGGIUNGERE QUESTI PERCORSI ALL'API
 */
import polka from "polka";
import {getComments, postComment} from "../controllers/commentController";

import {escapeQuery} from "../middleware/esapeChars";
import {parseJWT} from "../middleware/verifyJWT";

const commentRoutes : (app : polka.Polka) => polka.Polka = app =>
  app
    .get('/api/comment/:id?', getComments)
    .post('/api/comment/', postComment)

export default commentRoutes;

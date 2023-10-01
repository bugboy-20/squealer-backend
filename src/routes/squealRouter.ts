import polka from "polka";

import {deleteSqueal, getSqueals, postSqueal, updateSqueal} from '../controllers/squealController';
import {escapeQuery} from "../middleware/esapeChars";
import {parseJWT} from "../middleware/verifyJWT";

const squealRoutes : (app : polka.Polka) => polka.Polka = app =>
  app
    .use('/api/squeals/*',parseJWT)
    .get('/api/squeals/:id?', escapeQuery('channelName'), getSqueals)
    .post('/api/squeals/', postSqueal)
    .delete('/api/squeals/:id', deleteSqueal)
    .patch('/api/squeals/:id', updateSqueal)


export default squealRoutes;

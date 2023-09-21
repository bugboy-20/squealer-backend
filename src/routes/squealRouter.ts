import polka from "polka";

import {deleteSqueal, getSqueals, postSqueal, updateSqueal} from '../controllers/squealController';
import {escapeQuery} from "../middleware/esapeChars";

const squealRoutes : (app : polka.Polka) => void = app => {
  app.get('/api/squeals/:id?', escapeQuery('channelName'), getSqueals)
  app.post('/api/squeals/', postSqueal)
  app.delete('/api/squeals/:id', deleteSqueal)
  app.patch('/api/squeals/:id', updateSqueal)
}

export default squealRoutes;

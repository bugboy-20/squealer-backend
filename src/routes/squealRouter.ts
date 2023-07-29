import polka from "polka";

import {deleteSqueal, getSqueals, postSqueal} from '../controllers/squealController';

const squealRoutes : (app : polka.Polka) => void = app => {
  app.get('/api/squeals/:id?', getSqueals)
  app.post('/api/squeals/', postSqueal)
  app.delete('/api/squeals/:id', deleteSqueal)
}

export default squealRoutes;

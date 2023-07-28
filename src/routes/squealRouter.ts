import polka from "polka";

import {listAllSqueals, postSqueal} from '../controllers/squealController';

const squealRoutes : (app : polka.Polka) => void = app => {
  app.get('/api/squeals/', listAllSqueals)
  app.post('/api/squeals/', postSqueal)
}

export default squealRoutes;

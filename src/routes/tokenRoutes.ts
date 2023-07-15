

import polka from "polka"
import {send501} from '../utils/statusSenders'

const tokenRoutes : (app : polka.Polka) => void = app => {
    app
      .get('/api/token', send501) //login
      .delete('/api/token', send501) //logout
}

export default tokenRoutes;

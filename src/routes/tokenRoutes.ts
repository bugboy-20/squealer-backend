

import polka from "polka"
import {getToken} from "../controllers/tokenController";
import {send501} from '../utils/statusSenders'

const tokenRoutes : (app : polka.Polka) => void = app => {
    app
      .post('/api/token', getToken) //login
      .delete('/api/token', send501) //logout
}

export default tokenRoutes;

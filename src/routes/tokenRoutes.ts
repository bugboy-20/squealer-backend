

import polka from "polka"
import {getToken,deleteToken, getRefreshToken} from "../controllers/tokenController";

const tokenRoutes : (app : polka.Polka) => polka.Polka = app =>
    app
      .post('/api/token', getToken) //login
      .delete('/api/token', deleteToken) //logout
      .post('/api/token/refresh', getRefreshToken) // refresh token


export default tokenRoutes;

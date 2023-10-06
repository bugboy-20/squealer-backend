import { Express } from "express"
import {getToken,deleteToken, getRefreshToken} from "../controllers/tokenController";

const tokenRoutes : (app : Express) => Express = app =>
    app
      .post('/api/token', getToken) //login
      .delete('/api/token', deleteToken) //logout
      .post('/api/token/refresh', getRefreshToken) // refresh token


export default tokenRoutes;

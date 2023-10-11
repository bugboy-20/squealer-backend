import { Express } from "express"
import {listAllUsers, addUser, deleteUser, findUser, getQuote, whoiam} from "../controllers/userController";
import {and, not, auth, isModerator, sameUsername, isAuth} from "../middleware/auth";
import {parseJWT} from "../middleware/verifyJWT";
import {send401, send501} from "../utils/statusSenders";

const userRoutes : (app : Express) => Express = app => 
    app
      .use('/api/users/*',parseJWT)
      .get('/api/users/', listAllUsers)// auth(isAuth, listAllUsers), send401)
      .get('/api/users/me', auth(isAuth, whoiam), send401)
      .get('/api/users/:username', findUser)// auth(isAuth, findUser), send401)
      .get('/api/users/:username/subscriptions', send501) //TODO
      .get('/api/users/:username/quota', auth(and(isModerator,sameUsername), getQuote), send401)
      .delete('/api/users/:username', auth(and(isModerator, sameUsername), deleteUser), send401)
      .put('/api/users/:username',  addUser)

export default userRoutes;

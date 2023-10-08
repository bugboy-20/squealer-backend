import { Express } from "express"
import {listAllUsers, addUser, deleteUser, findUser, getQuote, whoiam} from "../controllers/userController";
import {and, not, auth, isModerator, noAuth, sameUsername} from "../middleware/auth";
import {parseJWT} from "../middleware/verifyJWT";
import {send401, send501} from "../utils/statusSenders";

const userRoutes : (app : Express) => Express = app => 
    app
      .use('/api/users/*',parseJWT)
      .get('/api/users/', auth(not(noAuth), listAllUsers), send401)
      .get('/api/users/:username', auth(not(noAuth), findUser))
      .get('/api/users/:username/quota', auth(and(isModerator,sameUsername), getQuote), send401)
      .delete('/api/users/:username', auth(and(isModerator, sameUsername), deleteUser), send401)
      .put('/api/users/:username',  addUser)
      .get('/api/users/:username/following', send501) //TODO
      .get('/api/users/me', whoiam)

export default userRoutes;

import { Express } from "express"
import {addChannel, getChannels} from "../controllers/channelController";
import {getSqueals} from "../controllers/squealController";
import {subscribeToChannel, unsubscribeFromChannel} from "../controllers/userController";
import {escapeParam} from "../middleware/esapeChars";
import {parseJWT} from "../middleware/verifyJWT";
import {send401, send501} from "../utils/statusSenders";
import {auth, isAuth} from "../middleware/auth";

const channelRoutes : (app : Express) => Express = app =>
  app
  .use('/api/channels/*',parseJWT)
  .get('/api/channels/:channelName?', escapeParam('channelName'), getChannels)
  .get('/api/channels/:channelName/squeals', escapeParam('channelName'), getSqueals)
  .post('/api/channels/', addChannel)
  .get('/api/channels/:channelName/subscriptions/', send501)
  .patch('/api/channels/:channelName/subscribe/', auth(isAuth, subscribeToChannel), send401)
  .delete('/api/channels/:channelName/subscribe/', auth(isAuth, unsubscribeFromChannel), send401)

export default channelRoutes;

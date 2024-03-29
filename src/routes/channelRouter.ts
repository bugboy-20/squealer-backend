import { Express } from "express"
import {addChannel, changeDescription, deleteChannel, getChannels} from "../controllers/channelController";
import {getSqueals} from "../controllers/squealController";
import {subscribeToChannel, unsubscribeFromChannel} from "../controllers/userController";
import {escapeParam} from "../middleware/esapeChars";
import {parseJWT} from "../middleware/parseJWT";
import {send401} from "../utils/statusSenders";
import {auth, isAuth} from "../middleware/auth";


const channelRoutes : (app : Express) => Express = app =>
  app
  .use('/api/channels/',parseJWT)
  .get('/api/channels/:channelName?', escapeParam('channelName'), getChannels)
  .get('/api/channels/:channelName/squeals', escapeParam('channelName'), getSqueals)
  .post('/api/channels/', addChannel)
  .patch('/api/channels/:channelName/description', changeDescription)
  .patch('/api/channels/:channelName/subscribe/', auth(isAuth, subscribeToChannel), send401)
  .delete('/api/channels/:channelName/subscribe/', auth(isAuth, unsubscribeFromChannel), send401)
  .delete('/api/channels/:channelName', deleteChannel)

export default channelRoutes;

import { Express } from "express"
import {addChannel, getChannels} from "../controllers/channelController";
import {getSqueals} from "../controllers/squealController";
import {escapeParam} from "../middleware/esapeChars";
import {parseJWT} from "../middleware/verifyJWT";
import {send501} from "../utils/statusSenders";

const channelRoutes : (app : Express) => Express = app =>
  app
  .use('/api/channels/*',parseJWT)
  .get('/api/channels/:channelName?', escapeParam('channelName'), getChannels)
  .get('/api/channels/:channelName/squeals', escapeParam('channelName'), getSqueals)
  .post('/api/channels/', addChannel)
  .get('/api/channels/:channelName/subscribers/', send501)
  .patch('/api/channels/:channelName/subscribers/', send501)
  

export default channelRoutes;

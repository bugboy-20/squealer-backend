import polka from "polka";
import {addChannel, getChannels} from "../controllers/channelController";
import {getSqueals} from "../controllers/squealController";
import {escapeParam} from "../middleware/esapeChars";
import {parseJWT} from "../middleware/verifyJWT";
import {send501} from "../utils/statusSenders";

const channelRoutes : (app : polka.Polka) => polka.Polka = app =>
  app
  .use('/api/channels/*',parseJWT)
  .get('/api/channels/:channelName?', escapeParam('channelName'), getChannels)
  .get('/api/channels/:channelName/squeals', escapeParam('channelName'), getSqueals)
  .post('/api/channels/', addChannel)
  .get('/api/channels/:channelName/subscribers/', send501)
  .patch('/api/channels/:channelName/subscribers/', send501)
  

export default channelRoutes;

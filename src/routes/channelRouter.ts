import polka from "polka";
import {addChannel, getChannels} from "../controllers/channelController";
import {getSqueals} from "../controllers/squealController";
import {escapeParam} from "../middleware/esapeChars";
import {send501} from "../utils/statusSenders";

const channelRoutes : (app : polka.Polka) => void = app => {
  app
  .get('/api/channels/:channelName?', escapeParam('channelName'), getChannels)
  .get('/api/channels/:channelName/squeals', escapeParam('channelName'), getSqueals)
  .post('/api/channels/', addChannel)
  
}

export default channelRoutes;

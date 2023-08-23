import polka from "polka";
import {addChannel, getChannels} from "../controllers/channelController";
import {getSqueals} from "../controllers/squealController";
import {send501} from "../utils/statusSenders";

const channelRoutes : (app : polka.Polka) => void = app => {
  app
  .get('/api/channels/:channelName?', getChannels)
  .get('/api/channels/:channelName/squeals', getSqueals)
  .post('/api/channels/', addChannel)
  
}

export default channelRoutes;

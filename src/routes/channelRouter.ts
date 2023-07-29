import polka from "polka";
import {addChannel, getChannels} from "../controllers/channelController";

const channelRoutes : (app : polka.Polka) => void = app => {
  app
  .get('/api/channels/:channelName?', getChannels)
  .post('/api/channels/', addChannel)
}

export default channelRoutes;

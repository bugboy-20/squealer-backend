
import polka from "polka"
import {addLog, listAllLogs} from "../controllers/logController";

const logRoutes : (app : polka.Polka) => void = app => {
    app
      .put('/api/logs/', addLog)
      .get('/api/logs/', listAllLogs)
}

export default logRoutes;

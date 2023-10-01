
import polka from "polka"
import {addLog, listAllLogs} from "../controllers/logController";
import {parseJWT} from "../middleware/verifyJWT";

const logRoutes : (app : polka.Polka) => polka.Polka = app =>
    app
      .put('/api/logs/', addLog)
      .get('/api/logs/', listAllLogs)

export default logRoutes;

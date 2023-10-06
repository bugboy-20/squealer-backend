import { Express } from "express"
import {addLog, listAllLogs} from "../controllers/logController";

const logRoutes : (app : Express) => Express = app =>
    app
      .put('/api/logs/', addLog)
      .get('/api/logs/', listAllLogs)

export default logRoutes;

import { Express } from "express"
import serverInfo from "../utils/info";
import channelRoutes from "./channelRouter";
import logRoutes from "./logRoutes";
import squealRoutes from "./squealRouter";
import tokenRoutes from "./tokenRoutes";
import userRoutes from "./userRoutes";
import mediaRoutes from "./mediaRoutes";

let routelist : Array<(a : Express) => Express> = [
    userRoutes,
    logRoutes,
    tokenRoutes,
    squealRoutes,
    channelRoutes,
    mediaRoutes,
    serverInfo
];

const routes : (app : Express) => Express = (app) => {
    routelist.forEach(f => f(app))
    app.all('/api/*', (req,res) => {
        res.status(405).end('405 - Method not Allowed')
    })
    return app;
}

export default routes;

import polka from "polka";
import serverInfo from "../utils/info";
import channelRoutes from "./channelRouter";
import logRoutes from "./logRoutes";
import squealRoutes from "./squealRouter";
import tokenRoutes from "./tokenRoutes";
import userRoutes from "./userRoutes";
import mediaRoutes from "./mediaRoutes";

let routelist : Array<(a : polka.Polka) => void> = [
    userRoutes,
    logRoutes,
    tokenRoutes,
    squealRoutes,
    channelRoutes,
    mediaRoutes,
    serverInfo
];

const routes : (app : polka.Polka) => polka.Polka = (app) => {
    routelist.forEach(f => f(app))
    app.all('/api/*', (req,res) => {
        res.statusCode = 405
        res.end('405 - Method not Allowed')
    })
    return app;
}

export default routes;

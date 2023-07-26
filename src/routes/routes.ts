import polka from "polka";
import logRoutes from "./logRoutes";
import tokenRoutes from "./tokenRoutes";
import userRoutes from "./userRoutes";


let routelist : Array<(a : polka.Polka) => void> = [
    userRoutes,
    logRoutes,
    tokenRoutes
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

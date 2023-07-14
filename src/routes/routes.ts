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
        res.sendStatus(405)
    })
    return app;
}

export default routes;

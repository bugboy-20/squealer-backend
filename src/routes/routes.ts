import polka from "polka";
import logRoutes from "./logRoutes";
import userRoutes from "./userRoutes";


let routelist : Array<(a : polka.Polka) => void> = [
    userRoutes,
    logRoutes
];

const routes : (app : polka.Polka) => polka.Polka = (app) => {
    routelist.forEach(f => f(app))
    return app;
}

export default routes;

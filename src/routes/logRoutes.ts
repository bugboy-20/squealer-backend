
import polka from "polka"

const logRoutes : (app : polka.Polka) => void = app => {
    app
      .put('/api/logs/', (req, res) => res.end('SEX'))
      .get('/api/logs/', (req, res) => res.end('SEX'))
}

export default logRoutes;

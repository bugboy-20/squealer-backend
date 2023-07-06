import polka from "polka"

const userRoutes : (app : polka.Polka) => void = app => {
    app
      .get('/api/users/', (req, res) => res.end('IMPROVED SEX'))
      .delete('/api/users/:username', (req, res) => res.end('IMPROVED SEX'))
      .put('/api/users/:username', (req, res) => res.end('IMPROVED SEX'))
}

export default userRoutes;

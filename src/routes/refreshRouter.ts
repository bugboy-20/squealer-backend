

import polka from "polka"
import {getRefreshToken} from "../controllers/tokenController";

const refreshRoutes : (app : polka.Polka) => void = app => {
    app
      .post('/api/refresh', getRefreshToken) // refresh token
}

export default refreshRoutes;

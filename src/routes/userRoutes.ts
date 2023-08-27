import polka from "polka"
import {listAllUsers, addUser, deleteUser, findUser, getQuote} from "../controllers/userController";

const userRoutes : (app : polka.Polka) => void = app => {
    app
      .get('/api/users/', listAllUsers)
      .get('/api/users/:username', findUser)
      .get('/api/users/:username/quota', getQuote)
      .delete('/api/users/:username', deleteUser)
      .put('/api/users/:username', addUser)
}

export default userRoutes;

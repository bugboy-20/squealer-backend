import polka from "polka"
import {listAllUsers, addUser, deleteUser, findUser} from "../controllers/userController";

const userRoutes : (app : polka.Polka) => void = app => {
    app
      .get('/api/users/', listAllUsers)
      .get('/api/users/:username', findUser)
      .delete('/api/users/:username', deleteUser)
      .put('/api/users/:username', addUser)
}

export default userRoutes;

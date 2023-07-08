import polka from "polka"
import {listAllUsers, addUser, deleteUser} from "../controllers/userController";

const userRoutes : (app : polka.Polka) => void = app => {
    app
      .get('/api/users/', listAllUsers)
      .delete('/api/users/:username', deleteUser)
      .put('/api/users/:username', addUser)
}

export default userRoutes;

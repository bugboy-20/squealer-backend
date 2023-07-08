
import {RequestHandler} from 'express';
import {User,UserModel} from '../models/userModel'

const listAllUsers : RequestHandler = async (req, res) => {
  try {
    const users: User[] = await UserModel.find().exec();
     res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(users);
    res.end(json);
    //res.status(200).json(logs);
    //res.json(logs);
  } catch (error) {
    // Handle any potential errors during the query
    console.error('listAllUsers error: ' + error)
    //await fetch(...) TODO
    throw error;
  }
}

const addUser : RequestHandler = async (req, res) => {

  try {
    const user = new UserModel(req.body);
    const savedUser = await user.save();
    res.end(JSON.stringify(savedUser));
  } catch(e) {
    console.error('addUser error: ' + e)
  }

}

const deleteUser : RequestHandler = async (req, res) => {
  try {
    const username = req.params.username;
    const deletedUser = await UserModel.findOneAndDelete({ username });
    if (deletedUser) {
      console.log(`User with username '${username}' has been deleted.`);
      res.end(deleteUser)
      return true;
    } else {
      res.end(deleteUser)
      console.log(`User with username '${username}' not found.`);
      return false;
    }
  } catch (error) {
    console.error('Error occurred while deleting user:', error);
    return false;
  }
}


export {listAllUsers,addUser, deleteUser};

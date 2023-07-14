
import {hash} from 'bcrypt';
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


const findUser : RequestHandler = async (req, res) => {
  try {
    const username = req.params.username;
    const user: User = await UserModel.findOne({username}).exec();
     res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(user);
    res.end(json);
    //res.status(200).json(logs);
    //res.json(logs);
  } catch (error) {
    // Handle any potential errors during the query
    console.error('findUser error: ' + error)
    //await fetch(...) TODO
    throw error;
  }
}


const addUser : RequestHandler = async (req, res) => {

  try {
    const user = new UserModel(req.body);
    const isUsernamealreadytaken = await UserModel.find({ username : user.username}).exec() //TODO check already taken
    res.sendStatus(202)
    user.password = await hash(user.password, 10);
    const savedUser = await user.save();
    res
      .writeHead(201, {'Content-Type': 'application/json'})
      .end(JSON.stringify(savedUser));
  } catch(e) {
    console.error('addUser error: ' + e)
  }

}

const deleteUser : RequestHandler = async (req, res) => {
  try {
    const username = req.params.username;
    const deletedUser = await UserModel.findOneAndDelete({ username }).exec();
    if (deletedUser) {
      console.log(`User with username '${username}' has been deleted.`);
      res
        .writeHead(200, {'Content-Type': 'application/json'})
        .end(deleteUser)
      return true;
    } else {
      res.end(deleteUser)
        .writeHead(400, {
          'Content-Type': 'application/json',
          'X-Error-Code': 'username not found'
        })
      console.log(`User with username '${username}' not found.`);
      return false;
    }
  } catch (error) {
    console.error('Error occurred while deleting user:', error);
    return false;
  }
}


export {listAllUsers,addUser, deleteUser, findUser};
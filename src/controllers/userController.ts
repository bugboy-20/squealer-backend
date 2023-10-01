
import {hash} from 'bcrypt';
import {RequestHandler} from 'express';
import {User,UserModel} from '../models/userModel'
import {userBackToFront, userFrontToBack} from '../utils/userUtils';
import { catchServerError } from '../utils/controllersUtils';

const listAllUsers : RequestHandler = catchServerError( async (req, res) => {
    const users: User[] = await UserModel.find().exec();
    res.json(users.map(u => userBackToFront(u)));
  },500,'listAllUsers error: ')

const findUser : RequestHandler = catchServerError( async (req, res) => {
    const username = req.params.username;
    const user =  await UserModel.findOne({username}).exec();
    if(user) {
       res.writeHead(200, {
        'Content-Type': 'application/json',
      });
      let json = JSON.stringify(userBackToFront(user));
      res.end(json);
    } else {
      res.statusCode = 404
      res.end();
    }
    //res.status(200).json(logs);
    //res.json(logs);
  },500,'findUser error: ')


const getQuote : RequestHandler = catchServerError( async (req, res) => {
    const user : User | null = await UserModel.findOne({ username: req.params.username }).exec()
    if (!user) {
      res.statusCode = 404
      res.end()
      return
    }

    const retUsr = userBackToFront(user).quota;
    res.end(JSON.stringify(retUsr))
})



const addUser : RequestHandler = catchServerError( async (req, res) => {

    const user = userFrontToBack(req.body)
    const existingUser = await UserModel.findOne({ username: user.username }).exec();

    if (existingUser) {
      res.statusCode = 409
      return res.end({ message: 'Username already taken' });
    }

    //res.sendStatus(202)
    user.password = await hash(user.password, 10);
    const savedUser = await user.save();
    res
      .writeHead(201, {'Content-Type': 'application/json'})
      .end(JSON.stringify(userBackToFront( savedUser)));

})

const deleteUser : RequestHandler = catchServerError( async (req, res) => {
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
})


export {listAllUsers,addUser, deleteUser, findUser, getQuote};

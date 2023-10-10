
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
      res.json(userBackToFront(user));
    } else {
      res.status(404).end();
    }
    //res.status(200).json(logs);
    //res.json(logs);
  },500,'findUser error: ')


const getQuote : RequestHandler = catchServerError( async (req, res) => {
    const user : User | null = await UserModel.findOne({ username: req.params.username }).exec()
    if (!user) {
      return res.status(404).end()
    }

    res.json(userBackToFront(user).quota);
})



const addUser : RequestHandler = catchServerError( async (req, res) => {

    const user = userFrontToBack(req.body)
    const existingUser = await UserModel.findOne({ username: user.username }).exec();

    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    //res.sendStatus(202)
    user.password = await hash(user.password, 10);
    const savedUser = await user.save();
    res.status(201).json(userBackToFront(savedUser));

})

const deleteUser : RequestHandler = catchServerError( async (req, res) => {
    const username = req.params.username;
    const deletedUser = await UserModel.findOneAndDelete({ username }).exec();
    if (deletedUser) {
      console.log(`User with username '${username}' has been deleted.`);
      res.json(deletedUser);
      return true;
    } else {
      console.log(`User with username '${username}' not found.`);
      res.set('X-Error-Code', 'username not found')
      res.status(400).end();
      return false;
    }
})


const whoiam : RequestHandler = catchServerError ( async (req,res) => {
  res.redirect(req.auth.username)
})

export {listAllUsers,addUser, deleteUser, findUser, getQuote, whoiam};

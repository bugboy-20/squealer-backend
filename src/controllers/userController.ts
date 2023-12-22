
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

const changeQuote : RequestHandler = catchServerError( async (req, res) => {
    const user = await UserModel.findOne({ username: req.params.username }).exec()
    if (!user) {
      return res.status(404).end()
    }

    const newQuote = req.body.quota;
    if (!newQuote) {
      return res.status(400).json({ message: 'No new quote provided' });
    }

    if(newQuote.day < 0 || newQuote.week < 0 || newQuote.month < 0 || newQuote.week >= 7 * newQuote.day || newQuote.month >= 4*newQuote.week) {
      return res.status(400).json({ message: 'Invalid quote' });
    }

    user.quote = newQuote;
    await user.save();
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

const subscribeToChannel : RequestHandler = catchServerError ( async (req,res) => {
  const username = req.params.username || req.auth.username
  const channelName = req.params.channelName

  if(!( username || channelName)) {
    res.sendStatus(400).end()
    return
  }

  res.json( await UserModel.updateOne( { username }, {$push: { subscriptions: channelName }}).exec())
  

})

const unsubscribeFromChannel : RequestHandler = catchServerError ( async (req,res) => {
  const username = req.params.username || req.auth.username
  const channelName = req.params.channelName

  if(!username || username.trim() === '' || !channelName) {
    res.sendStatus(400).end()
    return
  }
  const result = await UserModel.updateOne( { username }, {$pull: { subscriptions: channelName }}).exec();
  if (result.matchedCount > 0 || result.modifiedCount > 0) {
    res.status(200).json({ message: 'Unsubscription successful' });
  } else {
    res.status(400).json({ message: 'Unsubscription failed' });
  }
})

const addSMM : RequestHandler = catchServerError ( async (req,res) => {
  const username = req.params.username
  const SMM = req.body.SMM
  if (!username) { res.status(400).json({message: 'username not provided'}); return; }
  if (!SMM) { res.status(400).json({message: 'SMM not provided'}); return; }
  // check in the db if the SMM user exists
  const smmUser = await UserModel.findOne({ username: SMM }).exec()
  if (!smmUser) { res.status(400).json({message: 'SMM not found'}); return; }
  // SMM should be a professional
  if (smmUser.type !== 'professional') { res.status(400).json({message: 'SMM is not professional'}); return; }

  const result = await UserModel.updateOne( { username }, {$set: { SMM }})
  if (result.matchedCount > 0 || result.modifiedCount > 0) {
    res.status(200).json({ message: 'Update successful' });
  } else {
    res.status(400).json({ message: 'Update failed' });
  }
})

const deleteSMM : RequestHandler = catchServerError ( async (req,res) => {
  const username = req.params.username
  if (!username) { res.status(400).json({message: 'username not provided'}); return; }


  const result =await UserModel.updateOne( { username }, {$set: { SMM: null }})
  if (result.matchedCount > 0 || result.modifiedCount > 0) {
    res.status(200).json({ message: 'SMM deleted successfully' });
  } else {
    res.status(400).json({ message: 'SMM deletetion failed' });
  }
})

const changeBlockedStatus : RequestHandler = catchServerError ( async (req,res) => {
  const username = req.params.username
  const blocked = req.body.blocked
  if (!username) { res.status(400).json({message: 'username not provided'}); return; }
  if (!blocked) { res.status(400).json({message: 'blocked not provided'}); return; }
  if(typeof blocked !== 'boolean') { res.status(400).json({message: 'blocked must be a boolean'}); return; }

  const user = await UserModel.findOne({ username }).exec()
  if (!user) { res.status(400).json({message: 'user not found'}); return; }

  const result = await UserModel.updateOne( { username }, {$set: { blocked }})
  if (result.matchedCount > 0 || result.modifiedCount > 0) {
    res.status(200).json({ message: 'Update successful' });
  } else {
    res.status(400).json({ message: 'Update failed' });
  }
})


export {listAllUsers,addUser, deleteUser, findUser, getQuote, changeQuote, whoiam, subscribeToChannel, unsubscribeFromChannel, addSMM, deleteSMM, changeBlockedStatus};


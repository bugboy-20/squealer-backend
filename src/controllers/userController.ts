
import {compare} from 'bcrypt';
import {RequestHandler} from 'express';
import {User,UserModel} from '../models/userModel'
import {userBackToFront, userFrontToBack} from '../utils/userUtils';
import { catchServerError } from '../utils/controllersUtils';
import { hashPassword, signJwt, verifyJwt } from '../utils/authorisation';

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
    user.password = await hashPassword(user.password);
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

const changePassword : RequestHandler = catchServerError ( async (req,res) => {
  const username = req.params.username
  const { oldPassword, newPassword } = req.body
  if (!username) { res.status(400).json({message: 'username not provided'}); return; }
  if (!oldPassword) { res.status(400).json({message: 'old password not provided'}); return; }
  if (!newPassword) { res.status(400).json({message: 'new password not provided'}); return; }

  // check in the db if the user exists and the old password is correct
  const user = await UserModel.findOne({ username }).exec();
  if (!user || !(await compare(oldPassword, user.password))) { res.status(401).json({message: 'old password not valid'}); return; }

  const hashedPassword = await hashPassword(newPassword);

  const result = await UserModel.updateOne( { username }, {$set: { password: hashedPassword }})
  if (result.matchedCount > 0 || result.modifiedCount > 0) {
    res.status(200).json({ message: 'Password changed successfully' });
  } else {
    res.status(400).json({ message: 'Password change failed' });
  }
})

const resetPassword : RequestHandler = catchServerError ( async (req,res) => {
  const usernameOrEmail = req.params.nameOrEmail;

  if (!usernameOrEmail) { res.status(400).json({message: 'username or email not provided'}); return; }


  const body = req.body
  if(body && body.token === undefined && body.password === undefined) {
    // the user is asking for a reset link
    const user = await UserModel.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] }).exec();
    if (!user) { res.status(404).json({message: 'user not found'}); return; }

    const guestToken = signJwt({ username: user.username, email: user.email }, "GUEST", { expiresIn: "1h" });
    const link = `${req.headers['x-forwarded-proto'] ?? 'http'}://${req.headers.host}/reset_password/?token=${guestToken}`;
    // we won't send the email for simplicity sake
    res.status(202).json({message: `A reset link has been sent to ${user.email}`, link});
    return;
  }

  // the user is asking to reset the password
  const token = body.token
  const newPassword = body.password

  if (!token) { res.status(400).json({message: 'token not provided'}); return; }
  if (!newPassword) { res.status(400).json({message: 'new password not provided'}); return; }

  const payload = verifyJwt(token, 'GUEST')
  if (!payload) { res.status(400).json({message: 'token not valid'}); return; }
  if (payload.username !== usernameOrEmail && payload.email !== usernameOrEmail) { res.status(400).json({message: 'this is not your token'}); return; }

  const hashedPassword = await hashPassword(newPassword);

  const result = await UserModel.updateOne( { $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] }, {$set: { password: hashedPassword }})
  if (result.matchedCount > 0 || result.modifiedCount > 0) {
    res.status(204).json({ message: 'Password changed successfully' });
  } else {
    res.status(400).json({ message: 'Password change failed' });
  }
})

export {listAllUsers,addUser, deleteUser, findUser, getQuote, whoiam, subscribeToChannel, unsubscribeFromChannel, addSMM, deleteSMM, changePassword, resetPassword};


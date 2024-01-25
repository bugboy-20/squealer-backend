
import {compare} from 'bcrypt';
import {RequestHandler} from 'express';
import {User,UserModel} from '../models/userModel'
import {getPopularity, userBackToFront, userFrontToBack} from '../utils/userUtils';
import { catchServerError } from '../utils/controllersUtils';
import { hashPassword, signJwt, verifyJwt } from '../utils/authorisation';
import {send401} from '../utils/statusSenders';

const listAllUsers : RequestHandler = catchServerError( async (req, res) => {
  const username = req.query.username;
  const type = req.query.type;
  const popularity = req.query.popularity ?? 'descending';

  const query: any = {};
  if (typeof username === 'string') {
    query.username = { $regex: username, $options: 'i' };
  }
  if (typeof type === 'string') {
    query.type = type;
  }

  const users = await UserModel.find(query).exec();

  const popularityMap = new Map();
  for (const user of users) {
    const popularity = await getPopularity(user.username);
    popularityMap.set(user.username, popularity);
  }

  const sortedUsers = users
    .toSorted((a, b) => {
      const diff =
        popularity === 'ascending'
          ? popularityMap.get(a.username) - popularityMap.get(b.username)
          : popularityMap.get(b.username) - popularityMap.get(a.username);
      if (diff !== 0) return diff;
      return popularity === 'ascending'
        ? b.username.localeCompare(a.username)
        : a.username.localeCompare(b.username);
    })
    .map((user) => userBackToFront(user));

  res.json(sortedUsers);
},500)

const findUser : RequestHandler = catchServerError( async (req, res) => {
    const username = req.params.username;
    const user =  await UserModel.findOne({username}).exec();
    if(user) {
      res.json(userBackToFront(user));
    } else {
      res.sendStatus(404);
    }
    //res.status(200).json(logs);
    //res.json(logs);
  },500,'findUser error: ')


const getQuote : RequestHandler = catchServerError( async (req, res) => {
    const user : User | null = await UserModel.findOne({ username: req.params.username }).exec()
    if (!user) {
      return res.sendStatus(404);
    }

    res.json(userBackToFront(user).quota);
})

const changeQuote : RequestHandler = catchServerError( async (req, res) => {
    const user = await UserModel.findOne({ username: req.params.username }).exec()
    if (!user) {
      return res.sendStatus(404);
    }

    const dailyQuota = req.body.dailyQuota;
    if (dailyQuota !== 0 && !dailyQuota) {
      return res.status(400).json({ message: 'No new quote provided' });
    }

    if(dailyQuota < 0 || dailyQuota > user.quote_modifier * +(process.env.CHAR_PER_DAY as string)) {
      return res.status(400).json({ message: 'Invalid quote' });
    }

    user.quote.day = dailyQuota;
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
      res.sendStatus(400);
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
    res.sendStatus(400);
    return
  }

  res.json( await UserModel.updateOne( { username }, {$push: { subscriptions: channelName }}).exec())
  

})

const unsubscribeFromChannel : RequestHandler = catchServerError ( async (req,res) => {
  const username = req.params.username || req.auth.username
  const channelName = req.params.channelName

  if(!username || username.trim() === '' || !channelName) {
    res.sendStatus(400);
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
    res.status(202).json({message: `A reset link has been sent to ${user.email}`, link, token: guestToken});
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


const changeBlockedStatus : RequestHandler = catchServerError ( async (req,res) => {
  const username = req.params.username
  const blocked = req.body.blocked
  if (!username) { res.status(400).json({message: 'username not provided'}); return; }
  if (blocked !== false && !blocked) { res.status(400).json({message: 'blocked not provided'}); return; }
  if(typeof blocked !== 'boolean') { res.status(400).json({message: 'blocked must be a boolean'}); return; }
  
  const user = await UserModel.findOne({ username }).exec()
  if (!user) { res.status(400).json({message: 'user not found'}); return; }

  user.blocked = blocked
  await user.save()

  res.json(userBackToFront(user))
})

const buyQuote : RequestHandler = catchServerError ( async (req,res) => {
  const username = req?.auth.username
  const { maxD, maxW, maxM } = req.body
  if (!username) { res.status(400).json({message: 'username not provided'}); return; }
  if (!maxD) { res.status(400).json({message: 'amount not provided'}); return; }

  if(typeof maxD !== 'number' || typeof maxW !== "number" || typeof maxM !== "number") { res.status(400).json({message: 'amount must be a number'}); return; }

  const charPerDay = Number(process.env.CHAR_PER_DAY ?? 100)
  const newQuoteModifier = maxD / charPerDay;
  
  const user = await UserModel.findOne({ username }).exec()
  if(!user) { res.status(400).json({message: 'user not found'}); return; }

  user.quote_modifier = newQuoteModifier;
  user.save();

  res.json(userBackToFront(user))
})



const getAssitedVIP : RequestHandler = catchServerError ( async (req,res) => {
  const assistedVIP = await UserModel.find({ SMM: req.auth.username }).exec()
    .then(uu => uu.map(u => u.username))
  res.json(assistedVIP)
})

export {listAllUsers,addUser, deleteUser, findUser, getQuote, changeQuote, whoiam, subscribeToChannel, unsubscribeFromChannel, addSMM, deleteSMM, changeBlockedStatus, changePassword, resetPassword, getAssitedVIP, buyQuote };






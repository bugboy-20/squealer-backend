import {compare} from "bcrypt"
import {IncomingMessage, ServerResponse} from "http"
import { verify } from "jsonwebtoken"
import {User, UserModel} from "../models/userModel"
/*
function authenticateToken(req : IncomingMessage, res : ServerResponse, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) {
    res.statusCode = 401
    res.end()
  }

  verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) {
        res.statusCode = 403
        res.end(err.message)
    }
    req.user = user
    next()
  })
}*/

async function userLogin(username : string, password : string) : Promise<boolean> {

  try {
    const user : User = await UserModel.findOne({username}).exec();
    return await compare(password, user.password)
  } catch (e) {
  }

  return false;

}

async function revoceToken() {} //TODO


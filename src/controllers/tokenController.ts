import {RequestHandler} from "express";
import {sign, Secret} from "jsonwebtoken";
import {User, UserModel} from "../models/userModel";
import {userLogin} from "../utils/authorisation";

const getToken : RequestHandler = async (req,res) => {
  const { username, password } = req.body;
  if(! await userLogin(username,password)) {
    res.statusCode = 401;
    res.end("unathorized")
    return
  }
  try {
  
  const infos = { username }
  const accessToken = sign(infos, process.env.ACCESS_TOKEN_SECRET as string, {expiresIn: '1h' })
  
  

  res.end(accessToken)
  } catch(e) {
    console.error(e)
    res.statusCode = 500
    res.end()
  }
}

export { getToken }


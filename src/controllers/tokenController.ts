import {RequestHandler} from "express";
import {sign} from "jsonwebtoken";
import {userLogin} from "../utils/authorisation";

const getToken : RequestHandler = async (req,res) => {
const { username, password } = req.body;
if(! await userLogin(username,password)) {
  res.end("unathorized")
  return
}

  const infos = { name : username }

  const accessToken = sign(infos, process.env.ACCESS_TOKEN_SECRET, {expiresIn : '30min' })
  
  res.end(accessToken)

}

export { getToken }


import {RequestHandler} from "express";
import {sign, Secret} from "jsonwebtoken";
import {userLogin} from "../utils/authorisation";

const getToken : RequestHandler = async (req,res) => {
  const { username, password } = req.body;
  if(! await userLogin(username,password)) {
    res.statusCode = 401;
    res.end("unathorized")
    return
  }

  const infos = { name : username }


  const accessToken = sign(infos, process.env.ACCESS_TOKEN_SECRET as string, {expiresIn : '30min' })
  
  const asd = sign

  res.end(accessToken)

}

export { getToken }


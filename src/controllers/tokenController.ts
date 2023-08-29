import {RequestHandler} from "express";
import {sign } from "jsonwebtoken";
import {userLogin} from "../utils/authorisation";
import {catchServerError} from "../utils/controllersUtils";

const getToken : RequestHandler = catchServerError( async (req,res) => {
  const { username, password } = req.body;
  if(! await userLogin(username,password)) {
    res.statusCode = 401;
    res.end("unathorized")
    return
  }
  
  const infos = { username }
  const accessToken = sign(infos, process.env.ACCESS_TOKEN_SECRET as string, {expiresIn: '1h' })
  
  

  res.writeHead(200,{
    'Content-Type': 'text/plain'
  })
  res.end(accessToken)
})

export { getToken }


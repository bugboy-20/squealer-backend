import {compare} from "bcrypt"
import {IncomingMessage, ServerResponse} from "http"
import { verify } from "jsonwebtoken"
import polka, {Next} from "polka"
import { expressjwt, ExpressJwtRequest } from "express-jwt";
import {User, UserModel} from "../models/userModel"
import {RequestHandler} from "sirv";
/*
function verifyToken(req : Request, res : ServerResponse, next : Next) {
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
    req.user = user;

    next()
  })
}*/

const verifyToken =  expressjwt({
    secret: process.env.ACCESS_TOKEN_SECRET as string,
    algorithms: ["HS256"],
  }) //.unless({ path: ["/","/api/token","/api/users"] }) //TODO ???


const unauthorizatedUserHandler  = (err : any, req : Request, res : ServerResponse, next : Next) => {
  if (err.name === "UnauthorizedError") {
    let url = '/login';
    let str = `Redirecting to ${url}`;

    res.writeHead(302, {
        Location: url,
        'Content-Type': 'text/plain',
        'Content-Length': str.length
    });

    res.end(str);
  } else {
    next(err);
  }
}

async function userLogin(username : string, password : string) : Promise<boolean> {

  // con try catch non conpilava
  const user : User | null = await UserModel.findOne({username}).exec();
  if (user)
    return await compare(password, user.password)
  else
    return false;

}

async function revoceToken() {} //TODO

export { verifyToken, userLogin}

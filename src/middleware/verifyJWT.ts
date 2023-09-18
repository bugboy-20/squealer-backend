import { verify } from 'jsonwebtoken';
import { Middleware } from 'polka';
import { payloadCheck } from '../utils/authorisation';
import { send401, send403 } from '../utils/statusSenders';

export const parseJWT = (auth: Middleware, notAuth: Middleware): Middleware => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return notAuth(req, res, next);
    req.params = {
      ...req.params,
      token: authHeader.split(' ')[1],
    };
    return auth(req, res, next);
  };
};

export const verifyJWT = (notAuth: Middleware): Middleware =>
  parseJWT((req, res, next) => {
    const token = req.params.token; // guaranteed to be defined
    verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
      if (err || !payloadCheck(decoded, false)) return send403(req, res); //invalid token

      req.params = {
        ...req.params,
        isAuth: 'true',
        authUsername: decoded.username,
        authUsertype: decoded.type,
      };
      next();
    });
  }, notAuth);

export const requireJWT = verifyJWT(send401);

import { verify } from 'jsonwebtoken';
import { RequestHandler } from 'express';
import { payloadCheck } from '../utils/authorisation';
import { send401, send403 } from '../utils/statusSenders';

export const verifyJWT: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return send401(req, res);
  const token = authHeader.split(' ')[1];
  verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
    if (err || !payloadCheck(decoded, false)) return send403(req, res); //invalid token

    req.params = {
      ...req.params,
      authUsername: decoded.username,
      authUsertype: decoded.type,
    };
    next();
  });
};

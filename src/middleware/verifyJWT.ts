import { verify } from 'jsonwebtoken';
import { Middleware } from 'polka';
import { payloadCheck } from '../utils/authorisation';
import { send403 } from '../utils/statusSenders';

export const parseJWT: Middleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    req.params = {
      ...req.params,
      isAuth: 'false',
    };
    next();
  } else {
    const token = authHeader.split(' ')[1];
    verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
      if (err || !payloadCheck(decoded, false)) {
        req.params = {
          ...req.params,
          isAuth: 'false',
        };
        next();
        return
      }

      req.params = {
        ...req.params,
        isAuth: 'true',
        authUsername: decoded.username,
        authUsertype: decoded.type,
      };
      next();
    });
  }
};


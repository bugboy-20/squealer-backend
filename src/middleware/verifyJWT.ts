import cookie from 'cookie';
import { RequestHandler } from 'express';
import { verifyJwt } from '../utils/authorisation';

export const parseJWT: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookies = cookie.parse(req.headers.cookie ?? '');
  const message = 'Invalid token';
  // Get the token
  let access_token;
  if (authHeader?.startsWith('Bearer ')) {
    access_token = authHeader.split(' ')[1];
  } else if (cookies?.access_token) {
    access_token = cookies.access_token;
  } else if (cookies?.refresh_token) {
    // if there is no access token but there is a refresh token,
    // we need to refresh the access token
    res.statusCode = 401;
    return res.json({ message });
  }

  if (!access_token) {
    req.auth = {
      isAuth: false,
      username: '',
      usertype: '',
    };
    next();
  } else {
    const decoded = verifyJwt(access_token, 'ACCESS');
    if (!decoded) {
      res.statusCode = 401;
      return res.json({ message });
    }

    req.auth = {
      isAuth: true,
      username: decoded.username,
      usertype: decoded.type,
    };
    next();
  }
};

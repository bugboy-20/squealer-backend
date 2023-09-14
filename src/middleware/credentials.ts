import { Middleware } from 'polka';
import { allowedOrigins } from '../utils/allowedOrigins';

export const credentials: Middleware = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next();
};

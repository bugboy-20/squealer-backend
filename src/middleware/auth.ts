import { Middleware } from 'polka';

// estensione del tipo Middleware che restituisce un booleano, serve solo per tipare req
type BooleanMiddleware = Middleware extends (...a: infer A) => any
  ? (...a: A) => boolean
  : never;

export const auth = (
  condition: BooleanMiddleware,
  middleware: Middleware
): Middleware => {
  return (req, res, next) => {
    if (condition(req, res, next)) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
};

// example conditions
export const isModerator: BooleanMiddleware = (req) => {
  return (
    req.params.isAuth === 'true' && req.params.authUsertype === 'moderator'
  );
};

export const sameUsername: BooleanMiddleware = (req) => {
  return (
    req.params.isAuth === 'true' &&
    req.params.authUsername === req.params.username
  );
};

export const noAuth: BooleanMiddleware = (req) => {
  return req.params.isAuth === 'false';
};

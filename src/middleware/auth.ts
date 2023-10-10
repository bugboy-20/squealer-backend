import { RequestHandler } from 'express';

// estensione del tipo RequestHandler che restituisce un booleano, serve solo per tipare req
type BooleanRequestHandler = RequestHandler extends (...a: infer A) => any
  ? (...a: A) => boolean
  : never;

export const auth = (
  condition: BooleanRequestHandler,
  middleware: RequestHandler
): RequestHandler => {
  return (req, res, next) => {
    if (condition(req, res, next)) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
};

export const and = (a : BooleanRequestHandler, b : BooleanRequestHandler) : BooleanRequestHandler =>
  (req,res,next) => a(req,res,next) && b(req,res,next)

export const or = (a : BooleanRequestHandler, b : BooleanRequestHandler) : BooleanRequestHandler =>
  (req,res,next) => a(req,res,next) || b(req,res,next)

export const not = (a : BooleanRequestHandler) : BooleanRequestHandler =>
  (req,res,next) => !a(req,res,next)

// example conditions
export const isModerator: BooleanRequestHandler = (req) =>
    req.auth.isAuth === true && req.auth.usertype === 'moderator'

export const sameUsername: BooleanRequestHandler = (req) =>
    req.auth.isAuth === true &&
    req.auth.username === req.params.username

export const noAuth: BooleanRequestHandler = (req) =>
  req.auth.isAuth === false;

export const isAuth: BooleanRequestHandler = (req) =>
  req.auth.isAuth === true;

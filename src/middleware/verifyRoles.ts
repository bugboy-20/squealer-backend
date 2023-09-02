import { RequestHandler } from 'express';
import { send401 } from '../utils/statusSenders';

export const verifyRoles = (...allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.params?.type) {
      return send401(req, res);
    }
    const rolesArray = [...allowedRoles];
    if (!rolesArray.includes(req.params.type)) {
      return send401(req, res);
    }
    next();
  };
};

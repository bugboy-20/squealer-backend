import { RequestHandler } from 'express';
import { send401 } from '../utils/statusSenders';

export const verifyRoles = (...allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.params?.authUsertype) {
      return send401(req, res);
    }
    const rolesArray = [...allowedRoles];
    if (!rolesArray.includes(req.params.authUsertype)) {
      return send401(req, res);
    }
    next();
  };
};

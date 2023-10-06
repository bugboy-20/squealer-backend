import { Middleware } from 'polka';
import { send401 } from '../utils/statusSenders';

export const verifyRoles = (...allowedRoles: string[]): Middleware => {
  return (req, res, next) => {
    if (!req.params?.authUsertype) {
      return send401(req, res,next);
    }
    const rolesArray = [...allowedRoles];
    if (!rolesArray.includes(req.params.authUsertype)) {
      return send401(req, res,next);
    }
    next();
  };
};

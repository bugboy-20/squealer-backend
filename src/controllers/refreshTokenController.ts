import { RequestHandler } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { User, UserModel } from '../models/userModel';
import { payloadCheck } from '../utils/authorisation';
import { send401, send403 } from '../utils/statusSenders';

const getRefreshToken: RequestHandler = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return send401(req, res);
  const refreshToken: string = cookies.jwt;

  const user: User | null = await UserModel.findOne({ refreshToken }).exec();
  if (!user) return send403(req, res);

  verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
    (err, decoded) => {
      if (
        err ||
        !payloadCheck(decoded, true) ||
        user.username !== decoded.username
      )
        return send403(req, res);

      const accessToken = sign(
        { username: decoded.username, type: user.type },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '5m' }
      );
      res.json({ accessToken });
    }
  );
};

export { getRefreshToken };

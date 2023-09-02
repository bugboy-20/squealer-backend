import { compare } from 'bcrypt';
import cookie from 'cookie';
import { RequestHandler } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { User, UserModel } from '../models/userModel';
import { payloadCheck } from '../utils/authorisation';
import { catchServerError } from '../utils/controllersUtils';
import { send204, send401, send403 } from '../utils/statusSenders';

const cookieOptions: cookie.CookieSerializeOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: process.env.NODE_ENV === 'production',
};

const accessTokenExpiresIn = '5m';
const refreshTokenExpiresIn = '1d';

const getToken: RequestHandler = catchServerError(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.statusCode = 400;
    return res.end(
      JSON.stringify({ message: 'Username and password are required.' })
    );
  }

  const user: User | null = await UserModel.findOne({ username }).exec();

  if (!user || !(await compare(password, user.password)))
    return send401(req, res);

  // create access token and refresh token
  const accessToken = sign(
    { username: user.username, type: user.type },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: accessTokenExpiresIn }
  );
  const refreshToken = sign(
    { username: user.username },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: refreshTokenExpiresIn }
  );

  // TODO: Scrivere il refresh token nel db all'intero della tabella users

  // send access token and refresh token as cookie
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Set-Cookie': cookie.serialize('jwt', refreshToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    }),
  });
  res.end(accessToken);
});

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
        { expiresIn: accessTokenExpiresIn }
      );
      res.end(accessToken);
    }
  );
};

const deleteToken: RequestHandler = catchServerError(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return send204(req, res); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const user: User | null = await UserModel.findOne({ refreshToken }).exec();

  if (!user) {
    // TODO: non so se clearCookie funziona
    res.clearCookie('jwt', cookieOptions);
    return send204(req, res);
  }

  // TODO: Delete refreshToken in db, non so se così funziona
  await UserModel.updateOne(
    { username: user.username },
    { $unset: { refreshToken: 1 } }
  ).exec();

  res.clearCookie('jwt', cookieOptions);
  send204(req, res);
});

export { deleteToken, getRefreshToken, getToken };

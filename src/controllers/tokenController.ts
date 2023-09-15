import { compare } from 'bcrypt';
import cookie from 'cookie';
import { RequestHandler } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { UserModel } from '../models/userModel';
import { payloadCheck } from '../utils/authorisation';
import { catchServerError } from '../utils/controllersUtils';
import { send204, send401, send403 } from '../utils/statusSenders';

const cookieOptions: cookie.CookieSerializeOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
};

const accessTokenExpiresIn = '30s';
const refreshTokenExpiresIn = '1m';
const refreshTokenMaxAge = 60; //24 * 60 * 60 * 1000; // 1 day

const getToken: RequestHandler = catchServerError(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.statusCode = 400;
    return res.end(
      JSON.stringify({ message: 'Username and password are required.' })
    );
  }

  const user = await UserModel.findOne({ username }).exec();

  if (!user || !(await compare(password, user.password)))
    return send401(req, res);

  // create access token and refresh token
  const accessToken = sign(
    { username: user.username, type: user.type },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: accessTokenExpiresIn }
  );
  const newRefreshToken = sign(
    { username: user.username },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: refreshTokenExpiresIn }
  );

  const cookies = cookie.parse(req.headers.cookie ?? '');

  let newRefreshTokenArray = !cookies?.jwt
    ? user.refreshToken
    : user.refreshToken.filter((rt) => rt !== cookies.jwt);

  if (cookies?.jwt) {
    const refreshToken = cookies.jwt;
    const foundToken = await UserModel.findOne({ refreshToken }).exec();

    if (!foundToken) newRefreshTokenArray = [];

    res.setHeader('Set-Cookie', '');
  }

  // save the refresh token in db with the user
  user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  await user.save();

  // send access token and refresh token as cookie
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Set-Cookie': cookie.serialize('jwt', newRefreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAge,
    }),
  });
  res.end(accessToken);
});

const getRefreshToken: RequestHandler = async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie ?? '');
  if (!cookies?.jwt) return send401(req, res);
  const refreshToken: string = cookies.jwt;
  res.setHeader('Set-Cookie', '');

  const user = await UserModel.findOne({ refreshToken }).exec();

  // detected refresh token reuse
  if (!user) {
    verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (err, decoded) => {
        if (err || !payloadCheck(decoded, true)) return send403(req, res);
        // if someone is reusing a refresh token, there is a problem
        // we delete every refresh token of that user
        const hackedUser = await UserModel.findOne({
          username: decoded.username,
        }).exec();

        if (!hackedUser) return send403(req, res);
        hackedUser.refreshToken = [];
        await hackedUser.save();
      }
    );
    return send403(req, res);
  }

  const newRefreshTokenArray = user.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
    async (err, decoded) => {
      if (err) {
        user.refreshToken = [...newRefreshTokenArray];
        await user.save();
      }
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

      const newRefreshToken = sign(
        { username: user.username },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: refreshTokenExpiresIn }
      );

      // save the new refresh token in db with the user
      user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await user.save();

      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Set-Cookie': cookie.serialize('jwt', newRefreshToken, {
          ...cookieOptions,
          maxAge: refreshTokenMaxAge,
        }),
      });

      res.end(accessToken);
    }
  );
};

const deleteToken: RequestHandler = catchServerError(async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie ?? '');
  if (!cookies?.jwt) return send204(req, res); //No content
  const refreshToken = cookies.jwt;

  // is refreshToken in db?
  const user = await UserModel.findOne({ refreshToken }).exec();

  if (!user) {
    res.setHeader('Set-Cookie', '');
    return send204(req, res);
  }

  // delete refreshToken in db
  user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
  await user.save();

  res.setHeader('Set-Cookie', '');
  send204(req, res);
});

export { deleteToken, getRefreshToken, getToken };

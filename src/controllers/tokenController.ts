import { compare } from 'bcrypt';
import cookie from 'cookie';
import { Response, RequestHandler } from 'express';
import { sign } from 'jsonwebtoken';
import { UserModel } from '../models/userModel';
import { verifyJwt } from '../utils/authorisation';
import { catchServerError } from '../utils/controllersUtils';
import { send204, send401 } from '../utils/statusSenders';

const expiredRefreshToken = (res: Response) => {
  res.clearCookie('logged_in', cookieOptions);
  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/plain');
  res.json({ message: 'Expired refresh token' });
};

const cookieOptions: cookie.CookieSerializeOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
};

const accessTokenMaxAge = 30 * 1000; // 30s
const refreshTokenMaxAge = 60 * 1000; //24 * 60 * 60 * 1000; // 1 day
const accessTokenExpiresIn = '30s';
const refreshTokenExpiresIn = '1m';

const getToken: RequestHandler = catchServerError(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.statusCode = 400;
    return res.end(
      JSON.stringify({ message: 'Username and password are required.' })
    );
  }

  const user = await UserModel.findOne({ username }).exec();

  if (!user || !(await compare(password, user.password)))
    return send401(req, res, next);

  // create access token and refresh token
  const accessToken = sign(
    { username: user.username, type: user.type },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: accessTokenExpiresIn }
  );
  const newRefreshToken = sign(
    { username: user.username, type: user.type },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: refreshTokenExpiresIn }
  );

  const cookies = cookie.parse(req.headers.cookie ?? '');
  const oldRefreshToken = cookies?.refresh_token;

  let newRefreshTokenArray = !oldRefreshToken
    ? user.refreshToken
    : user.refreshToken.filter((rt) => rt !== oldRefreshToken);

  if (oldRefreshToken) {
    const foundToken = await UserModel.findOne({
      refreshToken: oldRefreshToken,
    }).exec();

    if (!foundToken) newRefreshTokenArray = [];

    res.clearCookie('logged_in', cookieOptions);
    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);
  }

  // save the refresh token in db with the user
  // user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  // await user.save();

  await UserModel.updateOne(
    { _id: user._id },
    { $set: { refreshToken: [...newRefreshTokenArray, newRefreshToken] } }
  );

  // send access token and refresh token as cookie
  res.statusCode = 200;
  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: accessTokenMaxAge,
  });
  res.cookie('refresh_token', newRefreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenMaxAge,
  });
  res.cookie('logged_in', true, {
    ...cookieOptions,
    httpOnly: false,
    maxAge: refreshTokenMaxAge,
  });
  res.setHeader('Content-Type', 'text/plain');
  res.end(accessToken);
});

const getRefreshToken: RequestHandler = catchServerError(async (req, res, next) => {
  const cookies = cookie.parse(req.headers.cookie ?? '');
  if (!cookies?.refresh_token) return send401(req, res, next);
  const refreshToken = cookies.refresh_token;
  res.clearCookie('access_token', cookieOptions); // no point in clearing the access token

  const user = await UserModel.findOne({ refreshToken }).exec();

  // detected refresh token reuse
  if (!user) {
    const decoded = verifyJwt(refreshToken, 'REFRESH');
    if (!decoded) return expiredRefreshToken(res);

    // if someone is reusing a refresh token, there is a problem
    // we delete every refresh token of that user
    const hackedUser = await UserModel.findOne({
      username: decoded.username,
    }).exec();

    if (!hackedUser) return expiredRefreshToken(res);

    // hackedUser.refreshToken = [];
    // await hackedUser.save();
    await UserModel.updateOne(
      { _id: hackedUser._id },
      { $set: { refreshToken: [] } }
    );
    return expiredRefreshToken(res);
  }

  const newRefreshTokenArray = user.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  const decoded = verifyJwt(refreshToken, 'REFRESH');
  if (!decoded) {
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { refreshToken: [...newRefreshTokenArray] } }
    );
    return expiredRefreshToken(res);
  }
  if (user.username !== decoded.username) {
    return expiredRefreshToken(res);
  }

  const accessToken = sign(
    { username: decoded.username, type: user.type },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: accessTokenExpiresIn }
  );

  const newRefreshToken = sign(
    { username: user.username, type: user.type },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: refreshTokenExpiresIn }
  );

  // save the new refresh token in db with the user
  // user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  // await user.save();

  await UserModel.updateOne(
    { _id: user._id },
    { $set: { refreshToken: [...newRefreshTokenArray, newRefreshToken] } }
  );

  res.statusCode = 200;
  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: accessTokenMaxAge,
  });
  res.cookie('refresh_token', newRefreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenMaxAge,
  });
  res.cookie('logged_in', true, {
    ...cookieOptions,
    httpOnly: false,
    maxAge: refreshTokenMaxAge,
  });

  res.setHeader('Content-Type', 'text/plain');
  res.end(accessToken);
});

const deleteToken: RequestHandler = catchServerError(async (req, res, next) => {
  const cookies = cookie.parse(req.headers.cookie ?? '');

  res.clearCookie('logged_in', cookieOptions);
  res.clearCookie('access_token', cookieOptions);

  if (!cookies?.refresh_token) return send204(req, res, next); //No content
  const refreshToken = cookies.refresh_token;

  // is refreshToken in db?
  const user = await UserModel.findOne({ refreshToken }).exec();

  if (user) {
    // delete refreshToken in db
    // user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
    // await user.save();

    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          refreshToken: user.refreshToken.filter((rt) => rt !== refreshToken),
        },
      }
    );
  }

  res.clearCookie('refresh_token', cookieOptions);

  send204(req, res, next);
});

export { deleteToken, getRefreshToken, getToken };

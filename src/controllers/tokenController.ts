import { compare } from 'bcrypt';
import cookie from 'cookie';
import { RequestHandler } from 'express';
import { sign } from 'jsonwebtoken';
import { User, UserModel } from '../models/userModel';
import { catchServerError } from '../utils/controllersUtils';
import { send401 } from '../utils/statusSenders';

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
    { expiresIn: '5m' }
  );
  const refreshToken = sign(
    { username: user.username },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: '1d' }
  );

  // TODO: Scrivere il refresh token nel db all'intero della tabella users

  // send access token and refresh token as cookie
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Set-Cookie': cookie.serialize('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    }),
  });
  res.end(accessToken);
});

export { getToken };

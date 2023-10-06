import jwt from 'jsonwebtoken';

type token_payload = {
  username: string;
  type: string;
};

const payloadCheck = (payload: any): payload is token_payload => {
  return (
    ('username' in payload && typeof payload.username === 'string') ||
    ('type' in payload && typeof payload.type === 'string')
  );
};

export const verifyJwt = (
  token: string,
  key: 'ACCESS' | 'REFRESH'
): token_payload | null => {
  try {
    const decoded = jwt.verify(
      token,
      process.env[`${key}_TOKEN_SECRET`] as string
    );
    if (payloadCheck(decoded)) return decoded;
    else return null;
  } catch (error) {
    return null;
  }
};

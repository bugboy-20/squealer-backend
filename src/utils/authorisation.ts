import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

type access_token_payload = {
  username: string;
  type: string;
};

type refresh_token_payload = {
  username: string;
};

type guest_token_payload = {
  username: string;
  email: string;
};

const TOKEN_TYPE_NAMES = ['ACCESS', 'REFRESH', 'GUEST'] as const;
type token_type_names = (typeof TOKEN_TYPE_NAMES)[number];

type token_payload<T> = 
  T extends 'ACCESS' ? access_token_payload :
  T extends 'REFRESH' ? refresh_token_payload :
  T extends 'GUEST' ? guest_token_payload :
  never;

const payloadCheck = <T extends token_type_names>(
  tokenType: T,
  payload: unknown
): payload is token_payload<T> => {
  if (typeof payload !== 'object' || payload === null) return false;

  switch (tokenType) {
    case 'ACCESS':
      return (
        'username' in payload &&
        typeof payload.username === 'string' &&
        'type' in payload &&
        typeof payload.type === 'string'
      );
    case 'REFRESH':
      return 'username' in payload && typeof payload.username === 'string';
    case 'GUEST':
      return (
        'username' in payload &&
        'email' in payload &&
        typeof payload.username === 'string' &&
        typeof payload.email === 'string'
      );
    default:
      return false;
  }
};

export const verifyJwt = <T extends token_type_names>(
  token: string,
  key: T
): token_payload<T> | null => {
  try {
    const decoded = jwt.verify(
      token,
      process.env[`${key}_TOKEN_SECRET`] as string
    );
    if (payloadCheck(key, decoded)) return decoded;
    else return null;
  } catch (error) {
    return null;
  }
};

export const signJwt = <T extends token_type_names>(
  payload: token_payload<T>,
  key: T,
  options: jwt.SignOptions
): string => {
  return jwt.sign(
    payload,
    process.env[`${key}_TOKEN_SECRET`] as string,
    options
  );
};


export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
};
import { IUser } from '@models/user';
import jwt from 'jsonwebtoken';
import { SECRET } from '@utils/secrets';
import { ACCESS_TOKEN_DURATION, REFRESH_TOKEN_DURATION } from './constants';
import { ObjectId } from 'mongoose';
export type TokenPayload = {
  userId: string | number | ObjectId;
  type: string;
  name: string;
  email: string;
};
export async function generateAccessToken(user: IUser) {
  const payload: TokenPayload = {
    userId: user._id as string,
    type: user.type,
    name: user.name,
    email: user.email,
  };
  const accessToken = jwt.sign(payload, SECRET, {
    expiresIn: ACCESS_TOKEN_DURATION,
  });

  return accessToken;
}

export async function generateRefreshToken(user: IUser) {
  const payload: TokenPayload = {
    userId: user._id as string,
    type: user.type,
    name: user.name,
    email: user.email,
  };

  const refreshToken = jwt.sign(payload, SECRET, {
    expiresIn: REFRESH_TOKEN_DURATION,
  });
  return refreshToken;
}

import { TokenPayload } from '@utils/auth';
import { SECRET } from '@utils/secrets';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;

  if ((!authHeader || !authHeader.startsWith('Bearer ')) && !queryToken) {
    res.status(403).json({ success: false, message: 'Unauthorized' });
    return;
  }
  let token;
  if (queryToken) {
    token = queryToken;
  } else {
    if (authHeader) token = authHeader.split(' ')[1];
  }

  if (!token) {
    res
      .status(403)
      .json({ success: false, message: 'Access token is required' });
    return;
  }

  try {
    const decoded: TokenPayload = jwt.verify(token, SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
    return;
  }
}

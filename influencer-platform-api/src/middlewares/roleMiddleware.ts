import { NextFunction, Request, RequestHandler, Response } from 'express';

export function roleMiddleware(
  role: 'admin' | 'influencer' | 'business'
): RequestHandler {
  if (role === 'admin') {
    return (req: Request, res: Response, next: NextFunction) => {
      const { type } = req?.user as any;

      if (type !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You are not authorized to access this resource',
        });
        return;
      }
      next();
    };
  }
  if (role === 'influencer') {
    return (req: Request, res: Response, next: NextFunction) => {
      const { type } = req?.user as any;

      if (type !== 'influencer' && type !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You are not authorized to access this resource',
        });
        return;
      }
      next();
    };
  }
  if (role === 'business') {
    return (req: Request, res: Response, next: NextFunction) => {
      const { type } = req?.user as any;

      if (type !== 'business' && type !== 'admin') {
        res.status(403).json({
          message: 'You are not authorized to access this resource',
          success: false,
        });

        return;
      }
      next();
    };
  }

  return (req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  };
}

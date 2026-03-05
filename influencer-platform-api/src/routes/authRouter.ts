import { Response, Request, Router } from 'express';
import {
  login,
  register,
  refresh,
  logout,
  requestPasswordReset,
  loginFailed,
  getProviders,
  loginWithProvider,
  verifyOtpCode,
  resendOtpCode,
  resetPassword,
  resendActivationOtpCode,
  verifyEmail,
} from '@conrollers/authController';
import authMiddleware from '@middlewares/authMiddleware';
import upload from '@utils/fileUpload';
import passport from 'passport';
import { FRONTEND_URL } from '@utils/secrets';
import { getCookieFromRequest } from '@utils/cookies';

const userRouter = Router();
userRouter.get('/refreshToken', (req: any, res: Response) => {
  // console.log(req);
  res.json({
    data1: getCookieFromRequest(req, 'refreshToken'),
    data2: req.session,
    data5: req.headers,
    data6: req.cookie,
    data4: req.cookies,
    data3: req.user,
  });
});
userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/login/failed', loginFailed);
userRouter.get('/providers', getProviders);
userRouter.post('/login/providers', loginWithProvider);
userRouter.post('/refresh', refresh);

userRouter.get(
  '/google/callback',

  passport.authenticate('google', {
    successRedirect: FRONTEND_URL + '/auth/login/providers',
    failureRedirect: '/api/auth/login/failed',
    session: true,
  })
);
userRouter.get(
  '/google',
  // @ts-ignore
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: true,
  })
);
userRouter.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);
userRouter.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: FRONTEND_URL + '/auth/login/providers',
    failureRedirect: '/api/auth/login/failed',
  })
);

userRouter.post('/password-reset-request', requestPasswordReset);
userRouter.post('/verify-otp', verifyOtpCode);
userRouter.post('/resend-otp', resendOtpCode);
userRouter.post('/resend-activation-otp', resendActivationOtpCode);
userRouter.post('/verify-email', verifyEmail);
userRouter.post('/password-reset', resetPassword);
userRouter.post('/logout', authMiddleware, logout);

export default userRouter;

import User, { IUser } from '@models/user';
import { verifyPassword } from '@utils/password';
import { NextFunction, Request, Response } from 'express';
import emailValidator from 'deep-email-validator';
import bcrypt from 'bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from '@utils/auth';
import jwt from 'jsonwebtoken';
import RefreshToken from '@models/refreshToken';
import crypto from 'crypto';
import { sendEmail } from '@utils/email';
import {
  generateWelcomeEmail,
  generatePasswordResetEmail,
  generateAccountActivationEmail,
} from '@utils/emailTemplates';
import { FRONTEND_URL, SECRET } from '@utils/secrets';
import logger from '@utils/logger';
import speakeasy from 'speakeasy';
import {
  ACCESS_TOKEN_DURATION_MS,
  PASS_KEY_DURATION,
  REFRESH_TOKEN_DURATION_MS,
  OTP_EXPIRATION,
} from '@utils/constants';
import { getCookieFromRequest } from '@utils/cookies';
import { getTotalRemainingCampaigns } from './subscriptionController';
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, type, date, phone, country, city } =
      req.body;
    logger.info(`Registering user: ${email}`);

    if (!validateEmail(email)) {
      throw new Error('Invalid email');
    }
    if (!verifyPassword(password)) {
      throw new Error(
        'Password must have at least 8 characters, one uppercase letter, one lowercase letter, and one digit'
      );
    }
    if (name.length < 3) {
      throw new Error('Name must have at least 3 characters');
    }
    if (type === 'business') {
      const existingBusiness = await User.findOne({ type: 'business', name });
      if (existingBusiness) {
        throw new Error('Business name already exists');
      }
    }

    const newUser: IUser = new User({
      name,
      username: email,
      email,
      password,
      type,
      dateOfBirth: date,
      phone,
      address: { country, city },
    });
    const acctivationCode = crypto.randomInt(100000, 999999).toString();
    newUser.otpCode = acctivationCode;
    await newUser.save();

    // Determine user type for email template
    const userType = type === 'business' ? 'brand' : 'influencer';
    const htmlEmail = generateWelcomeEmail(
      userType,
      name,
      acctivationCode,
      FRONTEND_URL
    );

    const plainTextFallback = `Welcome to WebTrend! Your activation code is ${acctivationCode}. This code expires in 10 minutes.`;

    sendEmail(
      email,
      `Welcome to WebTrend - ${
        userType === 'brand' ? 'Brand' : 'Creator'
      } Account`,
      plainTextFallback,
      htmlEmail
    );

    logger.info(`User registered successfully: ${email}`);
    const refreshToken = await generateRefreshToken(newUser);
    await RefreshToken.create({
      token: refreshToken,
      user: newUser._id,
      expires: new Date(Date.now() + REFRESH_TOKEN_DURATION_MS),
    });
    const accessToken = await generateAccessToken(newUser);

    delete newUser.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        accessToken,
        refreshToken,
        user: newUser,
        accessTokenExpires: Date.now() + ACCESS_TOKEN_DURATION_MS,
      },
    });
  } catch (err: any) {
    logger.error(`Registration failed: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.status === 'inactive') {
      res.status(403).json({
        success: false,
        message: 'User is banned!',
      });
      return;
    }
    if (!user.verified) {
      res.status(401).json({
        success: false,
        message:
          'User is not verified, please check your email for activation code',
      });
      return;
    }
    if (!user.password) {
      throw new Error('User has no password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      console.log('invalid');

      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      }
      await user.save();
      throw new Error('Invalid password');
    }
    user.failedAttempts = 0;
    user.lockUntil = null;
    await user.save();
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expires: new Date(Date.now() + REFRESH_TOKEN_DURATION_MS),
    });

    // remove the password from user object to return it

    user.password = undefined;
    user.otpCode = undefined;
    logger.info(`User logged in successfully: ${email}`);
    const remainingCampaigns = await getTotalRemainingCampaigns(user._id);
    if (user.type === 'business') {
      user.remainingCampaigns = remainingCampaigns;
    }
    res.json({
      success: true,
      message: 'User logged in successfully',
      data: {
        accessToken,
        refreshToken,
        user,
        accessTokenExpires: Date.now() + ACCESS_TOKEN_DURATION_MS,
      },
    });
  } catch (err: any) {
    logger.error(`Login failed: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
}
export async function loginFailed(req: Request, res: Response) {
  res.status(403).json({ success: false, message: 'Login failed' });
}

export async function getProviders(req: any, res: Response) {
  console.log('user', req.user);

  try {
    if (req.user) {
      const userID = req.user._id;
      const user = await User.findById(userID).select('-password -twoFASecret');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      const passKey = crypto.randomBytes(32).toString('hex');
      const hashedPassKey = await bcrypt.hash(passKey, 10);
      const passKeyToken = jwt.sign({ hashedPassKey }, SECRET, {
        expiresIn: PASS_KEY_DURATION, //
      });
      user.passKey = passKeyToken;
      await user.save();
      const refreshToken = await generateRefreshToken(user);
      await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expires: new Date(Date.now() + REFRESH_TOKEN_DURATION_MS),
      });
      const totalRemainingCampaigns = await getTotalRemainingCampaigns(
        user._id
      );
      if (user.type === 'business') {
        user.remainingCampaigns = totalRemainingCampaigns;
      }
      res.json({
        success: true,
        message: 'Login successful',
        data: { passKey, refreshToken, user },
      });
    } else {
      res.status(403).json({ success: false, message: 'Not authorized' });
    }
  } catch (err: any) {
    console.log(err);

    res.status(400).json({ success: false, message: err.message });
  }
}

export async function loginWithProvider(req: Request, res: Response) {
  const { email, passKey } = req.body;

  try {
    const user = await User.findOne({ email }).select('-password -twoFASecret');
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.passKey) {
      throw new Error('Passkey not found');
    }

    const decoded: any = jwt.verify(user.passKey, SECRET);
    console.log('decoded:', decoded);
    const matchs = await bcrypt.compare(passKey, decoded?.hashedPassKey);
    if (!matchs) {
      throw new Error('Invalid Pass Key');
    }
    user.passKey = undefined;
    await user.save();
    logger.info(`User logged in with provider: ${email}`);
    const newAccessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    const totalRemainingCampaigns = await getTotalRemainingCampaigns(user._id);

    if (user.type === 'business') {
      user.remainingCampaigns = totalRemainingCampaigns;
    }
    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expires: new Date(Date.now() + REFRESH_TOKEN_DURATION_MS),
    });
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken: newAccessToken,
        refreshToken,
        user,
        accessTokenExpires: Date.now() + ACCESS_TOKEN_DURATION_MS,
      },
    });
  } catch (e: any) {
    logger.error(`Login with provider failed: ${e.message}`);
    res.status(400).json({ success: false, message: e.message });
  }
}

export async function refresh(req: Request, res: Response) {
  // Get refresh token from request body
  const refreshToken = req.body.refreshToken;
  console.log('refresh token:', refreshToken);

  if (!refreshToken) {
    res
      .status(400)
      .json({ success: false, message: 'Refresh token is required' });
    console.log('Refresh token not found');

    return;
  }
  try {
    const decoded: TokenPayload = jwt.verify(
      refreshToken,
      SECRET
    ) as TokenPayload;

    const refreshTokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.userId,
    });
    const user = await User.findById(decoded.userId);

    if (!refreshTokenDoc || !user || refreshTokenDoc.expires < new Date()) {
      res.status(403).json({ message: 'Invalid refresh token' });
      RefreshToken.deleteOne({
        token: refreshToken,
        user: decoded.userId,
      });
      return;
    } // Generate new refresh token
    const newRefreshToken = await generateRefreshToken(user);

    // Delete old refresh token and create new one
    await RefreshToken.deleteOne({
      token: refreshToken,
      user: decoded.userId,
    });

    await RefreshToken.create({
      token: newRefreshToken,
      user: user._id,
      expires: new Date(Date.now() + REFRESH_TOKEN_DURATION_MS),
    });

    const accessToken = await generateAccessToken(user);
    logger.info(`Access token refreshed for user: ${user.email}`);
    res.status(200).json({
      success: true,
      message: 'Access token refreshed',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        accessTokenExpires: Date.now() + ACCESS_TOKEN_DURATION_MS,
      },
    });
  } catch (err: any) {
    console.log(err);

    logger.error(`Refresh token failed: ${err.message}`);
    res.status(400).json({ success: false, message: 'Invalid refresh token' });
  }
}

export async function logout(req: Request, res: Response) {
  // Get refresh token from body
  const refreshToken = req.body.refreshToken;

  try {
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    req.destroy();
    res.clearCookie('refreshToken');

    // clear session and cookies now
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
    });
    req.logout((err) => {});
    logger.info(`User logged out`);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.log(err);
    logger.error('Logout failed');

    res.status(400).json({ success: false, message: 'Invalid refresh token' });
  }
}

export async function requestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpToken = jwt.sign({ otpCode }, SECRET, {
      expiresIn: OTP_EXPIRATION,
    });
    user.otpCode = otpToken;
    await user.save();

    // Determine user type for email template
    const userType = user.type === 'business' ? 'brand' : 'influencer';
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${otpToken}`;
    const htmlEmail = generatePasswordResetEmail(userType, otpCode, resetUrl);

    const plainTextFallback = `Your OTP code for password reset is: ${otpCode}. It expires in 1 minute. If you didn't request this, please ignore this email.`;

    await sendEmail(
      user.email,
      'Password Reset Request - WebTrend',
      plainTextFallback,
      htmlEmail
    );

    logger.info(`OTP sent to: ${user.email}`);
    res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    logger.error(`OTP sending failed: ${err.message}`);
  }
}

export async function resendActivationOtpCode(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.otpCode) {
      throw new Error('OTP not found');
    }

    // Determine user type for email template
    const userType = user.type === 'business' ? 'brand' : 'influencer';
    const htmlEmail = generateWelcomeEmail(
      userType,
      user.name,
      user.otpCode,
      FRONTEND_URL
    );

    const plainTextFallback = `Your activation code for WebTrend is: ${user.otpCode}. This code expires in 10 minutes.`;

    await sendEmail(
      user.email,
      `WebTrend Activation Code (Resent) - ${
        userType === 'brand' ? 'Brand' : 'Creator'
      } Account`,
      plainTextFallback,
      htmlEmail
    );
    logger.info(`OTP resent to: ${user.email}`);
    res.status(200).json({ success: true, message: 'OTP resent' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    logger.error(`OTP resending failed: ${err.message}`);
  }
}
export async function verifyEmail(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.otpCode !== otp) {
      throw new Error('Invalid OTP');
    }
    user.status = 'active';
    user.verified = true;
    user.otpCode = undefined;
    await user.save();

    // Determine user type for email template
    const userType = user.type === 'business' ? 'brand' : 'influencer';
    const htmlEmail = generateAccountActivationEmail(userType, FRONTEND_URL);

    const plainTextFallback = `Congratulations! Your WebTrend account has been successfully activated. You now have full access to all platform features.`;

    await sendEmail(
      user.email,
      'Account Activated - WebTrend',
      plainTextFallback,
      htmlEmail
    );
    logger.info(`OTP resent to: ${user.email}`);
    res.status(200).json({ success: true, message: 'OTP resent' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    logger.error(`OTP resending failed: ${err.message}`);
  }
}
export async function resendOtpCode(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('otpCode');
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.otpCode) {
      throw new Error('OTP not found');
    }
    const { otpCode } = jwt.verify(user.otpCode, SECRET) as { otpCode: string };

    // Determine user type for email template
    const userType = user.type === 'business' ? 'brand' : 'influencer';
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${user.otpCode}`;
    const htmlEmail = generatePasswordResetEmail(userType, otpCode, resetUrl);

    const plainTextFallback = `Your OTP code for password reset is: ${otpCode}. It expires in 1 minute. If you didn't request this, please ignore this email.`;

    await sendEmail(
      user.email,
      'Password Reset Request - WebTrend (Resent)',
      plainTextFallback,
      htmlEmail
    );
    logger.info(`OTP resent to: ${user.email}`);
    res.status(200).json({ success: true, message: 'OTP resent' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    logger.error(`OTP resending failed: ${err.message}`);
  }
}

export async function verifyOtpCode(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }
    if (!user.otpCode) {
      throw new Error('OTP not found');
    }

    const { otpCode } = jwt.verify(user.otpCode, SECRET) as { otpCode: string };
    if (otpCode !== otp) {
      throw new Error('Invalid OTP');
    }
    user.otpCode = undefined;
    user.verified = true;
    await user.save();

    logger.info(`OTP verified for: ${user.email}`);
    res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    logger.error(`OTP verification failed: ${err.message}`);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const otpRecord: { otpCode: string } = jwt.verify(
      user.otpCode || '',
      SECRET
    ) as { otpCode: string };
    if (otpRecord.otpCode !== otp) {
      throw new Error('Invalid OTP');
    }
    if (!verifyPassword(newPassword)) {
      throw new Error(
        'Password must have at least 8 characters, one uppercase letter, one lowercase letter, and one digit'
      );
    }
    user.password = newPassword;
    user.otpCode = undefined;
    user.markModified('password');
    await user.save();

    logger.info(`Password reset successfully for user: ${user._id}`);
    res
      .status(200)
      .json({ success: true, message: 'Password reset successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    logger.error(`Password reset failed: ${err.message}`);
  }
}

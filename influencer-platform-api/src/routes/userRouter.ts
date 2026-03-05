import {
  handleInstagramCallback,
  initiateInstagramAuth,
  updateProfile,
  initiateTiktokAuth,
  handleTiktokCallback,
  initiateYoutubeAuth,
  handleYoutubeCallback,
  refreshSocialMediaMetrics,
  getSocialMediaMetrics,
  getUserById,
} from '@conrollers/userController';
import authMiddleware from '@middlewares/authMiddleware';
import User from '@models/user';
import upload from '@utils/fileUpload';
import { FRONTEND_URL } from '@utils/secrets';
import { Router } from 'express';
import passport from 'passport';

const userRouter = Router();
userRouter.put(
  '/profile',
  upload.single('profilePicture'),
  authMiddleware,
  updateProfile
);
userRouter.get('/instagram', authMiddleware, initiateInstagramAuth);
userRouter.get('/tiktok', authMiddleware, initiateTiktokAuth);

userRouter.get('/instagram/callback', handleInstagramCallback);
userRouter.get('/tiktok/callback', handleTiktokCallback);

userRouter.get('/youtube', authMiddleware, initiateYoutubeAuth);
userRouter.get('/youtube/callback', handleYoutubeCallback);

userRouter.post(
  '/social-media/refresh',
  authMiddleware,
  refreshSocialMediaMetrics
);

// Single endpoint to get metrics from all social platforms
userRouter.get('/social-media/metrics', authMiddleware, getSocialMediaMetrics);

// Keep individual platform endpoints for backward compatibility
userRouter.get('/instagram/metrics', authMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const instagram = user.socialMedia
      .filter((s: any) => s.platform === 'instagram')
      .map((insta: any) => ({
        username: insta.username,
        followers: insta.followers,
        platform: 'instagram',
      }));
    if (instagram.length === 0) {
      res.json({ success: false, message: 'Instagram account not found' });
      return;
    }
    res.json({
      success: true,
      message: 'Instagram accounts metrics retreived successfully',
      data: instagram,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});
userRouter.get('/tiktok/metrics', authMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const tiktok = user.socialMedia
      .filter((s: any) => s.platform === 'tiktok')
      .map((tk: any) => ({
        username: tk.username,
        followers: tk.followers,
        platform: 'tiktok',
      }));
    if (tiktok.length === 0) {
      res.json({ success: false, message: 'Tiktok account not found' });
      return;
    }
    res.json({
      success: true,
      message: 'Tiktok accounts metrics retreived successfully',
      data: tiktok,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});
userRouter.get('/youtube/metrics', authMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const youtube = user.socialMedia
      .filter((s: any) => s.platform === 'youtube')
      .map((yt: any) => ({
        username: yt.username,
        followers: yt.followers,
        platform: 'youtube',
      }));
    if (youtube.length === 0) {
      res.json({ success: false, message: 'Youtube account not found' });
      return;
    }
    res.json({
      success: true,
      message: 'Youtube accounts metrics retreived successfully',
      data: youtube,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

userRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const user = await User.findById(req.user.userId);
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: 'User not found', data: null });
      return;
    }
    res.json({ success: true, message: 'User retrieved', data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// Move this route to the bottom, after all other routes
userRouter.get('/:id', authMiddleware, getUserById);

export default userRouter;

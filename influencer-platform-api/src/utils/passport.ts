import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import passport from 'passport';
import {
  BASE_URL,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_SECRET,
} from '@utils/secrets';
import User from '@models/user';
import logger from './logger';
import { getTotalRemainingCampaigns } from '@conrollers/subscriptionController';
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_SECRET,
      callbackURL: `${BASE_URL}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          email: profile.emails?.[0].value,
        }).select('-password -twoFASecret');

        if (!user) {
          user = new User({
            type: 'influencer', // Default type;
            provider: 'google',
            name: profile.displayName,
            email: profile.emails?.[0].value,
            profilePicture: profile.photos?.[0].value,
            verified: true,
          });
          await user.save();
        }
        if (user.status === 'inactive') {
          return done(new Error('User account is banned'), undefined);
        }
        if (!user.verified) {
          return done(new Error('User is not verified'), undefined);
        }
        const totalRemainingCampaigns = await getTotalRemainingCampaigns(
          user._id
        );
        if (user.type === 'business') {
          user.remainingCampaigns = totalRemainingCampaigns;
        }

        return done(null, user);
      } catch (err) {
        logger.error(err);
        // @ts-ignore
        return done(err, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: `${BASE_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          email: profile.emails?.[0].value,
        }).select('-password -twoFASecret');
        if (!user) {
          user = new User({
            type: 'influencer', // Default type;
            provider: 'facebook',
            name: profile.displayName,
            email: profile.emails?.[0].value,
            profilePicture: profile.photos?.[0].value,
            verified: true,
          });
          await user.save();
        }
        if (user.status === 'inactive') {
          return done(new Error('User account is banned'), undefined);
        }
        if (!user.verified) {
          return done(new Error('User is not verified'), undefined);
        }

        const totalRemainingCampaigns = await getTotalRemainingCampaigns(
          user._id
        );

        if (user.type === 'business') {
          user.remainingCampaigns = totalRemainingCampaigns;
        }

        return done(null, user);
      } catch (err) {
        logger.error(err);
        // @ts-ignore
        return done(err, null);
      }
    }
  )
);

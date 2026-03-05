import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/influencer-platform';

export const SECRET = process.env.REFRESH_TOKEN_SECRET || 'secret';

export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export default process.env.EMAIL_USER || 'user';
export const EMAIL_PASS = process.env.EMAIL_PASS || 'pass';
export const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
export const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_SECRET = process.env.GOOGLE_SECRET || '';
export const BASE_URL =
  process.env.BASE_URL || 'http://localhost' + ':' + (PORT || 5000);

export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

export const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID || '';
export const INSTAGRAM_CLIENT_SECRET =
  process.env.INSTAGRAM_CLIENT_SECRET || '';

export const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID || '';
export const TIKTOK_SECRET_KEY = process.env.TIKTOK_SECRET_KEY || '';

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
export const SUPABASE_URL = process.env.SUPABASE_URL || '';

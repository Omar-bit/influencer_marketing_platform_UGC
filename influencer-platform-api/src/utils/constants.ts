import { BASE_URL, FRONTEND_URL } from './secrets';

export const REFRESH_TOKEN_DURATION = '7d'; // 7 days
export const REFRESH_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const ACCESS_TOKEN_DURATION = '15m'; //'15m';
export const ACCESS_TOKEN_DURATION_MS = 15 * 60 * 1000;

export const OTP_EXPIRATION = 60 * 5; // 5 minute

export const PASS_KEY_DURATION = '1m'; // 1 min

// export const INSTAGRAM_REDIRECT_URI = BASE_URL + '/api/user/instagram/callback';
export const INSTAGRAM_REDIRECT_URI = `https://redirectmeto.com/${BASE_URL}/api/user/instagram/callback`;

export const TIKTOK_REDIRECT_URI = `https://redirectmeto.com/${BASE_URL}/api/user/tiktok/callback`;

export const PAYMENT_CONTENT_URL = `${BASE_URL}/api/campaign-content/payment/`;
export const PAYMENT_CONTENT_REDIRECTION = `${FRONTEND_URL}/payment`;

export const PAYMENT_PRODUCT_URL = `${BASE_URL}/api/products/payment/`;
export const PAYMENT_PRODUCT_REDIRECTION = `${FRONTEND_URL}/payment`;

export const SUBSCRIPTION_URL = `${BASE_URL}/api/subscriptions/payment/`;
export const SUBSCRIPTION_REDIRECTION = PAYMENT_CONTENT_REDIRECTION;

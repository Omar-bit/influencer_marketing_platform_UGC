import * as authRoutes from '../routes/auth';
import { public_api } from '@/utils/axiosInstance';
export async function loginHandler(email: string, password: string) {
  const { data } = await public_api.post(authRoutes.LOGIN, { email, password });
  return data;
}

export async function signupHandler(email: string, password: string) {
  const { data } = await public_api.post(authRoutes.SIGNUP, {
    email,
    password,
  });
  return data;
}

export async function resetPasswordRequest(email: string) {
  const { data } = await public_api.post(authRoutes.RESET_PASS_REQUEST, {
    email,
  });
  return data;
}

export async function verifyOtp(email: string, otp: string) {
  const { data } = await public_api.post(authRoutes.VERIFY_OTP, { email, otp });
  return data;
}

export async function verifyEmail(email: string, otp: string) {
  const { data } = await public_api.post(authRoutes.VERIFY_EMAIL, {
    email,
    otp,
  });
  return data;
}

export async function resendOtp(email: string) {
  const { data } = await public_api.post(authRoutes.RESEND_OTP, { email });
  return data;
}

export async function resendActivationOtpCode(email: string) {
  const { data } = await public_api.post(authRoutes.RESEND_ACTIVATION_OTP, {
    email,
  });
  return data;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
) {
  const { data } = await public_api.post(authRoutes.RESET_PASS, {
    email,
    otp,
    newPassword,
  });
  return data;
}

export async function logout() {
  const { data } = await public_api.post(authRoutes.LOGOUT);
  return data;
}

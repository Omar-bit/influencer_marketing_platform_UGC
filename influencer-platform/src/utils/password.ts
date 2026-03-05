import axios from 'axios';
import { BACKEND_URL } from './secrets';

export function verifyPassword(password: string): {
  valid: boolean;
  error: string;
} {
  const hasUpperCase = password.toLowerCase() !== password;
  const hasLowerCase = password.toUpperCase() !== password;
  const hasDigit = /\d/.test(password);
  const valid =
    password.length >= 8 && hasUpperCase && hasLowerCase && hasDigit;
  return {
    valid,
    error: valid
      ? ''
      : !hasDigit
      ? 'Password must contain one digit at least'
      : !hasLowerCase
      ? 'Password must contain a lowercase letter at least'
      : !hasUpperCase
      ? 'Password must contain a uppercase letter at least'
      : 'Password must contain 8 characters least',
  };
}

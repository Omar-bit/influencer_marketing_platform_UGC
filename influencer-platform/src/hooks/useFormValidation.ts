import { useState } from 'react';

type Validator = (value: string) => string | null;

export function useFormValidation(validators: Record<string, Validator[]>) {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validateField = (name: string, value: string) => {
    const fieldValidators = validators[name];
    if (!fieldValidators) return;

    for (const validator of fieldValidators) {
      const errorMessage = validator(value);
      if (errorMessage) {
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));
        return;
      }
    }
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  return { errors, validateField };
}

// Validators
export const required = (value: string) =>
  value ? null : 'This field is required.';
export const isEmail = (value: string) =>
  /\S+@\S+\.\S+/.test(value) ? null : 'Invalid email format.';
export const minLength = (length: number) => (value: string) =>
  value.length >= length ? null : `Must be at least ${length} characters.`;
export const maxLength = (length: number) => (value: string) =>
  value.length <= length ? null : `Must be at most ${length} characters.`;
export const isValidPhone = (value: string) =>
  /^\+?\d{7,15}$/.test(value) ? null : 'Invalid phone number.';
export function isStrongPassword(password: string): string | null {
  const hasUpperCase = password.toLowerCase() !== password;
  const hasLowerCase = password.toUpperCase() !== password;
  const hasDigit = /\d/.test(password);
  const valid =
    password.length >= 8 && hasUpperCase && hasLowerCase && hasDigit;
  return valid
    ? ''
    : !hasDigit
    ? 'Password must contain one digit at least'
    : !hasLowerCase
    ? 'Password must contain a lowercase letter at least'
    : !hasUpperCase
    ? 'Password must contain a uppercase letter at least'
    : 'Password must contain 8 characters least';
}
export const isDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) ? null : 'Invalid date format.';

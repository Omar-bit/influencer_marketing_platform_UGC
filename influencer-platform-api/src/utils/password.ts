export function verifyPassword(password: string): boolean {
  let hasUpperCase = password.toLowerCase() !== password;
  let hasLowerCase = password.toUpperCase() !== password;
  let hasDigit = /\d/.test(password);

  return password.length >= 8 && hasUpperCase && hasLowerCase && hasDigit;
}

export const getCookieFromRequest = (req: any, cookieKey: string) => {
  const cookiesHeader = req.headers.cookie;
  if (!cookiesHeader) return undefined;
  const cookies = cookiesHeader.split(';');
  if (!cookies) return undefined;
  let cookieValue = '';
  cookies.forEach((cookie: string) => {
    const [key, value] = cookie.split('=');
    if (key.trim() === cookieKey) {
      cookieValue = value;
    }
  });
  return cookieValue;
};

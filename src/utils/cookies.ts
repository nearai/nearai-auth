import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

import { env } from '~/env';

/*
  In production for app.near.ai and chat.near.ai, the value for AUTH_COOKIE_DOMAIN 
  will be "near.ai" - which will make the cookie accessible for near.ai and *.near.ai domains: 
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#define_where_cookies_are_sent
*/

/*
  Due to us supporting iframe embeds of agents, we are forced to use "SameSite=None" on the 
  auth cookie. Any other SameSite setting prevents the iframe from accessing the auth cookie:
  https://andrewlock.net/understanding-samesite-cookies/#samesite-strict-cookies
*/

export const AUTH_COOKIE_NAME = 'auth';

export const COOKIE_OPTIONS: Partial<ResponseCookie> = {
  sameSite: 'none',
  path: '/',
  httpOnly: true,
  secure: true,
  maxAge: 34_560_000, // 400 days - max respected value by Chrome
  domain: env.AUTH_COOKIE_DOMAIN,
};

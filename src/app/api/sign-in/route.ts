import { type NextRequest, NextResponse } from 'next/server';

import { env } from '~/env';
import { signInModel } from '~/lib/models';

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

export async function POST(req: NextRequest) {
  const data = (await req.json()) as unknown;
  const parsed = signInModel.parse(data);
  const result = NextResponse.json({});

  const expires = new Date();
  expires.setFullYear(expires.getUTCFullYear() + 1);

  if (parsed.method === 'SIGNED_MESSAGE') {
    result.cookies.set(AUTH_COOKIE_NAME, JSON.stringify(parsed.signedMessage), {
      sameSite: 'none',
      path: '/',
      httpOnly: true,
      secure: true,
      maxAge: 34_560_000, // 400 days
      domain: env.AUTH_COOKIE_DOMAIN,
    });
  } else {
    // TODO
  }

  return result;
}

import { jwtDecode } from 'jwt-decode';
import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { type NextRequest, type NextResponse } from 'next/server';

import { env } from '~/env';
import { authTokensModel } from '~/utils/models';

import { parseSetCookies } from './cookies';

export const AUTH_ACCESS_TOKEN_COOKIE_NAME = 'nearai_access_token';
export const AUTH_REFRESH_TOKEN_COOKIE_NAME = 'nearai_refresh_token';

/*
  In production for app.near.ai and chat.near.ai, the value for AUTH_COOKIE_DOMAIN 
  will be "near.ai" - which will make the cookies accessible for near.ai and *.near.ai domains: 
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#define_where_cookies_are_sent
*/

/*
  Due to us supporting iframe embeds of agents, we are forced to use "SameSite=None" on the 
  auth cookies. Any other SameSite setting prevents the iframe from accessing the auth cookies:
  https://andrewlock.net/understanding-samesite-cookies/#samesite-strict-cookies
*/

export const AUTH_COOKIE_OPTIONS: Partial<ResponseCookie> = {
  sameSite: 'none',
  path: '/',
  httpOnly: true,
  secure: true,
  maxAge: 34_560_000, // 400 days - max respected value by Chrome
  domain: env.AUTH_COOKIE_DOMAIN,
};

export async function conditionallyRefreshAuthTokens(
  request: NextRequest,
  response: NextResponse,
) {
  try {
    const { accessToken, refreshToken } = getAuthCookies(request);
    const accessTokenPayload = accessToken ? jwtDecode(accessToken) : undefined;

    if (accessTokenPayload?.exp && refreshToken) {
      // Refresh the current access token if expired or will expire within 2 minutes

      const unixNow = Math.floor(Date.now() / 1000);
      // const paddingSeconds = 120;
      const paddingSeconds = 0;
      const shouldRefresh = unixNow + paddingSeconds > accessTokenPayload.exp;

      if (shouldRefresh) {
        if (env.NODE_ENV === 'development') {
          console.log('Refreshing auth tokens...', {
            expires: new Date(accessTokenPayload.exp * 1000),
            now: new Date(),
          });
        }

        const refreshed = await refreshAuthTokens(refreshToken);

        setAuthCookies(
          response,
          refreshed.access_token,
          refreshed.refresh_token,
        );

        if (env.NODE_ENV === 'development') {
          console.log('Auth tokens successfully refreshed', refreshed);
        }
      } else {
        if (env.NODE_ENV === 'development') {
          console.log('Auth tokens are valid - refresh skipped');
        }
      }
    }
  } catch (error) {
    // Most likely cause for error is that the refresh token has expired

    if (env.NODE_ENV === 'development') {
      console.error(error);
    }

    deleteAuthCookies(response);
  }
}

async function refreshAuthTokens(refreshToken: string) {
  const response = await fetch(`${env.NEXT_PUBLIC_ROUTER_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed with status: ${response.statusText}`);
  }

  const parsed = authTokensModel.parse(await response.json());

  return parsed;
}

export function getAuthCookies(request: NextRequest) {
  const setCookies = parseSetCookies(request.headers);

  const accessToken =
    setCookies[AUTH_ACCESS_TOKEN_COOKIE_NAME] ||
    request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE_NAME)?.value;

  const refreshToken =
    setCookies[AUTH_REFRESH_TOKEN_COOKIE_NAME] ||
    request.cookies.get(AUTH_REFRESH_TOKEN_COOKIE_NAME)?.value;

  return {
    accessToken,
    refreshToken,
  };
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  response.cookies.set(
    AUTH_ACCESS_TOKEN_COOKIE_NAME,
    accessToken,
    AUTH_COOKIE_OPTIONS,
  );
  response.cookies.set(
    AUTH_REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    AUTH_COOKIE_OPTIONS,
  );
}

export function deleteAuthCookies(response: NextResponse) {
  response.cookies.delete(AUTH_ACCESS_TOKEN_COOKIE_NAME);
  response.cookies.delete(AUTH_REFRESH_TOKEN_COOKIE_NAME);
}

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '~/utils/cookies';
import {
  signedMessageAuthorizationModel,
  signInAuthorizationModel,
} from '~/utils/models';

export type SignInResult = 'success' | 'error';

const input = z.union([
  signInAuthorizationModel,
  signedMessageAuthorizationModel,
]);

export async function POST(request: Request) {
  const data = (await request.json()) as unknown;
  const parsed = input.parse(data);
  const result = NextResponse.json({});

  const value = 'token' in parsed ? parsed.token : JSON.stringify(parsed);
  result.cookies.set(AUTH_COOKIE_NAME, value, COOKIE_OPTIONS);

  return result;
}

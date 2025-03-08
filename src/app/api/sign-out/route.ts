import { NextResponse } from 'next/server';

import { AUTH_COOKIE_NAME } from '../sign-in/route';

export async function POST() {
  const result = NextResponse.json({});
  result.cookies.delete(AUTH_COOKIE_NAME);
  return result;
}

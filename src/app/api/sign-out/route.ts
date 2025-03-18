import { NextResponse } from 'next/server';

import { deleteAuthCookies } from '~/utils/auth';

export async function POST() {
  const response = NextResponse.json({});
  deleteAuthCookies(response);
  return response;
}

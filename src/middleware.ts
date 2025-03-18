import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { conditionallyRefreshAuthTokens } from '~/utils/auth';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  await conditionallyRefreshAuthTokens(request, response);
  return response;
}

export const config = {
  matcher: [
    /*
      Match all request paths except for the ones starting with:
      _next/static (static files)
      _next/image (image optimization files)
      favicon.ico, sitemap.xml, robots.txt (metadata files)
    */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

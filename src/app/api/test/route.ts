import { type NextRequest } from 'next/server';

import { env } from '~/env';
import { getAuthCookies } from '~/utils/auth';

export async function GET(request: NextRequest) {
  const { accessToken } = getAuthCookies(request);

  const response = await fetch(`${env.NEXT_PUBLIC_ROUTER_URL}/auth/test`, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  });

  const json = (await response.json()) as unknown;

  return Response.json(json);
}

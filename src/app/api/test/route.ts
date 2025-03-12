import { cookies } from 'next/headers';

import { env } from '~/env';
import { AUTH_COOKIE_NAME } from '~/utils/cookies';

export async function GET() {
  const auth = cookies().get(AUTH_COOKIE_NAME)?.value;

  const response = await fetch(`${env.NEXT_PUBLIC_ROUTER_URL}/auth/test`, {
    headers: {
      Authorization: auth ? `Bearer ${auth}` : '',
    },
  });

  const json = (await response.json()) as unknown;

  return Response.json(json);
}

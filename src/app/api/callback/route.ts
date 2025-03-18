import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { env } from '~/env';
import { setAuthCookies } from '~/utils/auth';
import { authNearSignedMessageModel, authTokensModel } from '~/utils/models';

const inputModel = z.union([authTokensModel, authNearSignedMessageModel]);

export async function POST(request: NextRequest) {
  const response = NextResponse.json({});
  const data = (await request.json()) as unknown;
  const input = inputModel.parse(data);

  try {
    if ('access_token' in input) {
      setAuthCookies(response, input.access_token, input.refresh_token);
    } else {
      const nearLoginResponse = await fetch(
        `${env.NEXT_PUBLIC_ROUTER_URL}/auth/login/near`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        },
      );

      const data: unknown = await nearLoginResponse
        .json()
        .catch(() => nearLoginResponse.text());

      if (!nearLoginResponse.ok) {
        console.error(data);
        throw new Error('Failed to login with NEAR');
      }

      const parsed = authTokensModel.parse(data);

      setAuthCookies(response, parsed.access_token, parsed.refresh_token);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {},
      {
        status: 400,
      },
    );
  }

  return response;
}

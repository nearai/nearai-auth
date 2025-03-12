import { openToast } from '@near-pagoda/ui';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export function handleSignInSuccess(
  callbackUrl?: string,
  includeCallbackHashParams: Record<string, string> = {},
) {
  const opener = window.opener as WindowProxy | null;

  if (opener) {
    opener.postMessage(
      {
        authenticated: true,
      },
      '*',
    );
  } else {
    if (callbackUrl) {
      const callbackUrlIsValid =
        /^(http:\/\/localhost:|https:\/\/[^\/]+.near.ai|https:\/\/near.ai|https:\/\/[^\/]+-near-ai.vercel.app)/.test(
          callbackUrl,
        );

      if (!callbackUrlIsValid) {
        throw new Error(`Invalid callbackUrl value passed: ${callbackUrl}`);
      }

      const params = new URLSearchParams(includeCallbackHashParams);
      window.location.href = `${callbackUrl}#${params.toString()}`;
    } else {
      window.location.href = 'https://app.near.ai';
    }
  }
}

export function handleSignInError(error: unknown, router: AppRouterInstance) {
  console.error(error);

  openToast({
    id: 'sign-in-error',
    type: 'error',
    title: 'Sign in failed',
    description: 'Please try again or use a different sign in method',
  });

  router.replace('/');
}

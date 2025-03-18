import { openToast } from '@near-pagoda/ui';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export function handleSignInSuccess(
  callbackUrl?: string,
  callbackUrlHashParams: Record<string, string> = {},
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
      const isTrustedOrigin =
        /^(http:\/\/localhost:|https:\/\/[^\/]+.near.ai|https:\/\/near.ai|https:\/\/[^\/]+-near-ai.vercel.app)$/.test(
          new URL(callbackUrl).origin,
        );

      if (isTrustedOrigin) {
        // Only include callbackUrlHashParams if its a trusted callback origin
        const params = new URLSearchParams(callbackUrlHashParams);
        window.location.href = `${callbackUrl}#${params.toString()}`;
      } else {
        window.location.href = callbackUrl;
      }
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

export function getSignInUrlParams() {
  const params = new URLSearchParams(window.location.search);

  // Override search params with hash params
  const paramsFromHash = new URLSearchParams(window.location.hash.substring(1));
  paramsFromHash.forEach((value, key) => {
    params.set(key, value);
  });

  const result = {
    error: params.get('error'),
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
  };

  return result;
}

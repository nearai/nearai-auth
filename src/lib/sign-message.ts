import { type z } from 'zod';

import { type signedMessageAuthorizationModel } from './models';

const RECIPIENT = 'ai.near';
const MESSAGE = 'Welcome to NEAR AI Hub!';

export function getSignMessageCallbackUrl() {
  const queryParams = getSignMessageUrlParams();

  const urlParams = new URLSearchParams({
    callbackUrl: queryParams.callbackUrl,
    message: queryParams.message,
    recipient: queryParams.recipient,
    nonce: queryParams.nonce,
  });

  return `${window.location.origin}/sign-message-callback?${urlParams.toString()}`;
}

export type QueryParams = ReturnType<typeof getSignMessageUrlParams>;

export function getSignMessageUrlParams() {
  const params = new URLSearchParams(window.location.search);

  // Override search params with hash params
  const paramsFromHash = new URLSearchParams(window.location.hash.substring(1));
  paramsFromHash.forEach((value, key) => {
    params.set(key, value);
  });

  const result = {
    message: params.get('message') ?? MESSAGE,
    recipient: params.get('recipient') ?? RECIPIENT,
    nonce: computeNonce(params.get('nonce')),
    callbackUrl: params.get('callbackUrl') ?? '',

    accountId: params.get('accountId') ?? '',
    publicKey: params.get('publicKey') ?? '',
    signature: params.get('signature') ?? '',
  };

  return result;
}

function computeNonce(passedNonce: string | null) {
  if (passedNonce) {
    if (/^\d+$/.test(passedNonce)) {
      return passedNonce.padStart(32, '0');
    } else {
      throw new Error('Nonce contains non-numeric characters');
    }
  }

  return generateNonce();
}

function generateNonce() {
  const nonce = Date.now().toString();
  return nonce.padStart(32, '0');
}

export function redirectToCallbackUrlAfterSigningMessage(
  signed: z.infer<typeof signedMessageAuthorizationModel>,
) {
  const callbackUrlIsValid =
    /^(http:\/\/localhost:|https:\/\/[^\/]+.near.ai|https:\/\/near.ai)/.test(
      signed.callback_url,
    );

  if (!callbackUrlIsValid) {
    throw new Error(`Invalid callbackUrl value passed: ${signed.callback_url}`);
  }

  const params = new URLSearchParams(signed);
  window.location.href = `${signed.callback_url}#${params.toString()}`;
}

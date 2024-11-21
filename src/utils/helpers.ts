export function generateCallbackUrl(
  queryParams: Pick<QueryParams, 'message' | 'recipient' | 'nonce'>,
) {
  const urlParams = new URLSearchParams({
    message: queryParams.message,
    recipient: queryParams.recipient,
    nonce: queryParams.nonce,
    type: 'remote',
  });

  return `${window.location.origin}?${urlParams.toString()}`;
}

function padNonceWithZeros(input: string) {
  if (/^\d+$/.test(input)) {
    while (input.length < 32) {
      input = '0' + input;
    }
    return input;
  } else {
    throw new Error('Nonce contains non-numeric characters');
  }
}

export type QueryParams = ReturnType<typeof getQueryParams>;

export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);

  // Override search params with hash params
  const paramsFromHash = new URLSearchParams(window.location.hash.substring(1));
  paramsFromHash.forEach((value, key) => {
    params.set(key, value);
  });

  const result = {
    message: params.get('message') ?? '',
    recipient: params.get('recipient') ?? '',
    nonce: padNonceWithZeros(params.get('nonce') ?? '0'),
    callbackUrl: params.get('callbackUrl') ?? '',

    accountId: params.get('accountId') ?? '',
    publicKey: params.get('publicKey') ?? '',
    signature: params.get('signature') ?? '',

    type: params.get('type') ?? '',
  };

  if (
    result.message &&
    result.recipient &&
    result.nonce &&
    !result.callbackUrl
  ) {
    result.callbackUrl = generateCallbackUrl(result);
  }

  return result;
}

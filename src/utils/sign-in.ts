export function getSignInUrlParams() {
  const params = new URLSearchParams(window.location.search);

  // Override search params with hash params
  const paramsFromHash = new URLSearchParams(window.location.hash.substring(1));
  paramsFromHash.forEach((value, key) => {
    params.set(key, value);
  });

  const token = params.get('token');

  const result = {
    error: params.get('error'),
    token: token ? decodeURIComponent(token) : null,
  };

  return result;
}

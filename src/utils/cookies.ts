export function parseSetCookies(headers: Headers) {
  const cookies = headers.getSetCookie().reduce(
    (result, str) => {
      return {
        ...result,
        ...parseCookies(str),
      };
    },
    {} as Record<string, string>,
  );

  return cookies;
}

export function parseCookies(str: string) {
  const result: Record<string, string> = {};

  return str
    .split(';')
    .map((v) => v.split('='))
    .reduce((result, v) => {
      const key = v[0]?.trim();
      const value = v[1]?.trim();

      if (key && value) {
        result[decodeURIComponent(key)] = decodeURIComponent(value);
      }

      return result;
    }, result);
}

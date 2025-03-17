import { z } from 'zod';

export const authNearSignedMessageModel = z.object({
  account_id: z.string(),
  public_key: z.string(),
  signature: z.string(),
  callback_url: z.string(),
  message: z.string(),
  recipient: z.string(),
  nonce: z.string().regex(/^\d{32}$/),
});

export const authTokensModel = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

export const authAccessTokenPayload = z.object({
  exp: z.number().int(),
  user: z.object({
    id: z.string(),
    namespace: z.string(),
  }),
});

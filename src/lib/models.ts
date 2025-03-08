import { z } from 'zod';

export const signedMessageAuthorizationModel = z.object({
  account_id: z.string(),
  public_key: z.string(),
  signature: z.string(),
  callback_url: z.string(),
  message: z.string(),
  recipient: z.string(),
  nonce: z.string().regex(/^\d{32}$/),
});

export const signInModel = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('SIGNED_MESSAGE'),
    signedMessage: signedMessageAuthorizationModel,
  }),
  z.object({
    method: z.literal('PROVIDER'),
    foobar: z.string(),
    // TODO
  }),
]);

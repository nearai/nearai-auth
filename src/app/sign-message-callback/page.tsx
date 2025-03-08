'use client';

import {
  Button,
  Container,
  Flex,
  handleClientError,
  Section,
  Text,
} from '@near-pagoda/ui';
import { Wallet } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { type z } from 'zod';

import {
  signedMessageAuthorizationModel,
  type signInModel,
} from '~/lib/models';
import {
  getSignMessageUrlParams,
  redirectToCallbackUrlAfterSigningMessage as redirectAfterSigningMessage,
} from '~/lib/sign-message';

export default function SignMessageCallbackPage() {
  const router = useRouter();
  const [parsed, setParsed] = useState<z.infer<
    typeof signedMessageAuthorizationModel
  > | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    async function parseToken() {
      try {
        const params = getSignMessageUrlParams();

        const auth = signedMessageAuthorizationModel.parse({
          account_id: params.accountId,
          public_key: params.publicKey,
          signature: params.signature,
          callback_url: params.callbackUrl,
          message: params.message,
          recipient: params.recipient,
          nonce: params.nonce,
        });

        setParsed(auth);
      } catch (error) {
        console.error(error);
        setIsInvalid(true);
      }
    }

    void parseToken();
  }, []);

  useEffect(() => {
    if (!parsed || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const submit = async () => {
      try {
        const body: z.infer<typeof signInModel> = {
          method: 'SIGNED_MESSAGE',
          signedMessage: parsed,
        };

        const response = await fetch('/api/sign-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error('Failed to sign in');

        const opener = window.opener as WindowProxy | null;

        if (opener) {
          opener.postMessage(
            {
              authenticated: true,
            },
            '*',
          );
        } else {
          if (parsed.callback_url) {
            redirectAfterSigningMessage(parsed);
          } else {
            window.location.href = 'https://app.near.ai';
          }
        }
      } catch (error) {
        handleClientError({ error });
      }
    };

    void submit();
  }, [parsed, router]);

  return (
    <Section grow="available">
      <Container size="s" style={{ margin: 'auto', textAlign: 'center' }}>
        <Flex direction="column" gap="l" align="center">
          {isInvalid ? (
            <>
              <Text color="red-10">
                Your sign message request is invalid. Please close this window
                and try signing in again.
              </Text>
            </>
          ) : (
            <>
              <Button
                label="Sign In"
                icon={<Wallet />}
                loading
                fill="ghost"
                size="large"
              />
            </>
          )}
        </Flex>
      </Container>
    </Section>
  );
}

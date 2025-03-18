'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { Processing } from '~/components/Processing';
import { handleSignInError, handleSignInSuccess } from '~/utils/helpers';
import { authNearSignedMessageModel } from '~/utils/models';
import { getSignMessageUrlParams } from '~/utils/near';

export default function SignMessageCallbackPage() {
  const router = useRouter();
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const submit = async () => {
      try {
        const params = getSignMessageUrlParams();
        const parsed = authNearSignedMessageModel.parse({
          account_id: params.accountId,
          public_key: params.publicKey,
          signature: params.signature,
          callback_url: params.callbackUrl,
          message: params.message,
          recipient: params.recipient,
          nonce: params.nonce,
        });

        const response = await fetch('/api/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsed),
        });

        if (!response.ok) throw new Error('Failed to sign in');

        handleSignInSuccess(parsed.callback_url, parsed);
      } catch (error) {
        handleSignInError(error, router);
      }
    };

    void submit();
  }, [router]);

  return <Processing />;
}

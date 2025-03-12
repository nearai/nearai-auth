'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { type z } from 'zod';

import { Processing } from '~/components/Processing';
import { handleSignInError, handleSignInSuccess } from '~/utils/helpers';
import { signInAuthorizationModel } from '~/utils/models';
import { getSignInUrlParams } from '~/utils/sign-in';

export default function CallbackPage() {
  const router = useRouter();
  const [parsed, setParsed] = useState<z.infer<
    typeof signInAuthorizationModel
  > | null>(null);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    async function parseParams() {
      try {
        const params = getSignInUrlParams();
        if (params.error) throw new Error(params.error);
        const auth = signInAuthorizationModel.parse({
          token: params.token,
        });
        setParsed(auth);
      } catch (error) {
        handleSignInError(error, router);
      }
    }

    void parseParams();
  }, [router]);

  useEffect(() => {
    if (!parsed || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const submit = async () => {
      try {
        const response = await fetch('/api/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsed),
        });

        if (!response.ok) throw new Error('Failed to sign in');

        handleSignInSuccess();
      } catch (error) {
        handleSignInError(error, router);
      }
    };

    void submit();
  }, [parsed, router]);

  return <Processing />;
}

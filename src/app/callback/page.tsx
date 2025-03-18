'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { Processing } from '~/components/Processing';
import { handleSignInError, handleSignInSuccess } from '~/utils/helpers';
import { getSignInUrlParams } from '~/utils/helpers';
import { authTokensModel } from '~/utils/models';

export default function CallbackPage() {
  const router = useRouter();
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const submit = async () => {
      try {
        const params = getSignInUrlParams();
        if (params.error) throw new Error(params.error);
        const parsed = authTokensModel.parse(params);

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
  }, [router]);

  return <Processing />;
}

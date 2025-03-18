import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';
import type {
  WalletSelector,
  WalletSelectorState,
} from '@near-wallet-selector/core';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { QueryParams } from '../utils/near';

export function useWalletSelector() {
  const setupPromise = useRef<Promise<WalletSelector> | null>(null);
  const [state, setState] = useState<WalletSelectorState>();
  const [selector, setSelector] = useState<WalletSelector>();

  useEffect(() => {
    const initialize = async () => {
      if (!setupPromise.current) {
        setupPromise.current = setupWalletSelector({
          network: 'mainnet',
          modules: [
            setupMeteorWallet(),
            setupSender(),
            setupBitteWallet(),

            /*
              NOTE: MyNearWallet has been disabled for the time being due to how it 
              looks for the presence of `window.opener` and will not redirect. Instead, 
              it emits a postMessage() event which isn't currently compatible with how 
              our UI opens auth.near.ai via popup window.

              We can come back to this after our new auth flow is implemented. A simple 
              PR change submitted to my-near-wallet might do the trick to pass an option 
              that disables the `window.opener` check.

              https://github.com/mynearwallet/my-near-wallet/blob/master/packages/frontend/src/routes/SignWrapper.js#L108
            */
          ],
        });
      }

      const selector = await setupPromise.current;

      setSelector(selector);
    };

    void initialize();
  }, []);

  useEffect(() => {
    if (!selector) return;

    setState(selector.store.getState());

    const subscription = selector.store.observable.subscribe((value) => {
      setState(value);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selector]);

  const signMessage = useCallback(
    async (
      walletId: string,
      queryParams: Pick<
        QueryParams,
        'message' | 'recipient' | 'callbackUrl' | 'nonce'
      >,
    ) => {
      if (!selector) return;

      const { message, recipient, callbackUrl, nonce } = queryParams;
      const wallet = await selector.wallet(walletId);
      const signedMessage = await wallet.signMessage({
        message,
        nonce: Buffer.from(queryParams.nonce),
        recipient,
        callbackUrl,
      });

      if (!signedMessage) return;

      return {
        signature: signedMessage.signature,
        accountId: signedMessage.accountId,
        publicKey: signedMessage.publicKey,
        message,
        nonce,
        recipient,
        callbackUrl,
      };
    },
    [selector],
  );

  return { state, selector, signMessage };
}

import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';
import type {
  WalletSelector,
  WalletSelectorState,
} from '@near-wallet-selector/core';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupNearMobileWallet } from '@near-wallet-selector/near-mobile-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { QueryParams } from '../utils/helpers';

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
            setupMyNearWallet(),
            setupSender(),
            setupMeteorWallet(),
            setupBitteWallet({
              walletUrl: 'https://wallet.bitte.ai',
              callbackUrl: 'https://app.near.ai',
              deprecated: false,
            }),
            setupHereWallet(),
            setupNearMobileWallet(),
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

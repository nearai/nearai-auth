import {
  Accordion,
  Card,
  CardList,
  Flex,
  handleClientError,
  ImageIcon,
  PlaceholderStack,
  SvgIcon,
  Text,
} from '@near-pagoda/ui';
import { type WalletSelectorState } from '@near-wallet-selector/core';
import { Wallet } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

import { useWalletSelector } from '../hooks/wallet-selector';
import {
  getSignMessageCallbackUrl,
  getSignMessageUrlParams,
} from '../lib/sign-message';

export const SignInWithWallet = () => {
  const router = useRouter();
  const { state, signMessage } = useWalletSelector();

  const signIn = async (module: WalletSelectorState['modules'][number]) => {
    try {
      const { message, recipient, nonce } = getSignMessageUrlParams();
      const signMessageCallbackUrl = getSignMessageCallbackUrl();

      const signed = await signMessage(module.id, {
        message,
        recipient,
        nonce,
        callbackUrl: signMessageCallbackUrl,
      });

      if (!signed) return;

      const params = new URLSearchParams({
        signature: signed.signature,
        accountId: signed.accountId,
        publicKey: signed.publicKey,
      });

      router.replace(`${signMessageCallbackUrl}#${params.toString()}`);
    } catch (error) {
      handleClientError({ error });
    }
  };

  const modules = (state?.modules ?? []).filter(
    (module) => !module.metadata.deprecated,
  );

  return (
    <Accordion.Root type="multiple">
      <Accordion.Item value="message-details">
        <Accordion.Trigger>
          <SvgIcon icon={<Wallet />} color="violet-10" />
          Sign in with a wallet
        </Accordion.Trigger>

        <Accordion.Content>
          <>
            {modules.length > 0 ? (
              <CardList>
                {modules.map((module) => (
                  <Card
                    key={module.id}
                    href={
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      module.metadata.available
                        ? undefined
                        : // @ts-expect-error: The downloadUrl key actually does exist - the types from wallet selector are incorrect
                          module.metadata.downloadUrl
                    }
                    target="_blank"
                    onClick={
                      module.metadata.available
                        ? () => signIn(module)
                        : undefined
                    }
                    background="sand-0"
                    backgroundHover="sand-1"
                    border="sand-3"
                    padding="s"
                    indicateFocus={false}
                  >
                    <Flex align="center" gap="s">
                      <ImageIcon
                        size="s"
                        src={module.metadata.iconUrl}
                        alt={module.metadata.name}
                        indicateParentClickable
                      />
                      <Text size="text-s" weight={500} color="sand-12">
                        {module.metadata.name}
                      </Text>
                    </Flex>
                  </Card>
                ))}
              </CardList>
            ) : (
              <PlaceholderStack />
            )}
          </>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};

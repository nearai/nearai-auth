import {
  Button,
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
import { ArrowLeft, CaretRight } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

import { useWalletSelector } from '../hooks/wallet-selector';
import {
  getSignMessageCallbackUrl,
  getSignMessageUrlParams,
} from '../utils/near';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => unknown;
};

// TODO: Add support for signing message with ETH wallets: https://docs.near.org/build/web3-apps/ethereum-wallets

export const SignInWithNear = ({ open, setOpen }: Props) => {
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

  if (!open) return null;

  return (
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
                module.metadata.available ? () => signIn(module) : undefined
              }
              background="sand-0"
              backgroundHover="sand-1"
              border="sand-3"
              padding="m"
              indicateFocus={false}
            >
              <Flex align="center" gap="m">
                <ImageIcon
                  size="s"
                  src={module.metadata.iconUrl}
                  alt={module.metadata.name}
                  indicateParentClickable
                />
                <Text weight={500} color="sand-12">
                  {module.metadata.name}
                </Text>
                <SvgIcon
                  icon={<CaretRight weight="bold" />}
                  color="violet-10"
                  style={{ marginLeft: 'auto' }}
                  size="xs"
                />
              </Flex>
            </Card>
          ))}
        </CardList>
      ) : (
        <PlaceholderStack />
      )}

      <Flex direction="column" align="center">
        <Button
          label="All sign in methods"
          iconLeft={<ArrowLeft />}
          size="small"
          variant="secondary"
          onClick={() => setOpen(false)}
        />
      </Flex>
    </>
  );
};

import {
  Accordion,
  Button,
  Card,
  CardList,
  Container,
  copyTextToClipboard,
  Flex,
  handleClientError,
  HR,
  ImageIcon,
  PlaceholderStack,
  Section,
  SvgIcon,
  Text,
} from '@near-pagoda/ui';
import { type WalletSelectorState } from '@near-wallet-selector/core';
import {
  CaretRight,
  CheckCircle,
  Copy,
  DownloadSimple,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

import { useWalletSelector } from './hooks';
import type { QueryParams } from './utils';
import { generateCallbackUrl, getQueryParams } from './utils';

export const Login = () => {
  const { state, signMessage } = useWalletSelector();

  const [remoteLoginData, setRemoteLoginData] =
    useState<Partial<QueryParams>>();

  useEffect(() => {
    const queryParams = getQueryParams();

    if (
      queryParams.accountId &&
      queryParams.publicKey &&
      queryParams.signature &&
      queryParams.type === 'remote'
    ) {
      setRemoteLoginData({
        ...queryParams,
        callbackUrl: generateCallbackUrl(queryParams),
      });
      // window.history.replaceState({}, document.title, window.location.origin);
    }
  }, []);

  const logInWithModule = async (
    module: WalletSelectorState['modules'][number],
  ) => {
    try {
      const { message, recipient, nonce, callbackUrl } = getQueryParams();
      const remoteLogin = !!message && !!recipient && !!nonce && !callbackUrl;

      const signed = await signMessage(module.id, {
        message,
        recipient,
        nonce,
        callbackUrl,
      });

      if (!signed) return;

      if (remoteLogin && signed) {
        setRemoteLoginData(signed);
        return;
      }

      const urlParams = new URLSearchParams({
        signature: signed.signature,
        accountId: signed.accountId,
        publicKey: signed.publicKey,
      });

      window.location.href = `${callbackUrl}#${urlParams.toString()}`;
    } catch (error) {
      handleClientError({ error });
    }
  };

  const filteredQueryParams = Object.fromEntries(
    Object.entries(getQueryParams()).filter(([, value]) => !!value),
  );

  const modules = (state?.modules ?? []).filter(
    (module) => !module.metadata.deprecated,
  );

  const cliSignInCommand = remoteLoginData
    ? `nearai login save --accountId=${remoteLoginData.accountId} --signature=${remoteLoginData.signature} --publicKey=${remoteLoginData.publicKey} --nonce=${remoteLoginData.nonce} --callbackUrl='${remoteLoginData.callbackUrl}'`
    : null;

  if (cliSignInCommand) {
    return (
      <Section grow="screen-height">
        <Container size="s" style={{ margin: 'auto' }}>
          <Flex direction="column" gap="l">
            <SvgIcon
              size="xl"
              icon={<CheckCircle weight="fill" />}
              style={{ margin: '0 auto' }}
              color="green-brand"
            />

            <Text size="text-xl" style={{ margin: '0 auto' }}>
              Successfully signed with NEAR
            </Text>

            <HR />

            <Text>
              To complete your login, please return to the console and enter the
              following command:
            </Text>

            <Card style={{ textAlign: 'left' }}>
              <Text color="sand-12" family="monospace" size="text-xs">
                {cliSignInCommand}
              </Text>
            </Card>

            <Button
              iconLeft={<Copy />}
              label="Copy To Clipboard"
              onClick={() =>
                copyTextToClipboard(
                  cliSignInCommand,
                  'Paste command in your CLI',
                )
              }
              style={{ margin: '0 auto' }}
            />
          </Flex>
        </Container>
      </Section>
    );
  }

  return (
    <Section grow="screen-height">
      <Container size="xs" style={{ margin: 'auto' }}>
        <Flex direction="column" gap="l">
          <ImageIcon
            size="xl"
            src="/near.svg"
            alt="NEAR"
            style={{ padding: '0.75rem', margin: '0 auto' }}
          />

          <Text as="h1" size="text-2xl" style={{ margin: '0 auto' }}>
            Login with NEAR
          </Text>

          {modules.length > 0 ? (
            <CardList>
              {modules.map((module) => (
                <Card
                  key={module.id}
                  href={
                    module.metadata.available
                      ? undefined
                      : // @ts-expect-error: The downloadUrl key actually does exist - the types from wallet selector are incorrect
                        module.metadata.downloadUrl
                  }
                  target="_blank"
                  onClick={
                    module.metadata.available
                      ? () => logInWithModule(module)
                      : undefined
                  }
                  padding="s"
                >
                  <Flex align="center" gap="m">
                    <ImageIcon
                      src={module.metadata.iconUrl}
                      alt={module.metadata.name}
                    />
                    <Text weight={500} color="sand-12">
                      {module.metadata.name}
                    </Text>
                    <SvgIcon
                      size="xs"
                      color={module.metadata.available ? 'violet-9' : 'sand-9'}
                      icon={
                        module.metadata.available ? (
                          <CaretRight />
                        ) : (
                          <DownloadSimple />
                        )
                      }
                      style={{ marginLeft: 'auto' }}
                    />
                  </Flex>
                </Card>
              ))}
            </CardList>
          ) : (
            <PlaceholderStack />
          )}

          <Accordion.Root type="multiple">
            <Accordion.Item value="message-details">
              <Accordion.Trigger>Message Details</Accordion.Trigger>
              <Accordion.Content>
                <Card padding="s" background="sand-2">
                  <Text
                    size="text-xs"
                    color="sand-12"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {JSON.stringify(filteredQueryParams, null, 2)}
                  </Text>
                </Card>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </Flex>
      </Container>
    </Section>
  );
};

'use client';

import {
  Card,
  CardList,
  Container,
  Flex,
  HR,
  Section,
  SvgIcon,
  Text,
} from '@near-pagoda/ui';
import { CaretRight } from '@phosphor-icons/react';
import { useState } from 'react';

import { SignInWithNear } from '~/components/SignInWithNear';
import { env } from '~/env';
import GithubIcon from '~/svgs/github-icon.svg';
import GoogleIcon from '~/svgs/google-icon.svg';
import NearAiLogo from '~/svgs/near-ai-logo.svg';
import NearIcon from '~/svgs/near-icon.svg';

import s from './page.module.scss';

export default function HomePage() {
  const [showSignInWithNear, setShowSignInWithNear] = useState(false);

  const signInWithGoogle = async () => {
    window.location.href = `${env.NEXT_PUBLIC_ROUTER_URL}/auth/login/google`;
  };

  const signInWithGithub = async () => {
    window.location.href = `${env.NEXT_PUBLIC_ROUTER_URL}/auth/login/github`;
  };

  const methods = [
    {
      icon: <NearIcon />,
      label: 'NEAR Wallet',
      onClick: () => setShowSignInWithNear(true),
    },
    {
      icon: <GoogleIcon />,
      label: 'Google',
      onClick: signInWithGoogle,
    },
    {
      icon: <GithubIcon />,
      label: 'Github',
      onClick: signInWithGithub,
    },
  ];

  return (
    <Section grow="available">
      <Container size="xs" style={{ margin: 'auto' }}>
        <Flex direction="column" gap="l">
          <Flex direction="column" gap="m">
            <NearAiLogo className={s.logo} />

            <Text style={{ textAlign: 'center' }}>
              Sign in with your preferred{' '}
              {showSignInWithNear ? 'wallet' : 'method'}:
            </Text>
          </Flex>

          <HR />

          {!showSignInWithNear && (
            <Flex direction="column" gap="s">
              <CardList>
                {methods.map((method) => (
                  <Card
                    onClick={method.onClick}
                    background="sand-0"
                    border="sand-3"
                    padding="m"
                    key={method.label}
                  >
                    <Flex align="center" gap="m">
                      <SvgIcon icon={method.icon} color="sand-10" />
                      <Text weight={500} color="sand-12">
                        {method.label}
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
            </Flex>
          )}

          <SignInWithNear
            open={showSignInWithNear}
            setOpen={setShowSignInWithNear}
          />
        </Flex>
      </Container>
    </Section>
  );
}

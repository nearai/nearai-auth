'use client';

import { Button, Container, Flex, HR, Section, Text } from '@near-pagoda/ui';

import { SignInWithWallet } from '~/components/SignInWithWallet';
import AppleIcon from '~/svgs/apple-icon.svg';
import GithubIcon from '~/svgs/github-icon.svg';
import GoogleIcon from '~/svgs/google-icon.svg';
import NearAiLogo from '~/svgs/near-ai-logo.svg';

import s from './page.module.scss';

export default function HomePage() {
  return (
    <Section grow="available">
      <Container size="xs" style={{ margin: 'auto' }}>
        <Flex direction="column" gap="l">
          <NearAiLogo className={s.logo} />

          <Text style={{ textAlign: 'center' }}>
            Sign in with your preferred method:
          </Text>

          <Flex direction="column" gap="s">
            <Button
              label="Google"
              iconLeft={<GoogleIcon />}
              fill="outline"
              variant="secondary"
            />
            <Button
              label="Apple"
              iconLeft={<AppleIcon />}
              fill="outline"
              variant="secondary"
            />
            <Button
              label="GitHub"
              iconLeft={<GithubIcon />}
              fill="outline"
              variant="secondary"
            />
          </Flex>

          <Flex align="center" gap="m">
            <HR />
            <Text size="text-s">or</Text>
            <HR />
          </Flex>

          <SignInWithWallet />
        </Flex>
      </Container>
    </Section>
  );
}

import { Button, Container, Flex, Section } from '@near-pagoda/ui';
import { SignIn } from '@phosphor-icons/react';

export const Processing = () => {
  return (
    <Section grow="available">
      <Container size="s" style={{ margin: 'auto', textAlign: 'center' }}>
        <Flex direction="column" gap="l" align="center">
          <Button
            label="Sign In"
            icon={<SignIn />}
            loading
            fill="ghost"
            size="large"
          />
        </Flex>
      </Container>
    </Section>
  );
};

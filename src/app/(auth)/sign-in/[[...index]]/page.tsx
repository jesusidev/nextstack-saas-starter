'use client';

import { SignIn } from '@clerk/nextjs';
import { Container, Grid, Paper, rem, Text, Title, useMantineColorScheme } from '@mantine/core';
import Link from 'next/link';

export default function SignInPage() {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Container my={40}>
      <Paper withBorder shadow="md" p={20} mt={30} radius="md">
        <Grid grow>
          <Grid.Col span={6}>
            <Title>Welcome back!</Title>
            <Text size="sm" mt={5}>
              Do not have an account yet?{' '}
              <Link
                href="/sign-up"
                style={{
                  textDecoration: 'underline',
                  color: dark ? '#4dabf7' : '#1c7ed6',
                  fontSize: rem(14),
                }}
              >
                Create account
              </Link>
            </Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              appearance={{
                layout: {
                  socialButtonsVariant: 'iconButton',
                  socialButtonsPlacement: 'bottom',
                },
                elements: {
                  rootBox: {
                    margin: '0 auto',
                    width: '100%',
                    border: dark ? '1px solid #333' : 'none',
                  },
                  card: {
                    width: '100%',
                    maxWidth: '435px',
                  },
                  footer: {
                    display: 'none',
                  },
                },
              }}
            />
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
}

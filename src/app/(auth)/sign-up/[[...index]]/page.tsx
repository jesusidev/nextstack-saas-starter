'use client';

import { SignUp } from '@clerk/nextjs';
import { Container, Grid, Paper, rem, Text, Title, useMantineColorScheme } from '@mantine/core';
import Link from 'next/link';

export default function SignUpPage() {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Container my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Grid grow>
          <Grid.Col span={6}>
            <Title>Sign Up!</Title>
            <Text size="sm" mt={5}>
              Have an account?{' '}
              <Link
                href="/sign-in"
                style={{
                  textDecoration: 'underline',
                  color: dark ? '#4dabf7' : '#1c7ed6',
                  fontSize: rem(14),
                }}
              >
                Sign In
              </Link>
            </Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
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

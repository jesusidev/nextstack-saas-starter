'use client';

import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <Container py="xl">
      <Stack align="center" gap="lg" mih="50vh" justify="center">
        <Title order={2} ta="center">
          Something went wrong!
        </Title>
        <Text c="dimmed" ta="center" maw={400}>
          An unexpected error occurred. Please try again or return to the homepage.
        </Text>
        <Stack gap="sm" align="center">
          <Button onClick={reset} variant="filled">
            Try again
          </Button>
          <Button onClick={() => router.push('/')} variant="light">
            Return to home
          </Button>
        </Stack>
        {process.env.NODE_ENV === 'development' && (
          <Text size="xs" c="red" ta="center" mt="lg">
            Dev error: {error.message}
          </Text>
        )}
      </Stack>
    </Container>
  );
}

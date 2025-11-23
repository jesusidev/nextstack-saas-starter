import { Button, Container, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container py="xl">
      <Stack align="center" gap="lg" mih="50vh" justify="center">
        <Title order={1} size="6rem" c="dimmed">
          404
        </Title>
        <Title order={2} ta="center">
          Page Not Found
        </Title>
        <Text c="dimmed" ta="center" maw={400}>
          The page you are looking for doesn't exist. You may have mistyped the address or the page
          may have moved.
        </Text>
        <Button component={Link} href="/" variant="filled">
          Return to home
        </Button>
      </Stack>
    </Container>
  );
}

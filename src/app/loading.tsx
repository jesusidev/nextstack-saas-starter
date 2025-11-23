import { Center, Loader, Stack, Text } from '@mantine/core';

export default function Loading() {
  return (
    <Center style={{ minHeight: '50vh' }}>
      <Stack align="center" gap="md">
        <Loader size="lg" />
        <Text size="sm" c="dimmed">
          Loading...
        </Text>
      </Stack>
    </Center>
  );
}

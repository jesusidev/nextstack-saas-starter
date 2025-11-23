'use client';

import { Burger, Group, Text } from '@mantine/core';
import { UserButton } from '~/components/userButton';

type DashboardHeaderProps = {
  mobileOpened: boolean;
  toggleMobile: () => void;
};

export function DashboardHeader({ mobileOpened, toggleMobile }: DashboardHeaderProps) {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
        <Text size="lg" fw={600}>
          NextStack SaaS Starter
        </Text>
      </Group>

      {/* Desktop User Controls - Only visible on desktop */}
      <Group visibleFrom="sm">
        <UserButton />
      </Group>
    </Group>
  );
}

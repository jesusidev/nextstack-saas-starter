'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import {
  Avatar,
  Group,
  Menu,
  rem,
  Text,
  UnstyledButton,
  useMantineColorScheme,
  useMatches,
} from '@mantine/core';
import {
  IconChevronDown,
  IconLogout,
  IconMoonStars,
  IconSettings,
  IconSun,
} from '@tabler/icons-react';
import classes from './styles/UserButton.module.css';

type UserButtonProps = {
  variant?: 'header' | 'sidebar';
};

export function UserButton({ variant = 'header' }: UserButtonProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  const handleLogout = () => {
    signOut();
  };
  const isMobile = useMatches({
    base: true,
    sm: false,
  });

  // On mobile, use sidebar variant; on desktop, respect the prop
  const currentVariant = isMobile ? 'sidebar' : variant;

  if (currentVariant === 'sidebar') {
    return (
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <UnstyledButton style={{ width: '100%' }}>
            <Group gap="xs">
              <Avatar src={user?.imageUrl} alt={user?.fullName || ''} radius="xl" size={32} />
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500} c="light-dark(black, white)">
                  {user?.fullName}
                </Text>
                <Text size="xs" c="dimmed">
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>
              </div>
              <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item leftSection={<IconSettings style={{ width: rem(16), height: rem(16) }} />}>
            Account settings
          </Menu.Item>
          <Menu.Item
            leftSection={
              dark ? (
                <IconSun style={{ width: rem(16), height: rem(16) }} />
              ) : (
                <IconMoonStars style={{ width: rem(16), height: rem(16) }} />
              )
            }
            onClick={toggleColorScheme}
          >
            {dark ? 'Light' : 'Dark'} theme
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
            color="red"
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton className={classes.user}>
          <Group gap={7}>
            <Avatar src={user?.imageUrl} alt={user?.fullName || ''} radius="xl" size={20} />
            <Text fw={500} size="sm" lh={1} mr={3} c="light-dark(black, white)">
              {user?.fullName}
            </Text>
            <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<IconSettings style={{ width: rem(16), height: rem(16) }} />}>
          Account settings
        </Menu.Item>
        <Menu.Item
          leftSection={
            dark ? (
              <IconSun style={{ width: rem(16), height: rem(16) }} />
            ) : (
              <IconMoonStars style={{ width: rem(16), height: rem(16) }} />
            )
          }
          onClick={toggleColorScheme}
        >
          {dark ? 'Light' : 'Dark'} theme
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
          color="red"
          onClick={handleLogout}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

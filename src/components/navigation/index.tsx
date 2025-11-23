'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';
import {
  ActionIcon,
  Anchor,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  Group,
  HoverCard,
  rem,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBook,
  IconChartPie3,
  IconChevronDown,
  IconCode,
  IconCoin,
  IconFingerprint,
  IconMoonStars,
  IconNotification,
  IconSun,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { color } from '~/styles/colors';
import classes from './styles/Navigation.module.css';

const mockdata = [
  {
    icon: IconCode,
    title: 'Open source',
    description: 'This Pokémon’s cry is very loud and distracting',
  },
  {
    icon: IconCoin,
    title: 'Free for everyone',
    description: 'The fluid of Smeargle’s tail secretions changes',
  },
  {
    icon: IconBook,
    title: 'Documentation',
    description: 'Yanma is capable of seeing 360 degrees without',
  },
  {
    icon: IconFingerprint,
    title: 'Security',
    description: 'The shell’s rounded shape and the grooves on its.',
  },
  {
    icon: IconChartPie3,
    title: 'Analytics',
    description: 'This Pokémon uses its flying ability to quickly chase',
  },
  {
    icon: IconNotification,
    title: 'Notifications',
    description: 'Combusken battles with the intensely hot flames it spews',
  },
];

export function NavigationPrimary() {
  const [mounted, setMounted] = useState(false);
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = mounted ? colorScheme === 'dark' : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Group wrap="nowrap" align="flex-start">
        <ThemeIcon size={34} variant="default" radius="md">
          <item.icon size={rem(22)} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>
            {item.title}
          </Text>
          <Text size="xs">{item.description}</Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  return (
    <header className={classes.container}>
      <Group justify="space-between" h="100%">
        <Group className={classes.hiddenMobile}>
          <Link href="/" className={classes.link} style={{ textDecoration: 'none' }}>
            <Text>Home</Text>
          </Link>
          <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
            <HoverCard.Target>
              <button
                type="button"
                className={classes.link}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Center inline>
                  <Box component="span" mr={5}>
                    Features
                  </Box>
                  <IconChevronDown size={16} />
                </Center>
              </button>
            </HoverCard.Target>

            <HoverCard.Dropdown>
              <Group px="md">
                <Text fw={500}>Features</Text>
                <Anchor href="#" fz="xs">
                  View all
                </Anchor>
              </Group>

              <Divider my="sm" mx="-md" color={color.purple[5]} />

              <SimpleGrid cols={2} spacing={0}>
                {links}
              </SimpleGrid>

              <div className={classes.dropdownFooter}>
                <Group justify="space-between">
                  <div>
                    <Text fw={500} fz="sm">
                      Get started
                    </Text>
                    <Text size="xs">Their food sources have decreased, and their numbers</Text>
                  </div>
                  <Button variant="default">Get started</Button>
                </Group>
              </div>
            </HoverCard.Dropdown>
          </HoverCard>
          <button
            type="button"
            className={classes.link}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Learn
          </button>
          <button
            type="button"
            className={classes.link}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Academy
          </button>
        </Group>

        <Group className={classes.hiddenMobile}>
          <Button component={Link} href="/sign-in" variant="default">
            Sign in
          </Button>
          <Button component={Link} href="/sign-up">
            Sign up
          </Button>
          <ActionIcon
            variant="outline"
            color={dark ? 'yellow' : 'blue'}
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
          >
            {dark ? <IconSun size="1.1rem" /> : <IconMoonStars size="1.1rem" />}
          </ActionIcon>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Group>

        <Burger opened={drawerOpened} onClick={toggleDrawer} className={classes.hiddenDesktop} />
      </Group>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.hiddenDesktop}
        zIndex={100}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          <Divider my="sm" color={color.red[0]} />

          <Link href="/" className={classes.link} style={{ textDecoration: 'none' }}>
            <Text>Home</Text>
          </Link>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Features
              </Box>
              <IconChevronDown size={16} />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>
          <UnstyledButton className={classes.link}>Learn</UnstyledButton>
          <UnstyledButton className={classes.link}>Academy</UnstyledButton>
          <SignedIn>
            <Box ml={15}>
              <UserButton />
            </Box>
          </SignedIn>

          <Divider my="sm" />

          <Group grow pb="xl" px="md">
            <Button component={Link} href="/sign-in" variant="default">
              Sign in
            </Button>
            <Button component={Link} href="/sign-up">
              Sign up
            </Button>
            <ActionIcon
              variant="outline"
              color={dark ? 'yellow' : 'blue'}
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
            >
              {dark ? <IconSun size="1.1rem" /> : <IconMoonStars size="1.1rem" />}
            </ActionIcon>
          </Group>
        </ScrollArea>
      </Drawer>
    </header>
  );
}

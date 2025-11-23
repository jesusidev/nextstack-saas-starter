'use client';

import { ActionIcon, Container, Group, rem, Text } from '@mantine/core';
import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react';
import Link from 'next/link';
import { footerLinks } from '~/components/footer/footerLinks';
import classes from './styles/Footer.module.css';

export function FooterPrimary() {
  const groups = footerLinks.map((group) => {
    const links = group.links.map((link, linkIndex) => {
      // Use anchor tag for placeholder links
      if (link.link === '#') {
        return (
          <a
            key={`${group.title}-${link.label}-${linkIndex}`}
            className={classes.link}
            href={link.link}
            onClick={(event) => event.preventDefault()}
            style={{ textDecoration: 'none' }}
          >
            <Text>{link.label}</Text>
          </a>
        );
      }

      // Use Next.js Link for real routes
      return (
        <Link
          key={`${group.title}-${link.label}-${linkIndex}`}
          href={link.link}
          className={classes.link}
          style={{ textDecoration: 'none' }}
        >
          <Text>{link.label}</Text>
        </Link>
      );
    });

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Text size="xs" c="dimmed" className={classes.description}>
            Build fully functional accessible web applications faster than ever
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text c="dimmed" size="sm">
          © 2020 mantine.dev. All rights reserved.
        </Text>

        <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandTwitter style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandYoutube style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandInstagram style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>
    </footer>
  );
}

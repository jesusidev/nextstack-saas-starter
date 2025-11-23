'use client';

import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type React from 'react';
import { DashboardHeader } from '~/components/navigation/DashboardHeader';
import { LoggedInNavbar } from '~/components/navigation/loggedIn';

type LayoutDashboardProps = {
  children: React.ReactNode;
};

export default function LayoutDashboard({ children }: LayoutDashboardProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <DashboardHeader mobileOpened={mobileOpened} toggleMobile={toggleMobile} />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <LoggedInNavbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

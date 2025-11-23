import { Container, Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import LayoutPage from '~/layouts/page';

interface LegalLayoutProps {
  children: ReactNode;
}

/**
 * Legal Pages Layout
 *
 * Shared layout for all legal/policy pages.
 * Provides consistent container width and spacing.
 */
export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <LayoutPage>
      <Container size="md" py="xl">
        <Stack gap="xl">{children}</Stack>
      </Container>
    </LayoutPage>
  );
}

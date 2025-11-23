'use client';

import { useMantineColorScheme } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';

export function useColorScheme() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  // Ctrl/⌘ + J hotkey for theme switching
  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  return {
    colorScheme,
    toggleColorScheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
  };
}

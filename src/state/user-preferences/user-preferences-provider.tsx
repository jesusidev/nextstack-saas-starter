'use client';

import { type ReactNode, useCallback, useMemo, useState } from 'react';
import {
  defaultPreferences,
  type Theme,
  type UserPreferences,
  UserPreferencesContext,
  type ViewMode,
} from './user-preferences-context';

// Provider
interface UserPreferencesProviderProps {
  children: ReactNode;
  initialPreferences?: Partial<UserPreferences>;
}

export function UserPreferencesProvider({
  children,
  initialPreferences = {},
}: UserPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => ({
    ...defaultPreferences,
    ...initialPreferences,
  }));

  const updateTheme = useCallback((theme: Theme) => {
    setPreferences((prev) => ({ ...prev, theme }));
  }, []);

  const updateDefaultViewMode = useCallback((defaultViewMode: ViewMode) => {
    setPreferences((prev) => ({ ...prev, defaultViewMode }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setPreferences((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const toggleNotifications = useCallback(() => {
    setPreferences((prev) => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      updateTheme,
      updateDefaultViewMode,
      toggleSidebar,
      toggleNotifications,
      resetPreferences,
    }),
    [
      preferences,
      updateTheme,
      updateDefaultViewMode,
      toggleSidebar,
      toggleNotifications,
      resetPreferences,
    ]
  );

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
}

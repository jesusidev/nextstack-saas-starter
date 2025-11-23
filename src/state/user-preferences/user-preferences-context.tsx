import { createContext } from 'react';

// Types
export type ViewMode = 'cards' | 'table';
export type Theme = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: Theme;
  defaultViewMode: ViewMode;
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
}

export interface UserPreferencesContextValue {
  preferences: UserPreferences;
  updateTheme: (theme: Theme) => void;
  updateDefaultViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  toggleNotifications: () => void;
  resetPreferences: () => void;
}

// Default preferences
export const defaultPreferences: UserPreferences = {
  theme: 'system',
  defaultViewMode: 'cards',
  sidebarCollapsed: false,
  notificationsEnabled: true,
};

// Context
export const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(
  undefined
);

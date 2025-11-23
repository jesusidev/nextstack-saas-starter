'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { MicrosoftClarityWithConsent } from '~/components/analytics/clarity/MicrosoftClarityWithConsent';
import { GoogleAnalyticsWithConsent } from '~/components/analytics/google/GoogleAnalyticsWithConsent';
import { ClientOnly } from '~/components/ClientOnly';
import { CookieConsentBanner } from '~/components/cookie-consent/CookieConsentBanner';
import { CookieConsentProvider } from '~/components/cookie-consent/CookieConsentProvider';
import { CookiePreferencesButton } from '~/components/cookie-consent/CookiePreferencesButton';
import { DomainAnalyticsService } from '~/components/services/DomainAnalyticsService';
import { NotificationService } from '~/components/services/NotificationService';
import { UnifiedAnalyticsService } from '~/components/services/UnifiedAnalyticsService';
import { LenisProvider, NotificationProvider, Providers, UserPreferencesProvider } from '~/state';
import { theme } from '~/styles/theme';
import { TRPCReactProvider } from '~/utils/trpc';

interface RootProviderProps {
  children: React.ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  // ✨ Clean array-based provider composition following reference pattern
  const providers = [
    [
      ClerkProvider,
      {
        appearance: {
          baseTheme: undefined, // Let Mantine handle theme switching
        },
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      },
    ],
    [MantineProvider, { theme }],
    [TRPCReactProvider, {}],
    [UserPreferencesProvider, { initialPreferences: { theme: 'system' as const } }],
    [NotificationProvider, { maxNotifications: 5, defaultDuration: 5000 }],
    [
      LenisProvider,
      {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        lerp: 0.1,
        smoothWheel: true,
      },
    ],
  ] as const;

  return (
    <Providers providers={providers}>
      <CookieConsentProvider>
        <ClientOnly>
          <CookieConsentBanner />
          <CookiePreferencesButton />
          <MicrosoftClarityWithConsent />
          <GoogleAnalyticsWithConsent />
          <NotificationService />
          <UnifiedAnalyticsService />
          <DomainAnalyticsService />
        </ClientOnly>
        <Notifications position="top-center" zIndex={1077} limit={5} />
        {children}
      </CookieConsentProvider>
    </Providers>
  );
}

'use client';

import Script, { type ScriptProps } from 'next/script';
import type { JSX } from 'react';
import { useId } from 'react';
import { env } from '~/env.mjs';
import { usePageViews } from './hooks/usePageViews';

type GoogleAnalyticsProps = {
  gaMeasurementId?: string;
  gtagUrl?: string;
  strategy?: ScriptProps['strategy'];
  debugMode?: boolean;
  defaultConsent?: 'granted' | 'denied';
  nonce?: string;
};

type WithPageView = GoogleAnalyticsProps & {
  trackPageViews?: boolean;
};

type WithIgnoreHashChange = GoogleAnalyticsProps & {
  trackPageViews?: {
    ignoreHashChange: boolean;
  };
};

export function GoogleAnalytics({
  debugMode = false,
  gaMeasurementId,
  gtagUrl = 'https://www.googletagmanager.com/gtag/js',
  strategy = 'afterInteractive',
  defaultConsent = 'granted',
  trackPageViews = true,
  nonce,
}: WithPageView | WithIgnoreHashChange): JSX.Element | null {
  const _gaMeasurementId = env.NEXT_PUBLIC_GA_TAG ?? gaMeasurementId;
  const scriptId = useId();

  usePageViews({
    gaMeasurementId: _gaMeasurementId,
    disabled: !trackPageViews,
  });

  if (!_gaMeasurementId) {
    return null;
  }

  return (
    <>
      <Script src={`${gtagUrl}?id=${_gaMeasurementId}`} strategy={strategy} />
      <Script id={scriptId} nonce={nonce}>
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            // Google Consent Mode v2
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': '${defaultConsent}',
              'functionality_storage': 'denied',
              'personalization_storage': 'denied',
              'security_storage': 'granted',
              'wait_for_update': 500
            });
            gtag('config', '${_gaMeasurementId}', {
              page_path: window.location.pathname,
              ${debugMode ? `debug_mode: ${debugMode},` : ''}
            });
          `}
      </Script>
    </>
  );
}

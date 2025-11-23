import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { env } from '~/env.mjs';
import { pageView } from '../interactions/pageView';

export interface UsePageViewsOptions {
  gaMeasurementId?: string;
  disabled?: boolean;
}

export function usePageViews({ gaMeasurementId, disabled }: UsePageViewsOptions = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (disabled) {
      return;
    }

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    const _gaMeasurementId = env.NEXT_PUBLIC_GA_TAG ?? gaMeasurementId;

    pageView({ path: url }, _gaMeasurementId);
  }, [pathname, searchParams, gaMeasurementId, disabled]);
}

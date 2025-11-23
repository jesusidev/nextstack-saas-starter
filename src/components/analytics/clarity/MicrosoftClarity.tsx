'use client';

import Script from 'next/script';
import type { JSX } from 'react';
import { useId } from 'react';
import { env } from '~/env.mjs';

type MicrosoftClarityProps = {
  nonce?: string;
};

export function MicrosoftClarity({ nonce }: MicrosoftClarityProps): JSX.Element | null {
  const _MCId = env.NEXT_PUBLIC_MI_ID;
  const scriptId = useId();

  if (!_MCId) {
    return null;
  }

  return (
    <Script
      id={scriptId}
      nonce={nonce}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Microsoft Clarity requires script injection
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", '${_MCId}');`,
      }}
    />
  );
}

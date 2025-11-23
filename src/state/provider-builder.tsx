/* eslint-disable */
import type { ReactElement, ReactNode } from 'react';

// Provider tuple type - flexible to handle various provider prop types
// biome-ignore lint/suspicious/noExplicitAny: Provider composition requires flexible typing for various provider prop interfaces
type ProviderTuple = readonly [React.ComponentType<any>, any];

export interface ProvidersProps {
  children: ReactNode;
  providers: readonly ProviderTuple[];
}

export function Providers({ children, providers }: ProvidersProps): ReactElement {
  return providers.reduceRight(
    (node, [Provider, props]) => (
      <Provider key={Provider.name || Provider.displayName || 'provider'} {...props}>
        {node}
      </Provider>
    ),
    children as ReactElement
  );
}

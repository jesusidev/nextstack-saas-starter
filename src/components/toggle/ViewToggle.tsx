'use client';

import { SegmentedControl } from '@mantine/core';
import { IconLayoutGrid, IconTable } from '@tabler/icons-react';
import { useProductDispatcher } from '~/events';

export type ViewMode = 'cards' | 'table';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  context?: 'products' | 'projects' | 'dashboard';
}

export function ViewToggle({ value, onChange, context = 'products' }: ViewToggleProps) {
  const { viewToggled } = useProductDispatcher();

  const handleViewModeChange = (newValue: ViewMode) => {
    onChange(newValue);

    // Dispatch view toggle event only for products and projects contexts
    if (context === 'products' || context === 'projects') {
      viewToggled({
        viewMode: newValue,
        context,
      });
    }
  };

  return (
    <SegmentedControl
      value={value}
      onChange={(val) => handleViewModeChange(val as ViewMode)}
      data-testid={`view-toggle-${context}`}
      data={[
        {
          value: 'cards',
          label: (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              data-testid={`cards-view-option-${context}`}
            >
              <IconLayoutGrid size={16} />
              <span>Cards</span>
            </div>
          ),
        },
        {
          value: 'table',
          label: (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              data-testid={`table-view-option-${context}`}
            >
              <IconTable size={16} />
              <span>Table</span>
            </div>
          ),
        },
      ]}
      size="sm"
    />
  );
}

'use client';

import { NumberInput, type NumberInputHandlers } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useRef } from 'react';

type InputNumberProps = {
  min?: number;
  max?: number;
  label?: string;
  error?: string;
  defaultValue?: number;
};

export function InputNumber({
  min = 0,
  max,
  label,
  error,
  defaultValue,
  ...props
}: InputNumberProps) {
  const handlers = useRef<NumberInputHandlers>(null);

  return (
    <NumberInput
      {...props}
      min={min}
      max={max}
      label={label || ''}
      error={error && error}
      defaultValue={defaultValue || 0}
      handlersRef={handlers}
      rightSection={error && <IconAlertTriangle stroke={1.5} size="1.1rem" />}
    />
  );
}

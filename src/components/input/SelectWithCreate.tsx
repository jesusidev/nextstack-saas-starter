import {
  Checkbox,
  CloseButton,
  Combobox,
  Group,
  Loader,
  Pill,
  PillsInput,
  Stack,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useMemo, useRef, useState } from 'react';

// Generic type for single vs multi-select value
type SelectValue<M extends boolean> = M extends true ? string[] : string | null;

interface SelectWithCreateProps<M extends boolean = false> {
  // Core props
  value: SelectValue<M>;
  onChange: (value: SelectValue<M>) => void;
  data: Array<{ value: string; label: string }>;

  // Multi-select flag
  multiple?: M;

  // Creation props
  onCreate?: (name: string) => Promise<{ id: string; name: string }>;
  createLabel?: string;

  // Standard input props
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;

  // Loading states
  isLoading?: boolean;
  isCreating?: boolean;

  // Helper text
  helperText?: string;

  // Clearable option (for single-select)
  clearable?: boolean;

  // Test ID for e2e testing
  'data-testid'?: string;
}

export function SelectWithCreate<M extends boolean = false>({
  value,
  onChange,
  data,
  multiple = false as M,
  onCreate,
  createLabel,
  label,
  placeholder = 'Select...',
  error,
  required,
  disabled,
  isLoading,
  isCreating = false,
  helperText,
  clearable,
  'data-testid': dataTestId,
}: SelectWithCreateProps<M>) {
  const combobox = useCombobox({
    onDropdownClose: () => {
      if (!isCreating) {
        combobox.resetSelectedOption();
      }
    },
  });

  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }
    const searchLower = search.toLowerCase().trim();
    return data.filter((item) => item.label.toLowerCase().includes(searchLower));
  }, [data, search]);

  // Determine if "Create..." option should be shown
  const shouldShowCreate = useMemo(() => {
    if (!onCreate || !search.trim()) {
      return false;
    }
    const searchLower = search.toLowerCase().trim();
    // Show create option if no exact match exists
    return !data.some((item) => item.label.toLowerCase() === searchLower);
  }, [onCreate, search, data]);

  // Get display value for single-select
  const displayValue = useMemo(() => {
    if (multiple || !value) {
      return null;
    }
    const item = data.find((d) => d.value === value);
    return item?.label || null;
  }, [value, data, multiple]);

  // Get selected items for multi-select
  const selectedItems = useMemo(() => {
    if (!multiple || !Array.isArray(value)) {
      return [];
    }
    return value
      .map((v) => data.find((d) => d.value === v))
      .filter((item): item is { value: string; label: string } => item !== undefined);
  }, [value, data, multiple]);

  // Handle option selection
  const handleOptionSubmit = async (val: string) => {
    if (val === '$create' && onCreate) {
      await handleCreate();
      return;
    }

    if (multiple) {
      const currentValue = (value || []) as string[];
      const newValue = currentValue.includes(val)
        ? currentValue.filter((v) => v !== val)
        : [...currentValue, val];
      onChange(newValue as SelectValue<M>);
      setSearch('');
    } else {
      onChange(val as SelectValue<M>);
      setSearch('');
      setIsFocused(false);
      combobox.closeDropdown();
      // Blur the input to prevent cursor staying in field
      inputRef.current?.blur();
    }
  };

  // Handle inline creation
  const handleCreate = async () => {
    if (!onCreate || !search.trim() || isCreating) {
      return;
    }

    try {
      const newItem = await onCreate(search.trim());

      // Update selection
      if (multiple) {
        const currentValue = (value || []) as string[];
        onChange([...currentValue, newItem.id] as SelectValue<M>);
      } else {
        onChange(newItem.id as SelectValue<M>);
      }

      setSearch('');
      if (!multiple) {
        setIsFocused(false);
        combobox.closeDropdown();
        // Blur the input to prevent cursor staying in field
        inputRef.current?.blur();
      }
    } catch (error) {
      // Error handling is done by service hooks (notifications, etc.)
      // Log error for debugging purposes in development
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error in handleCreate:', error);
      }
    }
  };

  // Handle pill removal in multi-select
  const handleRemovePill = (valueToRemove: string) => {
    if (!multiple) {
      return;
    }
    const currentValue = (value || []) as string[];
    const newValue = currentValue.filter((v) => v !== valueToRemove);
    onChange(newValue as SelectValue<M>);
  };

  // Handle clear action for single-select
  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(null as SelectValue<M>);
  };

  return (
    <Stack gap="xs" data-testid={dataTestId}>
      <Combobox
        store={combobox}
        onOptionSubmit={handleOptionSubmit}
        disabled={disabled || isLoading}
        position="bottom-start"
        withinPortal={true}
      >
        {multiple ? (
          // Multi-select: Use PillsInput
          <Combobox.Target>
            <PillsInput
              label={label}
              error={error}
              required={required}
              disabled={disabled || isLoading}
              onClick={() => combobox.openDropdown()}
              rightSection={isLoading ? <Loader size={18} /> : <Combobox.Chevron />}
            >
              <Pill.Group>
                {selectedItems.map((item) => (
                  <Pill
                    key={item.value}
                    withRemoveButton
                    onRemove={() => handleRemovePill(item.value)}
                  >
                    {item.label}
                  </Pill>
                ))}
                <Combobox.EventsTarget>
                  <PillsInput.Field
                    value={search}
                    onChange={(event) => {
                      setSearch(event.currentTarget.value);
                      combobox.openDropdown();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        // If "Create..." option is available, create new item
                        if (shouldShowCreate) {
                          handleCreate();
                        }
                        // Otherwise, select first filtered option
                        else if (filteredData.length > 0) {
                          // biome-ignore lint/style/noNonNullAssertion: length check ensures element exists
                          handleOptionSubmit(filteredData[0]!.value);
                        }
                      }
                    }}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => combobox.closeDropdown()}
                    placeholder={selectedItems.length === 0 ? placeholder : undefined}
                  />
                </Combobox.EventsTarget>
              </Pill.Group>
            </PillsInput>
          </Combobox.Target>
        ) : (
          // Single-select: Use TextInput
          <Combobox.Target>
            <TextInput
              ref={inputRef}
              label={label}
              placeholder={placeholder}
              error={error}
              required={required}
              disabled={disabled || isLoading}
              data-testid="select-with-create-input"
              value={isFocused ? search : displayValue || ''}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                combobox.openDropdown();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  // If "Create..." option is available, create new item
                  if (shouldShowCreate) {
                    handleCreate();
                  }
                  // Otherwise, select first filtered option
                  else if (filteredData.length > 0) {
                    // biome-ignore lint/style/noNonNullAssertion: length check ensures element exists
                    handleOptionSubmit(filteredData[0]!.value);
                  }
                }
              }}
              onFocus={() => {
                setIsFocused(true);
                setSearch(displayValue || '');
                combobox.openDropdown();
              }}
              onBlur={() => {
                setIsFocused(false);
                setSearch('');
                combobox.closeDropdown();
              }}
              rightSection={
                isLoading ? (
                  <Loader size={18} />
                ) : clearable && value && !isFocused ? (
                  <CloseButton
                    size="sm"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleClear(event);
                    }}
                    aria-label="Clear selection"
                  />
                ) : (
                  <Combobox.Chevron />
                )
              }
            />
          </Combobox.Target>
        )}

        <Combobox.Dropdown data-testid="select-dropdown">
          <Combobox.Options>
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const isActive = multiple
                  ? Array.isArray(value) && value.includes(item.value)
                  : value === item.value;

                return (
                  <Combobox.Option value={item.value} key={item.value} active={isActive}>
                    {multiple && (
                      <Group gap="xs">
                        <Checkbox
                          checked={Array.isArray(value) && value.includes(item.value)}
                          readOnly
                          aria-hidden
                          tabIndex={-1}
                          style={{ pointerEvents: 'none' }}
                        />
                        <span>{item.label}</span>
                      </Group>
                    )}
                    {!multiple && <span>{item.label}</span>}
                  </Combobox.Option>
                );
              })
            ) : (
              <Combobox.Empty>No results found</Combobox.Empty>
            )}

            {shouldShowCreate && (
              <Combobox.Option
                value="$create"
                disabled={isCreating}
                data-testid="create-new-option"
              >
                {isCreating ? (
                  <Group gap="xs" data-testid="creating-loader">
                    <Loader size="xs" />
                    <span>Creating...</span>
                  </Group>
                ) : (
                  <Group gap="xs" data-testid="create-option-content">
                    <IconPlus size={16} />
                    <span>
                      {createLabel || 'Create'} &quot;{search.trim()}&quot;
                    </span>
                  </Group>
                )}
              </Combobox.Option>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>

      {helperText && (
        <Text size="xs" c="dimmed">
          {helperText}
        </Text>
      )}
    </Stack>
  );
}

export type { SelectWithCreateProps };

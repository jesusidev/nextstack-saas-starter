# Input Components

This directory contains specialized input components that extend Mantine's base components with application-specific functionality and patterns.

## Components

### CategorySelect

Multi-select component with inline category creation capability.

**File**: `CategorySelect.tsx`

**Features:**
- Multi-selection of existing categories
- Inline category creation with "Add" button
- Enter key support for quick creation
- Automatic selection of newly created categories
- Loading states and error handling

**Usage:**
```typescript
import { CategorySelect } from '~/components/input/CategorySelect';

function ProductForm() {
  const form = useForm({
    initialValues: { categoryIds: [] },
  });

  return (
    <CategorySelect
      label="Categories"
      placeholder="Select categories"
      value={form.values.categoryIds}
      onChange={(values) => form.setFieldValue('categoryIds', values)}
    />
  );
}
```

---

### ProjectSelect

Single-select component with inline project creation capability.

**File**: `ProjectSelect.tsx`

**Features:**
- Single project selection from existing projects
- Inline project creation with "Add" button
- Enter key support for quick creation
- Automatic selection of newly created project
- Enhanced error handling for duplicate names
- Full accessibility support with ARIA labels
- Helper text for user guidance

**Usage:**
```typescript
import { ProjectSelect } from '~/components/input/ProjectSelect';

function ProductForm() {
  const form = useForm({
    initialValues: { projectId: '' },
  });

  return (
    <ProjectSelect
      label="Project"
      placeholder="Select a project"
      {...form.getInputProps('projectId')}
    />
  );
}
```

**Props:**
```typescript
interface ProjectSelectProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}
```

**Error Handling:**
- Smart duplicate detection with user-friendly messages
- Input preservation on error for better UX
- Network error handling with retry suggestions

---

## Patterns

### Inline Creation Pattern

Both CategorySelect and ProjectSelect follow the same inline creation pattern:

1. **Local State**: `useState` for new entity name input
2. **Service Hook**: Uses appropriate service hook for data + mutations
3. **Async Creation**: `mutateAsync` for imperative creation
4. **Auto-Selection**: Automatically selects newly created entity
5. **Input Clearing**: Clears input after successful creation
6. **Enter Key Support**: Creates entity on Enter keypress
7. **Loading State**: Shows loading indicator during creation
8. **Validation**: Disables button when input is empty/whitespace
9. **Error Handling**: Try-catch with user-friendly error messages
10. **Accessibility**: ARIA labels and keyboard navigation

### Component Structure

```typescript
const ComponentSelect = forwardRef<HTMLInputElement, ComponentSelectProps>(
  ({ value, onChange, label, placeholder, error, required, disabled }, ref) => {
    // Local state for new entity name
    const [newEntityName, setNewEntityName] = useState('');
    
    // Service hook for data and mutations
    const service = useEntityService();
    const { data: entities = [], isLoading } = service.useEntities();
    const { createEntity } = service.useMutations();

    // Convert entities to select data format
    const selectData = entities.map((entity) => ({
      value: entity.id,
      label: entity.name,
    }));

    // Handle selection change
    const handleSelectChange = (newValue: string | null) => {
      onChange(newValue || '');
    };

    // Handle inline creation
    const handleAddEntity = async () => {
      if (!newEntityName.trim() || createEntity.isPending) {
        return;
      }

      try {
        const newEntity = await createEntity.mutateAsync({
          name: newEntityName.trim(),
        });
        
        onChange(newEntity.id);
        setNewEntityName('');
      } catch (error) {
        // Enhanced error handling
        showErrorNotification(error);
      }
    };

    return (
      <Stack gap="xs">
        <Select
          ref={ref}
          label={label}
          placeholder={placeholder}
          data={selectData}
          value={value}
          onChange={handleSelectChange}
          searchable
          error={error}
          required={required}
          disabled={isLoading || disabled}
          variant="outline"
        />

        <Group gap="xs">
          <TextInput
            placeholder="Create new entity"
            value={newEntityName}
            onChange={(e) => setNewEntityName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEntity();
              }
            }}
            style={{ flex: 1 }}
            disabled={disabled || createEntity.isPending}
            aria-label="New entity name"
          />
          <Button
            variant="outline"
            onClick={handleAddEntity}
            loading={createEntity.isPending}
            disabled={!newEntityName.trim() || createEntity.isPending || disabled}
            aria-label="Create new entity"
          >
            Add
          </Button>
        </Group>

        <Text size="xs" c="dimmed">
          Select an existing entity or create a new one
        </Text>
      </Stack>
    );
  }
);
```

---

## Best Practices

### When to Use Inline Creation

**Use inline creation when:**
- Users frequently need to create new entities during form completion
- The entity creation is simple (name-only or minimal fields)
- Context switching would significantly disrupt the user workflow
- The entity list is relatively small and manageable

**Avoid inline creation when:**
- Entity creation requires complex forms with many fields
- Entity creation needs additional context or configuration
- The entity list is very large (1000+ items)
- Entity creation is a rare or advanced feature

### Error Handling Guidelines

1. **Smart Error Detection**: Check for specific error patterns (duplicates, network issues)
2. **User-Friendly Messages**: Translate technical errors into actionable user messages
3. **Input Preservation**: Don't clear input on error to allow user correction
4. **Visual Feedback**: Use appropriate colors and icons for different error types

### Accessibility Requirements

1. **ARIA Labels**: All interactive elements need descriptive aria-labels
2. **Keyboard Navigation**: Full keyboard support including Enter key and focus management
3. **Screen Reader Support**: Semantic HTML and proper element relationships
4. **Loading States**: Communicate loading states to assistive technologies

### Performance Considerations

1. **Optimistic Updates**: Use service hooks with optimistic updates for instant feedback
2. **Cache Management**: Leverage existing query caching (5-minute default)
3. **Minimal Re-renders**: Only re-render when necessary data changes
4. **Efficient Data Structures**: Use appropriate data structures for select options

---

## Testing

### Unit Testing

Each component should have comprehensive unit tests covering:

- Basic functionality (selection, creation)
- Error scenarios (duplicates, network errors)
- Edge cases (empty inputs, whitespace)
- Accessibility (keyboard navigation, ARIA attributes)
- Integration with form libraries

### E2E Testing

Components should be tested in realistic user workflows:

- Complete form submission with inline creation
- Error handling and recovery
- Keyboard navigation workflows
- Mobile/responsive behavior
- Integration with authentication and permissions

---

## Future Enhancements

### Planned Features

1. **Entity Templates**: Quick creation with predefined settings
2. **Bulk Operations**: Create multiple entities at once
3. **Advanced Validation**: Custom validation rules and constraints
4. **Recent Entities**: Show recently used entities at top of list
5. **Entity Colors**: Visual distinction with color coding

### Component Extensions

1. **TagSelect**: Inline tag creation for categorization
2. **UserSelect**: Inline user creation/invitation
3. **LocationSelect**: Inline location creation with geocoding
4. **CustomSelect**: Generic inline creation component for any entity type

---

## Maintenance

### Code Quality

- Follow TypeScript strict mode requirements
- Use consistent naming conventions
- Implement proper error boundaries
- Maintain comprehensive test coverage

### Documentation

- Keep component documentation up-to-date
- Include usage examples for all props
- Document error handling patterns
- Maintain changelog for breaking changes

### Performance Monitoring

- Monitor component render performance
- Track mutation success/failure rates
- Analyze user interaction patterns
- Optimize based on real usage data
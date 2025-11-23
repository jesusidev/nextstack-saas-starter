# Permission Patterns - Frontend Development Guide

**Technical Documentation** | **Last Updated:** November 9, 2025

---

## Overview

This guide covers the frontend permission patterns used in NextStack SaaS Starter to implement ownership-based access control. These patterns ensure consistent, maintainable, and type-safe permission handling across all UI components.

### Core Principles

1. **Single Source of Truth:** All permission logic centralized in hooks
2. **Declarative UI:** Components declare required permissions, not implement checks
3. **Type Safety:** TypeScript ensures permission consistency
4. **Performance Optimized:** Cached permission data, minimal re-renders

---

## Permission Hook Patterns

### 1. usePermissions Hook

The primary hook for all permission checks:

```typescript
import { usePermissions } from '~/hooks/use-permissions';

function ProductActions({ product }: { product: Product }) {
  const { canEdit, canDelete, canView, isOwner, isAdmin, currentUser } = usePermissions();
  
  // Permission checks are simple boolean functions
  const canEditProduct = canEdit(product);
  const canDeleteProduct = canDelete(product);
  const ownsProduct = isOwner(product);
  
  return (
    <div>
      {canEditProduct && <EditButton />}
      {canDeleteProduct && <DeleteButton />}
      {ownsProduct && <OwnerBadge />}
    </div>
  );
}
```

### 2. Permission Check Functions

The hook provides standardized permission functions:

| Function | Purpose | Returns |
|----------|---------|---------|
| `canEdit(resource)` | Check edit permission | `boolean` |
| `canDelete(resource)` | Check delete permission | `boolean` |
| `canView(resource)` | Check view permission | `boolean` |
| `isOwner(resource)` | Check ownership | `boolean` |
| `isAdmin` | Check admin role | `boolean` |

### 3. Loading State Handling

The hook handles loading states gracefully:

```typescript
function ProductCard({ product }: { product: Product }) {
  const { canEdit, isLoading } = usePermissions();
  
  if (isLoading) {
    return <Skeleton height={100} />;
  }
  
  return (
    <Card>
      {canEdit(product) && <EditButton />}
    </Card>
  );
}
```

---

## Component Patterns

### 1. ResourceOwner Component

Declarative permission-based rendering:

```typescript
import { ResourceOwner } from '~/components/ResourceOwner';

// Basic usage
<ResourceOwner resource={product} permission="edit">
  <ActionIcon onClick={() => onEdit(product.id)}>
    <IconPencil />
  </ActionIcon>
</ResourceOwner>

// With fallback
<ResourceOwner 
  resource={product} 
  permission="delete"
  fallback={<Text color="dimmed">Cannot delete</Text>}
>
  <ActionIcon color="red" onClick={() => onDelete(product.id)}>
    <IconTrash />
  </ActionIcon>
</ResourceOwner>

// With loading skeleton
<ResourceOwner 
  resource={product} 
  permission="edit"
  showLoadingSkeleton
>
  <EditButton />
</ResourceOwner>
```

### 2. Conditional Action Patterns

Standard pattern for action buttons:

```typescript
function ProductTableActions({ product }: { product: Product }) {
  const { canEdit, canDelete } = usePermissions();
  
  return (
    <Group gap="xs">
      {canEdit(product) && (
        <ActionIcon 
          onClick={() => onEdit(product.id)}
          aria-label={`Edit product ${product.name}`}
        >
          <IconPencil size={16} />
        </ActionIcon>
      )}
      
      {canDelete(product) && (
        <ActionIcon 
          color="red"
          onClick={() => onDelete(product.id)}
          aria-label={`Delete product ${product.name}`}
        >
          <IconTrash size={16} />
        </ActionIcon>
      )}
      
      {/* Favorite is always available */}
      <FavoriteButton productId={product.id} />
    </Group>
  );
}
```

### 3. Owner Badge Pattern

Display ownership information:

```typescript
function ProductOwnerInfo({ product }: { product: Product }) {
  const { isOwner } = usePermissions();
  
  return (
    <Group gap="xs">
      <IconUser size={16} />
      <Text size="sm">
        {product.user?.firstName} {product.user?.lastName}
      </Text>
      
      {isOwner(product) && (
        <Badge size="xs" color="blue" variant="light">
          Owner
        </Badge>
      )}
    </Group>
  );
}
```

---

## Advanced Patterns

### 1. Permission-Based Navigation

Control navigation menu items:

```typescript
function DashboardNavigation() {
  const { isAdmin } = usePermissions();
  
  const navigationItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Products', href: '/products' },
    { label: 'Projects', href: '/projects' },
    // Admin-only items
    ...(isAdmin ? [
      { label: 'Admin', href: '/admin' },
      { label: 'System Stats', href: '/admin/stats' }
    ] : [])
  ];
  
  return (
    <Navigation items={navigationItems} />
  );
}
```

### 2. Bulk Action Permissions

Handle permissions for bulk operations:

```typescript
function BulkActions({ selectedProducts }: { selectedProducts: Product[] }) {
  const { canEdit, canDelete } = usePermissions();
  
  // Check if user can perform bulk actions on ALL selected items
  const canBulkEdit = selectedProducts.every(canEdit);
  const canBulkDelete = selectedProducts.every(canDelete);
  
  return (
    <Group>
      <Button 
        disabled={!canBulkEdit}
        onClick={() => bulkEdit(selectedProducts)}
      >
        Bulk Edit
      </Button>
      
      <Button 
        color="red"
        disabled={!canBulkDelete}
        onClick={() => bulkDelete(selectedProducts)}
      >
        Bulk Delete
      </Button>
    </Group>
  );
}
```

### 3. Form Permission Patterns

Control form fields and submit buttons:

```typescript
function ProductForm({ product }: { product: Product }) {
  const { canEdit } = usePermissions();
  const isEditable = canEdit(product);
  
  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        label="Product Name"
        defaultValue={product.name}
        disabled={!isEditable}
        required
      />
      
      <Textarea
        label="Description"
        defaultValue={product.description}
        disabled={!isEditable}
      />
      
      <Group mt="md">
        <Button 
          type="submit" 
          disabled={!isEditable}
          loading={isSubmitting}
        >
          {isEditable ? 'Save Changes' : 'Read Only'}
        </Button>
      </Group>
    </form>
  );
}
```

---

## Testing Patterns

### 1. Hook Testing

Test permission logic with React Testing Library:

```typescript
// src/hooks/__tests__/use-permissions.test.tsx
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../use-permissions';
import { createTestWrapper } from '../../../test/utils';

describe('usePermissions', () => {
  const wrapper = createTestWrapper({
    user: { id: 'user1', role: 'USER' },
  });

  it('should allow owner to edit resource', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });
    
    const ownedResource = { userId: 'user1', name: 'Test Product' };
    
    expect(result.current.canEdit(ownedResource)).toBe(true);
    expect(result.current.isOwner(ownedResource)).toBe(true);
  });

  it('should deny non-owner from editing resource', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });
    
    const otherResource = { userId: 'user2', name: 'Other Product' };
    
    expect(result.current.canEdit(otherResource)).toBe(false);
    expect(result.current.isOwner(otherResource)).toBe(false);
  });

  it('should allow admin to edit any resource', () => {
    const adminWrapper = createTestWrapper({
      user: { id: 'admin1', role: 'ADMIN' },
    });
    
    const { result } = renderHook(() => usePermissions(), { wrapper: adminWrapper });
    
    const anyResource = { userId: 'user2', name: 'User Product' };
    
    expect(result.current.canEdit(anyResource)).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });
});
```

### 2. Component Testing

Test permission-based UI rendering:

```typescript
// src/components/__tests__/ProductActions.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductActions } from '../ProductActions';
import { createTestWrapper } from '../../../test/utils';

describe('ProductActions', () => {
  const wrapper = createTestWrapper({
    user: { id: 'user1', role: 'USER' },
  });

  it('should show edit button for owned product', () => {
    const ownedProduct = { userId: 'user1', name: 'My Product' };
    
    render(<ProductActions product={ownedProduct} />, { wrapper });
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should not show edit button for unowned product', () => {
    const unownedProduct = { userId: 'user2', name: 'Other Product' };
    
    render(<ProductActions product={unownedProduct} />, { wrapper });
    
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('should show admin actions for admin user', () => {
    const adminWrapper = createTestWrapper({
      user: { id: 'admin1', role: 'ADMIN' },
    });
    
    const anyProduct = { userId: 'user2', name: 'User Product' };
    
    render(<ProductActions product={anyProduct} />, { wrapper: adminWrapper });
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
```

### 3. E2E Testing

Test complete permission flows:

```typescript
// e2e/ownership-permissions.spec.ts
test.describe('Ownership Permissions', () => {
  test('owner can edit and delete their products', async ({ page }) => {
    await signInTestUser(page, '/dashboard');
    
    // Find owned product
    const ownedProduct = page.locator('[data-owned="true"]').first();
    await expect(ownedProduct).toBeVisible();
    
    // Verify edit button exists
    const editButton = ownedProduct.locator('[data-testid="edit-button"]');
    await expect(editButton).toBeVisible();
    
    // Verify delete button exists
    const deleteButton = ownedProduct.locator('[data-testid="delete-button"]');
    await expect(deleteButton).toBeVisible();
    
    // Test edit functionality
    await editButton.click();
    await expect(page.locator('[data-testid="product-form"]')).toBeVisible();
  });

  test('non-owner cannot edit or delete others products', async ({ page }) => {
    await signInTestUser(page, '/dashboard');
    
    // Find unowned product (if any exist in test data)
    const unownedProduct = page.locator('[data-owned="false"]').first();
    
    if (await unownedProduct.isVisible()) {
      // Verify edit button doesn't exist
      const editButton = unownedProduct.locator('[data-testid="edit-button"]');
      await expect(editButton).not.toBeVisible();
      
      // Verify delete button doesn't exist
      const deleteButton = unownedProduct.locator('[data-testid="delete-button"]');
      await expect(deleteButton).not.toBeVisible();
    }
  });
});
```

---

## Performance Optimization

### 1. Memoization Patterns

Prevent unnecessary re-renders:

```typescript
import { memo } from 'react';

// Memoize component to prevent re-renders when permissions don't change
const ProductActions = memo(function ProductActions({ product }: { product: Product }) {
  const { canEdit, canDelete } = usePermissions();
  
  // Memoize permission checks
  const canEditProduct = useMemo(() => canEdit(product), [product, canEdit]);
  const canDeleteProduct = useMemo(() => canDelete(product), [product, canDelete]);
  
  return (
    <Group>
      {canEditProduct && <EditButton />}
      {canDeleteProduct && <DeleteButton />}
    </Group>
  );
});
```

### 2. Permission Caching

The usePermissions hook uses React Query caching:

```typescript
// Single user query cached for all permission checks
const { data: currentUser } = api.user.get.useQuery({
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Permission calculations use cached data
const canEdit = useCallback((resource: Resource) => {
  if (!currentUser) return false;
  if (currentUser.role === 'ADMIN') return true;
  return resource.userId === currentUser.id;
}, [currentUser]);
```

### 3. Selective Updates

Only re-render when relevant permissions change:

```typescript
// Custom hook for specific permission type
export const useCanEdit = () => {
  const { canEdit } = usePermissions();
  return canEdit;
};

// Component only subscribes to edit permission
function EditButton({ product }: { product: Product }) {
  const canEdit = useCanEdit();
  
  if (!canEdit(product)) return null;
  
  return <Button>Edit</Button>;
}
```

---

## Accessibility Patterns

### 1. ARIA Labels

Provide accessible names for permission-based actions:

```typescript
<ActionIcon
  onClick={() => onEdit(product.id)}
  aria-label={`Edit product ${product.name}`}
  aria-describedby={`product-${product.id}-owner`}
>
  <IconPencil />
</ActionIcon>
```

### 2. Disabled State Communication

Clearly communicate why actions are disabled:

```typescript
<Button
  disabled={!canEdit(product)}
  aria-disabled={!canEdit(product)}
  aria-label={
    canEdit(product) 
      ? `Edit product ${product.name}`
      : `Cannot edit product ${product.name} - you are not the owner`
  }
>
  Edit
</Button>
```

### 3. Screen Reader Announcements

Announce permission changes:

```typescript
function PermissionStatus({ resource }: { resource: Resource }) {
  const { isOwner, isAdmin } = usePermissions();
  
  return (
    <div aria-live="polite" className="sr-only">
      {isOwner(resource) && 'You are the owner of this resource'}
      {isAdmin && 'You have administrator privileges'}
    </div>
  );
}
```

---

## Error Handling Patterns

### 1. Permission Denied UI

Handle permission failures gracefully:

```typescript
function ProtectedAction({ resource, permission, children }: Props) {
  const { canEdit, canDelete } = usePermissions();
  
  const hasPermission = permission === 'edit' ? canEdit(resource) : canDelete(resource);
  
  if (!hasPermission) {
    return (
      <Tooltip label="You don't have permission to perform this action">
        <ActionIcon disabled>
          <IconLock size={16} />
        </ActionIcon>
      </Tooltip>
    );
  }
  
  return <>{children}</>;
}
```

### 2. Fallback Content

Provide appropriate fallbacks:

```typescript
<ResourceOwner 
  resource={product} 
  permission="edit"
  fallback={
    <Group gap="xs">
      <IconLock size={14} color="dimmed" />
      <Text size="xs" color="dimmed">Read only</Text>
    </Group>
  }
>
  <EditButton />
</ResourceOwner>
```

### 3. Error Boundaries

Catch permission-related errors:

```typescript
class PermissionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    if (error.message.includes('permission')) {
      return { hasError: true };
    }
    return null;
  }

  render() {
    if (this.state.hasError) {
      return <Alert color="red">Permission error occurred</Alert>;
    }

    return this.props.children;
  }
}
```

---

## Migration Guide

### From Manual Checks to Permission Hook

#### Before (Manual Checks)

```typescript
function ProductActions({ product, currentUser }: Props) {
  const canEdit = currentUser?.id === product.userId || currentUser?.role === 'ADMIN';
  
  return (
    <div>
      {canEdit && <EditButton />}
    </div>
  );
}
```

#### After (Permission Hook)

```typescript
function ProductActions({ product }: Props) {
  const { canEdit } = usePermissions();
  
  return (
    <div>
      {canEdit(product) && <EditButton />}
    </div>
  );
}
```

### Benefits of Migration

1. **Centralized Logic:** All permission logic in one place
2. **Type Safety:** TypeScript ensures consistency
3. **Testability:** Easier to unit test permission logic
4. **Performance:** Cached permission data
5. **Maintainability:** Single source of truth

---

## Best Practices

### 1. Do's

- ✅ Use `usePermissions` hook for all permission checks
- ✅ Use `ResourceOwner` component for conditional rendering
- ✅ Provide accessible labels for permission-based actions
- ✅ Handle loading states gracefully
- ✅ Test permission logic thoroughly

### 2. Don'ts

- ❌ Don't implement manual permission checks in components
- ❌ Don't pass user data directly to components for permission checks
- ❌ Don't assume permissions without checking
- ❌ Don't show disabled buttons without explanation
- ❌ Don't forget to test admin and non-owner scenarios

### 3. Code Style

```typescript
// ✅ Good: Clear permission check
{canEdit(product) && <EditButton />}

// ✅ Good: Declarative with ResourceOwner
<ResourceOwner resource={product} permission="edit">
  <EditButton />
</ResourceOwner>

// ❌ Bad: Manual permission logic
{currentUser?.id === product.userId && <EditButton />}

// ❌ Bad: Complex inline logic
{currentUser && (currentUser.role === 'ADMIN' || currentUser.id === product.userId) && <EditButton />}
```

---

## Troubleshooting

### Common Issues

#### "Permission hook returns undefined"

**Cause:** User data not loaded
**Solution:** Handle loading state

```typescript
const { canEdit, isLoading } = usePermissions();

if (isLoading) {
  return <Skeleton />;
}
```

#### "Permissions not updating after role change"

**Cause:** React Query cache not invalidated
**Solution:** Invalidate user cache

```typescript
// After role change
utils.user.get.invalidate();
```

#### "Too many re-renders with permission checks"

**Cause:** Permission functions called on every render
**Solution:** Memoize permission checks

```typescript
const canEditProduct = useMemo(() => canEdit(product), [product, canEdit]);
```

---

## Related Documentation

- **[Ownership Middleware](./ownership-middleware.md)** - Backend permission patterns
- **[Admin Endpoints](../api/admin-endpoints.md)** - Admin API documentation
- **[User Guide](../features/ownership-access-control.md)** - End-user documentation
- **[Testing Guide](../testing/ownership-testing.md)** - Testing patterns and examples

---

**Last Updated:** November 9, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
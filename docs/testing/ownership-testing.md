# Ownership Testing Guide

**Testing Documentation** | **Last Updated:** November 9, 2025

---

## Overview

This guide covers comprehensive testing strategies for the ownership-based access control feature in NextStack SaaS Starter. It includes unit tests, integration tests, and E2E tests for both backend and frontend permission logic.

### Testing Philosophy

1. **Security First:** All permission boundaries must be tested
2. **Comprehensive Coverage:** Test owner, non-owner, and admin scenarios
3. **Edge Cases:** Test orphaned resources, null values, and error conditions
4. **Performance:** Ensure permission checks don't impact performance
5. **Accessibility:** Test permission-based UI with screen readers

---

## Backend Testing

### Unit Testing Ownership Middleware

Test the core ownership validation logic:

```typescript
// src/__tests__/api/middleware/ownership.test.ts
import { createOwnershipMiddleware } from '~/server/api/middleware/ownership';
import { TRPCError } from '@trpc/server';
import { createMockContext } from '../../../test/utils';

describe('Ownership Middleware', () => {
  let mockCtx: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockNext = jest.fn();
    mockCtx = createMockContext();
  });

  describe('Resource Validation', () => {
    it('should pass for valid owner', async () => {
      // Arrange
      const middleware = createOwnershipMiddleware(
        (id) => Promise.resolve({ id, userId: 'user1' }),
        'product'
      );
      mockCtx.auth.userId = 'user1';
      mockCtx.auth.role = 'USER';

      // Act
      await middleware({ ctx: mockCtx, next: mockNext, input: { id: 'prod1' } });

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          ctx: expect.objectContaining({
            resource: { id: 'prod1', userId: 'user1' },
            isAdminOverride: false,
          }),
        })
      );
    });

    it('should allow admin bypass', async () => {
      // Arrange
      const middleware = createOwnershipMiddleware(
        (id) => Promise.resolve({ id, userId: 'user2' }),
        'product'
      );
      mockCtx.auth.userId = 'admin1';
      mockCtx.auth.role = 'ADMIN';

      // Act
      await middleware({ ctx: mockCtx, next: mockNext, input: { id: 'prod1' } });

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          ctx: expect.objectContaining({
            isAdminOverride: true,
          }),
        })
      );
    });

    it('should reject non-owner', async () => {
      // Arrange
      const middleware = createOwnershipMiddleware(
        (id) => Promise.resolve({ id, userId: 'user2' }),
        'product'
      );
      mockCtx.auth.userId = 'user1';
      mockCtx.auth.role = 'USER';

      // Act & Assert
      await expect(
        middleware({ ctx: mockCtx, next: mockNext, input: { id: 'prod1' } })
      ).rejects.toThrow(TRPCError);

      const error = await middleware({ ctx: mockCtx, next: mockNext, input: { id: 'prod1' } })
        .catch(e => e);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('You do not have permission to modify this product');
    });

    it('should reject orphaned resource', async () => {
      // Arrange
      const middleware = createOwnershipMiddleware(
        (id) => Promise.resolve({ id, userId: null }),
        'product'
      );
      mockCtx.auth.userId = 'user1';
      mockCtx.auth.role = 'USER';

      // Act & Assert
      await expect(
        middleware({ ctx: mockCtx, next: mockNext, input: { id: 'prod1' } })
      ).rejects.toThrow('This product has no owner');
    });

    it('should reject missing resource', async () => {
      // Arrange
      const middleware = createOwnershipMiddleware(
        (id) => Promise.resolve(null),
        'product'
      );
      mockCtx.auth.userId = 'user1';

      // Act & Assert
      await expect(
        middleware({ ctx: mockCtx, next: mockNext, input: { id: 'prod1' } })
      ).rejects.toThrow('product not found');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
```

### Integration Testing tRPC Procedures

Test complete procedure flows with ownership:

```typescript
// src/__tests__/api/routers/product.test.ts
import { createCallerFactory } from '~/server/api/trpc';
import { createTRPCContext } from '~/server/api/trpc';
import { productRouter } from '~/server/api/routers/product';
import { createTestUser, createTestProduct, wipeDatabase } from '../../../test/helpers';

describe('Product Router Ownership', () => {
  let caller: any;
  let user1: any, user2: any, admin: any;
  let product1: any, product2: any;

  beforeAll(async () => {
    await wipeDatabase();
    
    // Create test users
    user1 = await createTestUser({ role: 'USER' });
    user2 = await createTestUser({ role: 'USER' });
    admin = await createTestUser({ role: 'ADMIN' });
    
    // Create test products
    product1 = await createTestProduct({ userId: user1.id, name: 'User1 Product' });
    product2 = await createTestProduct({ userId: user2.id, name: 'User2 Product' });
  });

  describe('Update Product', () => {
    it('should allow owner to update product', async () => {
      // Arrange
      const ctx = await createTRPCContext({ auth: { userId: user1.id, role: 'USER' } });
      const createCaller = createCallerFactory(productRouter);
      caller = createCaller(ctx);

      // Act
      const result = await caller.update({
        id: product1.id,
        name: 'Updated by Owner',
      });

      // Assert
      expect(result.name).toBe('Updated by Owner');
      expect(result.userId).toBe(user1.id);
    });

    it('should reject non-owner from updating product', async () => {
      // Arrange
      const ctx = await createTRPCContext({ auth: { userId: user2.id, role: 'USER' } });
      const createCaller = createCallerFactory(productRouter);
      caller = createCaller(ctx);

      // Act & Assert
      await expect(
        caller.update({
          id: product1.id,
          name: 'Hacked by Non-Owner',
        })
      ).rejects.toThrow('FORBIDDEN');
    });

    it('should allow admin to update any product', async () => {
      // Arrange
      const ctx = await createTRPCContext({ auth: { userId: admin.id, role: 'ADMIN' } });
      const createCaller = createCallerFactory(productRouter);
      caller = createCaller(ctx);

      // Act
      const result = await caller.update({
        id: product1.id,
        name: 'Updated by Admin',
      });

      // Assert
      expect(result.name).toBe('Updated by Admin');
      expect(result.userId).toBe(user1.id); // Owner doesn't change
    });
  });

  describe('Delete Product', () => {
    it('should allow owner to delete product', async () => {
      // Arrange
      const productToDelete = await createTestProduct({ userId: user1.id });
      const ctx = await createTRPCContext({ auth: { userId: user1.id, role: 'USER' } });
      const createCaller = createCallerFactory(productRouter);
      caller = createCaller(ctx);

      // Act
      const result = await caller.delete({ id: productToDelete.id });

      // Assert
      expect(result.id).toBe(productToDelete.id);
      
      // Verify deletion
      const deleted = await prisma.product.findUnique({ where: { id: productToDelete.id } });
      expect(deleted).toBeNull();
    });

    it('should reject non-owner from deleting product', async () => {
      // Arrange
      const ctx = await createTRPCContext({ auth: { userId: user2.id, role: 'USER' } });
      const createCaller = createCallerFactory(productRouter);
      caller = createCaller(ctx);

      // Act & Assert
      await expect(
        caller.delete({ id: product1.id })
      ).rejects.toThrow('FORBIDDEN');
      
      // Verify product still exists
      const exists = await prisma.product.findUnique({ where: { id: product1.id } });
      expect(exists).not.toBeNull();
    });
  });

  describe('Query Products', () => {
    it('should only return user\'s own products', async () => {
      // Arrange
      const ctx = await createTRPCContext({ auth: { userId: user1.id, role: 'USER' } });
      const createCaller = createCallerFactory(productRouter);
      caller = createCaller(ctx);

      // Act
      const result = await caller.products({});

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(product1.id);
      expect(result[0].userId).toBe(user1.id);
    });

    it('should return all products for admin', async () => {
      // Arrange
      const ctx = await createTRPCContext({ auth: { userId: admin.id, role: 'ADMIN' } });
      const createCaller = createCallerFactory(productRouter);
      caller = createCaller(ctx);

      // Act
      const result = await caller.products({});

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(p => p.id)).toContain(product1.id);
      expect(result.map(p => p.id)).toContain(product2.id);
    });
  });
});
```

### Admin Router Testing

Test admin-specific functionality:

```typescript
// src/__tests__/api/routers/admin.test.ts
describe('Admin Router', () => {
  let adminCaller: any;
  let userCaller: any;

  beforeAll(async () => {
    const adminCtx = await createTRPCContext({ auth: { userId: admin.id, role: 'ADMIN' } });
    const userCtx = await createTRPCContext({ auth: { userId: user1.id, role: 'USER' } });
    
    const createCaller = createCallerFactory(adminRouter);
    adminCaller = createCaller(adminCtx);
    userCaller = createCaller(userCtx);
  });

  describe('Authorization', () => {
    it('should allow admin to access admin endpoints', async () => {
      const result = await adminCaller.statsOverview();
      expect(result.totalUsers).toBeGreaterThan(0);
    });

    it('should reject non-admin from accessing admin endpoints', async () => {
      await expect(userCaller.statsOverview()).rejects.toThrow('UNAUTHORIZED');
    });
  });

  describe('Bulk Operations', () => {
    it('should perform bulk delete successfully', async () => {
      // Create test products
      const products = await Promise.all([
        createTestProduct({ userId: user1.id }),
        createTestProduct({ userId: user1.id }),
        createTestProduct({ userId: user2.id }),
      ]);

      // Act
      const result = await adminCaller.productsBulkDelete({
        productIds: products.map(p => p.id),
      });

      // Assert
      expect(result.deleted).toBe(3);
      
      // Verify all deleted
      const remaining = await prisma.product.count({
        where: { id: { in: products.map(p => p.id) } }
      });
      expect(remaining).toBe(0);
    });

    it('should perform bulk update successfully', async () => {
      // Create test products
      const products = await Promise.all([
        createTestProduct({ userId: user1.id, status: 'ACTIVE' }),
        createTestProduct({ userId: user1.id, status: 'ACTIVE' }),
      ]);

      // Act
      const result = await adminCaller.productsBulkUpdate({
        productIds: products.map(p => p.id),
        data: { status: 'INACTIVE' },
      });

      // Assert
      expect(result.updated).toBe(2);
      
      // Verify status updated
      const updated = await prisma.product.findMany({
        where: { id: { in: products.map(p => p.id) } }
      });
      expect(updated.every(p => p.status === 'INACTIVE')).toBe(true);
    });
  });
});
```

---

## Frontend Testing

### Permission Hook Testing

Test the usePermissions hook logic:

```typescript
// src/hooks/__tests__/use-permissions.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePermissions } from '../use-permissions';
import { createTestWrapper } from '../../../test/utils';

describe('usePermissions', () => {
  let queryClient: QueryClient;
  let wrapper: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }: any) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  describe('Owner Permissions', () => {
    it('should allow owner to edit resource', async () => {
      // Arrange
      const mockUser = { id: 'user1', role: 'USER' as const };
      const mockResource = { userId: 'user1', name: 'Test Product' };
      
      jest.spyOn(api, 'useUserGet').mockReturnValue({
        data: mockUser,
        isLoading: false,
      } as any);

      // Act
      const { result } = renderHook(() => usePermissions(), { wrapper });

      // Assert
      expect(result.current.canEdit(mockResource)).toBe(true);
      expect(result.current.canDelete(mockResource)).toBe(true);
      expect(result.current.isOwner(mockResource)).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });

    it('should deny non-owner from editing resource', async () => {
      // Arrange
      const mockUser = { id: 'user1', role: 'USER' as const };
      const mockResource = { userId: 'user2', name: 'Other Product' };
      
      jest.spyOn(api, 'useUserGet').mockReturnValue({
        data: mockUser,
        isLoading: false,
      } as any);

      // Act
      const { result } = renderHook(() => usePermissions(), { wrapper });

      // Assert
      expect(result.current.canEdit(mockResource)).toBe(false);
      expect(result.current.canDelete(mockResource)).toBe(false);
      expect(result.current.isOwner(mockResource)).toBe(false);
    });
  });

  describe('Admin Permissions', () => {
    it('should allow admin to edit any resource', async () => {
      // Arrange
      const mockAdmin = { id: 'admin1', role: 'ADMIN' as const };
      const mockResource = { userId: 'user2', name: 'User Product' };
      
      jest.spyOn(api, 'useUserGet').mockReturnValue({
        data: mockAdmin,
        isLoading: false,
      } as any);

      // Act
      const { result } = renderHook(() => usePermissions(), { wrapper });

      // Assert
      expect(result.current.canEdit(mockResource)).toBe(true);
      expect(result.current.canDelete(mockResource)).toBe(true);
      expect(result.current.isAdmin).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined resource', async () => {
      // Arrange
      const mockUser = { id: 'user1', role: 'USER' as const };
      
      jest.spyOn(api, 'useUserGet').mockReturnValue({
        data: mockUser,
        isLoading: false,
      } as any);

      // Act
      const { result } = renderHook(() => usePermissions(), { wrapper });

      // Assert
      expect(result.current.canEdit(undefined)).toBe(false);
      expect(result.current.canDelete(undefined)).toBe(false);
      expect(result.current.isOwner(undefined)).toBe(false);
    });

    it('should handle null userId resource', async () => {
      // Arrange
      const mockUser = { id: 'user1', role: 'USER' as const };
      const mockResource = { userId: null, name: 'Orphaned Product' };
      
      jest.spyOn(api, 'useUserGet').mockReturnValue({
        data: mockUser,
        isLoading: false,
      } as any);

      // Act
      const { result } = renderHook(() => usePermissions(), { wrapper });

      // Assert
      expect(result.current.canEdit(mockResource)).toBe(false);
      expect(result.current.isOwner(mockResource)).toBe(false);
    });

    it('should handle loading state', async () => {
      // Arrange
      jest.spyOn(api, 'useUserGet').mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      // Act
      const { result } = renderHook(() => usePermissions(), { wrapper });

      // Assert
      expect(result.current.isLoading).toBe(true);
      expect(result.current.canEdit({ userId: 'user1' })).toBe(false);
    });
  });
});
```

### Component Testing

Test permission-based UI components:

```typescript
// src/components/__tests__/ResourceOwner.test.tsx
import { render, screen } from '@testing-library/react';
import { ResourceOwner } from '../ResourceOwner';
import { createTestWrapper } from '../../../test/utils';

describe('ResourceOwner', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = createTestWrapper({
      user: { id: 'user1', role: 'USER' },
    });
  });

  describe('Permission-Based Rendering', () => {
    it('should render children for owner with edit permission', () => {
      // Arrange
      const ownedResource = { userId: 'user1', name: 'My Product' };

      // Act
      render(
        <ResourceOwner resource={ownedResource} permission="edit">
          <button data-testid="edit-button">Edit</button>
        </ResourceOwner>,
        { wrapper }
      );

      // Assert
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    });

    it('should render fallback for non-owner with edit permission', () => {
      // Arrange
      const unownedResource = { userId: 'user2', name: 'Other Product' };

      // Act
      render(
        <ResourceOwner 
          resource={unownedResource} 
          permission="edit"
          fallback={<div data-testid="no-permission">No Permission</div>}
        >
          <button data-testid="edit-button">Edit</button>
        </ResourceOwner>,
        { wrapper }
      );

      // Assert
      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
      expect(screen.getByTestId('no-permission')).toBeInTheDocument();
    });

    it('should render children for admin with any permission', () => {
      // Arrange
      const adminWrapper = createTestWrapper({
        user: { id: 'admin1', role: 'ADMIN' },
      });
      const anyResource = { userId: 'user2', name: 'User Product' };

      // Act
      render(
        <ResourceOwner resource={anyResource} permission="delete">
          <button data-testid="delete-button">Delete</button>
        </ResourceOwner>,
        { wrapper: adminWrapper }
      );

      // Assert
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show skeleton when loading and showLoadingSkeleton is true', () => {
      // Arrange
      const loadingWrapper = createTestWrapper({
        user: { id: 'user1', role: 'USER' },
        loading: true,
      });
      const resource = { userId: 'user1', name: 'Test' };

      // Act
      render(
        <ResourceOwner 
          resource={resource} 
          permission="edit"
          showLoadingSkeleton
        >
          <div>Content</div>
        </ResourceOwner>,
        { wrapper: loadingWrapper }
      );

      // Assert
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should render nothing when loading and showLoadingSkeleton is false', () => {
      // Arrange
      const loadingWrapper = createTestWrapper({
        user: { id: 'user1', role: 'USER' },
        loading: true,
      });
      const resource = { userId: 'user1', name: 'Test' };

      // Act
      const { container } = render(
        <ResourceOwner 
          resource={resource} 
          permission="edit"
          showLoadingSkeleton={false}
        >
          <div>Content</div>
        </ResourceOwner>,
        { wrapper: loadingWrapper }
      );

      // Assert
      expect(container.firstChild).toBeNull();
    });
  });
});
```

### Integration Testing with tRPC

Test frontend components with real tRPC calls:

```typescript
// src/components/__tests__/ProductTable.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductTable } from '../ProductTable';
import { createTestWrapper, setupTestServer } from '../../../test/utils';

// Setup MSW for API mocking
const server = setupTestServer();

describe('ProductTable Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should show edit buttons only for owned products', async () => {
    // Arrange
    const wrapper = createTestWrapper({
      user: { id: 'user1', role: 'USER' },
    });

    // Mock API responses
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.json([
          { id: 'prod1', name: 'Owned Product', userId: 'user1' },
          { id: 'prod2', name: 'Other Product', userId: 'user2' },
        ]));
      })
    );

    // Act
    render(<ProductTable />, { wrapper });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Owned Product')).toBeInTheDocument();
      expect(screen.getByText('Other Product')).toBeInTheDocument();
    });

    // Check edit buttons
    const ownedRow = screen.getByText('Owned Product').closest('tr');
    const otherRow = screen.getByText('Other Product').closest('tr');

    expect(ownedRow?.querySelector('[data-testid="edit-button"]')).toBeInTheDocument();
    expect(otherRow?.querySelector('[data-testid="edit-button"]')).not.toBeInTheDocument();
  });

  it('should handle edit action for owned product', async () => {
    // Arrange
    const wrapper = createTestWrapper({
      user: { id: 'user1', role: 'USER' },
    });

    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.json([
          { id: 'prod1', name: 'Owned Product', userId: 'user1' },
        ]));
      }),
      rest.put('/api/products/:id', (req, res, ctx) => {
        return res(ctx.json({ id: 'prod1', name: 'Updated Product' }));
      })
    );

    // Act
    render(<ProductTable />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('edit-button'));
    await userEvent.type(screen.getByDisplayValue('Owned Product'), ' Updated');
    await userEvent.click(screen.getByText('Save'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Updated Product')).toBeInTheDocument();
    });
  });
});
```

---

## E2E Testing

### Permission Flow Testing

Test complete user flows with Playwright:

```typescript
// e2e/ownership-permissions.spec.ts
import { test, expect } from '@playwright/test';
import { signInTestUser, signInAdmin } from './support/authHelpers';

test.describe('Ownership-Based Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test.describe('Product Ownership', () => {
    test('owner can edit and delete their products', async ({ page }) => {
      // Arrange
      await signInTestUser(page, '/dashboard');
      
      // Create a test product
      await page.click('[data-testid="create-product-button"]');
      await page.fill('[data-testid="product-name-input"]', 'Test Product');
      await page.click('[data-testid="submit-button"]');
      
      // Wait for product to appear
      await expect(page.locator('text=Test Product')).toBeVisible();
      
      // Act & Assert - Edit button visible
      const productRow = page.locator('text=Test Product').closest('tr');
      const editButton = productRow.locator('[data-testid="edit-button"]');
      await expect(editButton).toBeVisible();
      
      // Act & Assert - Delete button visible
      const deleteButton = productRow.locator('[data-testid="delete-button"]');
      await expect(deleteButton).toBeVisible();
      
      // Act - Test edit functionality
      await editButton.click();
      await expect(page.locator('[data-testid="product-form"]')).toBeVisible();
      await page.fill('[data-testid="product-name-input"]', 'Updated Product');
      await page.click('[data-testid="submit-button"]');
      
      // Assert - Product updated
      await expect(page.locator('text=Updated Product')).toBeVisible();
      
      // Act - Test delete functionality
      const deleteButtonUpdated = page.locator('text=Updated Product').closest('tr')
        .locator('[data-testid="delete-button"]');
      await deleteButtonUpdated.click();
      await page.click('[data-testid="confirm-delete"]');
      
      // Assert - Product deleted
      await expect(page.locator('text=Updated Product')).not.toBeVisible();
    });

    test('non-owner cannot edit or delete others products', async ({ page }) => {
      // Arrange - Sign in as user who doesn't own the test product
      await signInTestUser(page, '/dashboard');
      
      // Note: This test assumes there's at least one product not owned by the test user
      // In a real test environment, you'd set up specific test data
      
      // Look for products not owned by current user
      const products = page.locator('[data-product-row]');
      const count = await products.count();
      
      if (count > 0) {
        // Check first product
        const firstProduct = products.first();
        const isOwned = await firstProduct.locator('[data-owned="true"]').isVisible();
        
        if (!isOwned) {
          // Assert - No edit button
          const editButton = firstProduct.locator('[data-testid="edit-button"]');
          await expect(editButton).not.toBeVisible();
          
          // Assert - No delete button
          const deleteButton = firstProduct.locator('[data-testid="delete-button"]');
          await expect(deleteButton).not.toBeVisible();
          
          // Assert - Owner badge not present
          const ownerBadge = firstProduct.locator('text=Owner');
          await expect(ownerBadge).not.toBeVisible();
        }
      }
    });
  });

  test.describe('Admin Permissions', () => {
    test('admin can access admin dashboard', async ({ page }) => {
      // Arrange
      await signInAdmin(page, '/admin');
      
      // Assert - Admin dashboard loads
      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
      await expect(page.locator('text=System Statistics')).toBeVisible();
    });

    test('admin can view all products', async ({ page }) => {
      // Arrange
      await signInAdmin(page, '/admin/products');
      
      // Assert - Can see products from all users
      const productRows = page.locator('[data-testid="admin-product-row"]');
      await expect(productRows).toHaveCount.greaterThan(0);
      
      // Assert - Can see user information
      const firstRow = productRows.first();
      await expect(firstRow.locator('[data-testid="user-info"]')).toBeVisible();
    });

    test('admin can perform bulk operations', async ({ page }) => {
      // Arrange
      await signInAdmin(page, '/admin/products');
      
      // Act - Select products
      const checkboxes = page.locator('[data-testid="product-checkbox"]');
      const count = await checkboxes.count();
      
      if (count >= 2) {
        await checkboxes.first().check();
        await checkboxes.nth(1).check();
        
        // Act - Perform bulk operation
        await page.click('[data-testid="bulk-actions-menu"]');
        await page.click('[data-testid="bulk-delete"]');
        await page.click('[data-testid="confirm-bulk-delete"]');
        
        // Assert - Success notification
        await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
        await expect(page.locator('text=deleted successfully')).toBeVisible();
      }
    });
  });

  test.describe('Permission Indicators', () => {
    test('owner badge displays correctly', async ({ page }) => {
      // Arrange
      await signInTestUser(page, '/dashboard');
      
      // Create a product
      await page.click('[data-testid="create-product-button"]');
      await page.fill('[data-testid="product-name-input"]', 'Owner Badge Test');
      await page.click('[data-testid="submit-button"]');
      
      // Assert - Owner badge visible
      await expect(page.locator('text=Owner Badge Test')).toBeVisible();
      const productRow = page.locator('text=Owner Badge Test').closest('tr');
      const ownerBadge = productRow.locator('[data-testid="owner-badge"]');
      await expect(ownerBadge).toBeVisible();
      await expect(ownerBadge).toHaveText('Owner');
    });

    test('permission buttons have proper accessibility labels', async ({ page }) => {
      // Arrange
      await signInTestUser(page, '/dashboard');
      
      // Create a product
      await page.click('[data-testid="create-product-button"]');
      await page.fill('[data-testid="product-name-input"]', 'A11y Test Product');
      await page.click('[data-testid="submit-button"]');
      
      // Assert - Edit button has proper aria-label
      const editButton = page.locator('[data-testid="edit-button"]');
      await expect(editButton).toHaveAttribute('aria-label', /Edit product/i);
      
      // Assert - Delete button has proper aria-label
      const deleteButton = page.locator('[data-testid="delete-button"]');
      await expect(deleteButton).toHaveAttribute('aria-label', /Delete product/i);
    });
  });
});
```

### Security Testing

Test that security boundaries are enforced:

```typescript
// e2e/security-boundaries.spec.ts
test.describe('Security Boundaries', () => {
  test('cannot access others resources via direct URL manipulation', async ({ page }) => {
    // Arrange
    await signInTestUser(page, '/dashboard');
    
    // Try to access another user's product directly
    // This assumes we know a product ID that belongs to another user
    await page.goto('/products/other-user-product-id');
    
    // Assert - Should show forbidden or not found
    await expect(page.locator('text=not found')).toBeVisible();
    // Or redirect to dashboard with error message
    await expect(page).toHaveURL('/dashboard');
  });

  test('API endpoints reject unauthorized requests', async ({ page }) => {
    // Arrange
    await signInTestUser(page, '/dashboard');
    
    // Try to call admin endpoint directly
    const response = await page.evaluate(async () => {
      try {
        const result = await fetch('/api/admin.statsOverview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        return { status: result.status, ok: result.ok };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    // Assert
    expect(response.status).toBe(401);
    expect(response.ok).toBe(false);
  });

  test('cannot modify request data to bypass ownership', async ({ page }) => {
    // This test would require more complex setup to intercept and modify requests
    // It's more of a security audit test that would be done manually or with specialized tools
    test.skip(true, 'Requires specialized security testing tools');
  });
});
```

---

## Test Utilities

### Mock Data Factory

Create reusable test data factories:

```typescript
// test/factories.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const createTestUser = async (overrides?: Partial<User>) => {
  return await prisma.user.create({
    data: {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'USER',
      ...overrides,
    },
  });
};

export const createTestProduct = async (overrides?: Partial<Product>) => {
  return await prisma.product.create({
    data: {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      status: 'ACTIVE',
      userId: faker.string.uuid(), // Will be overridden
      ...overrides,
    },
  });
};

export const createTestProject = async (overrides?: Partial<Project>) => {
  return await prisma.project.create({
    data: {
      name: faker.company.name(),
      status: 'ACTIVE',
      userId: faker.string.uuid(), // Will be overridden
      ...overrides,
    },
  });
};

export const wipeDatabase = async () => {
  // Clean up in correct order due to foreign keys
  await prisma.product.deleteMany();
  await prisma.project.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
};
```

### Test Wrapper Factory

Create React Testing Library wrappers:

```typescript
// test/utils.tsx
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { trpc } from '~/utils/trpc';

export const createTestWrapper = (options?: {
  user?: { id: string; role: 'USER' | 'ADMIN' };
  loading?: boolean;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Mock tRPC responses
  const mockTRPC = {
    useUserGet: () => ({
      data: options?.user || { id: 'test-user', role: 'USER' },
      isLoading: options?.loading || false,
    }),
  };

  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={mockTRPC as any}>
          {children}
        </trpc.Provider>
      </QueryClientProvider>
    );
  };
};

export const createMockContext = (overrides?: any) => ({
  auth: {
    userId: 'test-user',
    role: 'USER',
    ...overrides?.auth,
  },
  db: prisma,
  ...overrides,
});
```

### MSW Server Setup

Set up Mock Service Worker for API testing:

```typescript
// test/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const setupTestServer = () => {
  return setupServer(
    // Mock user endpoint
    rest.get('/api/user.get', (req, res, ctx) => {
      return res(ctx.json({
        id: 'test-user',
        email: 'test@example.com',
        role: 'USER',
      }));
    }),

    // Mock products endpoint
    rest.get('/api/products', (req, res, ctx) => {
      return res(ctx.json([
        { id: 'prod1', name: 'Test Product', userId: 'test-user' },
      ]));
    }),

    // Mock admin endpoints
    rest.post('/api/admin.statsOverview', (req, res, ctx) => {
      return res(ctx.json({
        totalUsers: 10,
        totalProducts: 50,
        totalProjects: 20,
      }));
    }),
  );
};
```

---

## Performance Testing

### Permission Check Performance

Test that permission checks don't impact performance:

```typescript
// src/__tests__/performance/permissions.test.ts
describe('Permission Performance', () => {
  it('should handle 1000 permission checks quickly', async () => {
    // Arrange
    const mockUser = { id: 'user1', role: 'USER' };
    const mockResource = { userId: 'user1', name: 'Test' };
    
    jest.spyOn(api, 'useUserGet').mockReturnValue({
      data: mockUser,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => usePermissions());

    // Act
    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      result.current.canEdit(mockResource);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Assert
    expect(duration).toBeLessThan(100); // Should complete in <100ms
  });

  it('should not cause unnecessary re-renders', async () => {
    // Arrange
    const renderSpy = jest.fn();
    
    const TestComponent = () => {
      renderSpy();
      const { canEdit } = usePermissions();
      const canEditTest = canEdit({ userId: 'user1', name: 'Test' });
      return <div>{canEditTest ? 'Can Edit' : 'Cannot Edit'}</div>;
    };

    // Act
    const { rerender } = render(<TestComponent />, { wrapper });
    
    // Re-render with same props
    rerender(<TestComponent />);

    // Assert
    expect(renderSpy).toHaveBeenCalledTimes(2); // Initial + one re-render
  });
});
```

---

## Continuous Integration

### GitHub Actions Workflow

Set up automated testing:

```yaml
# .github/workflows/test-ownership.yml
name: Ownership Feature Tests

on:
  push:
    branches: [main, feature/ownership-access-control]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup test database
        run: |
          docker-compose -f docker-compose.test.yml up -d postgres
          npm run db:test:push
      
      - name: Run backend tests
        run: npm run test:backend -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run frontend tests
        run: npm run test:frontend -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start test server
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 10
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Related Documentation

- **[Ownership Middleware](../development/ownership-middleware.md)** - Backend implementation
- **[Permission Patterns](../development/permission-patterns.md)** - Frontend patterns
- **[Admin Endpoints](../api/admin-endpoints.md)** - API documentation
- **[User Guide](../features/ownership-access-control.md)** - End-user documentation

---

**Last Updated:** November 9, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
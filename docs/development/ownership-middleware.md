# Ownership Middleware - Developer Guide

**Technical Documentation** | **Last Updated:** November 9, 2025

---

## Overview

The ownership middleware system provides secure, reusable access control for tRPC procedures in NextStack SaaS Starter. This guide covers how to use, extend, and test the ownership middleware.

### Architecture

The ownership system follows **Attribute-Based Access Control (ABAC)** with ownership as the primary attribute:

- **Primary Attribute:** `resource.userId === currentUser.id`
- **Admin Override:** `user.role === 'ADMIN'` bypasses ownership checks
- **Extensible:** Ready for future collaboration attributes

---

## Quick Start

### Basic Usage

```typescript
import { requiresProductOwnership } from '~/server/api/middleware/ownership';

// Apply to a procedure
update: protectedProcedure
  .use(requiresProductOwnership)  // ✅ Ownership check
  .input(updateProductInput)
  .mutation(async ({ ctx, input }) => {
    // ctx.resource is pre-loaded and validated
    const product = await ctx.db.product.update({
      where: { id: input.id },
      data: input.data,
    });
    return product;
  });
```

### Available Middleware

| Middleware | Resource | Usage |
|------------|----------|-------|
| `requiresProductOwnership` | Product | `use(requiresProductOwnership)` |
| `requiresProjectOwnership` | Project | `use(requiresProjectOwnership)` |
| `requiresCategoryOwnership` | Category | `use(requiresCategoryOwnership)` |

---

## Core Concepts

### 1. Middleware Pattern

The ownership middleware follows the tRPC middleware pattern:

```typescript
export const createOwnershipMiddleware = <TResource extends ResourceWithOwnership>(
  fetchResource: FetchResourceFunction<TResource>,
  resourceName: string
) => {
  return t.middleware(async ({ ctx, next, input }) => {
    // 1. Validate input has ID
    // 2. Fetch resource
    // 3. Check admin bypass
    // 4. Validate ownership
    // 5. Pass resource to next middleware
  });
};
```

### 2. Resource Shape

Resources must have the minimal shape for ownership validation:

```typescript
type ResourceWithOwnership = {
  userId: string | null;  // Owner ID (null = orphaned)
  id: string;            // Resource ID
};
```

### 3. Context Enhancement

The middleware enhances the tRPC context:

```typescript
// After middleware passes
ctx.resource     // Pre-loaded resource object
ctx.isAdminOverride  // Boolean: true if admin bypass used
```

---

## Implementation Details

### Ownership Validation Flow

```typescript
// 1. Input validation
if (!input?.id) {
  throw new TRPCError({ code: 'BAD_REQUEST' });
}

// 2. Resource fetch
const resource = await fetchResource(input.id, ctx.db);
if (!resource) {
  throw new TRPCError({ code: 'NOT_FOUND' });
}

// 3. Admin bypass
if (ctx.auth.role === 'ADMIN') {
  return next({ ctx: { ...ctx, resource, isAdminOverride: true } });
}

// 4. Ownership check
if (!resource.userId || resource.userId !== ctx.auth.userId) {
  throw new TRPCError({ code: 'FORBIDDEN' });
}

// 5. Success
return next({ ctx: { ...ctx, resource, isAdminOverride: false } });
```

### Error Handling

The middleware provides consistent error responses:

| Error Type | Code | Message | When |
|------------|------|---------|------|
| Missing ID | BAD_REQUEST | "Resource ID is required" | Input validation fails |
| Not Found | NOT_FOUND | "{resource} not found" | Resource doesn't exist |
| No Owner | FORBIDDEN | "This {resource} has no owner" | Resource is orphaned |
| Not Owner | FORBIDDEN | "You do not have permission" | Ownership mismatch |

### Admin Override Detection

```typescript
import { isAdminAction } from '~/server/api/middleware/ownership';

// In your procedure
update: protectedProcedure
  .use(requiresProductOwnership)
  .mutation(async ({ ctx }) => {
    const wasAdminOverride = isAdminAction(ctx);
    
    if (wasAdminOverride) {
      console.info(`Admin ${ctx.auth.userId} updated product ${ctx.resource.id}`);
    } else {
      console.info(`Owner ${ctx.auth.userId} updated product ${ctx.resource.id}`);
    }
    
    // ... update logic
  });
```

---

## Creating Custom Ownership Middleware

### For New Resource Types

```typescript
// 1. Define the middleware
export const requiresCustomResourceOwnership = createOwnershipMiddleware(
  (id, db) => db.customResource.findUnique({
    where: { id },
    select: { id: true, userId: true },
  }),
  'customResource'
);

// 2. Use in router
export const customResourceRouter = createTRPCRouter({
  update: protectedProcedure
    .use(requiresCustomResourceOwnership)
    .input(updateCustomResourceInput)
    .mutation(async ({ ctx, input }) => {
      // ctx.resource is available and validated
      return await ctx.db.customResource.update({
        where: { id: input.id },
        data: input.data,
      });
    }),
});
```

### Advanced Custom Middleware

```typescript
// Custom middleware with additional logic
export const requiresProjectOwnershipWithStats = createOwnershipMiddleware(
  async (id, db) => {
    const project = await db.project.findUnique({
      where: { id },
      select: { 
        id: true, 
        userId: true,
        _count: { select: { product: true } }
      },
    });
    return project;
  },
  'project'
);
```

---

## Frontend Integration

### Permission Hook

```typescript
import { usePermissions } from '~/hooks/use-permissions';

function ProductActions({ product }: { product: Product }) {
  const { canEdit, canDelete, isOwner } = usePermissions();
  
  return (
    <div>
      {canEdit(product) && (
        <Button onClick={() => editProduct(product.id)}>
          Edit
        </Button>
      )}
      
      {canDelete(product) && (
        <Button color="red" onClick={() => deleteProduct(product.id)}>
          Delete
        </Button>
      )}
      
      {isOwner(product) && (
        <Badge color="blue">Owner</Badge>
      )}
    </div>
  );
}
```

### Resource Owner Component

```typescript
import { ResourceOwner } from '~/components/ResourceOwner';

// Declarative permission-based rendering
<ResourceOwner resource={product} permission="edit">
  <ActionIcon onClick={() => onEdit(product.id)}>
    <IconPencil />
  </ActionIcon>
</ResourceOwner>

<ResourceOwner resource={product} permission="delete">
  <ActionIcon color="red" onClick={() => onDelete(product.id)}>
    <IconTrash />
  </ActionIcon>
</ResourceOwner>
```

---

## Testing Patterns

### Backend Testing

```typescript
// src/__tests__/api/ownership/product.test.ts
describe('Product Ownership Middleware', () => {
  let user1: User, user2: User, admin: User;
  let product1: Product, product2: Product;

  beforeEach(async () => {
    // Setup test users and products
    user1 = await createTestUser();
    user2 = await createTestUser();
    admin = await createTestUser({ role: 'ADMIN' });
    
    product1 = await createTestProduct({ userId: user1.id });
    product2 = await createTestProduct({ userId: user2.id });
  });

  describe('Owner Access', () => {
    it('should allow owner to update product', async () => {
      const result = await caller.product.update({
        id: product1.id,
        name: 'Updated Name',
      }, { ctx: { auth: { userId: user1.id, role: 'USER' } } });

      expect(result.name).toBe('Updated Name');
    });

    it('should allow owner to delete product', async () => {
      await expect(
        caller.product.delete({ id: product1.id }, 
        { ctx: { auth: { userId: user1.id, role: 'USER' } } })
      ).resolves.not.toThrow();
    });
  });

  describe('Non-Owner Access', () => {
    it('should deny non-owner from updating product', async () => {
      await expect(
        caller.product.update({
          id: product1.id,
          name: 'Hacked Name',
        }, { ctx: { auth: { userId: user2.id, role: 'USER' } } })
      ).rejects.toThrow('FORBIDDEN');
    });

    it('should deny non-owner from deleting product', async () => {
      await expect(
        caller.product.delete({ id: product1.id }, 
        { ctx: { auth: { userId: user2.id, role: 'USER' } } })
      ).rejects.toThrow('FORBIDDEN');
    });
  });

  describe('Admin Access', () => {
    it('should allow admin to update any product', async () => {
      const result = await caller.product.update({
        id: product1.id,
        name: 'Admin Updated',
      }, { ctx: { auth: { userId: admin.id, role: 'ADMIN' } } });

      expect(result.name).toBe('Admin Updated');
    });

    it('should allow admin to delete any product', async () => {
      await expect(
        caller.product.delete({ id: product1.id }, 
        { ctx: { auth: { userId: admin.id, role: 'ADMIN' } } })
      ).resolves.not.toThrow();
    });
  });
});
```

### Frontend Testing

```typescript
// src/hooks/__tests__/use-permissions.test.tsx
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../use-permissions';

describe('usePermissions', () => {
  it('should allow owner to edit resource', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: TestWrapper,
    });

    // Mock user and resource
    const currentUser = { id: 'user1', role: 'USER' };
    const resource = { userId: 'user1', name: 'Test Product' };

    // Test permission
    expect(result.current.canEdit(resource)).toBe(true);
    expect(result.current.isOwner(resource)).toBe(true);
  });

  it('should deny non-owner from editing resource', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: TestWrapper,
    });

    const currentUser = { id: 'user1', role: 'USER' };
    const resource = { userId: 'user2', name: 'Other Product' };

    expect(result.current.canEdit(resource)).toBe(false);
    expect(result.current.isOwner(resource)).toBe(false);
  });

  it('should allow admin to edit any resource', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: TestWrapper,
    });

    const currentUser = { id: 'admin1', role: 'ADMIN' };
    const resource = { userId: 'user2', name: 'User Product' };

    expect(result.current.canEdit(resource)).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });
});
```

---

## Performance Considerations

### Database Query Optimization

The ownership middleware uses minimal queries for validation:

```typescript
// ✅ Good: Only fetch required fields
export const requiresProductOwnership = createOwnershipMiddleware(
  (id, db) => db.product.findUnique({
    where: { id },
    select: { id: true, userId: true }, // Minimal fields
  }),
  'product'
);

// ❌ Bad: Fetches entire resource
export const requiresProductOwnership = createOwnershipMiddleware(
  (id, db) => db.product.findUnique({
    where: { id },
    include: { user: true, categories: true }, // Unnecessary data
  }),
  'product'
);
```

### Frontend Caching

The permission hook uses React Query caching:

```typescript
// ✅ Single user query cached for all permission checks
const { data: currentUser } = api.user.get.useQuery();

// Permission calculations use cached data - no additional API calls
const canEdit = (resource) => {
  if (currentUser?.role === 'ADMIN') return true;
  return resource.userId === currentUser?.id;
};
```

---

## Security Best Practices

### 1. Always Use Middleware

```typescript
// ✅ Good: Protected by middleware
update: protectedProcedure
  .use(requiresProductOwnership)
  .mutation(async ({ ctx }) => {
    // Safe - ownership already validated
  });

// ❌ Bad: Manual ownership check
update: protectedProcedure
  .mutation(async ({ ctx, input }) => {
    const product = await ctx.db.product.findUnique({ where: { id: input.id } });
    if (product.userId !== ctx.auth.userId) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    // Error-prone - easy to forget checks
  });
```

### 2. Admin Override Logging

```typescript
// ✅ Good: Log admin actions
if (ctx.auth.role === 'ADMIN') {
  console.info(`Admin ${ctx.auth.userId} accessing ${resourceName} ${resource.id}`);
  return next({ ctx: { ...ctx, resource, isAdminOverride: true } });
}
```

### 3. Consistent Error Messages

```typescript
// ✅ Good: Use consistent error patterns
throw new TRPCError({
  code: 'FORBIDDEN',
  message: `You do not have permission to modify this ${resourceName}`,
});
```

---

## Troubleshooting

### Common Issues

#### "Resource not found" but resource exists

**Cause:** Resource fetch function is incorrect
**Solution:** Verify the fetch function and database query

```typescript
// Check your fetch function
const fetchResource = (id, db) => db.product.findUnique({
  where: { id },  // ✅ Correct
  // where: { productId: id },  // ❌ Wrong field name
});
```

#### "Admin bypass not working"

**Cause:** Role not included in tRPC context
**Solution:** Ensure role is added to context

```typescript
// In trpc.ts context creation
export const createTRPCContext = async (opts: CreateTRPCContextOptions) => {
  const { req, res } = opts;
  const auth = getAuth(req);
  
  // ✅ Include role in context
  const user = auth.userId ? await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, role: true },
  }) : null;

  return {
    db,
    auth: {
      userId: auth?.userId ?? null,
      role: user?.role ?? 'USER',  // ✅ Include role
    },
  };
};
```

#### "Frontend permissions not updating"

**Cause:** React Query cache not invalidated
**Solution:** Invalidate cache after mutations

```typescript
// In your mutation
onSuccess: () => {
  utils.user.get.invalidate();  // ✅ Refresh user data
},
```

### Debug Tips

1. **Check Context:** Log `ctx.auth` to verify user and role
2. **Verify Resource:** Log `ctx.resource` to confirm it's loaded
3. **Test Admin:** Use admin account to test bypass functionality
4. **Check Database:** Verify resource has correct `userId`

---

## Migration Guide

### From Manual Checks to Middleware

#### Before (Manual Checks)

```typescript
update: protectedProcedure
  .input(updateProductInput)
  .mutation(async ({ ctx, input }) => {
    // Manual ownership check
    const product = await ctx.db.product.findUnique({
      where: { id: input.id },
    });
    
    if (!product) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    
    if (product.userId !== ctx.auth.userId) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    
    // Update logic
    return await ctx.db.product.update({
      where: { id: input.id },
      data: input.data,
    });
  });
```

#### After (Middleware)

```typescript
update: protectedProcedure
  .use(requiresProductOwnership)  // ✅ Automatic ownership check
  .input(updateProductInput)
  .mutation(async ({ ctx, input }) => {
    // ctx.resource is pre-loaded and validated
    return await ctx.db.product.update({
      where: { id: input.id },
      data: input.data,
    });
  });
```

### Benefits of Migration

1. **DRY Principle:** No repeated ownership checks
2. **Consistency:** Same error handling across all procedures
3. **Type Safety:** TypeScript generics ensure correct resource types
4. **Admin Support:** Built-in admin bypass functionality
5. **Testability:** Easier to test with middleware isolation

---

## Future Extensibility

### Collaboration Support

The ownership middleware is ready for future collaboration features:

```typescript
// Future: Enhanced middleware for collaboration
export const createCollaborativeOwnershipMiddleware = (
  fetchResource: FetchResourceFunction,
  resourceName: string
) => {
  return t.middleware(async ({ ctx, next, input }) => {
    const resource = await fetchResource(input.id, ctx.db);
    
    // 1. Admin bypass (already implemented)
    if (ctx.auth.role === 'ADMIN') return next();
    
    // 2. Owner check (already implemented)
    if (resource.userId === ctx.auth.userId) return next();
    
    // 3. Future: Collaborator check
    const collaboration = await ctx.db.collaborator.findUnique({
      where: {
        userId_resourceId: {
          userId: ctx.auth.userId,
          resourceId: resource.id,
        },
      },
    });
    
    if (collaboration && collaboration.role === 'EDITOR') {
      return next();
    }
    
    throw new TRPCError({ code: 'FORBIDDEN' });
  });
};
```

### Permission Levels

Future support for granular permissions:

```typescript
// Future: Permission-based middleware
export const createPermissionMiddleware = (
  requiredPermission: Permission,
  fetchResource: FetchResourceFunction
) => {
  return t.middleware(async ({ ctx, next, input }) => {
    const resource = await fetchResource(input.id, ctx.db);
    const userPermissions = await getUserPermissions(ctx.auth.userId, resource.id);
    
    if (userPermissions.includes(requiredPermission)) {
      return next();
    }
    
    throw new TRPCError({ code: 'FORBIDDEN' });
  });
};
```

---

## API Reference

### Core Functions

#### `createOwnershipMiddleware<TResource>`

Creates ownership middleware for a resource type.

```typescript
function createOwnershipMiddleware<TResource extends ResourceWithOwnership>(
  fetchResource: FetchResourceFunction<TResource>,
  resourceName: string
): t.Middleware<{ resource: TResource; isAdminOverride: boolean }>
```

**Parameters:**
- `fetchResource`: Function to fetch resource by ID
- `resourceName`: Resource name for error messages

**Returns:**
- tRPC middleware function

#### `isAdminAction(ctx)`

Checks if the current action was performed with admin override.

```typescript
function isAdminAction(ctx: Context): boolean
```

**Parameters:**
- `ctx`: tRPC context

**Returns:**
- Boolean indicating admin override

### Pre-built Middleware

#### `requiresProductOwnership`

Ownership middleware for Product resources.

#### `requiresProjectOwnership`

Ownership middleware for Project resources.

#### `requiresCategoryOwnership`

Ownership middleware for Category resources.

### Types

#### `ResourceWithOwnership`

Minimal interface for ownership validation.

```typescript
interface ResourceWithOwnership {
  userId: string | null;
  id: string;
}
```

#### `FetchResourceFunction<TResource>`

Function signature for resource fetching.

```typescript
type FetchResourceFunction<TResource> = (
  id: string,
  db: PrismaClient
) => Promise<TResource | null>;
```

---

## Related Documentation

- **[User Guide](../features/ownership-access-control.md)** - End-user documentation
- **[Permission Patterns](./permission-patterns.md)** - Frontend permission patterns
- **[Admin Endpoints](../api/admin-endpoints.md)** - Admin API documentation
- **[Testing Guide](../testing/ownership-testing.md)** - Testing patterns and examples

---

**Last Updated:** November 9, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
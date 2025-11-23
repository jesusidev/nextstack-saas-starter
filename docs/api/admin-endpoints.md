# Admin API Endpoints

**API Documentation** | **Last Updated:** November 9, 2025

---

## Overview

The NextStack SaaS Starter Admin API provides comprehensive administrative capabilities for managing users, products, projects, and system resources. All endpoints require admin authentication and include audit logging.

### Authentication

All admin endpoints require:
- **Admin Role:** User must have `role: 'ADMIN'`
- **Authentication:** Valid Clerk session
- **Authorization:** Admin-only middleware protection

```typescript
// Admin middleware automatically checks role
export const adminProcedure = t.procedure.use(adminOnlyMiddleware);
```

---

## Product Management

### List All Products

Retrieve all products with optional filtering and pagination.

```typescript
POST /api/admin.products.listAll
```

**Request Body:**
```typescript
{
  limit?: number;      // 1-100, default: 50
  offset?: number;     // default: 0
  userId?: string;     // Filter by specific user
}
```

**Response:**
```typescript
{
  products: Product[];
  total: number;
  hasMore: boolean;
}
```

**Example:**
```typescript
const response = await api.admin.productsListAll({
  limit: 25,
  offset: 0,
  userId: "user_123"
});

// Response includes full product data with user and category relationships
```

### Bulk Update Products

Update multiple products simultaneously.

```typescript
POST /api/admin.products.bulkUpdate
```

**Request Body:**
```typescript
{
  productIds: string[];
  data: {
    status?: 'ACTIVE' | 'INACTIVE';
    // Additional bulk update fields
  };
}
```

**Response:**
```typescript
{
  updated: number;  // Count of products updated
}
```

**Example:**
```typescript
const response = await api.admin.productsBulkUpdate({
  productIds: ["prod_1", "prod_2", "prod_3"],
  data: { status: "INACTIVE" }
});

// Logs: Admin admin_123 bulk updated 3 products
```

### Bulk Delete Products

Delete multiple products permanently.

```typescript
POST /api/admin.products.bulkDelete
```

**Request Body:**
```typescript
{
  productIds: string[];
}
```

**Response:**
```typescript
{
  deleted: number;  // Count of products deleted
}
```

**Example:**
```typescript
const response = await api.admin.productsBulkDelete({
  productIds: ["prod_1", "prod_2"]
});

// Logs: Admin admin_123 bulk deleted 2 products
```

### List Orphaned Products

Find products with no owner (userId is null).

```typescript
POST /api/admin.products.orphaned
```

**Response:**
```typescript
{
  id: string;
  name: string;
  createdAt: Date;
}[]
```

**Use Case:** Clean up resources from deleted users.

---

## Project Management

### List All Projects

Retrieve all projects with user and product count information.

```typescript
POST /api/admin.projects.listAll
```

**Request Body:**
```typescript
{
  limit?: number;      // 1-100, default: 50
  offset?: number;     // default: 0
  userId?: string;     // Filter by specific user
}
```

**Response:**
```typescript
{
  projects: Project[];
  total: number;
  hasMore: boolean;
}
```

**Example:**
```typescript
const response = await api.admin.projectsListAll({
  limit: 50,
  userId: "user_123"
});

// Each project includes:
// - User information
// - Product count (_count.product)
```

### Bulk Delete Projects

Delete multiple projects permanently.

```typescript
POST /api/admin.projects.bulkDelete
```

**Request Body:**
```typescript
{
  projectIds: string[];
}
```

**Response:**
```typescript
{
  deleted: number;  // Count of projects deleted
}
```

---

## User Management

### List Users

Retrieve all users with their resource counts and search functionality.

```typescript
POST /api/admin.users.list
```

**Request Body:**
```typescript
{
  limit?: number;      // 1-100, default: 50
  offset?: number;     // default: 0
  search?: string;     // Search by email, first name, or last name
}
```

**Response:**
```typescript
{
  users: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'USER' | 'ADMIN';
    _count: {
      products: number;
      projects: number;
    };
  }[];
  total: number;
  hasMore: boolean;
}
```

**Example:**
```typescript
// Search for users by name
const response = await api.admin.usersList({
  search: "john",
  limit: 25
});

// Returns users matching "john" in name or email
```

### Get User Statistics

Retrieve detailed statistics for a specific user.

```typescript
POST /api/admin.users.statistics
```

**Request Body:**
```typescript
{
  userId: string;
}
```

**Response:**
```typescript
{
  productCount: number;
  projectCount: number;
  categoryCount: number;
}
```

**Use Case:** Quick overview of user's resource usage.

---

## System Statistics

### Overview Statistics

Get system-wide statistics and metrics.

```typescript
POST /api/admin.stats.overview
```

**Response:**
```typescript
{
  totalUsers: number;
  totalProducts: number;
  totalProjects: number;
  totalCategories: number;
  orphanedProducts: number;
}
```

**Use Case:** Dashboard metrics and system health monitoring.

### Recent Activity

Get recent activity across the system.

```typescript
POST /api/admin.stats.recentActivity
```

**Request Body:**
```typescript
{
  limit?: number;  // 1-50, default: 20
}
```

**Response:**
```typescript
{
  recentProducts: {
    id: string;
    name: string;
    createdAt: Date;
    user: {
      firstName?: string;
      lastName?: string;
    };
  }[];
  recentProjects: {
    id: string;
    name: string;
    createdAt: Date;
    user: {
      firstName?: string;
      lastName?: string;
    };
  }[];
}
```

**Use Case:** Activity feed and recent changes monitoring.

---

## Error Handling

### Standard Error Responses

All admin endpoints return consistent error responses:

```typescript
// Unauthorized (not admin)
{
  error: "UNAUTHORIZED";
  message: "Admin access required";
  code: 401;
}

// Forbidden (admin but insufficient permissions)
{
  error: "FORBIDDEN";
  message: "Insufficient permissions";
  code: 403;
}

// Bad Request (invalid input)
{
  error: "BAD_REQUEST";
  message: "Invalid input data";
  code: 400;
}

// Not Found
{
  error: "NOT_FOUND";
  message: "Resource not found";
  code: 404;
}
```

### Input Validation

All endpoints use Zod schemas for input validation:

```typescript
// Example validation schema
const bulkDeleteInput = z.object({
  productIds: z.array(z.string()).min(1).max(100),
});
```

### Audit Logging

All admin actions are logged with:

```typescript
console.info(`Admin ${ctx.auth.userId} bulk updated ${updated.count} products`);
console.warn(`Admin ${ctx.auth.userId} bulk deleted ${deleted.count} products`);
```

---

## Rate Limiting

Admin endpoints have elevated rate limits but are still protected:

```typescript
// Standard user: 100 requests/minute
// Admin user: 500 requests/minute
```

### Rate Limit Headers

```typescript
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 499
X-RateLimit-Reset: 1640995200
```

---

## Usage Examples

### Frontend Integration

```typescript
// React component using admin API
function AdminProductManager() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const { data: productsData } = api.admin.productsListAll.useQuery();
  const bulkDelete = api.admin.productsBulkDelete.useMutation();
  
  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync({ productIds: selectedIds });
      // Refresh data
      await utils.admin.productsListAll.invalidate();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };
  
  return (
    <div>
      {/* Product list with selection */}
      <Button 
        onClick={handleBulkDelete}
        disabled={selectedIds.length === 0}
        loading={bulkDelete.isLoading}
      >
        Delete Selected ({selectedIds.length})
      </Button>
    </div>
  );
}
```

### Server-Side Usage

```typescript
// Server-side admin action
async function cleanupOrphanedProducts() {
  const orphaned = await api.admin.productsOrphaned.query();
  
  if (orphaned.length > 0) {
    const result = await api.admin.productsBulkDelete.mutate({
      productIds: orphaned.map(p => p.id)
    });
    
    console.log(`Cleaned up ${result.deleted} orphaned products`);
  }
}
```

### Bulk Operations Pattern

```typescript
// Safe bulk operation with error handling
async function safeBulkUpdate(productIds: string[], updates: any) {
  const BATCH_SIZE = 50;
  const results = [];
  
  for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
    const batch = productIds.slice(i, i + BATCH_SIZE);
    
    try {
      const result = await api.admin.productsBulkUpdate.mutate({
        productIds: batch,
        data: updates
      });
      
      results.push({ batch: batch, success: true, updated: result.updated });
    } catch (error) {
      results.push({ batch: batch, success: false, error: error.message });
    }
  }
  
  return results;
}
```

---

## Testing

### Unit Testing Admin Procedures

```typescript
// src/__tests__/api/admin.test.ts
describe('Admin Router', () => {
  let adminCaller: any;
  
  beforeEach(async () => {
    adminCaller = createCaller({
      auth: { userId: 'admin_123', role: 'ADMIN' },
      db: prisma,
    });
  });
  
  describe('productsListAll', () => {
    it('should return all products for admin', async () => {
      const result = await adminCaller.admin.productsListAll();
      
      expect(result.products).toBeDefined();
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(typeof result.hasMore).toBe('boolean');
    });
    
    it('should filter by userId', async () => {
      const result = await adminCaller.admin.productsListAll({
        userId: 'user_123'
      });
      
      expect(result.products.every(p => p.userId === 'user_123')).toBe(true);
    });
  });
  
  describe('bulkDelete', () => {
    it('should delete multiple products', async () => {
      // Create test products
      const product1 = await createTestProduct();
      const product2 = await createTestProduct();
      
      const result = await adminCaller.admin.productsBulkDelete({
        productIds: [product1.id, product2.id]
      });
      
      expect(result.deleted).toBe(2);
      
      // Verify deletion
      const remaining = await prisma.product.count({
        where: { id: { in: [product1.id, product2.id] } }
      });
      expect(remaining).toBe(0);
    });
  });
});
```

### Integration Testing

```typescript
// e2e/admin.spec.ts
test.describe('Admin API', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
  });
  
  test('admin can view all products', async ({ page }) => {
    await page.goto('/admin');
    
    // Verify admin can see products from all users
    const products = page.locator('[data-testid="admin-product-row"]');
    await expect(products).toHaveCount.greaterThan(0);
  });
  
  test('admin can perform bulk operations', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Select products
    await page.check('[data-testid="select-product-1"]');
    await page.check('[data-testid="select-product-2"]');
    
    // Perform bulk delete
    await page.click('[data-testid="bulk-delete"]');
    await page.click('[data-testid="confirm-delete"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
  });
});
```

---

## Security Considerations

### Admin Access Control

1. **Role Verification:** All endpoints verify admin role
2. **Audit Logging:** All actions logged with admin ID
3. **Input Validation:** Strict Zod schema validation
4. **Rate Limiting:** Elevated but protected rate limits

### Best Practices

1. **Principle of Least Privilege:** Only use admin endpoints when necessary
2. **Bulk Operation Limits:** Limit batch sizes to prevent overload
3. **Error Handling:** Don't expose sensitive information in errors
4. **Monitoring:** Monitor admin action logs for suspicious activity

### Data Protection

```typescript
// Admin endpoints include sensitive data - handle carefully
const adminData = await api.admin.usersList.query();

// ✅ Good: Store securely, limit access
// ❌ Bad: Log to console, store in localStorage
```

---

## Performance Optimization

### Database Queries

Admin endpoints use optimized queries:

```typescript
// Efficient user listing with counts
const users = await db.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    _count: {
      select: {
        products: true,
        projects: true,
      },
    },
  },
});
```

### Pagination

Always use pagination for large datasets:

```typescript
// Client-side
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  ['admin', 'products'],
  ({ pageParam = 0 }) => api.admin.productsListAll({
    limit: 50,
    offset: pageParam * 50
  })
);
```

### Caching

Consider caching admin data:

```typescript
// Cache for 5 minutes
const staleTime = 5 * 60 * 1000;

const { data } = api.admin.statsOverview.useQuery(undefined, {
  staleTime,
});
```

---

## Monitoring and Analytics

### Admin Action Metrics

Track admin actions for monitoring:

```typescript
// In admin procedures
console.info(`Admin ${ctx.auth.userId} performed ${action} on ${resourceType}`);
```

### Performance Monitoring

Monitor admin endpoint performance:

```typescript
// Response time tracking
const startTime = Date.now();
// ... procedure logic
const duration = Date.now() - startTime;
console.debug(`Admin ${procedureName} completed in ${duration}ms`);
```

### Error Tracking

Monitor admin errors:

```typescript
// Error reporting
if (error instanceof TRPCError) {
  console.error(`Admin error: ${error.code} - ${error.message}`);
  // Send to error tracking service
}
```

---

## Related Documentation

- **[Ownership Middleware](../development/ownership-middleware.md)** - Backend permission patterns
- **[Permission Patterns](../development/permission-patterns.md)** - Frontend permission patterns
- **[User Guide](../features/ownership-access-control.md)** - End-user documentation
- **[Testing Guide](../testing/ownership-testing.md)** - Testing patterns and examples

---

**Last Updated:** November 9, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
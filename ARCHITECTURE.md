# NextStack SaaS Starter - Architecture

This document provides a high-level overview of the system architecture, design decisions, and key patterns used in the NextStack SaaS Starter template.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Data Flow](#data-flow)
5. [Security](#security)
6. [Infrastructure](#infrastructure)
7. [Key Design Decisions](#key-design-decisions)

---

## System Overview

NextStack SaaS Starter is a full-stack Next.js application designed for rapid SaaS development. It provides a production-ready foundation with authentication, database, file uploads, and analytics.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js App (React 18 + Server Components)         │  │
│  │  - Server-Side Rendering (SSR)                       │  │
│  │  - Client-Side Hydration                             │  │
│  │  - Optimistic UI Updates                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  tRPC (Type-Safe API)                                │  │
│  │  - End-to-end type safety                            │  │
│  │  - Automatic API client generation                   │  │
│  │  - Request/Response validation                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REST API Routes                                     │  │
│  │  - File uploads (S3 presigned URLs)                  │  │
│  │  - Health checks                                     │  │
│  │  - Webhooks                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Prisma ORM                                          │  │
│  │  - Type-safe database queries                        │  │
│  │  - Automatic migrations                              │  │
│  │  - Connection pooling                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                 │  │
│  │  - Relational data storage                           │  │
│  │  - ACID transactions                                 │  │
│  │  - Full-text search                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Clerk      │  │   AWS S3     │  │  Analytics   │     │
│  │ (Auth)       │  │ (Storage)    │  │ (GA4/Clarity)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with Server Components
- **TypeScript** - Type safety
- **Mantine 8** - Component library
- **tRPC** - Type-safe API client
- **Lenis** - Smooth scrolling

### Backend
- **Next.js API Routes** - Serverless functions
- **tRPC** - Type-safe API layer
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Relational database
- **Zod** - Runtime validation

### Authentication
- **Clerk** - User authentication and management
- **Middleware** - Route protection
- **Webhooks** - User sync

### File Storage
- **AWS S3** - Object storage
- **Presigned URLs** - Secure direct uploads
- **Multipart uploads** - Large file support

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Local development
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD

### Testing
- **Jest** - Unit testing
- **Playwright** - E2E testing
- **React Testing Library** - Component testing

### Code Quality
- **Biome** - Linting and formatting
- **TypeScript** - Static type checking
- **Husky** - Git hooks
- **Conventional Commits** - Commit standards

---

## Architecture Patterns

### 1. Server Components First

We use React Server Components by default for better performance:

```typescript
// app/page.tsx - Server Component (default)
export default async function HomePage() {
  const data = await fetchData(); // Runs on server
  return <div>{data}</div>;
}
```

Client Components are used only when needed:

```typescript
// components/InteractiveButton.tsx
'use client'; // Explicit client component

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 2. tRPC for Type-Safe APIs

End-to-end type safety without code generation:

```typescript
// server/api/routers/product.ts
export const productRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany();
  }),
});

// client usage - fully typed!
const { data } = api.product.getAll.useQuery();
```

### 3. Optimistic UI Updates

Immediate feedback with automatic rollback on errors:

```typescript
const utils = api.useUtils();
const { mutate } = api.product.create.useMutation({
  onMutate: async (newProduct) => {
    // Cancel outgoing refetches
    await utils.product.getAll.cancel();
    
    // Optimistically update
    const previousData = utils.product.getAll.getData();
    utils.product.getAll.setData(undefined, (old) => [...old, newProduct]);
    
    return { previousData };
  },
  onError: (err, newProduct, context) => {
    // Rollback on error
    utils.product.getAll.setData(undefined, context.previousData);
  },
});
```

### 4. Ownership-Based Access Control

Resources are owned by users with role-based permissions:

```typescript
// Middleware checks ownership
export const ownershipMiddleware = t.middleware(async ({ ctx, next, input }) => {
  const resource = await ctx.db.product.findUnique({
    where: { id: input.id },
  });
  
  if (resource.userId !== ctx.userId && ctx.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  
  return next();
});
```

### 5. Event-Driven Architecture

Custom events for cross-component communication:

```typescript
// Emit event
import { productEvents } from '@/events';
productEvents.emit('product:created', { productId: '123' });

// Listen to event
productEvents.on('product:created', (data) => {
  console.log('Product created:', data.productId);
});
```

---

## Data Flow

### 1. User Authentication Flow

```
User → Clerk Sign In → Webhook → Sync to DB → Session Created
                                      ↓
                              User Record in DB
                                      ↓
                              Middleware Validates
                                      ↓
                              Protected Routes Accessible
```

### 2. Data Mutation Flow

```
User Action → Optimistic Update → tRPC Mutation → Prisma Query
                    ↓                    ↓              ↓
              UI Updates          Validation      Database
                    ↓                    ↓              ↓
              (Instant)           Success/Error    Committed
                                       ↓
                              Refetch or Rollback
```

### 3. File Upload Flow

```
User Selects File → Request Presigned URL → Upload to S3
                           ↓                      ↓
                    tRPC API Route          Direct Upload
                           ↓                      ↓
                    Generate URL            S3 Bucket
                           ↓                      ↓
                    Return to Client        File Stored
                           ↓
                    Confirm Upload
                           ↓
                    Save Metadata to DB
```

---

## Security

### Authentication
- **Clerk** handles all authentication
- **JWT tokens** for session management
- **Middleware** protects routes
- **Webhooks** sync user data

### Authorization
- **Ownership checks** on all mutations
- **Role-based access** (user, admin)
- **Admin bypass** for support
- **Audit logging** for sensitive operations

### Data Protection
- **Environment variables** for secrets
- **Presigned URLs** for S3 (no exposed credentials)
- **SQL injection protection** (Prisma parameterized queries)
- **XSS protection** (React escaping)
- **CSRF protection** (SameSite cookies)

### Infrastructure
- **HTTPS only** in production
- **Security headers** (CSP, HSTS, etc.)
- **Rate limiting** on API routes
- **Docker security** (non-root user)

---

## Infrastructure

### Local Development
- **Docker Compose** for all services
- **Hot reload** for fast development
- **Volume mounts** for code changes
- **Health checks** for reliability

### Production Deployment
- **Multi-stage Docker builds** for small images
- **Terraform** for infrastructure as code
- **GitHub Actions** for CI/CD
- **Zero-downtime deployments**

### Database
- **PostgreSQL 15** for reliability
- **Connection pooling** for performance
- **Automated backups** (production)
- **Migration system** (Prisma)

### File Storage
- **AWS S3** for scalability
- **CDN integration** (optional)
- **Lifecycle policies** for cost optimization
- **Versioning** for data protection

---

## Key Design Decisions

### Why Next.js App Router?
- Server Components for better performance
- Streaming and Suspense support
- Simplified data fetching
- Better SEO with SSR

### Why tRPC?
- End-to-end type safety without codegen
- Automatic API client generation
- Better DX than REST or GraphQL
- Smaller bundle size

### Why Prisma?
- Type-safe database queries
- Automatic migrations
- Great TypeScript support
- Active ecosystem

### Why Clerk?
- Production-ready authentication
- User management UI
- Webhooks for sync
- Social login support

### Why Docker?
- Consistent environments
- Easy local development
- Production parity
- Simple deployment

### Why Mantine?
- Comprehensive component library
- Built-in dark mode
- Accessibility focused
- TypeScript first

---

## Performance Optimizations

### Frontend
- **Server Components** reduce client JS
- **Image optimization** with next/image
- **Font optimization** with next/font
- **Code splitting** automatic with Next.js
- **Lazy loading** for heavy components

### Backend
- **Connection pooling** for database
- **Query optimization** with Prisma
- **Caching** with React Cache
- **Streaming** for large responses

### Infrastructure
- **CDN** for static assets
- **Database indexes** for queries
- **Docker layer caching** for builds
- **Multi-stage builds** for small images

---

## Scalability Considerations

### Horizontal Scaling
- **Stateless application** (scales easily)
- **Database connection pooling**
- **S3 for file storage** (no local files)
- **Load balancer ready**

### Vertical Scaling
- **Efficient queries** with Prisma
- **Optimized Docker images**
- **Resource limits** configured
- **Memory management**

### Future Enhancements
- **Redis** for caching
- **Queue system** for background jobs
- **Microservices** if needed
- **Database read replicas**

---

## Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Mantine Documentation](https://mantine.dev)

---

**Questions?** Open an issue or check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more details.

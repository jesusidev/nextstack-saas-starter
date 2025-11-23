import { TRPCError } from '@trpc/server';
import { type Context, t } from '../trpc';

type ResourceWithOwnership = {
  userId: string | null;
  id: string;
};

type FetchResourceFunction<TResource extends ResourceWithOwnership> = (
  id: string,
  db: Context['db']
) => Promise<TResource | null>;

export const createOwnershipMiddleware = <TResource extends ResourceWithOwnership>(
  fetchResource: FetchResourceFunction<TResource>,
  resourceName: string,
  options?: {
    /**
     * Function to determine if ownership check should be skipped
     * Useful for operations that don't require ownership (e.g., favoriting)
     */
    skipOwnershipCheck?: (input: any) => boolean;
  }
) => {
  return t.middleware(async ({ ctx, next, input }) => {
    const typedInput = input as { id: string };

    if (!typedInput?.id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Resource ID is required',
      });
    }

    // Check if ownership validation should be skipped for this operation
    if (options?.skipOwnershipCheck?.(input)) {
      // Still fetch the resource for context, but don't validate ownership
      const resource = await fetchResource(typedInput.id, ctx.db);

      if (!resource) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `${resourceName} not found`,
        });
      }

      return next({
        ctx: {
          ...ctx,
          auth: {
            ...ctx.auth,
            userId: ctx.auth.userId as string,
          },
          resource,
          isAdminOverride: false,
        },
      });
    }

    const resource = await fetchResource(typedInput.id, ctx.db);

    if (!resource) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `${resourceName} not found`,
      });
    }

    // ✨ NEW: Admin bypass
    if (ctx.auth.role === 'ADMIN') {
      console.info(`Admin ${ctx.auth.userId} accessing ${resourceName} ${resource.id}`);
      return next({
        ctx: {
          ...ctx,
          auth: {
            ...ctx.auth,
            userId: ctx.auth.userId as string,
          },
          resource,
          isAdminOverride: true,
        },
      });
    }

    // Existing ownership checks
    if (!resource.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `This ${resourceName} has no owner and cannot be modified`,
      });
    }

    if (resource.userId !== ctx.auth.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You do not have permission to modify this ${resourceName}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        auth: {
          ...ctx.auth,
          userId: ctx.auth.userId as string,
        },
        resource,
        isAdminOverride: false,
      },
    });
  });
};

// Helper to check if action was performed with admin override
export const isAdminAction = (ctx: Context): boolean => {
  return (ctx as any).isAdminOverride === true;
};

export const requiresProductOwnership = createOwnershipMiddleware(
  (id, db) =>
    db.product.findUnique({
      where: { id },
      select: { id: true, userId: true },
    }),
  'product',
  {
    // Skip ownership check if this is a favorite-only update
    skipOwnershipCheck: (input: any) => {
      // If only isFavorite is being updated (and id), skip ownership check
      const keys = Object.keys(input);
      return keys.length === 2 && keys.includes('id') && keys.includes('isFavorite');
    },
  }
);

export const requiresProjectOwnership = createOwnershipMiddleware(
  (id, db) =>
    db.project.findUnique({
      where: { id },
      select: { id: true, userId: true },
    }),
  'project'
);

export const requiresCategoryOwnership = createOwnershipMiddleware(
  (id, db) =>
    db.category.findUnique({
      where: { id },
      select: { id: true, userId: true },
    }),
  'category'
);

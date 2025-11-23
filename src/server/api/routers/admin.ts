import { Status } from '@prisma/client';
import { z } from 'zod';
import { adminProcedure } from '~/server/api/middleware/adminOnly';
import { createTRPCRouter } from '~/server/api/trpc';

export const adminRouter = createTRPCRouter({
  // Product Management
  productsListAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        userId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause = input.userId ? { userId: input.userId } : {};

      const [products, total] = await Promise.all([
        ctx.db.product.findMany({
          where: whereClause,
          take: input.limit,
          skip: input.offset,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        ctx.db.product.count({ where: whereClause }),
      ]);

      return {
        products,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  productsBulkUpdate: adminProcedure
    .input(
      z.object({
        productIds: z.array(z.string()),
        data: z.object({
          status: z.nativeEnum(Status).optional(),
          // Add other bulk update fields
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.product.updateMany({
        where: {
          id: {
            in: input.productIds,
          },
        },
        data: input.data,
      });

      console.info(`Admin ${ctx.auth.userId} bulk updated ${updated.count} products`);

      return {
        updated: updated.count,
      };
    }),

  productsBulkDelete: adminProcedure
    .input(
      z.object({
        productIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db.product.deleteMany({
        where: {
          id: {
            in: input.productIds,
          },
        },
      });

      console.warn(`Admin ${ctx.auth.userId} bulk deleted ${deleted.count} products`);

      return {
        deleted: deleted.count,
      };
    }),

  productsOrphaned: adminProcedure.query(async ({ ctx }) => {
    // Find products with no owner
    const orphaned = await ctx.db.product.findMany({
      where: {
        userId: null,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return orphaned;
  }),

  // Project Management
  projectsListAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        userId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause = input.userId ? { userId: input.userId } : {};

      const [projects, total] = await Promise.all([
        ctx.db.project.findMany({
          where: whereClause,
          take: input.limit,
          skip: input.offset,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        ctx.db.project.count({ where: whereClause }),
      ]);

      return {
        projects,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  projectsBulkDelete: adminProcedure
    .input(
      z.object({
        projectIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db.project.deleteMany({
        where: {
          id: {
            in: input.projectIds,
          },
        },
      });

      console.warn(`Admin ${ctx.auth.userId} bulk deleted ${deleted.count} projects`);

      return {
        deleted: deleted.count,
      };
    }),

  // User Management
  usersList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause = input.search
        ? {
            OR: [
              { email: { contains: input.search } },
              { firstName: { contains: input.search } },
              { lastName: { contains: input.search } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where: whereClause,
          take: input.limit,
          skip: input.offset,
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
          orderBy: {
            id: 'desc',
          },
        }),
        ctx.db.user.count({ where: whereClause }),
      ]);

      return {
        users,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  usersStatistics: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [productCount, projectCount, categoryCount] = await Promise.all([
        ctx.db.product.count({ where: { userId: input.userId } }),
        ctx.db.project.count({ where: { userId: input.userId } }),
        ctx.db.category.count({ where: { userId: input.userId } }),
      ]);

      return {
        productCount,
        projectCount,
        categoryCount,
      };
    }),

  // System Statistics
  statsOverview: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers, totalProducts, totalProjects, totalCategories, orphanedProducts] =
      await Promise.all([
        ctx.db.user.count(),
        ctx.db.product.count(),
        ctx.db.project.count(),
        ctx.db.category.count(),
        ctx.db.product.count({ where: { userId: null } }),
      ]);

    return {
      totalUsers,
      totalProducts,
      totalProjects,
      totalCategories,
      orphanedProducts,
    };
  }),

  statsRecentActivity: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const recentProducts = await ctx.db.product.findMany({
        take: input.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const recentProjects = await ctx.db.project.findMany({
        take: input.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return {
        recentProducts,
        recentProjects,
      };
    }),
});

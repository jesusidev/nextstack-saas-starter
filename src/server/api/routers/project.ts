import { projectInput, projectQueryInput, updateProjectInput } from '~/types/project';
import { requiresProjectOwnership } from '../middleware/ownership';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const projectRouter = createTRPCRouter({
  // Consolidated endpoint - handles both single project and list queries
  projects: protectedProcedure.input(projectQueryInput).query(async ({ ctx, input }) => {
    // If ID is provided, return single project
    if (input?.id) {
      const project = await ctx.db.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId, // Ensure user can only access their own projects
        },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Get product count for this specific project
      const totalProjectProducts = await ctx.db.product.count({
        where: {
          userId: ctx.auth.userId,
          projectId: project.id,
        },
      });

      return {
        ...project,
        totalProjectProducts,
      };
    }

    // Otherwise, return list of projects
    const projects = await ctx.db.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
    });

    const totalProjectProducts = await ctx.db.product.count({
      where: {
        userId: ctx.auth.userId,
        projectId: {
          in: projects.map((project) => project.id),
        },
      },
    });

    return projects.map(({ name, updatedAt, id, status }) => ({
      name,
      updatedAt,
      id,
      status,
      totalProjectProducts,
    }));
  }),
  create: protectedProcedure.input(projectInput).mutation(async ({ ctx, input }) =>
    ctx.db.project.create({
      data: {
        name: input.name,
        userId: ctx.auth.userId,
      },
    })
  ),
  update: protectedProcedure
    .input(updateProjectInput)
    .use(requiresProjectOwnership)
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.status && { status: input.status }),
        },
      });

      return project;
    }),
});

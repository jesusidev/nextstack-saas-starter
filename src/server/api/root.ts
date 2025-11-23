import { adminRouter } from '~/server/api/routers/admin';
import { productRouter } from '~/server/api/routers/product';
import { projectRouter } from '~/server/api/routers/project';
import { userRouter } from '~/server/api/routers/user';
import { createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  user: userRouter,
  project: projectRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

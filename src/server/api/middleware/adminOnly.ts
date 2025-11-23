import { TRPCError } from '@trpc/server';
import { t } from '../trpc';

export const adminOnly = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }

  if (ctx.auth.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  console.info(`Admin action by ${ctx.auth.userId}`);

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth,
    },
  });
});

export const adminProcedure = t.procedure.use(adminOnly);

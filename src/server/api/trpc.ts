import { getAuth } from '@clerk/nextjs/server';

import { initTRPC, TRPCError } from '@trpc/server';
import type * as trpcNext from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { db } from '~/server/db';

interface AuthContext {
  auth: ReturnType<typeof getAuth> & { role: 'ADMIN' | 'USER' };
}

const createContextInner = ({ auth }: AuthContext) => ({
  auth,
  db,
  isAdminOverride: false,
});

export const createTRPCContext = async (opts: trpcNext.CreateNextContextOptions) => {
  const authData = await getAuth(opts.req);

  let userRole: 'ADMIN' | 'USER' = 'USER';

  if (authData?.userId) {
    const user = await db.user.findUnique({
      where: { id: authData.userId },
      select: { role: true },
    });

    userRole = user?.role ?? 'USER';
  }

  return createContextInner({
    auth: {
      ...authData,
      role: userRole,
    },
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      auth: {
        ...ctx.auth,
        userId: ctx.auth.userId as string,
      },
    },
  });
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

export { t };
export type Context = Awaited<ReturnType<typeof createTRPCContext>> & {
  resource?: any;
  isAdminOverride?: boolean;
};

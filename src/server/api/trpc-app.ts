import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { db } from '~/server/db';

// Create context for App Router
export const createTRPCContext = async () => {
  const authData = await auth();

  let userRole: 'ADMIN' | 'USER' = 'USER';

  if (authData?.userId) {
    const user = await db.user.findUnique({
      where: { id: authData.userId },
      select: { role: true },
    });

    userRole = user?.role ?? 'USER';
  }

  return {
    auth: {
      ...authData,
      role: userRole,
    },
    db,
    isAdminOverride: false,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
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
      auth: ctx.auth,
      db: ctx.db,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

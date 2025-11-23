import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { userInput } from '~/types/user';

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) =>
    ctx.db.user.findUnique({
      where: {
        id: ctx.auth.userId,
      },
    })
  ),
  create: protectedProcedure.input(userInput).mutation(async ({ ctx, input }) =>
    ctx.db.user.create({
      data: {
        id: ctx.auth.userId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
      },
    })
  ),
  update: protectedProcedure.input(userInput).mutation(async ({ ctx, input }) =>
    ctx.db.user.update({
      where: {
        id: ctx.auth.userId,
      },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
      },
    })
  ),
});

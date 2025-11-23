import { TRPCError } from '@trpc/server';
import type { Context } from '~/server/api/trpc';

/**
 * Check if the current user has admin role
 */
export const isAdmin = (ctx: Context): boolean => {
  return ctx.auth.role === 'ADMIN';
};

/**
 * Require admin role, throw error if not admin
 */
export const requireAdmin = (ctx: Context): void => {
  if (!isAdmin(ctx)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
};

/**
 * Check if the current action is an admin override
 */
export const isAdminOverride = (ctx: Context): boolean => {
  return ctx.isAdminOverride === true;
};

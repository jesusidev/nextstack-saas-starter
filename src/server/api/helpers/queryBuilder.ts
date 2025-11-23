import type { Context } from '../trpc';

type OwnershipWhere<T = Record<string, any>> = T & {
  userId?: string | null;
};

export const buildOwnershipWhere = <T extends Record<string, any>>(
  ctx: Context,
  additionalWhere?: T
): OwnershipWhere<T> => {
  if (ctx.auth.role === 'ADMIN') {
    return { ...additionalWhere } as OwnershipWhere<T>;
  }

  if (!ctx.auth.userId) {
    return {
      ...additionalWhere,
      userId: null,
    } as OwnershipWhere<T>;
  }

  return {
    ...additionalWhere,
    userId: ctx.auth.userId,
  } as OwnershipWhere<T>;
};

export const requireOwnershipWhere = <T extends Record<string, any>>(
  ctx: Context,
  additionalWhere?: T
): OwnershipWhere<T> & { userId: string } => {
  if (ctx.auth.role === 'ADMIN') {
    return { ...additionalWhere } as OwnershipWhere<T> & { userId: string };
  }

  if (!ctx.auth.userId) {
    throw new Error('Authentication required');
  }

  return {
    ...additionalWhere,
    userId: ctx.auth.userId,
  } as OwnershipWhere<T> & { userId: string };
};

export const canAccessResource = (ctx: Context, resource: { userId: string | null }): boolean => {
  if (ctx.auth.role === 'ADMIN') {
    return true;
  }

  if (!ctx.auth.userId) {
    return false;
  }

  return resource.userId === ctx.auth.userId;
};

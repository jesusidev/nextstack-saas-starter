import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { appRouter } from '~/server/api/root';
import { db } from '~/server/db';
import { cleanup, createTestAdmin, createTestProduct, createTestUser } from './setup';

describe('Admin Bypass', () => {
  let userId: string;
  let adminId: string;
  let productId: string;

  beforeEach(async () => {
    await cleanup();

    const user = await createTestUser();
    userId = user.id;

    const admin = await createTestAdmin();
    adminId = admin.id;

    const product = await createTestProduct(userId);
    productId = product.id;
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should allow admin to update any product', async () => {
    const ctx = {
      auth: { userId: adminId, role: 'ADMIN' },
      db,
    } as any;
    const caller = appRouter.createCaller(ctx);

    const result = await caller.product.update({
      id: productId,
      name: 'Admin Updated',
    });

    expect(result.name).toBe('Admin Updated');
  });

  it('should allow admin to delete any product', async () => {
    const ctx = {
      auth: { userId: adminId, role: 'ADMIN' },
      db,
    } as any;
    const caller = appRouter.createCaller(ctx);

    await caller.product.delete({ id: productId });

    const deleted = await db.product.findUnique({
      where: { id: productId },
    });
    expect(deleted).toBeNull();
  });

  it('should allow admin to view all products', async () => {
    await createTestProduct(userId, { name: 'User Product' });
    await createTestProduct(adminId, { name: 'Admin Product' });

    const ctx = {
      auth: { userId: adminId, role: 'ADMIN' },
      db,
    } as any;
    const caller = appRouter.createCaller(ctx);

    const products = await caller.product.products({});

    expect((products as any[]).length).toBeGreaterThanOrEqual(2);
  });

  it('should allow regular user to see only their products', async () => {
    await createTestProduct(userId, { name: 'User Product' });
    await createTestProduct(adminId, { name: 'Admin Product' });

    const ctx = {
      auth: { userId: userId, role: 'USER' },
      db,
    } as any;
    const caller = appRouter.createCaller(ctx);

    const products = await caller.product.products({});

    expect((products as any[]).every((p: any) => p.userId === userId)).toBe(true);
  });
});

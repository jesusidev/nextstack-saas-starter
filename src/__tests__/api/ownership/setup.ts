import { db } from '~/server/db';

export const createTestUser = async (overrides = {}) => {
  return await db.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      ...overrides,
    },
  });
};

export const createTestAdmin = async (overrides = {}) => {
  return await createTestUser({
    role: 'ADMIN',
    ...overrides,
  });
};

export const createTestProduct = async (userId: string, overrides = {}) => {
  return await db.product.create({
    data: {
      name: 'Test Product',
      userId,
      ...overrides,
    },
  });
};

export const createTestProject = async (userId: string, overrides = {}) => {
  return await db.project.create({
    data: {
      name: 'Test Project',
      userId,
      ...overrides,
    },
  });
};

export const createTestCategory = async (userId: string, overrides = {}) => {
  return await db.category.create({
    data: {
      name: 'Test Category',
      userId,
      ...overrides,
    },
  });
};

export const cleanup = async () => {
  await db.favoriteProduct.deleteMany({});
  await db.favoriteProject.deleteMany({});
  await db.productImage.deleteMany({});
  await db.fileUpload.deleteMany({});
  await db.product.deleteMany({});
  await db.project.deleteMany({});
  await db.category.deleteMany({});
  await db.user.deleteMany({});
};

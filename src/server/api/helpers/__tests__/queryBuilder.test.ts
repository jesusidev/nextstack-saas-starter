import { describe, expect, it } from '@jest/globals';
import { buildOwnershipWhere, canAccessResource, requireOwnershipWhere } from '../queryBuilder';

describe('Query Builder Helpers', () => {
  describe('buildOwnershipWhere', () => {
    it('should add userId for regular users', () => {
      const ctx = {
        auth: { userId: 'user-1', role: 'USER' },
        db: {},
      } as any;

      const where = buildOwnershipWhere(ctx, { status: 'ACTIVE' });

      expect(where).toEqual({
        status: 'ACTIVE',
        userId: 'user-1',
      });
    });

    it('should not add userId for admins', () => {
      const ctx = {
        auth: { userId: 'admin-1', role: 'ADMIN' },
        db: {},
      } as any;

      const where = buildOwnershipWhere(ctx, { status: 'ACTIVE' });

      expect(where).toEqual({
        status: 'ACTIVE',
      });
    });

    it('should set userId to null for unauthenticated users', () => {
      const ctx = {
        auth: { userId: null, role: 'USER' },
        db: {},
      } as any;

      const where = buildOwnershipWhere(ctx, { status: 'ACTIVE' });

      expect(where).toEqual({
        status: 'ACTIVE',
        userId: null,
      });
    });

    it('should work without additional conditions', () => {
      const ctx = {
        auth: { userId: 'user-1', role: 'USER' },
        db: {},
      } as any;

      const where = buildOwnershipWhere(ctx);

      expect(where).toEqual({
        userId: 'user-1',
      });
    });
  });

  describe('requireOwnershipWhere', () => {
    it('should add userId for regular users', () => {
      const ctx = {
        auth: { userId: 'user-1', role: 'USER' },
        db: {},
      } as any;

      const where = requireOwnershipWhere(ctx, { status: 'ACTIVE' });

      expect(where).toEqual({
        status: 'ACTIVE',
        userId: 'user-1',
      });
    });

    it('should throw error for unauthenticated users', () => {
      const ctx = {
        auth: { userId: null, role: 'USER' },
        db: {},
      } as any;

      expect(() => requireOwnershipWhere(ctx)).toThrow('Authentication required');
    });
  });

  describe('canAccessResource', () => {
    it('should allow owner to access resource', () => {
      const ctx = {
        auth: { userId: 'user-1', role: 'USER' },
        db: {},
      } as any;
      const resource = { userId: 'user-1' };

      expect(canAccessResource(ctx, resource)).toBe(true);
    });

    it('should deny non-owner from accessing resource', () => {
      const ctx = {
        auth: { userId: 'user-2', role: 'USER' },
        db: {},
      } as any;
      const resource = { userId: 'user-1' };

      expect(canAccessResource(ctx, resource)).toBe(false);
    });

    it('should allow admin to access any resource', () => {
      const ctx = {
        auth: { userId: 'admin-1', role: 'ADMIN' },
        db: {},
      } as any;
      const resource = { userId: 'user-1' };

      expect(canAccessResource(ctx, resource)).toBe(true);
    });

    it('should deny access to orphaned resources', () => {
      const ctx = {
        auth: { userId: 'user-1', role: 'USER' },
        db: {},
      } as any;
      const resource = { userId: null };

      expect(canAccessResource(ctx, resource)).toBe(false);
    });
  });
});

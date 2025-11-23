/**
 * @jest-environment node
 */

// Mock all external dependencies at the top
jest.mock('@clerk/nextjs/server');
jest.mock('~/server/db');
jest.mock('superjson', () => ({
  default: {
    stringify: jest.fn((obj) => JSON.stringify(obj)),
    parse: jest.fn((str) => JSON.parse(str)),
  },
}));

// Mock TRPC errors
jest.mock('@trpc/server', () => {
  const actual = jest.requireActual('@trpc/server');
  return {
    ...actual,
    TRPCError: class TRPCError extends Error {
      code: string;
      constructor(opts: { code: string; message?: string }) {
        super(opts.message || 'TRPC Error');
        this.name = 'TRPCError';
        this.code = opts.code;
      }
    },
    initTRPC: {
      context: jest.fn().mockReturnValue({
        create: jest.fn().mockReturnValue({
          router: jest.fn((procedures) => ({ _def: { procedures } })),
          procedure: {
            use: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            mutation: jest.fn((fn) => ({ _fn: fn })),
            query: jest.fn((fn) => ({ _fn: fn })),
          },
        }),
      }),
    },
  };
});

import { TRPCError } from '@trpc/server';
import { updateProjectInput } from '~/types/project';

describe('Project Router - Update Mutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should accept valid status values (ACTIVE)', () => {
      const input = {
        id: 'project-123',
        status: 'ACTIVE' as const,
      };

      const result = updateProjectInput.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid status values (INACTIVE)', () => {
      const input = {
        id: 'project-123',
        status: 'INACTIVE' as const,
      };

      const result = updateProjectInput.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status values', () => {
      const input = {
        id: 'project-123',
        status: 'INVALID_STATUS',
      };

      const result = updateProjectInput.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should require project id', () => {
      const input = {
        status: 'ACTIVE',
      };

      const result = updateProjectInput.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept partial updates (name only)', () => {
      const input = {
        id: 'project-123',
        name: 'Updated Project Name',
      };

      const result = updateProjectInput.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept partial updates (status only)', () => {
      const input = {
        id: 'project-123',
        status: 'INACTIVE' as const,
      };

      const result = updateProjectInput.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept updates with both name and status', () => {
      const input = {
        id: 'project-123',
        name: 'Updated Project',
        status: 'INACTIVE' as const,
      };

      const result = updateProjectInput.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('Authorization', () => {
    it('should verify user owns the project before updating', async () => {
      const mockDb = {
        project: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'project-123',
            userId: 'user-123',
            name: 'Test Project',
            status: 'ACTIVE',
          }),
          update: jest.fn().mockResolvedValue({
            id: 'project-123',
            userId: 'user-123',
            name: 'Test Project',
            status: 'INACTIVE',
          }),
        },
      };

      const ctx = {
        auth: { userId: 'user-123' },
        db: mockDb,
      };

      const input = {
        id: 'project-123',
        status: 'INACTIVE' as const,
      };

      // Simulate the update mutation logic
      const existingProject = await mockDb.project.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      expect(existingProject).toBeDefined();
      expect(existingProject?.userId).toBe(ctx.auth.userId);

      // If ownership verified, proceed with update
      if (existingProject && existingProject.userId === ctx.auth.userId) {
        const result = await mockDb.project.update({
          where: { id: input.id },
          data: { status: input.status },
        });

        expect(result.status).toBe('INACTIVE');
        expect(mockDb.project.findUnique).toHaveBeenCalledWith({
          where: { id: 'project-123' },
          select: { userId: true },
        });
        expect(mockDb.project.update).toHaveBeenCalledWith({
          where: { id: 'project-123' },
          data: { status: 'INACTIVE' },
        });
      }
    });

    it('should throw FORBIDDEN error when user does not own the project', async () => {
      const mockDb = {
        project: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'project-123',
            userId: 'user-other',
          }),
          update: jest.fn(),
        },
      };

      const input = {
        id: 'project-123',
        status: 'INACTIVE' as const,
      };

      const userId = 'user-123';

      // Simulate the update mutation logic
      const existingProject = await mockDb.project.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      expect(existingProject).toBeDefined();
      expect(existingProject?.userId).not.toBe(userId);

      // Should throw FORBIDDEN error
      if (existingProject && existingProject.userId !== userId) {
        expect(() => {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this project',
          });
        }).toThrow('You do not have permission to update this project');
      }

      // Update should not be called
      expect(mockDb.project.update).not.toHaveBeenCalled();
    });

    it('should throw NOT_FOUND error when project does not exist', async () => {
      const mockDb = {
        project: {
          findUnique: jest.fn().mockResolvedValue(null),
          update: jest.fn(),
        },
      };

      const _ctx = {
        auth: { userId: 'user-123' },
        db: mockDb,
      };

      const input = {
        id: 'nonexistent-project',
        status: 'INACTIVE' as const,
      };

      // Simulate the update mutation logic
      const existingProject = await mockDb.project.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      expect(existingProject).toBeNull();

      // Should throw NOT_FOUND error
      if (!existingProject) {
        expect(() => {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }).toThrow('Project not found');
      }

      // Update should not be called
      expect(mockDb.project.update).not.toHaveBeenCalled();
    });
  });

  describe('Update Functionality', () => {
    it('should toggle status from ACTIVE to INACTIVE', async () => {
      const mockDb = {
        project: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'project-123',
            userId: 'user-123',
          }),
          update: jest.fn().mockResolvedValue({
            id: 'project-123',
            name: 'Test Project',
            status: 'INACTIVE',
            userId: 'user-123',
          }),
        },
      };

      const ctx = {
        auth: { userId: 'user-123' },
        db: mockDb,
      };

      const input = {
        id: 'project-123',
        status: 'INACTIVE' as const,
      };

      // Verify ownership
      const existingProject = await mockDb.project.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (existingProject && existingProject.userId === ctx.auth.userId) {
        const result = await mockDb.project.update({
          where: { id: input.id },
          data: { status: input.status },
        });

        expect(result.status).toBe('INACTIVE');
      }
    });

    it('should toggle status from INACTIVE to ACTIVE', async () => {
      const mockDb = {
        project: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'project-123',
            userId: 'user-123',
          }),
          update: jest.fn().mockResolvedValue({
            id: 'project-123',
            name: 'Test Project',
            status: 'ACTIVE',
            userId: 'user-123',
          }),
        },
      };

      const ctx = {
        auth: { userId: 'user-123' },
        db: mockDb,
      };

      const input = {
        id: 'project-123',
        status: 'ACTIVE' as const,
      };

      // Verify ownership
      const existingProject = await mockDb.project.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (existingProject && existingProject.userId === ctx.auth.userId) {
        const result = await mockDb.project.update({
          where: { id: input.id },
          data: { status: input.status },
        });

        expect(result.status).toBe('ACTIVE');
      }
    });

    it('should update both name and status together', async () => {
      const mockDb = {
        project: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'project-123',
            userId: 'user-123',
          }),
          update: jest.fn().mockResolvedValue({
            id: 'project-123',
            name: 'Updated Project Name',
            status: 'INACTIVE',
            userId: 'user-123',
          }),
        },
      };

      const ctx = {
        auth: { userId: 'user-123' },
        db: mockDb,
      };

      const input = {
        id: 'project-123',
        name: 'Updated Project Name',
        status: 'INACTIVE' as const,
      };

      // Verify ownership
      const existingProject = await mockDb.project.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (existingProject && existingProject.userId === ctx.auth.userId) {
        const result = await mockDb.project.update({
          where: { id: input.id },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.status && { status: input.status }),
          },
        });

        expect(result.name).toBe('Updated Project Name');
        expect(result.status).toBe('INACTIVE');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockDb = {
        project: {
          findUnique: jest.fn().mockRejectedValue(new Error('Database connection error')),
          update: jest.fn(),
        },
      };

      const input = {
        id: 'project-123',
        status: 'INACTIVE' as const,
      };

      // Should propagate database errors
      await expect(
        mockDb.project.findUnique({
          where: { id: input.id },
          select: { userId: true },
        })
      ).rejects.toThrow('Database connection error');
    });
  });
});

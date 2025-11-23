import { renderHook } from '@testing-library/react';
import { api } from '~/utils/trpc';
import { usePermissions } from '../use-permissions';

jest.mock('~/utils/trpc', () => ({
  api: {
    user: {
      get: {
        useQuery: jest.fn(),
      },
    },
  },
}));

describe('usePermissions', () => {
  it('should allow owner to edit resource', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-1' };
    expect(result.current.canEdit(resource)).toBe(true);
  });

  it('should deny non-owner from editing resource', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-2' };
    expect(result.current.canEdit(resource)).toBe(false);
  });

  it('should allow admin to edit any resource', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'admin-1', role: 'ADMIN' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-1' };
    expect(result.current.canEdit(resource)).toBe(true);
  });

  it('should handle loading state', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.canEdit({ userId: 'user-1' })).toBe(false);
  });

  it('should identify owner correctly', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const ownedResource = { id: 'res-1', userId: 'user-1' };
    const othersResource = { id: 'res-2', userId: 'user-2' };

    expect(result.current.isOwner(ownedResource)).toBe(true);
    expect(result.current.isOwner(othersResource)).toBe(false);
  });

  it('should identify admin correctly', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'admin-1', role: 'ADMIN' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isAdmin).toBe(true);
  });

  it('should deny editing when user is not loaded', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-1' };
    expect(result.current.canEdit(resource)).toBe(false);
  });

  it('should deny editing resource with null userId', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: null };
    expect(result.current.canEdit(resource)).toBe(false);
  });

  it('should deny editing undefined resource', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.canEdit(undefined)).toBe(false);
  });

  it('should deny deleting when user is not loaded', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-1' };
    expect(result.current.canDelete(resource)).toBe(false);
  });

  it('should allow owner to delete resource', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-1' };
    expect(result.current.canDelete(resource)).toBe(true);
  });

  it('should deny non-owner from deleting resource', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-2' };
    expect(result.current.canDelete(resource)).toBe(false);
  });

  it('should allow admin to delete any resource', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'admin-1', role: 'ADMIN' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-1' };
    expect(result.current.canDelete(resource)).toBe(true);
  });

  it('should allow owner to view resource', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-1' };
    expect(result.current.canView(resource)).toBe(true);
  });

  it('should deny non-owner from viewing resource', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-2' };
    expect(result.current.canView(resource)).toBe(false);
  });

  it('should allow admin to view any resource', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'admin-1', role: 'ADMIN' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: 'user-1' };
    expect(result.current.canView(resource)).toBe(true);
  });

  it('should not identify admin as owner unless they actually own it', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'admin-1', role: 'ADMIN' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const othersResource = { id: 'res-1', userId: 'user-1' };
    expect(result.current.isOwner(othersResource)).toBe(false);
  });

  it('should return false for resource with null userId', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    const resource = { id: 'res-1', userId: null };
    expect(result.current.isOwner(resource)).toBe(false);
  });

  it('should identify non-admin user correctly', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: { id: 'user-1', role: 'USER' },
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isAdmin).toBe(false);
  });

  it('should return false when user is not loaded', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isAdmin).toBe(false);
  });

  it('should return current user when loaded', () => {
    const mockUser = { id: 'user-1', role: 'USER', email: 'user@example.com' };

    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.currentUser).toEqual(mockUser);
  });

  it('should return undefined when not loaded', () => {
    // @ts-expect-error - Mocking TRPC query return value
    api.user.get.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.currentUser).toBeUndefined();
  });
});

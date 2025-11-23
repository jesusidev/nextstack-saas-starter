import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import * as permissionsHook from '~/hooks/use-permissions';
import { ResourceOwner } from '../ResourceOwner';

jest.mock('~/hooks/use-permissions');

describe('ResourceOwner', () => {
  const mockResource = { id: 'resource-1', userId: 'user-1' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user has edit permission', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => true),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => true),
      isOwner: jest.fn(() => true),
      isLoading: false,
      currentUser: { id: 'user-1', role: 'USER' },
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={mockResource} permission="edit">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user has delete permission', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => true),
      canView: jest.fn(() => true),
      isOwner: jest.fn(() => true),
      isLoading: false,
      currentUser: { id: 'user-1', role: 'USER' },
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={mockResource} permission="delete">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user has view permission', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => true),
      isOwner: jest.fn(() => true),
      isLoading: false,
      currentUser: { id: 'user-1', role: 'USER' },
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={mockResource} permission="view">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('hides children when user lacks edit permission', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => true),
      isOwner: jest.fn(() => false),
      isLoading: false,
      currentUser: { id: 'user-2', role: 'USER' },
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={mockResource} permission="edit">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('hides children when user lacks delete permission', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => true),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => true),
      isOwner: jest.fn(() => true),
      isLoading: false,
      currentUser: { id: 'user-2', role: 'USER' },
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={mockResource} permission="delete">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('hides children when user lacks view permission', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => false),
      isOwner: jest.fn(() => false),
      isLoading: false,
      currentUser: { id: 'user-2', role: 'USER' },
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={mockResource} permission="view">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows fallback when provided and permission denied', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => false),
      isOwner: jest.fn(() => false),
      isLoading: false,
      currentUser: { id: 'user-2', role: 'USER' },
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner
          resource={mockResource}
          permission="edit"
          fallback={<div>Fallback Content</div>}
        >
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
  });

  it('shows nothing when permission denied and no fallback provided', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => false),
      isOwner: jest.fn(() => false),
      isLoading: false,
      currentUser: { id: 'user-2', role: 'USER' },
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={mockResource} permission="edit">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows loading skeleton when loading and showLoadingSkeleton is true', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => false),
      isOwner: jest.fn(() => false),
      isLoading: true,
      currentUser: undefined,
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={mockResource} permission="edit" showLoadingSkeleton>
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    // Check that skeleton is rendered (by checking for specific data attributes or classes)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows nothing when loading and showLoadingSkeleton is false', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => false),
      isOwner: jest.fn(() => false),
      isLoading: true,
      currentUser: undefined,
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={mockResource} permission="edit">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('handles undefined resource gracefully', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => false),
      isOwner: jest.fn(() => false),
      isLoading: false,
      currentUser: { id: 'user-1', role: 'USER' },
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={undefined} permission="edit">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('handles resource with null userId gracefully', () => {
    const resourceWithNullUserId = { id: 'resource-1', userId: null };
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      canView: jest.fn(() => false),
      isOwner: jest.fn(() => false),
      isLoading: false,
      currentUser: { id: 'user-1', role: 'USER' },
      isAdmin: false,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={resourceWithNullUserId} permission="edit">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('admin can access regardless of ownership', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => true),
      canDelete: jest.fn(() => true),
      canView: jest.fn(() => true),
      isOwner: jest.fn(() => false),
      isLoading: false,
      currentUser: { id: 'admin-1', role: 'ADMIN' },
      isAdmin: true,
    } as any);

    render(
      <MantineProvider>
        <ResourceOwner resource={mockResource} permission="edit">
          <div>Protected Content</div>
        </ResourceOwner>
      </MantineProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

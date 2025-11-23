import { render, screen } from '@testing-library/react';
import * as permissionsHook from '~/hooks/use-permissions';
import type { Product } from '~/types/product';
import { ProductTable } from '../ProductTable';

jest.mock('~/hooks/use-permissions');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ProductTable Permission Integration', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      userId: 'user-1',
      categories: [],
      brand: 'Brand A',
      sku: 'SKU-1',
      description: 'Description 1',
      remaining: { id: 'rem-1', quantity: 10, productId: '1' },
      isFavorite: false,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      storeId: null,
      projectId: null,
      user: null,
      favoriteProducts: [],
      images: [],
    },
    {
      id: '2',
      name: 'Product 2',
      userId: 'user-2',
      categories: [],
      brand: 'Brand B',
      sku: 'SKU-2',
      description: 'Description 2',
      remaining: { id: 'rem-2', quantity: 5, productId: '2' },
      isFavorite: false,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      storeId: null,
      projectId: null,
      user: null,
      favoriteProducts: [],
      images: [],
    },
  ];

  const mockDeleteFn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows edit buttons only for owned products', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn((product) => product.userId === 'user-1'),
      canDelete: jest.fn((product) => product.userId === 'user-1'),
      isOwner: jest.fn((product) => product.userId === 'user-1'),
      isLoading: false,
      currentUser: { id: 'user-1', role: 'USER' },
      isAdmin: false,
    } as any);

    render(<ProductTable products={mockProducts} onDelete={mockDeleteFn} />);

    const editButtons = screen.queryAllByTestId('edit-button');
    expect(editButtons).toHaveLength(1);
  });

  it('shows delete buttons only for owned products', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn((product) => product.userId === 'user-1'),
      canDelete: jest.fn((product) => product.userId === 'user-1'),
      isOwner: jest.fn((product) => product.userId === 'user-1'),
      isLoading: false,
      currentUser: { id: 'user-1', role: 'USER' },
      isAdmin: false,
    } as any);

    render(<ProductTable products={mockProducts} onDelete={mockDeleteFn} />);

    const deleteButtons = screen.queryAllByTestId('delete-button');
    expect(deleteButtons).toHaveLength(1);
  });

  it('shows owner badge only for owned products', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn((product) => product.userId === 'user-1'),
      canDelete: jest.fn((product) => product.userId === 'user-1'),
      isOwner: jest.fn((product) => product.userId === 'user-1'),
      isLoading: false,
      currentUser: { id: 'user-1', role: 'USER' },
      isAdmin: false,
    } as any);

    render(<ProductTable products={mockProducts} onDelete={mockDeleteFn} />);

    const ownerBadges = screen.queryAllByText('Owner');
    expect(ownerBadges).toHaveLength(1);
  });

  it('shows favorite button for all products', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      isOwner: jest.fn(() => false),
      isLoading: false,
      currentUser: { id: 'user-1', role: 'USER' },
      isAdmin: false,
    } as any);

    render(<ProductTable products={mockProducts} onDelete={mockDeleteFn} />);

    const favoriteButtons = screen.queryAllByTestId('favorite-button');
    expect(favoriteButtons).toHaveLength(2);
  });

  it('admin sees edit buttons for all products', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => true),
      canDelete: jest.fn(() => true),
      isOwner: jest.fn((product) => product.userId === 'admin-1'),
      isLoading: false,
      currentUser: { id: 'admin-1', role: 'ADMIN' },
      isAdmin: true,
    } as any);

    render(<ProductTable products={mockProducts} onDelete={mockDeleteFn} />);

    const editButtons = screen.queryAllByTestId('edit-button');
    expect(editButtons).toHaveLength(2);
  });

  it('admin sees delete buttons for all products', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => true),
      canDelete: jest.fn(() => true),
      isOwner: jest.fn((product) => product.userId === 'admin-1'),
      isLoading: false,
      currentUser: { id: 'admin-1', role: 'ADMIN' },
      isAdmin: true,
    } as any);

    render(<ProductTable products={mockProducts} onDelete={mockDeleteFn} />);

    const deleteButtons = screen.queryAllByTestId('delete-button');
    expect(deleteButtons).toHaveLength(2);
  });

  it('non-owner does not see edit and delete buttons', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      isOwner: jest.fn(() => false),
      isLoading: false,
      currentUser: { id: 'user-3', role: 'USER' },
      isAdmin: false,
    } as any);

    render(<ProductTable products={mockProducts} onDelete={mockDeleteFn} />);

    const editButtons = screen.queryAllByTestId('edit-button');
    const deleteButtons = screen.queryAllByTestId('delete-button');

    expect(editButtons).toHaveLength(0);
    expect(deleteButtons).toHaveLength(0);
  });

  it('handles loading state gracefully', () => {
    jest.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canEdit: jest.fn(() => false),
      canDelete: jest.fn(() => false),
      isOwner: jest.fn(() => false),
      isLoading: true,
      currentUser: undefined,
      isAdmin: false,
    } as any);

    render(<ProductTable products={mockProducts} onDelete={mockDeleteFn} />);

    // All action buttons should be hidden when loading
    const editButtons = screen.queryAllByTestId('edit-button');
    const deleteButtons = screen.queryAllByTestId('delete-button');

    expect(editButtons).toHaveLength(0);
    expect(deleteButtons).toHaveLength(0);
  });
});

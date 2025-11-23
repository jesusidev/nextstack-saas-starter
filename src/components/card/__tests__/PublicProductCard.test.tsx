import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Product } from '~/types/product';
import { PublicProductCard } from '../PublicProductCard';

// Mock analytics hook
const mockTrack = jest.fn();
jest.mock('~/hooks/analytics/useAnalytics', () => ({
  useAnalytics: () => ({
    track: mockTrack,
    trackPageView: jest.fn(),
    trackUserAction: jest.fn(),
    trackBusinessMetric: jest.fn(),
    trackError: jest.fn(),
  }),
}));

// Mock HeartIcon
jest.mock('~/components/icons/HeartIcon', () => ({
  HeartIcon: ({ filled }: { filled: boolean }) => (
    <div data-testid="heart-icon">{filled ? 'filled' : 'unfilled'}</div>
  ),
}));

describe('PublicProductCard', () => {
  const mockOnSignUpTrigger = jest.fn();

  const mockProduct: Product = {
    id: 'product-123',
    name: 'Test Product',
    description: 'This is a test product description',
    brand: 'Test Brand',
    sku: 'TEST-SKU-001',
    status: 'ACTIVE',
    isFavorite: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    userId: 'user-123',
    storeId: null,
    projectId: 'project-123',
    remaining: {
      id: 'remaining-123',
      quantity: 5,
      productId: 'product-123',
    },
    user: {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
    },
    categories: [
      {
        productId: 'product-123',
        categoryId: 'category-123',
        category: {
          id: 'category-123',
          name: 'Electronics',
          status: 'ACTIVE',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          userId: 'user-123',
        },
      },
    ],
    favoriteProducts: [],
    images: ['https://example.com/image.jpg'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (product = mockProduct) => {
    return render(
      <MantineProvider>
        <PublicProductCard product={product} onSignUpTrigger={mockOnSignUpTrigger} />
      </MantineProvider>
    );
  };

  describe('rendering', () => {
    it('should render product information', () => {
      renderComponent();

      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    });

    it('should render sign-in badge', () => {
      renderComponent();

      expect(screen.getByText('Sign in to view')).toBeInTheDocument();
    });

    it('should render product details', () => {
      renderComponent();

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Test Brand')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    it('should render product image', () => {
      renderComponent();

      const image = screen.getByRole('img', { name: /test product product image/i });
      expect(image).toBeInTheDocument();
    });

    it('should use fallback image when no image provided', () => {
      const productWithoutImage = { ...mockProduct, images: [] };
      renderComponent(productWithoutImage);

      const image = screen.getByRole('img', { name: /test product product image/i });
      expect(image).toBeInTheDocument();
    });

    it('should use fallback image when no image provided', () => {
      const productWithoutImage = { ...mockProduct, images: [] };
      renderComponent(productWithoutImage);

      const image = screen.getByRole('img', { name: /test product product image/i });
      expect(image).toBeInTheDocument();
    });

    it('should not render description if not provided', () => {
      const productWithoutDescription = { ...mockProduct, description: null };
      renderComponent(productWithoutDescription);

      expect(screen.queryByText('This is a test product description')).not.toBeInTheDocument();
    });

    it('should render favorite button', () => {
      renderComponent();

      const favoriteButton = screen.getByTestId('favorite-button');
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should show unfilled heart icon', () => {
      renderComponent();

      const heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveTextContent('unfilled');
    });
  });

  describe('card click interaction', () => {
    it('should trigger sign-up overlay on card click', () => {
      renderComponent();

      const card = screen.getByRole('button', { name: /view test product - sign in required/i });
      fireEvent.click(card);

      expect(mockOnSignUpTrigger).toHaveBeenCalledWith('card');
    });

    it('should emit analytics event on card click', () => {
      renderComponent();

      const card = screen.getByRole('button', { name: /view test product - sign in required/i });
      fireEvent.click(card);

      expect(mockTrack).toHaveBeenCalledWith({
        event: 'conversion:public-product-card-click',
        properties: {
          productId: 'product-123',
          productName: 'Test Product',
          isAuthenticated: false,
        },
      });
    });

    it('should trigger on Enter key press', () => {
      renderComponent();

      const card = screen.getByRole('button', { name: /view test product - sign in required/i });
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });

      expect(mockOnSignUpTrigger).toHaveBeenCalledWith('card');
    });

    it('should trigger on Space key press', () => {
      renderComponent();

      const card = screen.getByRole('button', { name: /view test product - sign in required/i });
      fireEvent.keyDown(card, { key: ' ', code: 'Space' });

      expect(mockOnSignUpTrigger).toHaveBeenCalledWith('card');
    });
  });

  describe('favorite button interaction', () => {
    it('should trigger sign-up overlay on favorite click', () => {
      renderComponent();

      const favoriteButton = screen.getByTestId('favorite-button');
      fireEvent.click(favoriteButton);

      expect(mockOnSignUpTrigger).toHaveBeenCalledWith('favorite');
    });

    it('should emit analytics event on favorite click', () => {
      renderComponent();

      const favoriteButton = screen.getByTestId('favorite-button');
      fireEvent.click(favoriteButton);

      expect(mockTrack).toHaveBeenCalledWith({
        event: 'conversion:public-product-favorite-click',
        properties: {
          productId: 'product-123',
          productName: 'Test Product',
          isAuthenticated: false,
        },
      });
    });

    it('should prevent event bubbling on favorite click', () => {
      renderComponent();

      const favoriteButton = screen.getByTestId('favorite-button');
      fireEvent.click(favoriteButton);

      // Should only call onSignUpTrigger once with 'favorite'
      expect(mockOnSignUpTrigger).toHaveBeenCalledTimes(1);
      expect(mockOnSignUpTrigger).toHaveBeenCalledWith('favorite');
    });
  });

  describe('accessibility', () => {
    it('should have role="button" on card', () => {
      renderComponent();

      const card = screen.getByRole('button', { name: /view test product - sign in required/i });
      expect(card).toBeInTheDocument();
    });

    it('should have tabIndex="0" for keyboard navigation', () => {
      renderComponent();

      const card = screen.getByRole('button', { name: /view test product - sign in required/i });
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper aria-label on favorite button', () => {
      renderComponent();

      const favoriteButton = screen.getByRole('button', {
        name: /sign up to favorite this product/i,
      });
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should have proper tooltips', () => {
      renderComponent();

      // User tooltip
      expect(screen.getByText('User')).toBeInTheDocument();

      // Quantity tooltip
      expect(screen.getByText('Quantity')).toBeInTheDocument();

      // Brand tooltip
      expect(screen.getByText('Brand')).toBeInTheDocument();

      // Categories tooltip
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have cursor pointer style', () => {
      renderComponent();

      const card = screen.getByRole('button', { name: /view test product - sign in required/i });
      expect(card).toHaveStyle('cursor: pointer');
    });

    it('should have transition style', () => {
      renderComponent();

      const card = screen.getByRole('button', { name: /view test product - sign in required/i });
      expect(card).toHaveStyle('transition: all 0.2s ease');
    });
  });

  describe('conditional rendering', () => {
    it('should not render user if not provided', () => {
      const productWithoutUser = { ...mockProduct, user: null };
      renderComponent(productWithoutUser);

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should not render quantity if not provided', () => {
      const productWithoutQuantity = { ...mockProduct, remaining: null };
      renderComponent(productWithoutQuantity);

      // Check that quantity icon is not present
      const quantityElement = screen.queryByText('5');
      expect(quantityElement).not.toBeInTheDocument();
    });

    it('should not render brand if not provided', () => {
      const productWithoutBrand = { ...mockProduct, brand: null };
      renderComponent(productWithoutBrand);

      expect(screen.queryByText('Test Brand')).not.toBeInTheDocument();
    });

    it('should not render categories if empty', () => {
      const productWithoutCategories = { ...mockProduct, categories: [] };
      renderComponent(productWithoutCategories);

      expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
    });
  });
});

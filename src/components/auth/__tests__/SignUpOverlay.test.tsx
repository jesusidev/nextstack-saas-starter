import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SignUpOverlay } from '../SignUpOverlay';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

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

describe('SignUpOverlay', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props: {
    opened: boolean;
    onClose: () => void;
    triggerSource: 'card' | 'favorite' | 'scroll';
    title?: string;
    description?: string;
  }) => {
    return render(
      <MantineProvider>
        <SignUpOverlay {...props} />
      </MantineProvider>
    );
  };

  describe('rendering', () => {
    it('should not render when closed', () => {
      renderComponent({
        opened: false,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      expect(screen.queryByTestId('signup-overlay')).not.toBeInTheDocument();
    });

    it('should render when opened', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      expect(screen.getByTestId('signup-overlay')).toBeInTheDocument();
    });

    it('should render Clerk SignIn component', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
    });
  });

  describe('trigger-specific messaging', () => {
    it('should show card_click messaging', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      expect(screen.getByText(/sign in to view full product details/i)).toBeInTheDocument();
      expect(
        screen.getByText(/create a free account to explore product details/i)
      ).toBeInTheDocument();
    });

    it('should show favorite_click messaging', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'favorite',
      });

      expect(screen.getByText(/sign in to save your favorite products/i)).toBeInTheDocument();
      expect(
        screen.getByText(/join thousands of users discovering and organizing/i)
      ).toBeInTheDocument();
    });

    it('should show scroll_trigger messaging', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'scroll',
      });

      expect(
        screen.getByText(/join thousands of users discovering amazing products/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/create your free account to unlock full access/i)
      ).toBeInTheDocument();
    });

    it('should use custom title and description', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
        title: 'Custom Title',
        description: 'Custom Description',
      });

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Description')).toBeInTheDocument();
    });
  });

  describe('analytics tracking', () => {
    it('should track shown event when opened', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      expect(mockTrack).toHaveBeenCalledWith({
        event: 'conversion:overlay-shown',
        properties: {
          triggerSource: 'card',
        },
      });
    });

    it('should track shown event with different trigger sources', () => {
      const { rerender } = renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'favorite',
      });

      expect(mockTrack).toHaveBeenCalledWith({
        event: 'conversion:overlay-shown',
        properties: {
          triggerSource: 'favorite',
        },
      });

      mockTrack.mockClear();

      rerender(
        <MantineProvider>
          <SignUpOverlay opened={true} onClose={mockOnClose} triggerSource="scroll" />
        </MantineProvider>
      );

      expect(mockTrack).toHaveBeenCalledWith({
        event: 'conversion:overlay-shown',
        properties: {
          triggerSource: 'scroll',
        },
      });
    });

    it('should track dismissed event on close', async () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'scroll',
      });

      // Clear the "shown" event
      mockTrack.mockClear();

      // Find and click close button (Mantine Modal close button)
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockTrack).toHaveBeenCalledWith({
          event: 'conversion:overlay-dismissed',
          properties: {
            triggerSource: 'scroll',
          },
        });
      });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('user interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should be closeable via Escape key', async () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should navigate to sign-up page when Sign Up button is clicked', async () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      const signUpButton = screen.getByTestId('signup-button');
      fireEvent.click(signUpButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/sign-up');
        expect(mockTrack).toHaveBeenCalledWith({
          event: 'conversion:signup-clicked',
          properties: {
            triggerSource: 'card',
            action: 'sign_up',
          },
        });
      });
    });

    it('should navigate to sign-in page when Sign In button is clicked', async () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'favorite',
      });

      const signInButton = screen.getByTestId('signin-button');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/sign-in');
        expect(mockTrack).toHaveBeenCalledWith({
          event: 'conversion:signin-clicked',
          properties: {
            triggerSource: 'favorite',
            action: 'sign_in',
          },
        });
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper modal attributes', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      const modal = screen.getByTestId('signup-overlay');
      expect(modal).toHaveAttribute('data-testid', 'signup-overlay');
    });

    it('should have close button with accessible label', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should have accessible Sign Up button', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      const signUpButton = screen.getByTestId('signup-button');
      expect(signUpButton).toBeInTheDocument();
      expect(signUpButton).toHaveTextContent(/sign up/i);
    });

    it('should have accessible Sign In button', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      const signInButton = screen.getByTestId('signin-button');
      expect(signInButton).toBeInTheDocument();
      expect(signInButton).toHaveTextContent(/sign in/i);
    });
  });

  describe('additional messaging', () => {
    it('should display "no credit card required" message', () => {
      renderComponent({
        opened: true,
        onClose: mockOnClose,
        triggerSource: 'card',
      });

      expect(
        screen.getByText(/no credit card required • free forever • takes 30 seconds/i)
      ).toBeInTheDocument();
    });
  });
});

// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom/jest-globals');

// Mock ResizeObserver for Mantine components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Next.js App Router navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Next.js router (legacy - keeping for compatibility during migration)
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock Clerk authentication (client-side)
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'user_123',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'user_123',
    sessionId: 'session_123',
    getToken: jest.fn().mockResolvedValue('mock-token'),
  }),
  // @ts-expect-error
  ClerkProvider: ({ children }) => children,
  // @ts-expect-error
  SignedIn: ({ children }) => children,
  SignedOut: () => null,
}));

// Mock Clerk authentication (server-side)
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({
    userId: 'user_123',
    sessionId: 'session_123',
  })),
  currentUser: jest.fn(() => ({
    id: 'user_123',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  })),
}));

// Mock tRPC API
jest.mock('~/utils/trpc', () => ({
  api: {
    useContext: jest.fn(() => ({
      client: {
        query: jest.fn(),
        mutation: jest.fn(),
      },
    })),
  },
}));

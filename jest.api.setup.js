// Setup for API route tests (Node environment)

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
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

// Mock environment variables
process.env.S3_ASSETS_BUCKET = 'test-bucket';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';

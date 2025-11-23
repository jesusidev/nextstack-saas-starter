import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { POST } from '~/app/api/files/upload/route';
import { db } from '~/server/db';
import { s3Service } from '~/service/aws/s3Service';
import { requireAuth, verifyProductOwnership } from '~/utils/apiAuth';

jest.mock('~/utils/apiAuth');
jest.mock('~/service/aws/s3Service');
jest.mock('~/server/db', () => ({
  db: {
    fileUpload: {
      create: jest.fn(),
    },
  },
}));

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockVerifyProductOwnership = verifyProductOwnership as jest.MockedFunction<
  typeof verifyProductOwnership
>;
const mockS3Create = s3Service.create as jest.MockedFunction<typeof s3Service.create>;
const mockDbCreate = db.fileUpload.create as jest.MockedFunction<typeof db.fileUpload.create>;

describe('POST /api/files/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require authentication', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

    const request = new Request('http://localhost/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
  });

  it('should validate file type', async () => {
    mockRequireAuth.mockResolvedValue('user123');

    const request = new Request('http://localhost/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('validation');
  });

  it('should validate file size', async () => {
    mockRequireAuth.mockResolvedValue('user123');

    const request = new Request('http://localhost/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        fileSize: 20 * 1024 * 1024,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('validation');
  });

  it('should verify product ownership when productId is provided', async () => {
    mockRequireAuth.mockResolvedValue('user123');
    mockVerifyProductOwnership.mockResolvedValue(undefined);
    mockS3Create.mockResolvedValue({
      key: 'test-key',
      uploadUrl: 'https://s3.amazonaws.com/test',
    });
    mockDbCreate.mockResolvedValue({
      id: 'upload123',
      key: 'test-key',
      filename: 'test.jpg',
      contentType: 'image/jpeg',
      fileSize: 1024,
      userId: 'user123',
      productId: 'prod123',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024,
        productId: 'prod123',
      }),
    });

    await POST(request as any);

    expect(mockVerifyProductOwnership).toHaveBeenCalledWith('user123', 'prod123');
  });

  it('should create presigned URL and track upload', async () => {
    mockRequireAuth.mockResolvedValue('user123');
    mockS3Create.mockResolvedValue({
      key: 'assets/test-key.jpg',
      uploadUrl: 'https://s3.amazonaws.com/test?presigned',
    });
    mockDbCreate.mockResolvedValue({
      id: 'upload123',
      key: 'assets/test-key.jpg',
      filename: 'test.jpg',
      contentType: 'image/jpeg',
      fileSize: 1024,
      userId: 'user123',
      productId: null,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.uploadId).toBe('upload123');
    expect(data.data.key).toBe('assets/test-key.jpg');
    expect(data.data.uploadUrl).toContain('presigned');
    expect(mockS3Create).toHaveBeenCalled();
    expect(mockDbCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        key: 'assets/test-key.jpg',
        filename: 'test.jpg',
        userId: 'user123',
        status: 'PENDING',
      }),
    });
  });

  it('should handle missing required fields', async () => {
    mockRequireAuth.mockResolvedValue('user123');

    const request = new Request('http://localhost/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.jpg',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('validation');
  });
});

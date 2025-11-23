import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { POST } from '~/app/api/files/confirm/route';
import { db } from '~/server/db';
import { s3Service } from '~/service/aws/s3Service';
import { requireAuth, verifyUploadOwnership } from '~/utils/apiAuth';

jest.mock('~/utils/apiAuth');
jest.mock('~/service/aws/s3Service');
jest.mock('~/server/db', () => ({
  db: {
    fileUpload: {
      update: jest.fn(),
    },
  },
}));
jest.mock('~/env.mjs', () => ({
  env: {
    S3_ASSETS_BUCKET: 'test-bucket',
    AWS_REGION: 'us-east-1',
  },
}));

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockVerifyUploadOwnership = verifyUploadOwnership as jest.MockedFunction<
  typeof verifyUploadOwnership
>;
const mockS3HeadObject = s3Service.headObject as jest.MockedFunction<typeof s3Service.headObject>;
const mockDbUpdate = db.fileUpload.update as jest.MockedFunction<typeof db.fileUpload.update>;

describe('POST /api/files/confirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require authentication', async () => {
    const { UnauthorizedError } = require('~/types/api');
    mockRequireAuth.mockRejectedValue(new UnauthorizedError('Authentication required'));

    const request = new Request('http://localhost/api/files/confirm', {
      method: 'POST',
      body: JSON.stringify({
        uploadId: 'upload123',
        key: 'assets/test.jpg',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
  });

  it('should verify upload ownership', async () => {
    mockRequireAuth.mockResolvedValue('user123');
    mockVerifyUploadOwnership.mockResolvedValue(undefined);
    mockS3HeadObject.mockResolvedValue({
      exists: true,
      contentLength: 1024,
      contentType: 'image/jpeg',
    });
    mockDbUpdate.mockResolvedValue({
      id: 'upload123',
      key: 'assets/test.jpg',
      filename: 'test.jpg',
      contentType: 'image/jpeg',
      fileSize: 1024,
      userId: 'user123',
      productId: null,
      status: 'COMPLETED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost/api/files/confirm', {
      method: 'POST',
      body: JSON.stringify({
        uploadId: 'upload123',
        key: 'assets/test.jpg',
      }),
    });

    await POST(request as any);

    expect(mockVerifyUploadOwnership).toHaveBeenCalledWith('user123', 'upload123');
  });

  it('should verify file exists in S3', async () => {
    mockRequireAuth.mockResolvedValue('user123');
    mockVerifyUploadOwnership.mockResolvedValue(undefined);
    mockS3HeadObject.mockResolvedValue({
      exists: false,
    });

    const request = new Request('http://localhost/api/files/confirm', {
      method: 'POST',
      body: JSON.stringify({
        uploadId: 'upload123',
        key: 'assets/test.jpg',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toContain('not found');
  });

  it('should update file upload status to COMPLETED', async () => {
    mockRequireAuth.mockResolvedValue('user123');
    mockVerifyUploadOwnership.mockResolvedValue(undefined);
    mockS3HeadObject.mockResolvedValue({
      exists: true,
      contentLength: 2048,
      contentType: 'image/jpeg',
    });
    mockDbUpdate.mockResolvedValue({
      id: 'upload123',
      key: 'assets/test.jpg',
      filename: 'test.jpg',
      contentType: 'image/jpeg',
      fileSize: 2048,
      userId: 'user123',
      productId: null,
      status: 'COMPLETED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost/api/files/confirm', {
      method: 'POST',
      body: JSON.stringify({
        uploadId: 'upload123',
        key: 'assets/test.jpg',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.success).toBe(true);
    expect(data.data.url).toContain('test-bucket');
    expect(data.data.url).toContain('assets/test.jpg');
    expect(mockDbUpdate).toHaveBeenCalledWith({
      where: { id: 'upload123' },
      data: {
        status: 'COMPLETED',
        fileSize: 2048,
      },
    });
  });

  it('should return error when verification fails', async () => {
    const { ForbiddenError } = require('~/types/api');
    mockRequireAuth.mockResolvedValue('user123');
    mockVerifyUploadOwnership.mockRejectedValue(new ForbiddenError('Not authorized'));

    const request = new Request('http://localhost/api/files/confirm', {
      method: 'POST',
      body: JSON.stringify({
        uploadId: 'upload123',
        key: 'assets/test.jpg',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toContain('Forbidden');
  });
});

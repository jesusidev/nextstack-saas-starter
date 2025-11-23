import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DELETE } from '~/app/api/files/delete/route';
import { db } from '~/server/db';
import { s3Service } from '~/service/aws/s3Service';
import { requireAuth, verifyImageOwnership } from '~/utils/apiAuth';

jest.mock('~/utils/apiAuth');
jest.mock('~/service/aws/s3Service');
jest.mock('~/server/db', () => ({
  db: {
    fileUpload: {
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockVerifyImageOwnership = verifyImageOwnership as jest.MockedFunction<
  typeof verifyImageOwnership
>;
const mockS3Delete = s3Service.delete as jest.MockedFunction<typeof s3Service.delete>;
const mockDbUpdate = db.fileUpload.update as jest.MockedFunction<typeof db.fileUpload.update>;
const mockDbFindFirst = db.fileUpload.findFirst as jest.MockedFunction<
  typeof db.fileUpload.findFirst
>;

describe('DELETE /api/files/delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require authentication', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

    const request = new Request('http://localhost/api/files/delete', {
      method: 'DELETE',
      body: JSON.stringify({
        key: 'assets/test.jpg',
      }),
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
  });

  it('should verify image ownership', async () => {
    mockRequireAuth.mockResolvedValue('user123');
    mockVerifyImageOwnership.mockResolvedValue(undefined);
    mockS3Delete.mockResolvedValue({
      message: 'File deleted successfully',
      params: { Bucket: 'test-bucket', Key: 'assets/test.jpg' },
    });
    mockDbFindFirst.mockResolvedValue({
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
    mockDbUpdate.mockResolvedValue({
      id: 'upload123',
      key: 'assets/test.jpg',
      filename: 'test.jpg',
      contentType: 'image/jpeg',
      fileSize: 1024,
      userId: 'user123',
      productId: null,
      status: 'DELETED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost/api/files/delete', {
      method: 'DELETE',
      body: JSON.stringify({
        key: 'assets/test.jpg',
        productId: 'product123',
      }),
    });

    await DELETE(request as any);

    expect(mockVerifyImageOwnership).toHaveBeenCalledWith(
      'user123',
      'assets/test.jpg',
      'product123'
    );
  });

  it('should delete from S3 and mark as DELETED', async () => {
    mockRequireAuth.mockResolvedValue('user123');
    mockVerifyImageOwnership.mockResolvedValue(undefined);
    mockS3Delete.mockResolvedValue({
      message: 'File deleted successfully',
      params: { Bucket: 'test-bucket', Key: 'assets/test.jpg' },
    });
    mockDbFindFirst.mockResolvedValue({
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
    mockDbUpdate.mockResolvedValue({
      id: 'upload123',
      key: 'assets/test.jpg',
      filename: 'test.jpg',
      contentType: 'image/jpeg',
      fileSize: 1024,
      userId: 'user123',
      productId: null,
      status: 'DELETED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost/api/files/delete', {
      method: 'DELETE',
      body: JSON.stringify({
        key: 'assets/test.jpg',
        productId: 'product123',
      }),
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain('deleted');
    expect(mockS3Delete).toHaveBeenCalledWith('assets/test.jpg');
    expect(mockDbUpdate).toHaveBeenCalledWith({
      where: { key: 'assets/test.jpg' },
      data: { status: 'DELETED' },
    });
  });

  it('should reject unauthorized delete attempts', async () => {
    mockRequireAuth.mockResolvedValue('user123');
    mockVerifyImageOwnership.mockRejectedValue(new Error('Not authorized'));

    const request = new Request('http://localhost/api/files/delete', {
      method: 'DELETE',
      body: JSON.stringify({
        key: 'assets/someone-elses-image.jpg',
      }),
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBeDefined();
    expect(mockS3Delete).not.toHaveBeenCalled();
  });

  it('should handle missing key', async () => {
    mockRequireAuth.mockResolvedValue('user123');

    const request = new Request('http://localhost/api/files/delete', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('validation');
  });
});

import { TRPCClientError } from '@trpc/client';
import {
  getPermissionErrorInfo,
  getPermissionToastInfo,
  getSuccessToastInfo,
} from '../errorHandling';

// Mock console.error
const mockConsoleError = jest.fn();
console.error = mockConsoleError;

describe('errorHandling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  describe('getPermissionErrorInfo', () => {
    it('returns error info for FORBIDDEN errors', () => {
      const error = new TRPCClientError('Forbidden');
      // @ts-expect-error - Mocking TRPC error data structure
      error.data = { code: 'FORBIDDEN' };

      const result = getPermissionErrorInfo(error, 'product');

      expect(result).toEqual({
        message: "You don't have permission to modify this product.",
        type: 'error',
      });
    });

    it('returns warning info for NOT_FOUND errors', () => {
      const error = new TRPCClientError('Not Found');
      // @ts-expect-error - Mocking TRPC error data structure
      error.data = { code: 'NOT_FOUND' };

      const result = getPermissionErrorInfo(error, 'project');

      expect(result).toEqual({
        message: 'This project could not be found.',
        type: 'warning',
      });
    });

    it('returns generic error info for unexpected errors', () => {
      const error = new Error('Unexpected error');

      const result = getPermissionErrorInfo(error, 'resource');

      expect(result).toEqual({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error);
    });

    it('returns generic error info for TRPC errors without specific code', () => {
      const error = new TRPCClientError('Internal Server Error');
      // @ts-expect-error - Mocking TRPC error data structure
      error.data = { code: 'INTERNAL_SERVER_ERROR' };

      const result = getPermissionErrorInfo(error, 'category');

      expect(result).toEqual({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error);
    });

    it('uses default resource type when not provided', () => {
      const error = new TRPCClientError('Forbidden');
      // @ts-expect-error - Mocking TRPC error data structure
      error.data = { code: 'FORBIDDEN' };

      const result = getPermissionErrorInfo(error);

      expect(result).toEqual({
        message: "You don't have permission to modify this resource.",
        type: 'error',
      });
    });
  });

  describe('getPermissionToastInfo', () => {
    it('returns permission required info with correct message', () => {
      const result = getPermissionToastInfo('edit', 'product');

      expect(result).toEqual({
        message: 'You need owner permissions to edit this product.',
        type: 'warning',
      });
    });
  });

  describe('getSuccessToastInfo', () => {
    it('returns success info with correct message', () => {
      const result = getSuccessToastInfo('updated', 'product');

      expect(result).toEqual({
        message: 'product updated successfully.',
        type: 'success',
      });
    });
  });
});

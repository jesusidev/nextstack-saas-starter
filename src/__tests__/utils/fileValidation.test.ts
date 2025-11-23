import { describe, expect, it } from '@jest/globals';
import { FILE_UPLOAD_ERRORS, MAX_FILE_SIZE } from '~/constants/fileUpload';
import {
  getFileExtension,
  isValidImageType,
  sanitizeFilename,
  uploadRequestSchema,
  validateFileSize,
  validateImageType,
} from '~/utils/fileValidation';

describe('fileValidation', () => {
  describe('isValidImageType', () => {
    it('should accept valid image types', () => {
      expect(isValidImageType('image/jpeg')).toBe(true);
      expect(isValidImageType('image/png')).toBe(true);
      expect(isValidImageType('image/webp')).toBe(true);
      expect(isValidImageType('image/gif')).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(isValidImageType('image/bmp')).toBe(false);
      expect(isValidImageType('application/pdf')).toBe(false);
      expect(isValidImageType('text/plain')).toBe(false);
    });
  });

  describe('validateImageType', () => {
    it('should not throw for valid types', () => {
      expect(() => validateImageType('image/jpeg')).not.toThrow();
      expect(() => validateImageType('image/png')).not.toThrow();
    });

    it('should throw for invalid types', () => {
      expect(() => validateImageType('image/bmp')).toThrow(FILE_UPLOAD_ERRORS.INVALID_FILE_TYPE);
    });
  });

  describe('validateFileSize', () => {
    it('should accept valid file sizes', () => {
      expect(() => validateFileSize(1024)).not.toThrow();
      expect(() => validateFileSize(MAX_FILE_SIZE)).not.toThrow();
    });

    it('should reject oversized files', () => {
      expect(() => validateFileSize(MAX_FILE_SIZE + 1)).toThrow(FILE_UPLOAD_ERRORS.FILE_TOO_LARGE);
    });

    it('should reject zero or negative sizes', () => {
      expect(() => validateFileSize(0)).toThrow();
      expect(() => validateFileSize(-1)).toThrow();
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path traversal attempts', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd');
    });

    it('should preserve valid characters', () => {
      expect(sanitizeFilename('my-image_2024.jpg')).toBe('my-image_2024.jpg');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeFilename('file<script>.jpg')).toBe('filescript.jpg');
    });

    it('should truncate long filenames', () => {
      const longName = `${'a'.repeat(300)}.jpg`;
      expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255);
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extensions', () => {
      expect(getFileExtension('test.jpg')).toBe('.jpg');
      expect(getFileExtension('image.png')).toBe('.png');
    });

    it('should handle files without extensions', () => {
      expect(getFileExtension('noextension')).toBe('');
    });

    it('should handle multiple dots', () => {
      expect(getFileExtension('my.file.jpg')).toBe('.jpg');
    });
  });

  describe('uploadRequestSchema', () => {
    it('should validate correct upload requests', () => {
      const valid = {
        filename: 'test.jpg',
        contentType: 'image/jpeg' as const,
        fileSize: 1024,
        productId: 'prod_123',
      };
      expect(uploadRequestSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject invalid content types', () => {
      const invalid = {
        filename: 'test.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
      };
      expect(uploadRequestSchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject oversized files', () => {
      const invalid = {
        filename: 'test.jpg',
        contentType: 'image/jpeg' as const,
        fileSize: MAX_FILE_SIZE + 1,
      };
      expect(uploadRequestSchema.safeParse(invalid).success).toBe(false);
    });

    it('should allow optional productId', () => {
      const valid = {
        filename: 'test.jpg',
        contentType: 'image/jpeg' as const,
        fileSize: 1024,
      };
      expect(uploadRequestSchema.safeParse(valid).success).toBe(true);
    });
  });
});

import { z } from 'zod';
import { ALLOWED_IMAGE_TYPES, FILE_UPLOAD_ERRORS, MAX_FILE_SIZE } from '~/constants/fileUpload';

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const isValidImageType = (contentType: string): contentType is AllowedImageType => {
  return ALLOWED_IMAGE_TYPES.includes(contentType as AllowedImageType);
};

export const validateImageType = (contentType: string): void => {
  if (!isValidImageType(contentType)) {
    throw new Error(FILE_UPLOAD_ERRORS.INVALID_FILE_TYPE);
  }
};

export const validateFileSize = (fileSize: number): void => {
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(FILE_UPLOAD_ERRORS.FILE_TOO_LARGE);
  }

  if (fileSize <= 0) {
    throw new Error('File size must be greater than 0.');
  }
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9-_. ]/g, '')
    .trim()
    .slice(0, 255);
};

export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.slice(lastDot).toLowerCase();
};

export const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
  fileSize: z.number().min(1).max(MAX_FILE_SIZE),
  productId: z.string().optional(),
});

export const deleteRequestSchema = z.object({
  key: z.string().min(1),
  productId: z.string(),
});

export const confirmUploadSchema = z.object({
  uploadId: z.string(),
  key: z.string(),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;
export type DeleteRequest = z.infer<typeof deleteRequestSchema>;
export type ConfirmUploadRequest = z.infer<typeof confirmUploadSchema>;

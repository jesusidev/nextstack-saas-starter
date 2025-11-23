import type { FileUpload, UploadStatus } from '@prisma/client';
import type { ConfirmUploadRequest, DeleteRequest, UploadRequest } from '~/utils/fileValidation';

export type { UploadRequest, DeleteRequest, ConfirmUploadRequest };

export interface PresignedUploadResponse {
  uploadId: string;
  key: string;
  uploadUrl: string;
}

export interface ConfirmUploadResponse {
  success: true;
  url: string;
  fileUpload: FileUpload;
}

export interface DeleteFileResponse {
  success: true;
  message: string;
  key: string;
}

export interface S3PresignInput {
  filename: string;
  contentType: string;
}

export interface S3PresignOutput {
  key: string;
  uploadUrl: string;
}

export interface S3DeleteInput {
  key: string;
}

export interface S3HeadObjectResult {
  exists: boolean;
  contentType?: string;
  contentLength?: number;
  lastModified?: Date;
  etag?: string;
}

export interface CreateUploadInput {
  filename: string;
  contentType: string;
  fileSize: number;
  userId: string;
  productId?: string;
}

export interface UpdateUploadStatusInput {
  uploadId: string;
  status: UploadStatus;
}

export interface OrphanedUpload {
  id: string;
  key: string;
  createdAt: Date;
  status: UploadStatus;
}

export interface CleanupResult {
  deletedCount: number;
  failedKeys: string[];
  errors: Array<{ key: string; error: string }>;
}

export interface S3Config {
  bucket: string;
  region: string;
}

export interface FileOperationError {
  code: string;
  message: string;
  key?: string;
  statusCode: number;
}

export type UploadFlowState =
  | { status: 'idle' }
  | { status: 'requesting-presign' }
  | { status: 'uploading'; progress: number }
  | { status: 'confirming' }
  | { status: 'success'; url: string }
  | { status: 'error'; error: string };

export interface FileMetadata {
  filename: string;
  contentType: string;
  fileSize: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export type ImageContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

export const isImageContentType = (type: string): type is ImageContentType => {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type);
};

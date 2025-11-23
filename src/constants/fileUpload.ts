export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const PRESIGNED_URL_EXPIRY = 60 * 60;

export const FILE_UPLOAD_ERRORS = {
  INVALID_FILE_TYPE: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.',
  FILE_TOO_LARGE: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
  INVALID_FILENAME: 'Invalid filename. Please use alphanumeric characters and common symbols.',
  MISSING_FIELDS: 'Required fields are missing.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  PRODUCT_NOT_FOUND: 'Product not found or access denied.',
} as const;

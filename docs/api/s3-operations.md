# S3 Operations API Documentation

## Overview

Secure API endpoints for uploading, confirming, and deleting images in S3. All endpoints require authentication and implement authorization checks.

## Security Features

- ✅ Authentication required on all endpoints
- ✅ Authorization checks (user ownership validation)
- ✅ Server-side file validation (type, size)
- ✅ Upload tracking in database
- ✅ Two-phase upload (presign → upload → confirm)
- ✅ Audit trail for all operations

## API Endpoints

### POST /api/files/upload

Generate a presigned URL for uploading a file to S3.

**Authentication:** Required

**Request Body:**
```json
{
  "filename": "image.jpg",
  "contentType": "image/jpeg",
  "fileSize": 1024000,
  "productId": "prod_123" // optional
}
```

**Validation Rules:**
- `filename`: Required, max 255 characters, sanitized
- `contentType`: Must be one of: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- `fileSize`: Required, max 10MB (10485760 bytes)
- `productId`: Optional, must be owned by authenticated user

**Response (200):**
```json
{
  "success": true,
  "message": "Presigned URL generated successfully",
  "data": {
    "uploadId": "upload_abc123",
    "key": "assets/user123/image-uuid.jpg",
    "uploadUrl": "https://bucket.s3.region.amazonaws.com/assets/...?presigned-params"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `400 Bad Request`: Validation failed
- `403 Forbidden`: Product not owned by user
- `500 Internal Server Error`: Server error

**Example Usage:**
```typescript
const response = await fetch('/api/files/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: file.name,
    contentType: file.type,
    fileSize: file.size,
    productId: 'prod_123',
  }),
});

const { data } = await response.json();
const { uploadId, key, uploadUrl } = data;

// Step 2: Upload to S3
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
});

// Step 3: Confirm upload (see below)
```

---

### POST /api/files/confirm

Confirm that a file was successfully uploaded to S3 and mark it as complete.

**Authentication:** Required

**Request Body:**
```json
{
  "uploadId": "upload_abc123",
  "key": "assets/user123/image-uuid.jpg"
}
```

**Validation Rules:**
- `uploadId`: Required, must be owned by authenticated user
- `key`: Required, must match uploadId

**Server-Side Verification:**
1. Verifies user owns the upload record
2. Checks file exists in S3 (HeadObject)
3. Updates upload status to `COMPLETED`
4. Records actual file size from S3

**Response (200):**
```json
{
  "success": true,
  "message": "Upload confirmed successfully",
  "data": {
    "success": true,
    "url": "https://bucket.s3.region.amazonaws.com/assets/user123/image-uuid.jpg",
    "fileUpload": {
      "id": "upload_abc123",
      "key": "assets/user123/image-uuid.jpg",
      "status": "COMPLETED",
      "fileSize": 1024000,
      ...
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Upload not owned by user
- `400 Bad Request`: Validation failed or file not found in S3
- `500 Internal Server Error`: Server error

**Note:** If confirmation fails, the upload status is automatically marked as `FAILED`.

---

### DELETE /api/files/delete

Delete an image from S3 and mark it as deleted in the database.

**Authentication:** Required

**Request Body:**
```json
{
  "key": "assets/user123/image-uuid.jpg"
}
```

**Validation Rules:**
- `key`: Required, must be owned by authenticated user

**Authorization:**
- Verifies user owns the image (via product relationship)
- Only image owner can delete

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Image not owned by user
- `400 Bad Request`: Validation failed
- `404 Not Found`: Image not found
- `500 Internal Server Error`: Server error

**Example Usage:**
```typescript
const response = await fetch('/api/files/delete', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'assets/user123/image-uuid.jpg',
  }),
});

const { message } = await response.json();
```

---

## Complete Upload Flow

```typescript
// Step 1: Request presigned URL
const presignResponse = await fetch('/api/files/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: file.name,
    contentType: file.type,
    fileSize: file.size,
    productId: product.id, // optional
  }),
});

if (!presignResponse.ok) {
  throw new Error('Failed to get presigned URL');
}

const { data } = await presignResponse.json();
const { uploadId, key, uploadUrl } = data;

// Step 2: Upload file to S3
const s3Response = await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
});

if (!s3Response.ok) {
  throw new Error('Failed to upload to S3');
}

// Step 3: Confirm upload
const confirmResponse = await fetch('/api/files/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uploadId,
    key,
  }),
});

if (!confirmResponse.ok) {
  throw new Error('Failed to confirm upload');
}

const { data: confirmData } = await confirmResponse.json();
const finalUrl = confirmData.url; // Use this URL to reference the image
```

## Security Best Practices

### 1. Always Validate on Server-Side
Never trust client-side validation alone. All file validation (type, size) is enforced server-side.

### 2. Use Presigned URLs Correctly
- Presigned URLs are time-limited (default: 1 hour)
- Never log or expose presigned URLs
- Always confirm upload after S3 upload

### 3. Authorization Checks
- All operations verify user ownership
- Product images can only be modified by product owner
- Upload records are user-scoped

### 4. Two-Phase Upload
The two-phase upload (presign → upload → confirm) ensures:
- Database tracking before upload
- Verification after upload
- Orphaned file cleanup possible
- Audit trail for all uploads

### 5. Error Handling
Always handle errors at each step:
```typescript
try {
  // Step 1: Presign
  const presignData = await getPresignedUrl();
  
  // Step 2: Upload
  await uploadToS3(presignData.uploadUrl);
  
  // Step 3: Confirm
  await confirmUpload(presignData.uploadId, presignData.key);
} catch (error) {
  // Upload marked as FAILED automatically
  console.error('Upload failed:', error);
  // Show user-friendly error message
}
```

## Environment Variables

Required environment variables:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_ASSETS_BUCKET=your-bucket-name

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Rate Limiting

**Current Status:** Not implemented (Task 017)

**Recommended Limits:**
- Per user (authenticated): 10 uploads/minute, 50 uploads/hour
- Per IP (fallback): 5 uploads/minute, 20 uploads/hour

## Troubleshooting

### Upload fails at Step 2 (S3 upload)

**Symptoms:** 
- Presigned URL generated successfully
- S3 PUT request fails with 403 or network error

**Solutions:**
1. Check CORS configuration on S3 bucket
2. Verify presigned URL not expired
3. Check file ContentType matches presigned request
4. Verify network connectivity to S3

### Upload fails at Step 3 (Confirm)

**Symptoms:**
- File uploaded to S3 successfully
- Confirm endpoint returns error

**Solutions:**
1. Verify uploadId matches presigned response
2. Check file actually exists in S3 (may be delayed)
3. Verify user still has access to upload record
4. Check database connectivity

### "Unauthorized" errors

**Symptoms:**
- 401 responses on API calls

**Solutions:**
1. Verify authentication cookies/tokens present
2. Check Clerk configuration
3. Verify user is logged in
4. Check for token expiration

### "Forbidden" errors

**Symptoms:**
- 403 responses when trying to delete/confirm

**Solutions:**
1. Verify user owns the product/image
2. Check productId is correct
3. Verify upload ownership
4. Check database relationships

## Database Schema

### FileUpload Model

```prisma
model FileUpload {
  id          String       @id @default(cuid())
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  key         String       @unique
  filename    String
  contentType String
  fileSize    Int?
  status      UploadStatus @default(PENDING)
  userId      String
  productId   String?
  product     Product?     @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum UploadStatus {
  PENDING    // Upload initiated, waiting for S3 upload
  COMPLETED  // Upload confirmed, file in S3
  FAILED     // Upload failed or confirmation failed
  DELETED    // File deleted
}
```

## Monitoring & Logging

All file operations are tracked in the database with:
- Upload initiation time
- Completion/failure time
- User ID
- File metadata
- Status transitions

Use database queries to monitor:
```sql
-- Failed uploads
SELECT * FROM "FileUpload" WHERE status = 'FAILED' ORDER BY "createdAt" DESC;

-- Orphaned uploads (PENDING > 1 hour)
SELECT * FROM "FileUpload" 
WHERE status = 'PENDING' 
AND "createdAt" < NOW() - INTERVAL '1 hour';

-- Upload success rate
SELECT 
  status,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM "FileUpload"
GROUP BY status;
```

## Migration from Old Implementation

If migrating from `/api/s3/presign`:

1. **Update client code** to use three-step flow (presign → upload → confirm)
2. **Add file size** to presign request
3. **Add confirm call** after S3 upload
4. **Update error handling** to handle new error responses
5. **Remove old route** after migration complete (Task 016)

**Before:**
```typescript
const { uploadUrl } = await getPresignedUrl(filename, contentType);
await uploadToS3(uploadUrl, file);
// Done - no confirmation
```

**After:**
```typescript
const { uploadId, key, uploadUrl } = await getPresignedUrl(filename, contentType, fileSize);
await uploadToS3(uploadUrl, file);
await confirmUpload(uploadId, key); // New step!
```

## Support

For issues or questions:
- Check troubleshooting section above
- Review error messages in browser console
- Check server logs for API errors
- Verify environment variables configured
- Test with small files first (< 1MB)

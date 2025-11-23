import type { NextRequest } from 'next/server';
import { db } from '~/server/db';
import { s3Service } from '~/service/aws/s3Service';
import type { PresignedUploadResponse } from '~/types/s3';
import { requireAuth, verifyProductOwnership } from '~/utils/apiAuth';
import { handleApiError, successResponse } from '~/utils/apiResponse';
import { uploadRequestSchema } from '~/utils/fileValidation';
import { withRateLimit } from '~/utils/withRateLimit';

async function uploadHandler(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const validatedData = uploadRequestSchema.parse(body);
    const { filename, contentType, fileSize, productId } = validatedData;

    if (productId) {
      await verifyProductOwnership(userId, productId);
    }

    const { key, uploadUrl } = await s3Service.create({
      filename,
      contentType,
    });

    const fileUpload = await db.fileUpload.create({
      data: {
        key,
        filename,
        contentType,
        fileSize,
        userId,
        productId,
        status: 'PENDING',
      },
    });

    const responseData: PresignedUploadResponse = {
      uploadId: fileUpload.id,
      key,
      uploadUrl,
    };

    return successResponse(responseData, 'Presigned URL generated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// Apply rate limiting: 10 requests per minute
export const POST = withRateLimit(uploadHandler, 60 * 1000, 10);

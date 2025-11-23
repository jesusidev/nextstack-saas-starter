import type { NextRequest } from 'next/server';
import { env } from '~/env.mjs';
import { db } from '~/server/db';
import { s3Service } from '~/service/aws/s3Service';
import type { ConfirmUploadResponse } from '~/types/s3';
import { requireAuth, verifyUploadOwnership } from '~/utils/apiAuth';
import { handleApiError, successResponse } from '~/utils/apiResponse';
import { confirmUploadSchema } from '~/utils/fileValidation';
import { withRateLimit } from '~/utils/withRateLimit';

async function confirmHandler(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const { uploadId, key } = confirmUploadSchema.parse(body);

    await verifyUploadOwnership(userId, uploadId);

    const headResult = await s3Service.headObject(key);

    if (!headResult.exists) {
      throw new Error('File not found in S3. Upload may have failed.');
    }

    const fileUpload = await db.fileUpload.update({
      where: { id: uploadId },
      data: {
        status: 'COMPLETED',
        fileSize: headResult.contentLength,
      },
    });

    const baseUrl = `https://${env.S3_ASSETS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
    const finalUrl = `${baseUrl}/${key}`;

    const responseData: ConfirmUploadResponse = {
      success: true,
      url: finalUrl,
      fileUpload,
    };

    return successResponse(responseData, 'Upload confirmed successfully');
  } catch (error) {
    try {
      const body = await request.json();
      const { uploadId } = body;

      if (uploadId) {
        await db.fileUpload.update({
          where: { id: uploadId },
          data: { status: 'FAILED' },
        });
      }
    } catch {
      // Ignore errors when trying to mark upload as failed
    }

    return handleApiError(error);
  }
}

// Apply rate limiting: 15 requests per minute
export const POST = withRateLimit(confirmHandler, 60 * 1000, 15);

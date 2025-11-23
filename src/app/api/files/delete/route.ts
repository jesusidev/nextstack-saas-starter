import type { NextRequest } from 'next/server';
import { db } from '~/server/db';
import { s3Service } from '~/service/aws/s3Service';
import type { DeleteFileResponse } from '~/types/s3';
import { requireAuth, verifyImageOwnership } from '~/utils/apiAuth';
import { handleApiError, successResponse } from '~/utils/apiResponse';
import { deleteRequestSchema } from '~/utils/fileValidation';
import { withRateLimit } from '~/utils/withRateLimit';

async function deleteHandler(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const { key, productId } = deleteRequestSchema.parse(body);

    await verifyImageOwnership(userId, key, productId);

    await s3Service.delete(key);

    await db.productImage.deleteMany({
      where: {
        url: { contains: key },
        productId: productId,
      },
    });

    await db.fileUpload.updateMany({
      where: { key },
      data: { status: 'DELETED' },
    });

    const responseData: DeleteFileResponse = {
      success: true,
      message: 'File deleted successfully',
      key,
    };

    return successResponse(responseData);
  } catch (error) {
    return handleApiError(error);
  }
}

// Apply rate limiting: 20 requests per minute
export const DELETE = withRateLimit(deleteHandler, 60 * 1000, 20);

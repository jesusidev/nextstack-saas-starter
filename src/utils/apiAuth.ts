import { db } from '~/server/db';
import { ForbiddenError } from '~/types/api';

export { getSessionUserId, requireAuth } from '~/lib/auth/session';

export const verifyProductOwnership = async (userId: string, productId: string): Promise<void> => {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { userId: true },
  });

  if (!product) {
    throw new ForbiddenError('Product not found');
  }

  if (product.userId !== userId) {
    throw new ForbiddenError('You do not have permission to modify this product');
  }
};

export const verifyUploadOwnership = async (userId: string, uploadId: string): Promise<void> => {
  const upload = await db.fileUpload.findUnique({
    where: { id: uploadId },
    select: { userId: true },
  });

  if (!upload) {
    throw new ForbiddenError('Upload not found');
  }

  if (upload.userId !== userId) {
    throw new ForbiddenError('You do not have permission to access this upload');
  }
};

export const verifyImageOwnership = async (
  userId: string,
  key: string,
  productId: string
): Promise<void> => {
  const productImage = await db.productImage.findFirst({
    where: {
      url: { contains: key },
      product: {
        id: productId,
        userId: userId,
      },
    },
    include: {
      product: {
        select: { userId: true },
      },
    },
  });

  if (!productImage) {
    throw new ForbiddenError('Image not found or you do not have permission to delete it');
  }
};

import { db } from '~/server/db';
import { s3Service } from '~/service/aws/s3Service';
import type { CleanupResult } from '~/types/s3';

const ORPHAN_THRESHOLD_HOURS = 24;

export const cleanupOrphanedFiles = async (): Promise<CleanupResult> => {
  const threshold = new Date(Date.now() - ORPHAN_THRESHOLD_HOURS * 60 * 60 * 1000);

  const orphanedUploads = await db.fileUpload.findMany({
    where: {
      status: 'PENDING',
      createdAt: { lt: threshold },
    },
  });

  let deletedCount = 0;
  const failedKeys: string[] = [];
  const errors: Array<{ key: string; error: string }> = [];

  for (const upload of orphanedUploads) {
    try {
      await s3Service.delete(upload.key);
      await db.fileUpload.update({
        where: { id: upload.id },
        data: { status: 'DELETED' },
      });
      deletedCount++;
    } catch (error) {
      failedKeys.push(upload.key);
      errors.push({
        key: upload.key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { deletedCount, failedKeys, errors };
};

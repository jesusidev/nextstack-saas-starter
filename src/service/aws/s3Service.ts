import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { env } from '~/env.mjs';
import type { S3HeadObjectResult } from '~/types/s3';

const sanitizeKey = (key: string): string => key.replace(/[^a-zA-Z0-9-_./]/g, '');

const missingEnvs = (config: Record<string, string | undefined>, required: string[]): string[] => {
  return required.filter((key) => !config[key]);
};

const s3Config = {
  bucket: env.S3_ASSETS_BUCKET,
  region: env.AWS_REGION,
};

// Use AWS SDK v3 default credential provider chain (env, shared config, EC2/ECS role, etc.)
const getS3Client = () =>
  new S3Client({
    region: s3Config.region,
    // Prevent SDK from auto-calculating/hoisting checksums into the presigned URL for PutObject
    // which can cause 403 on browser PUT if the body checksum doesn't match.
    requestChecksumCalculation: 'WHEN_REQUIRED',
  });

type PresignInput = { filename: string; contentType: string };

const create = async ({ filename, contentType }: PresignInput) => {
  const missing = missingEnvs({ ...s3Config, bucketName: s3Config.bucket }, [
    'region',
    'bucketName',
  ]);
  if (missing.length > 0) {
    throw new Error(`Missing ENVs: ${missing.join(', ')}`);
  }

  const key = `assets/${uuidv4()}/${sanitizeKey(filename)}`;

  const s3Client = getS3Client();

  const params = {
    Bucket: s3Config.bucket,
    Key: key,
    ContentType: contentType,
  };

  const uploadUrl = await getSignedUrl(s3Client, new PutObjectCommand(params), {
    expiresIn: 60 * 60, // 1 hour
  });

  return { key, uploadUrl };
};

const remove = async (key: string) => {
  const missing = missingEnvs({ ...s3Config, bucketName: s3Config.bucket }, [
    'region',
    'bucketName',
  ]);
  if (missing.length > 0) {
    throw new Error(`Missing ENVs: ${missing.join(', ')}`);
  }

  const s3Client = getS3Client();

  const params = {
    Bucket: s3Config.bucket,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(params));
  return { message: 'File deleted successfully', params };
};

const headObject = async (key: string): Promise<S3HeadObjectResult> => {
  const missing = missingEnvs({ ...s3Config, bucketName: s3Config.bucket }, [
    'region',
    'bucketName',
  ]);
  if (missing.length > 0) {
    throw new Error(`Missing ENVs: ${missing.join(', ')}`);
  }

  const s3Client = getS3Client();

  try {
    const response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
      })
    );

    return {
      exists: true,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      etag: response.ETag,
    };
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return { exists: false };
    }
    throw error;
  }
};

export const s3Service = {
  create,
  delete: remove,
  headObject,
};

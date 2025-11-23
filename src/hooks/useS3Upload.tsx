import type React from 'react';
import { useState } from 'react';
import { useNotificationDispatcher } from '~/events';

export enum UploadMessageType {
  NONE = '',
  FILE_SELECTED = 'Image selected',
  UPLOAD_SUCCESS = 'File uploaded successfully.',
  UPLOAD_ERROR = 'Error uploading file.',
  DELETE_SUCCESS = 'File deleted successfully.',
  DELETE_ERROR = 'Error deleting file.',
  NO_FILE = 'Please select a file first.',
  NO_FILE_TO_DELETE = 'No file to delete.',
}

export enum UploadProgressState {
  IDLE = 'idle',
  REQUESTING_PRESIGN = 'requesting-presign',
  UPLOADING = 'uploading',
  CONFIRMING = 'confirming',
  SUCCESS = 'success',
  ERROR = 'error',
}

function getRelativePath(url: string) {
  const assetsIndex = url.indexOf('/assets');
  if (assetsIndex !== -1) {
    return url.substring(assetsIndex + 1);
  }
  return null; // Return null or handle the case where '/assets' is not found
}

const useS3Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<UploadMessageType>(UploadMessageType.NONE);
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [progressState, setProgressState] = useState<UploadProgressState>(UploadProgressState.IDLE);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const notificationDispatcher = useNotificationDispatcher();

  const handleFileChange = (payload: File | null) => {
    setFile(payload);
    if (payload) {
      setMessage(UploadMessageType.FILE_SELECTED);
      setProgressState(UploadProgressState.IDLE);
    } else {
      setMessage(UploadMessageType.NONE);
      setProgressState(UploadProgressState.IDLE);
      setUploadId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage(UploadMessageType.NO_FILE);
      return;
    }

    setLoading(true);

    try {
      setProgressState(UploadProgressState.REQUESTING_PRESIGN);
      const presignResponse = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get presigned URL');
      }

      const presignResult = await presignResponse.json();
      const { data } = presignResult;
      const { uploadId: newUploadId, key, uploadUrl: presignedUrl } = data;

      setUploadId(newUploadId);

      setProgressState(UploadProgressState.UPLOADING);
      const putHeaders: Record<string, string> = {
        'Content-Type': file.type,
      };

      const s3Response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: putHeaders,
        body: file,
      });

      if (!s3Response.ok) {
        setMessage(UploadMessageType.UPLOAD_ERROR);
        setProgressState(UploadProgressState.ERROR);
        throw new Error('Failed to upload file to S3');
      }

      setProgressState(UploadProgressState.CONFIRMING);
      const confirmResponse = await fetch('/api/files/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId: newUploadId,
          key,
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to confirm upload');
      }

      const confirmResult = await confirmResponse.json();
      const { data: confirmData } = confirmResult;

      setMessage(UploadMessageType.UPLOAD_SUCCESS);
      setProgressState(UploadProgressState.SUCCESS);
      setUploadUrl(confirmData.url);
      setLoading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage(UploadMessageType.UPLOAD_ERROR);
      setProgressState(UploadProgressState.ERROR);
      notificationDispatcher.show({
        message: error instanceof Error ? error.message : 'Error uploading file',
        type: 'error',
      });
      setLoading(false);
    }
  };

  const handleDelete = async (fileKey: string, productId: string) => {
    if (!fileKey) {
      setMessage(UploadMessageType.NO_FILE_TO_DELETE);
      return;
    }

    if (!productId) {
      setMessage(UploadMessageType.DELETE_ERROR);
      console.error('Product ID is required for delete operation');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: getRelativePath(fileKey),
          productId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setMessage(UploadMessageType.DELETE_SUCCESS);
      setUploadUrl('');
      setFile(null);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting file:', error);
      setMessage(UploadMessageType.DELETE_ERROR);
      setLoading(false);
    }
  };

  return {
    file,
    message,
    uploadUrl,
    handleFileChange,
    handleSubmit,
    handleDelete,
    loading,
    progressState,
    uploadId,
  };
};

export default useS3Upload;

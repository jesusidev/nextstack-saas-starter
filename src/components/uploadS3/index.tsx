'use client';

import { Button, FileButton, Group, Image, Loader, Modal, Text, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconPhotoOff, IconPhotoPlus, IconRestore } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { MAX_FILE_SIZE } from '~/constants/fileUpload';
import { useNotificationDispatcher } from '~/events';
import { useAnalytics } from '~/hooks/analytics/useAnalytics';
import { useProductService } from '~/hooks/service/useProductService';
import useS3Upload, { UploadMessageType, UploadProgressState } from '~/hooks/useS3Upload';
import type { Product } from '~/types/product';

function UploadComponent({ product }: { product: Product }) {
  const {
    loading,
    file,
    message,
    uploadUrl,
    handleFileChange,
    handleSubmit,
    handleDelete,
    progressState,
  } = useS3Upload();
  const productService = useProductService();
  const { updateProduct } = productService.useMutations();
  const notificationDispatcher = useNotificationDispatcher();
  const analytics = useAnalytics();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastProcessedUrl = useRef<string | null>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      notificationDispatcher.show({
        message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        type: 'error',
      });
      return;
    }
    handleFileChange(selectedFile);

    if (selectedFile) {
      analytics.trackUserAction({
        action: 'select_product_image',
        category: 'product_management',
        label: product.name,
      });
    }
  };

  const handleReset = () => {
    handleFileChange(null);
    analytics.trackUserAction({
      action: 'reset_product_image_upload',
      category: 'product_management',
      label: product.name,
    });
  };

  useEffect(() => {
    const handleImageUpdate = async () => {
      if (
        message === UploadMessageType.UPLOAD_SUCCESS &&
        uploadUrl &&
        uploadUrl !== lastProcessedUrl.current
      ) {
        lastProcessedUrl.current = uploadUrl;

        try {
          await updateProduct.mutateAsync({ id: product.id, images: [uploadUrl] });

          notificationDispatcher.show({
            message: `Image uploaded successfully for ${product.name}`,
            type: 'success',
          });

          analytics.trackUserAction({
            action: 'upload_product_image',
            category: 'product_management',
            label: product.name,
          });
        } catch (error) {
          console.error('Failed to update product with new image:', error);
          notificationDispatcher.show({
            message: 'Failed to update product with new image',
            type: 'error',
          });
        }
      }
    };

    void handleImageUpdate();
  }, [
    uploadUrl,
    message,
    product.id,
    product.name,
    analytics,
    notificationDispatcher,
    updateProduct,
  ]);

  const getProgressText = () => {
    switch (progressState) {
      case UploadProgressState.REQUESTING_PRESIGN:
        return 'Requesting upload...';
      case UploadProgressState.UPLOADING:
        return 'Uploading...';
      case UploadProgressState.CONFIRMING:
        return 'Confirming...';
      default:
        return null;
    }
  };

  const progressText = getProgressText();

  const openDeleteModal = (imageUrl: string) => {
    setImageToDelete(imageUrl);
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    if (imageToDelete) {
      setIsDeleting(true);
      try {
        await handleDelete(imageToDelete, product.id);
        await updateProduct.mutateAsync({ id: product.id, images: [] });

        notificationDispatcher.show({
          message: `Image deleted successfully for ${product.name}`,
          type: 'success',
        });

        analytics.trackUserAction({
          action: 'delete_product_image',
          category: 'product_management',
          label: product.name,
        });

        setDeleteModalOpened(false);
        setImageToDelete(null);
      } catch (error) {
        console.error('Failed to delete image:', error);
        notificationDispatcher.show({
          message: 'Failed to delete image',
          type: 'error',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setDeleteModalOpened(false);
      setImageToDelete(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!file && !product.images[0] && message !== UploadMessageType.UPLOAD_ERROR && (
        <FileButton onChange={handleFileSelect} accept="image/png,image/jpeg" disabled={loading}>
          {({ onClick }) => (
            <Button
              p={0}
              leftSection={<IconPhotoPlus size={15} />}
              variant="transparent"
              color="black"
              type="button"
              onClick={onClick}
              disabled={loading}
            >
              Upload image
            </Button>
          )}
        </FileButton>
      )}

      {message === UploadMessageType.UPLOAD_ERROR && (
        <>
          <Text size="xs" c="red">
            Upload failed
          </Text>
          <Button
            p={0}
            ml={5}
            size="xs"
            variant="outline"
            color="red"
            type="button"
            onClick={handleReset}
          >
            Try Again
          </Button>
        </>
      )}

      {file && message !== UploadMessageType.UPLOAD_SUCCESS && (
        <>
          <Button
            p={0}
            leftSection={loading ? <Loader size={15} /> : <IconPhotoPlus size={15} />}
            variant="transparent"
            color="black"
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {progressText || 'Submit'}
          </Button>
          <Button
            styles={{
              section: {
                margin: 0,
              },
            }}
            p={0}
            ml={5}
            h={20}
            w={20}
            leftSection={
              <Tooltip label="Reset" withArrow position="top" color="red.5">
                <IconRestore size={15} />
              </Tooltip>
            }
            variant="outline"
            color="red"
            type="button"
            onClick={handleReset}
            disabled={loading}
          />
        </>
      )}

      {product.images.length > 0 && (
        <Button
          p={0}
          leftSection={<IconPhotoOff size={15} />}
          variant="transparent"
          type="button"
          color="red.5"
          onClick={() => openDeleteModal(product.images[0] ? product.images[0] : '')}
          loading={loading}
          disabled={loading}
        >
          Delete Image
        </Button>
      )}

      <Modal
        opened={deleteModalOpened}
        onClose={cancelDelete}
        title="Confirm Image Deletion"
        centered
        zIndex={10000}
        closeOnClickOutside={!isDeleting}
        closeOnEscape={!isDeleting}
      >
        <Group align="center" mb="md">
          <IconAlertTriangle size={24} color="red" />
          <Text>Are you sure you want to delete this image?</Text>
        </Group>

        {imageToDelete && (
          <Image
            src={imageToDelete}
            alt="Image to delete"
            radius="md"
            mb="md"
            mah={200}
            fit="contain"
          />
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete} loading={isDeleting} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Image'}
          </Button>
        </Group>
      </Modal>
    </form>
  );
}

export default UploadComponent;

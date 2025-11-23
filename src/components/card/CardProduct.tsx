'use client';

import { Badge, Box, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconEye, IconEyeOff, IconTrash } from '@tabler/icons-react';
import { Card } from '~/components/card/Card';
import { ModalCreateProduct } from '~/components/modal/CreateProduct';
import UploadComponent from '~/components/uploadS3';
import { usePermissions } from '~/hooks/use-permissions';
import type { Product } from '~/types/product';
import classes from './styles/CardProduct.module.css';

interface CardProductProps {
  product: Product;
  onDelete: () => void;
  onStatusToggle: (args: { id: string; status: 'ACTIVE' | 'INACTIVE' }) => void;
}

export function CardProduct({ product, onDelete, onStatusToggle }: CardProductProps) {
  const { canEdit, canDelete, isOwner, isLoading } = usePermissions();
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  return (
    <>
      <ModalCreateProduct
        opened={editOpened}
        close={closeEdit}
        productId={product.id}
        isEditing={true}
      />
      <Card>
        <Card.LoadingOverlay visible={product.id.includes('loading')} />
        <Card.Header title={product.name} link={product.id}>
          {/* Show owner badge */}
          {isOwner(product) && (
            <Badge size="xs" variant="light" color="blue" mr="xs">
              Owner
            </Badge>
          )}
          {/* Only show menu if user can edit (owner or admin) */}
          {!isLoading && canEdit(product) && (
            <Card.Menu>
              <Menu.Item leftSection={<IconEdit size={15} />} onClick={openEdit}>
                Edit
              </Menu.Item>
              <Menu.Item
                leftSection={
                  product.status === 'ACTIVE' ? <IconEyeOff size={15} /> : <IconEye size={15} />
                }
                color={product.status === 'ACTIVE' ? 'orange.5' : 'green.5'}
                onClick={() =>
                  onStatusToggle({
                    id: product.id,
                    status: product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                  })
                }
              >
                {product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </Menu.Item>
              {canDelete(product) && (
                <Menu.Item leftSection={<IconTrash size={15} />} color="red.5" onClick={onDelete}>
                  Delete
                </Menu.Item>
              )}
              <Menu.Item component="div" closeMenuOnClick={false}>
                <UploadComponent product={product} />
              </Menu.Item>
            </Card.Menu>
          )}
        </Card.Header>
        <Card.Image
          image={product.images[0] ?? 'https://picsum.photos/800/800?random=2'}
          title={product.name}
          link={product.id}
        />
        <Card.Description description={product.description ?? 'No description available'} />
        <Box className={classes.footer}>
          <Card.Details
            user={product.user}
            quantity={product.remaining?.quantity}
            brand={product.brand ?? 'No Brand'}
            categories={product.categories}
          />
          <Card.Actions
            link={product.id}
            productId={product.id}
            isFavorite={product.isFavorite ?? false}
          />
        </Box>
      </Card>
    </>
  );
}

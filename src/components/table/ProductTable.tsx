'use client';

import { ActionIcon, Avatar, Badge, Group, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { HeartIcon, type HeartIconHandle } from '~/components/icons/HeartIcon';
import { ModalCreateProduct } from '~/components/modal/CreateProduct';
import { useDebouncedFavorite } from '~/hooks/use-debounced-favorite';
import { usePermissions } from '~/hooks/use-permissions';
import type { Product } from '~/types/product';

interface ProductTableProps {
  products: Product[];
  onDelete: (productId: string) => void;
}

const categoryColors: Record<string, string> = {
  electronics: 'blue',
  clothing: 'pink',
  books: 'green',
  home: 'orange',
  sports: 'purple',
  default: 'gray',
};

interface ProductRowProps {
  product: Product;
  onRowClick: (productId: string) => void;
  onEditClick: (productId: string) => void;
  onDelete: (productId: string) => void;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Permission checks add necessary complexity
function ProductRow({ product, onRowClick, onEditClick, onDelete }: ProductRowProps) {
  const heartRef = useRef<HeartIconHandle>(null);
  const [heartBounce, setHeartBounce] = useState(false);
  const [rowGlow, setRowGlow] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const { toggleFavorite, isProcessing } = useDebouncedFavorite(product.id, product.isFavorite);
  const { canEdit, canDelete, isOwner, isLoading } = usePermissions();

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      if (isProcessing) {
        return;
      }
      e.stopPropagation();
      setHeartBounce(true);
      setRowGlow(true);
      setShowOverlay(true);
      toggleFavorite();
      setTimeout(() => {
        setHeartBounce(false);
        setRowGlow(false);
      }, 800);
      setTimeout(() => {
        setShowOverlay(false);
      }, 1500);
    },
    [isProcessing, toggleFavorite]
  );

  return (
    <Table.Tr
      key={product.id}
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: rowGlow
          ? '0 0 20px 3px rgba(250, 82, 82, 0.3), inset 0 0 10px 1px rgba(250, 82, 82, 0.1)'
          : 'none',
        transform: rowGlow ? 'scale(1.01)' : 'scale(1)',
        position: 'relative',
      }}
      onClick={() => onRowClick(product.id)}
    >
      <AnimatePresence>
        {showOverlay && (
          <motion.td
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(135deg, rgba(250, 82, 82, 0.15) 0%, rgba(252, 146, 158, 0.15) 100%)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(250, 82, 82, 0.3)',
                border: '2px solid rgba(250, 82, 82, 0.2)',
              }}
            >
              <motion.div
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--mantine-color-red-6)',
                  textAlign: 'center',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {product.isFavorite ? '❤️ Favorited!' : '💔 Removed'}
              </motion.div>
            </motion.div>
          </motion.td>
        )}
      </AnimatePresence>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={30} radius={30}>
            {product.name[0]?.toUpperCase()}
          </Avatar>
          <div>
            <Group gap="xs">
              <Text fz="sm" fw={500}>
                {product.name}
              </Text>
              {isOwner(product) && (
                <Badge size="xs" variant="light" color="blue">
                  Owner
                </Badge>
              )}
            </Group>
          </div>
        </Group>
      </Table.Td>

      <Table.Td>
        <Badge
          color={
            categoryColors[product.categories?.[0]?.category?.name?.toLowerCase() || 'default']
          }
          variant="light"
        >
          {product.categories?.[0]?.category?.name || 'Uncategorized'}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Text fz="sm">{product.brand || 'No Brand'}</Text>
      </Table.Td>

      <Table.Td>
        <Text fz="sm" c="dimmed">
          {product.sku || 'No SKU'}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text fz="sm" c="dimmed" truncate>
          {product.description || 'No description available'}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text fz="sm">{product.remaining?.quantity || 0} units</Text>
      </Table.Td>

      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon
            variant="heart"
            color={product.isFavorite ? 'red' : 'gray'}
            data-testid="favorite-button"
            aria-label={product.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={handleFavoriteClick}
            onMouseEnter={() => heartRef.current?.startAnimation()}
            onMouseLeave={() => heartRef.current?.stopAnimation()}
            disabled={isProcessing}
            style={{
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: heartBounce ? 'scale(1.3)' : 'scale(1)',
              opacity: isProcessing ? 0.6 : 1,
            }}
          >
            <HeartIcon ref={heartRef} size={16} filled={product.isFavorite} />
          </ActionIcon>
          {/* Edit button - only for owners */}
          {!isLoading && canEdit(product) && (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(product.id);
              }}
              data-testid="edit-button"
              aria-label="Edit product"
            >
              <IconPencil size={16} stroke={1.5} />
            </ActionIcon>
          )}

          {/* Delete button - only for owners */}
          {!isLoading && canDelete(product) && (
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }}
              data-testid="delete-button"
              aria-label="Delete product"
            >
              <IconTrash size={16} stroke={1.5} />
            </ActionIcon>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleEditClick = (productId: string) => {
    setEditingProductId(productId);
    open();
  };

  const handleCloseEdit = () => {
    close();
    setEditingProductId(null);
  };

  const handleRowClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const rows = products.map((product) => (
    <ProductRow
      key={product.id}
      product={product}
      onRowClick={handleRowClick}
      onEditClick={handleEditClick}
      onDelete={onDelete}
    />
  ));

  return (
    <>
      {opened && (
        <ModalCreateProduct
          opened={opened}
          close={handleCloseEdit}
          productId={editingProductId || undefined}
          isEditing={!!editingProductId}
        />
      )}
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Brand</Table.Th>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Stock</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text fw={500} ta="center" c="dimmed">
                    No products found. Create your first product!
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}

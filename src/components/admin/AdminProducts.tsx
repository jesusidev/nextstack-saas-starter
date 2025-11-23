'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  Pagination,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPencil, IconSearch, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { api } from '~/utils/api';

export function AdminProducts() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [userFilter, setUserFilter] = useState('');
  const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false);

  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, refetch } = api.admin.productsListAll.useQuery({
    limit,
    offset,
    userId: userFilter || undefined,
  });

  const bulkDeleteMutation = api.admin.productsBulkDelete.useMutation({
    onSuccess: (result) => {
      console.log(`Deleted ${result.deleted} products`);
      setSelected([]);
      deleteModalHandlers.close();
      refetch();
    },
    onError: (error) => {
      console.error('Bulk delete error:', error);
    },
  });

  const handleSelectAll = () => {
    if (selected.length === data?.products.length) {
      setSelected([]);
    } else {
      setSelected(data?.products.map((p) => p.id) || []);
    }
  };

  const handleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate({ productIds: selected });
  };

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <div>
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Filter by user ID"
          leftSection={<IconSearch size={16} />}
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        />
        {selected.length > 0 && (
          <Button
            color="red"
            onClick={deleteModalHandlers.open}
            leftSection={<IconTrash size={16} />}
          >
            Delete {selected.length} selected
          </Button>
        )}
      </Group>

      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Checkbox
                checked={selected.length === data?.products.length}
                onChange={handleSelectAll}
              />
            </Table.Th>
            <Table.Th>Product</Table.Th>
            <Table.Th>Owner</Table.Th>
            <Table.Th>Brand</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.products.map((product) => (
            <Table.Tr key={product.id}>
              <Table.Td>
                <Checkbox
                  checked={selected.includes(product.id)}
                  onChange={() => handleSelect(product.id)}
                />
              </Table.Td>
              <Table.Td>
                <Text fw={500}>{product.name}</Text>
              </Table.Td>
              <Table.Td>
                {product.user ? (
                  <div>
                    <Text size="sm">
                      {product.user.firstName} {product.user.lastName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {product.user.email}
                    </Text>
                  </div>
                ) : (
                  <Badge color="orange">No Owner</Badge>
                )}
              </Table.Td>
              <Table.Td>{product.brand || 'N/A'}</Table.Td>
              <Table.Td>
                <Text size="sm">{new Date(product.createdAt).toLocaleDateString()}</Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => window.open(`/products/${product.id}`, '_blank')}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => {
                      setSelected([product.id]);
                      deleteModalHandlers.open();
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {totalPages > 1 && (
        <Group justify="center" mt="md">
          <Pagination value={page} onChange={setPage} total={totalPages} />
        </Group>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={deleteModalHandlers.close}
        title="Confirm Bulk Delete"
      >
        <Text>
          Are you sure you want to delete {selected.length} product(s)? This action cannot be
          undone.
        </Text>
        <Group mt="md" justify="flex-end">
          <Button variant="default" onClick={deleteModalHandlers.close}>
            Cancel
          </Button>
          <Button color="red" onClick={handleBulkDelete} loading={bulkDeleteMutation.isPending}>
            Delete
          </Button>
        </Group>
      </Modal>
    </div>
  );
}

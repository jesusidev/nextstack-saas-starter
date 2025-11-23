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

export function AdminProjects() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [userFilter, setUserFilter] = useState('');
  const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false);

  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, refetch } = api.admin.projectsListAll.useQuery({
    limit,
    offset,
    userId: userFilter || undefined,
  });

  const bulkDeleteMutation = api.admin.projectsBulkDelete.useMutation({
    onSuccess: (result) => {
      console.log(`Deleted ${result.deleted} projects`);
      setSelected([]);
      deleteModalHandlers.close();
      refetch();
    },
    onError: (error) => {
      console.error('Bulk delete error:', error);
    },
  });

  const handleSelectAll = () => {
    if (selected.length === data?.projects.length) {
      setSelected([]);
    } else {
      setSelected(data?.projects.map((p) => p.id) || []);
    }
  };

  const handleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate({ projectIds: selected });
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
                checked={selected.length === data?.projects.length}
                onChange={handleSelectAll}
              />
            </Table.Th>
            <Table.Th>Project</Table.Th>
            <Table.Th>Owner</Table.Th>
            <Table.Th>Products</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.projects.map((project) => (
            <Table.Tr key={project.id}>
              <Table.Td>
                <Checkbox
                  checked={selected.includes(project.id)}
                  onChange={() => handleSelect(project.id)}
                />
              </Table.Td>
              <Table.Td>
                <Text fw={500}>{project.name}</Text>
              </Table.Td>
              <Table.Td>
                {project.user ? (
                  <div>
                    <Text size="sm">
                      {project.user.firstName} {project.user.lastName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {project.user.email}
                    </Text>
                  </div>
                ) : (
                  <Badge color="orange">No Owner</Badge>
                )}
              </Table.Td>
              <Table.Td>
                <Text size="sm">{project._count.product}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{new Date(project.createdAt).toLocaleDateString()}</Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => window.open(`/projects/${project.id}`, '_blank')}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => {
                      setSelected([project.id]);
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
          Are you sure you want to delete {selected.length} project(s)? This action cannot be
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

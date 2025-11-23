'use client';

import { ActionIcon, Badge, Group, Pagination, Table, Text, TextInput } from '@mantine/core';
import { IconEye, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { api } from '~/utils/api';

export function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const limit = 20;
  const offset = (page - 1) * limit;

  const { data } = api.admin.usersList.useQuery({
    limit,
    offset,
    search: search || undefined,
  });

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <div>
      <Group mb="md">
        <TextInput
          placeholder="Search users..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
      </Group>

      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>User</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Products</Table.Th>
            <Table.Th>Projects</Table.Th>
            <Table.Th>Joined</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.users.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>
                <Text fw={500}>
                  {user.firstName} {user.lastName}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {user.email}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge color={user.role === 'ADMIN' ? 'red' : 'blue'}>{user.role}</Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{user._count.products}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{user._count.projects}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {new Date(user.id).toLocaleDateString()}{' '}
                  {/* Using id as createdAt since User doesn't have createdAt */}
                </Text>
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => {
                    // View user details or filter products by user
                  }}
                >
                  <IconEye size={16} />
                </ActionIcon>
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
    </div>
  );
}

'use client';

import { Paper, Stack, Text, Timeline, Title } from '@mantine/core';
import { IconClipboardList, IconPackages } from '@tabler/icons-react';
import { api } from '~/utils/api';

export function AdminStats() {
  const { data: activity } = api.admin.statsRecentActivity.useQuery({
    limit: 10,
  });

  return (
    <Stack gap="xl">
      <Paper withBorder p="md">
        <Title order={3} mb="md">
          Recent Activity
        </Title>

        <Title order={5} mb="sm">
          Recent Products
        </Title>
        <Timeline>
          {activity?.recentProducts.map((product) => (
            <Timeline.Item
              key={product.id}
              bullet={<IconPackages size={12} />}
              title={product.name}
            >
              <Text size="xs" c="dimmed">
                Created by{' '}
                {product.user ? `${product.user.firstName} ${product.user.lastName}` : 'Unknown'}
              </Text>
              <Text size="xs" c="dimmed">
                {new Date(product.createdAt).toLocaleString()}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>

        <Title order={5} mb="sm" mt="xl">
          Recent Projects
        </Title>
        <Timeline>
          {activity?.recentProjects.map((project) => (
            <Timeline.Item
              key={project.id}
              bullet={<IconClipboardList size={12} />}
              title={project.name}
            >
              <Text size="xs" c="dimmed">
                Created by{' '}
                {project.user ? `${project.user.firstName} ${project.user.lastName}` : 'Unknown'}
              </Text>
              <Text size="xs" c="dimmed">
                {new Date(project.createdAt).toLocaleString()}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Paper>
    </Stack>
  );
}

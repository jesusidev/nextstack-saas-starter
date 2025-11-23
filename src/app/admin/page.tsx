'use client';

import { Badge, Container, Grid, Group, Paper, rem, Stack, Tabs, Text, Title } from '@mantine/core';
import {
  IconAlertCircle,
  IconChartBar,
  IconClipboardList,
  IconPackages,
  IconUsers,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminProducts } from '~/components/admin/AdminProducts';
import { AdminProjects } from '~/components/admin/AdminProjects';
import { AdminStats } from '~/components/admin/AdminStats';
import { AdminUsers } from '~/components/admin/AdminUsers';
import LayoutDashboard from '~/layouts/dashboard';
import { api } from '~/utils/api';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: currentUser } = api.user.get.useQuery();
  const { data: stats } = api.admin.statsOverview.useQuery();

  // Redirect non-admins
  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <LayoutDashboard>
        <Container py="xl">
          <Text>Access Denied. Admin role required.</Text>
        </Container>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <div>
              <Title order={1}>Admin Dashboard</Title>
              <Text c="dimmed">Manage all platform resources</Text>
            </div>
            <Badge size="lg" variant="light" color="red">
              Admin
            </Badge>
          </Group>

          {/* System Statistics */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper withBorder p="md">
                <Group>
                  <IconUsers size={32} stroke={1.5} />
                  <div>
                    <Text size="xs" c="dimmed">
                      Total Users
                    </Text>
                    <Text size="xl" fw={700}>
                      {stats?.totalUsers || 0}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper withBorder p="md">
                <Group>
                  <IconPackages size={32} stroke={1.5} />
                  <div>
                    <Text size="xs" c="dimmed">
                      Total Products
                    </Text>
                    <Text size="xl" fw={700}>
                      {stats?.totalProducts || 0}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper withBorder p="md">
                <Group>
                  <IconClipboardList size={32} stroke={1.5} />
                  <div>
                    <Text size="xs" c="dimmed">
                      Total Projects
                    </Text>
                    <Text size="xl" fw={700}>
                      {stats?.totalProjects || 0}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper withBorder p="md">
                <Group>
                  <IconAlertCircle size={32} stroke={1.5} color="orange" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Orphaned Products
                    </Text>
                    <Text size="xl" fw={700} c="orange">
                      {stats?.orphanedProducts || 0}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>
          </Grid>

          {/* Management Tabs */}
          <Tabs defaultValue="products">
            <Tabs.List>
              <Tabs.Tab
                value="products"
                leftSection={<IconPackages style={{ width: rem(16), height: rem(16) }} />}
              >
                Products
              </Tabs.Tab>
              <Tabs.Tab
                value="projects"
                leftSection={<IconClipboardList style={{ width: rem(16), height: rem(16) }} />}
              >
                Projects
              </Tabs.Tab>
              <Tabs.Tab
                value="users"
                leftSection={<IconUsers style={{ width: rem(16), height: rem(16) }} />}
              >
                Users
              </Tabs.Tab>
              <Tabs.Tab
                value="stats"
                leftSection={<IconChartBar style={{ width: rem(16), height: rem(16) }} />}
              >
                Statistics
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="products" pt="md">
              <AdminProducts />
            </Tabs.Panel>

            <Tabs.Panel value="projects" pt="md">
              <AdminProjects />
            </Tabs.Panel>

            <Tabs.Panel value="users" pt="md">
              <AdminUsers />
            </Tabs.Panel>

            <Tabs.Panel value="stats" pt="md">
              <AdminStats />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </LayoutDashboard>
  );
}

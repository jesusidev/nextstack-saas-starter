'use client';

import { useUser } from '@clerk/nextjs';
import {
  ActionIcon,
  Badge,
  Container,
  Grid,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import {
  IconCalendar,
  IconClipboardList,
  IconListDetails,
  IconPackages,
  IconTags,
  IconUser,
} from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { HeartIcon, type HeartIconHandle } from '~/components/icons/HeartIcon';
import { CategorySelect } from '~/components/input/CategorySelect';
import { useProductService } from '~/hooks/service/useProductService';
import { useProjectService } from '~/hooks/service/useProjectService';
import { useDebouncedFavorite } from '~/hooks/use-debounced-favorite';
import { usePermissions } from '~/hooks/use-permissions';
import LayoutDashboard from '~/layouts/dashboard';
import LayoutPage from '~/layouts/page';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: Refactor this component to reduce complexity
export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const { isSignedIn } = useUser();
  const heartRef = useRef<HeartIconHandle>(null);
  const [heartBounce, setHeartBounce] = useState(false);

  const productService = useProductService();
  const projectService = useProjectService();
  const { updateProduct } = productService.useMutations();
  const { data: product, isPending: isLoading } = productService.useProduct(id);
  const { canEdit, isOwner, isLoading: permissionsLoading } = usePermissions();

  // Fetch project details if product has a projectId
  const { data: project } = projectService.useProject(product?.projectId ?? '');

  // Current product categories (extract IDs from the category relationships)
  const currentCategories =
    product?.categories?.map((categoryLink: { categoryId: string }) => categoryLink.categoryId) ||
    [];

  const handleCategoriesChange = (categories: string[]) => {
    // Only allow if user can edit
    if (!canEdit(product)) {
      console.warn('Unauthorized category update attempt');
      return;
    }

    updateProduct.mutate({
      id: id,
      categories: categories,
    });
  };

  const { toggleFavorite, isProcessing } = useDebouncedFavorite(id, product?.isFavorite ?? false);

  const handleFavoriteClick = useCallback(() => {
    if (isProcessing) {
      return;
    }
    setHeartBounce(true);
    toggleFavorite();
    setTimeout(() => setHeartBounce(false), 600);
  }, [isProcessing, toggleFavorite]);

  if (isSignedIn) {
    return (
      <LayoutDashboard>
        {isLoading || permissionsLoading ? (
          <Container my="md">
            <Skeleton height={50} mb="xl" />
            <Skeleton height={200} />
          </Container>
        ) : (
          <Container my="md">
            <SimpleGrid cols={1} spacing="md">
              <Group>
                <h1>Product: {product?.name}</h1>
                {isOwner(product) && (
                  <Badge size="lg" variant="light" color="blue">
                    Owner
                  </Badge>
                )}
                <ActionIcon
                  variant={product?.isFavorite ? 'filled' : 'light'}
                  onClick={handleFavoriteClick}
                  onMouseEnter={() => heartRef.current?.startAnimation()}
                  onMouseLeave={() => heartRef.current?.stopAnimation()}
                  disabled={isProcessing}
                  aria-busy={isProcessing}
                  aria-label={product?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  style={{
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: heartBounce ? 'scale(1.3)' : 'scale(1)',
                    opacity: isProcessing ? 0.6 : 1,
                  }}
                >
                  <HeartIcon ref={heartRef} size={18} filled={product?.isFavorite} />
                </ActionIcon>
              </Group>
            </SimpleGrid>

            <Tabs defaultValue="overview" mt="md">
              <Tabs.List>
                <Tabs.Tab value="overview" leftSection={<IconListDetails size="0.8rem" />}>
                  Overview
                </Tabs.Tab>
                <Tabs.Tab value="categories" leftSection={<IconTags size="0.8rem" />}>
                  Categories
                </Tabs.Tab>
                <Tabs.Tab value="projects" leftSection={<IconClipboardList size="0.8rem" />}>
                  Projects
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="overview">
                <Stack gap="md" pt="md">
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Stack gap="xs">
                        <Title order={4}>Basic Information</Title>
                        <Group gap="xs">
                          <Text fw={500}>Name:</Text>
                          <Text>{product?.name || 'N/A'}</Text>
                        </Group>
                        <Group gap="xs">
                          <Text fw={500}>Brand:</Text>
                          <Text>{product?.brand || 'No Brand'}</Text>
                        </Group>
                        <Group gap="xs">
                          <Text fw={500}>SKU:</Text>
                          <Text>{product?.sku || 'N/A'}</Text>
                        </Group>
                        <Group gap="xs">
                          <Text fw={500}>Description:</Text>
                          <Text>{product?.description || 'No description available'}</Text>
                        </Group>
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Stack gap="xs">
                        <Title order={4}>Details</Title>
                        <Group gap="xs">
                          <IconPackages size={16} />
                          <Text fw={500}>Quantity:</Text>
                          <Text>{product?.remaining?.quantity ?? 'N/A'}</Text>
                        </Group>
                        <Group gap="xs">
                          <IconUser size={16} />
                          <Text fw={500}>Owner:</Text>
                          <Text>
                            {product?.user?.firstName} {product?.user?.lastName}
                          </Text>
                          {isOwner(product) && (
                            <Badge size="xs" variant="light" color="blue">
                              You
                            </Badge>
                          )}
                        </Group>
                        <Group gap="xs">
                          <IconCalendar size={16} />
                          <Text fw={500}>Created:</Text>
                          <Text>
                            {product?.createdAt
                              ? new Date(product.createdAt).toLocaleDateString()
                              : 'N/A'}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <IconCalendar size={16} />
                          <Text fw={500}>Updated:</Text>
                          <Text>
                            {product?.updatedAt
                              ? new Date(product.updatedAt).toLocaleDateString()
                              : 'N/A'}
                          </Text>
                        </Group>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="categories">
                {!permissionsLoading && canEdit(product) ? (
                  <CategorySelect
                    value={currentCategories}
                    onChange={handleCategoriesChange}
                    label="Product Categories"
                    placeholder="Select or add categories for this product"
                  />
                ) : (
                  <Stack gap="md" pt="md">
                    <Title order={4}>Categories</Title>
                    {product?.categories && product.categories.length > 0 ? (
                      <Group gap="xs">
                        {product.categories.map(
                          (categoryLink: { categoryId: string; category?: { name: string } }) => (
                            <Badge key={categoryLink.categoryId} variant="light" size="lg">
                              {categoryLink.category?.name || 'Unknown Category'}
                            </Badge>
                          )
                        )}
                      </Group>
                    ) : (
                      <Text c="dimmed">No categories assigned</Text>
                    )}
                    {!permissionsLoading && !canEdit(product) && (
                      <Text size="sm" c="dimmed">
                        Only the owner can modify categories
                      </Text>
                    )}
                  </Stack>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="projects">
                <Stack gap="md" pt="md">
                  {product?.projectId ? (
                    project ? (
                      <Grid>
                        <Grid.Col span={12}>
                          <Group gap="md">
                            <Title order={4}>Associated Project</Title>
                            <Badge variant="light" size="lg">
                              {project.status}
                            </Badge>
                          </Group>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Stack gap="xs">
                            <Group gap="xs">
                              <Text fw={500}>Project Name:</Text>
                              <Text>{project.name}</Text>
                            </Group>
                            <Group gap="xs">
                              <Text fw={500}>Project ID:</Text>
                              <Text c="dimmed" size="sm">
                                {project.id}
                              </Text>
                            </Group>
                          </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Stack gap="xs">
                            <Group gap="xs">
                              <IconPackages size={16} />
                              <Text fw={500}>Total Products:</Text>
                              <Text>{project.totalProjectProducts || 0}</Text>
                            </Group>
                            <Group gap="xs">
                              <IconCalendar size={16} />
                              <Text fw={500}>Last Updated:</Text>
                              <Text>
                                {project.updatedAt
                                  ? new Date(project.updatedAt).toLocaleDateString()
                                  : 'N/A'}
                              </Text>
                            </Group>
                          </Stack>
                        </Grid.Col>
                      </Grid>
                    ) : (
                      <Text>Loading project information...</Text>
                    )
                  ) : (
                    <Stack align="center" gap="md" py="xl">
                      <IconClipboardList size={48} stroke={1} color="gray" />
                      <Text size="lg" c="dimmed">
                        No Project Associated
                      </Text>
                      <Text size="sm" c="dimmed" ta="center">
                        This product is not currently assigned to any project.
                      </Text>
                    </Stack>
                  )}
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Container>
        )}
      </LayoutDashboard>
    );
  }

  return (
    <LayoutPage>
      <Container size="lg" py="xl">
        <h1>Product Details</h1>
        <p>Please sign in to view product details.</p>
      </Container>
    </LayoutPage>
  );
}

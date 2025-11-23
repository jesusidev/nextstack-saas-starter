'use client';

import { SignedIn } from '@clerk/nextjs';
import {
  ActionIcon,
  Badge,
  Center,
  Container,
  Grid,
  Group,
  Menu,
  Skeleton,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import {
  IconArrowRight,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconPackages,
  IconSearch,
} from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CardProduct } from '~/components/card/CardProduct';
import { EditProjectName } from '~/components/modal/EditProjectName';
import { ProductTable } from '~/components/table/ProductTable';
import { type ViewMode, ViewToggle } from '~/components/toggle/ViewToggle';
import { useProductService } from '~/hooks/service/useProductService';
import { useProjectService } from '~/hooks/service/useProjectService';
import { useEvent } from '~/hooks/use-event';
import { usePermissions } from '~/hooks/use-permissions';
import LayoutDashboard from '~/layouts/dashboard';
import classes from '~/styles/Dashboard.module.css';

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;

  const projectService = useProjectService();
  const productService = useProductService();

  const { data: project } = projectService.useProject(id);
  const { canEdit, canDelete, isOwner, isLoading: permissionsLoading } = usePermissions();
  const {
    data: products = [],
    isPending: isLoading,
    isError,
  } = productService.useProducts({ projectId: id });

  const { createProduct, deleteProduct, updateProduct } = productService.useMutations();
  const { updateProject } = projectService.useMutations();
  const isUpdatingProject = updateProject.isPending;

  // Modal state for edit project name
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>({
    key: 'projects-view-mode',
    defaultValue: 'cards',
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const { dispatch: dispatchSearchEvent } = useEvent('product:search');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase();

    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query);
      const brandMatch = product.brand?.toLowerCase().includes(query);
      const skuMatch = product.sku?.toLowerCase().includes(query);

      return nameMatch || brandMatch || skuMatch;
    });
  }, [products, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) {
      dispatchSearchEvent({
        query: searchQuery,
        resultCount: filteredProducts.length,
      });
    }
  }, [searchQuery, filteredProducts.length, dispatchSearchEvent]);

  const handleCreateProduct = (productName: string) => {
    if (inputRef.current) {
      createProduct.mutate({
        name: productName,
        brand: 'test',
        sku: Math.ceil(Math.random() * 10000).toString(),
        projectId: id,
      });
      inputRef.current.value = '';
    }
  };

  return (
    <LayoutDashboard>
      <Container fluid>
        <Grid>
          <Grid.Col span={12}>
            <Group justify="space-between" mb="md">
              <Group>
                <h1>Project: {project?.name || 'Loading...'}</h1>
                {isOwner(project) && (
                  <Badge size="lg" variant="light" color="blue">
                    Owner
                  </Badge>
                )}
                {project?.status && (
                  <Badge
                    variant="light"
                    size="lg"
                    color={project.status === 'ACTIVE' ? 'green' : 'gray'}
                  >
                    {project.status}
                  </Badge>
                )}
              </Group>
              {project && !permissionsLoading && canEdit(project) && (
                <SignedIn>
                  <Menu position="bottom-end" shadow="sm" withArrow>
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="lg" data-testid="project-menu-button">
                        <IconDotsVertical size={20} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconEdit size={15} />} onClick={openEditModal}>
                        Edit Project Name
                      </Menu.Item>
                      <Menu.Item
                        leftSection={
                          project.status === 'ACTIVE' ? (
                            <IconEyeOff size={15} />
                          ) : (
                            <IconEye size={15} />
                          )
                        }
                        color={project.status === 'ACTIVE' ? 'orange.5' : 'green.5'}
                        disabled={isUpdatingProject}
                        onClick={() =>
                          updateProject.mutate({
                            id: project.id,
                            status: project.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                          })
                        }
                      >
                        {isUpdatingProject
                          ? 'Updating...'
                          : project.status === 'ACTIVE'
                            ? 'Deactivate Project'
                            : 'Activate Project'}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </SignedIn>
              )}
            </Group>
          </Grid.Col>

          <Grid.Col span={12} className={classes.addProduct}>
            <TextInput
              mt={10}
              leftSection={<IconPackages size="1.1rem" stroke={1.5} />}
              size="md"
              ref={inputRef}
              rightSection={
                <ActionIcon
                  size={32}
                  variant="filled"
                  onClick={() => {
                    if (inputRef.current?.value) {
                      handleCreateProduct(inputRef.current.value);
                    }
                  }}
                >
                  <IconArrowRight size="1.1rem" stroke={1.5} />
                </ActionIcon>
              }
              placeholder="Add product to project"
              rightSectionWidth={42}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateProduct(e.currentTarget.value);
                }
              }}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              leftSection={<IconSearch size="1.1rem" stroke={1.5} />}
              placeholder="Search products by name, brand, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              aria-label="Search products"
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <ViewToggle value={viewMode} onChange={setViewMode} context="projects" />
          </Grid.Col>

          <Grid.Col span={12}>
            {isError && <h1>Error Getting Products</h1>}
            {isLoading && <Skeleton height={408} width={272} radius="md" animate />}
            {products?.length < 1 && !isLoading && <h1>No Products Found for this Project</h1>}

            {products?.length > 0 && filteredProducts?.length === 0 && !isLoading && (
              <Center style={{ minHeight: '200px' }}>
                <Text size="lg" c="dimmed">
                  {searchQuery.trim()
                    ? `No products found matching "${searchQuery}"`
                    : 'No products available'}
                </Text>
              </Center>
            )}

            {filteredProducts?.length > 0 && viewMode === 'cards' && (
              <section className={classes.product}>
                {filteredProducts.map((product) => (
                  <CardProduct
                    key={product.id}
                    product={product}
                    onDelete={() => deleteProduct.mutate({ id: product.id })}
                    onStatusToggle={({ id, status }) => updateProduct.mutate({ id, status })}
                  />
                ))}
              </section>
            )}

            {filteredProducts?.length > 0 && viewMode === 'table' && (
              <ProductTable
                products={filteredProducts}
                onDelete={(id) => deleteProduct.mutate({ id })}
              />
            )}
          </Grid.Col>
        </Grid>
      </Container>
      {project && (
        <EditProjectName opened={editModalOpened} close={closeEditModal} projectId={project.id} />
      )}
    </LayoutDashboard>
  );
}

'use client';

import { ActionIcon, Button, Center, Grid, Group, Skeleton, Text, TextInput } from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { IconArrowRight, IconPackages, IconPlus, IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CardProduct } from '~/components/card/CardProduct';
import { ModalCreateProduct } from '~/components/modal/CreateProduct';
import { ProductTable } from '~/components/table/ProductTable';
import { type ViewMode, ViewToggle } from '~/components/toggle/ViewToggle';
import { UserVerification } from '~/components/user/UserVerification';
import { useProductService } from '~/hooks/service/useProductService';
import { useEvent } from '~/hooks/use-event';
import classes from '~/styles/Dashboard.module.css';

export default function DashboardPage() {
  const productService = useProductService();

  // Query hooks
  const { data: products = [], isPending: isLoading, isError } = productService.useProducts();

  // All mutations in one clean destructure
  const { createProduct, deleteProduct, updateProduct } = productService.useMutations();

  const [opened, { open, close }] = useDisclosure(false);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>({
    key: 'dashboard-view-mode',
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

  return (
    <>
      <UserVerification />
      {opened && <ModalCreateProduct opened={opened} close={close} />}
      <Grid gutter="md">
        <Grid.Col className={classes.addProduct}>
          {/* Mobile: Stack vertically */}
          <Group hiddenFrom="sm" gap="md" mb="md" align="stretch" grow>
            <TextInput
              leftSection={<IconPackages size="1.1rem" stroke={1.5} />}
              size="md"
              ref={inputRef}
              rightSection={
                <ActionIcon
                  size={32}
                  variant="filled"
                  onClick={() => {
                    createProduct.mutate({
                      name: inputRef.current ? inputRef.current.value : '',
                      brand: 'test',
                      sku: 'test',
                      quantity: 10,
                      isFavorite: false,
                    });
                    if (inputRef.current) {
                      inputRef.current.value = '';
                    }
                  }}
                >
                  <IconArrowRight size="1.1rem" stroke={1.5} />
                </ActionIcon>
              }
              placeholder="Quick Add Product"
              rightSectionWidth={42}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createProduct.mutate({
                    name: e.currentTarget.value,
                  });
                  e.currentTarget.value = '';
                }
              }}
            />
          </Group>

          <Group hiddenFrom="sm" justify="center" mb="md">
            <ViewToggle value={viewMode} onChange={setViewMode} context="dashboard" />
          </Group>

          {/* Desktop: Side by side */}
          <Group visibleFrom="sm" justify="space-between" align="center" mb="md">
            <div style={{ flex: 1 }}>
              <TextInput
                leftSection={<IconPackages size="1.1rem" stroke={1.5} />}
                size="md"
                ref={inputRef}
                rightSection={
                  <ActionIcon
                    size={32}
                    variant="filled"
                    onClick={() => {
                      createProduct.mutate({
                        name: inputRef.current ? inputRef.current.value : '',
                      });
                      if (inputRef.current) {
                        inputRef.current.value = '';
                      }
                    }}
                  >
                    <IconArrowRight size="1.1rem" stroke={1.5} />
                  </ActionIcon>
                }
                placeholder="Quick Add Product"
                rightSectionWidth={42}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createProduct.mutate({
                      name: e.currentTarget.value,
                    });
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            <ViewToggle value={viewMode} onChange={setViewMode} context="dashboard" />
          </Group>

          <Button onClick={open} rightSection={<IconPlus size="1.1rem" stroke={1.5} />}>
            Create Product
          </Button>
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
          {isError && <h1>Error Getting Products</h1>}
          {isLoading &&
            (viewMode === 'cards' ? (
              <Skeleton height={408} width={272} radius="md" animate />
            ) : (
              <Skeleton height={300} radius="md" animate />
            ))}
          {products?.length < 1 && !isLoading && (
            <h1>No Products Found, Please Create a Product</h1>
          )}
          {products?.length > 0 && filteredProducts?.length === 0 && !isLoading && (
            <Center style={{ minHeight: '200px' }}>
              <Text size="lg" c="dimmed">
                {searchQuery.trim()
                  ? `No products found matching "${searchQuery}"`
                  : 'No products available'}
              </Text>
            </Center>
          )}
          {filteredProducts?.length > 0 &&
            (viewMode === 'cards' ? (
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
            ) : (
              <ProductTable
                products={filteredProducts}
                onDelete={(productId) => deleteProduct.mutate({ id: productId })}
              />
            ))}
        </Grid.Col>
      </Grid>
    </>
  );
}

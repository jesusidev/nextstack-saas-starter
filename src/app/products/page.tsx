'use client';

import { useUser } from '@clerk/nextjs';
import {
  ActionIcon,
  Button,
  Center,
  Container,
  Grid,
  Skeleton,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { IconArrowRight, IconPackages, IconPlus, IconSearch } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollLockOverlay } from '~/components/auth/ScrollLockOverlay';
import { SignUpOverlay } from '~/components/auth/SignUpOverlay';
import { CardProduct } from '~/components/card/CardProduct';
import { PublicProductCard } from '~/components/card/PublicProductCard';
import { AnalyticsEventListener } from '~/components/debug/AnalyticsEventListener';
import { NotificationEventListener } from '~/components/debug/NotificationEventListener';
import { ProductEventListener } from '~/components/debug/ProductEventListener';
import { ModalCreateProduct } from '~/components/modal/CreateProduct';
import { ProductTable } from '~/components/table/ProductTable';
import { type ViewMode, ViewToggle } from '~/components/toggle/ViewToggle';
import { UserVerification } from '~/components/user/UserVerification';
import { useAnalytics } from '~/hooks/analytics/useAnalytics';
import { useProductService } from '~/hooks/service/useProductService';
import { useEvent } from '~/hooks/use-event';
import { useScrollDepth } from '~/hooks/use-scroll-depth';
import { useSignUpOverlay } from '~/hooks/use-signup-overlay';
import LayoutDashboard from '~/layouts/dashboard';
import LayoutPage from '~/layouts/page';
import classes from '~/styles/Dashboard.module.css';
import type { ShowFilter } from '~/types/product';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex page with multiple view modes (authenticated, public, default) - refactoring would reduce readability
export default function ProductPage() {
  const searchParams = useSearchParams();
  const show = (searchParams.get('show') as ShowFilter) || undefined;
  const projectId = searchParams.get('projectId') || undefined;

  const productService = useProductService();
  const { isSignedIn } = useUser();

  // Determine if this is a public browsing request
  const isPublicBrowsing = show === 'all' && !isSignedIn;

  // Query hooks - pass isPublic flag for unauthenticated users
  const {
    data: productList = [],
    isPending: isLoading,
    isError,
  } = productService.useProducts({
    show,
    projectId,
    isPublic: isPublicBrowsing,
  });

  // All mutations in one clean destructure
  const { createProduct, deleteProduct, updateProduct } = productService.useMutations();

  const [opened, { open, close }] = useDisclosure(false);
  const analytics = useAnalytics();

  // Sign-up overlay state (for public users)
  const {
    opened: overlayOpened,
    triggerSource,
    showOverlay,
    closeOverlay,
    hasShownThisSession,
  } = useSignUpOverlay();

  // Track if scroll lock overlay is shown
  const [showScrollLock, setShowScrollLock] = useState(false);

  // Scroll depth tracking for public users (50% threshold)
  useScrollDepth({
    threshold: 50,
    enabled: isPublicBrowsing && !hasShownThisSession,
    onThresholdReached: () => {
      // Show scroll lock overlay
      setShowScrollLock(true);

      // Track the scroll lock trigger
      analytics.track({
        event: 'conversion:scroll-locked',
        properties: {
          scrollDepth: 50,
        },
      });

      // Lock scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;

      // Show overlay after a short delay
      setTimeout(() => {
        showOverlay('scroll');
      }, 1000);
    },
    sessionKey: 'signup-overlay-scroll-shown',
  });

  // Clean up scroll lock on unmount or when overlay closes
  useEffect(() => {
    if (!overlayOpened && showScrollLock) {
      // User closed the modal, unlock scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      setShowScrollLock(false);
    }
  }, [overlayOpened, showScrollLock]);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>({
    key: 'products-view-mode',
    defaultValue: 'cards',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const { dispatch: dispatchSearchEvent } = useEvent('product:search');

  // Track page view
  useEffect(() => {
    analytics.trackPageView({
      page: 'products',
      title: 'Products',
    });

    // Track public products page view for unauthenticated users
    if (isPublicBrowsing) {
      analytics.track({
        event: 'conversion:page-viewed',
        properties: {
          productCount: productList.length,
          showAll: show === 'all',
        },
      });
    }
  }, [analytics, isPublicBrowsing, productList.length, show]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return productList;
    }

    const query = searchQuery.toLowerCase();

    return productList.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query);
      const brandMatch = product.brand?.toLowerCase().includes(query);
      const skuMatch = product.sku?.toLowerCase().includes(query);

      return nameMatch || brandMatch || skuMatch;
    });
  }, [productList, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) {
      dispatchSearchEvent({
        query: searchQuery,
        resultCount: filteredProducts.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filteredProducts.length, dispatchSearchEvent]);

  // Authenticated user view
  if (isSignedIn) {
    return (
      <LayoutDashboard>
        {/* Skip link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
        >
          Skip to main content
        </a>

        <ProductEventListener />
        <AnalyticsEventListener />
        <NotificationEventListener />
        <UserVerification />
        {opened && <ModalCreateProduct opened={opened} close={close} />}
        {/* biome-ignore lint/correctness/useUniqueElementIds: Skip link target requires static ID */}
        <Container size="xl" px="md" id="main-content">
          <Grid gutter="md">
            <Grid.Col className={classes.addProduct}>
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
              <Button onClick={open} mt={10} rightSection={<IconPlus size="1.1rem" stroke={1.5} />}>
                Create Product
              </Button>
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                leftSection={<IconSearch size="1.1rem" stroke={1.5} />}
                placeholder="Search products by name, brand, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                aria-label="Search products by name, brand, or SKU"
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <ViewToggle value={viewMode} onChange={setViewMode} context="products" />
            </Grid.Col>

            {/* Live region for screen reader announcements */}
            <output aria-live="polite" aria-atomic="true" className="sr-only">
              {isLoading && 'Loading products...'}
              {!isLoading &&
                filteredProducts?.length > 0 &&
                `Showing ${filteredProducts.length} products`}
              {!isLoading &&
                filteredProducts?.length === 0 &&
                searchQuery.trim() &&
                `No products found matching "${searchQuery}"`}
            </output>

            <Grid.Col span={12}>
              {isError && <h1>Error Getting Products</h1>}
              {isLoading && <Skeleton height={408} width={272} radius="md" animate />}
              {productList?.length < 1 && !isLoading && (
                <h1>No Products Found, Please Create a Product</h1>
              )}

              {productList?.length > 0 && filteredProducts?.length === 0 && !isLoading && (
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
                  onDelete={(productId) => deleteProduct.mutate({ id: productId })}
                />
              )}
            </Grid.Col>
          </Grid>
        </Container>
      </LayoutDashboard>
    );
  }

  // Public browsing view (unauthenticated users with ?show=all)
  if (isPublicBrowsing) {
    return (
      <LayoutPage>
        {/* Skip link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
        >
          Skip to main content
        </a>

        {/* biome-ignore lint/correctness/useUniqueElementIds: Skip link target requires static ID */}
        <Container size="xl" px="md" py="xl" id="main-content">
          <Grid gutter="md">
            {/* Header */}
            <Grid.Col span={12}>
              <Text size="xl" fw={700} mb="xs">
                Discover Amazing Products
              </Text>
              <Text size="sm" c="dimmed">
                Explore curated products from our community. Sign in to save favorites and manage
                your inventory.
              </Text>
            </Grid.Col>

            {/* Search */}
            <Grid.Col span={12}>
              <TextInput
                leftSection={<IconSearch size="1.1rem" stroke={1.5} />}
                placeholder="Search products by name, brand, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                aria-label="Search products by name, brand, or SKU"
              />
            </Grid.Col>

            {/* Live region for screen reader announcements */}
            <output aria-live="polite" aria-atomic="true" className="sr-only">
              {isLoading && 'Loading products...'}
              {!isLoading &&
                filteredProducts?.length > 0 &&
                `Showing ${filteredProducts.length} products`}
              {!isLoading &&
                filteredProducts?.length === 0 &&
                searchQuery.trim() &&
                `No products found matching "${searchQuery}"`}
            </output>

            {/* Products Grid */}
            <Grid.Col span={12}>
              {isError && (
                <Center style={{ minHeight: '200px' }}>
                  <Text size="lg" c="red">
                    Error loading products. Please try again later.
                  </Text>
                </Center>
              )}

              {isLoading && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(272px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {/* biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton placeholders don't change order */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={`skeleton-${i}`} height={408} width="100%" radius="md" animate />
                  ))}
                </div>
              )}

              {productList?.length < 1 && !isLoading && (
                <Center style={{ minHeight: '200px' }}>
                  <Text size="lg" c="dimmed">
                    No products available yet. Check back soon!
                  </Text>
                </Center>
              )}

              {productList?.length > 0 && filteredProducts?.length === 0 && !isLoading && (
                <Center style={{ minHeight: '200px' }}>
                  <Text size="lg" c="dimmed">
                    {searchQuery.trim()
                      ? `No products found matching "${searchQuery}"`
                      : 'No products available'}
                  </Text>
                </Center>
              )}

              {filteredProducts?.length > 0 && !isLoading && (
                <section className={classes.product}>
                  {filteredProducts.map((product) => (
                    <PublicProductCard
                      key={product.id}
                      product={product}
                      onSignUpTrigger={showOverlay}
                    />
                  ))}
                </section>
              )}
            </Grid.Col>
          </Grid>

          {/* Scroll lock overlay with gradient shadow */}
          <ScrollLockOverlay visible={showScrollLock && !overlayOpened} />

          {/* Sign-up overlay */}
          {overlayOpened && triggerSource && (
            <SignUpOverlay
              opened={overlayOpened}
              onClose={closeOverlay}
              triggerSource={triggerSource}
            />
          )}
        </Container>
      </LayoutPage>
    );
  }

  // Default view (not signed in, no ?show=all)
  return (
    <LayoutPage>
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      {/* biome-ignore lint/correctness/useUniqueElementIds: Skip link target requires static ID */}
      <Container size="lg" py="xl" id="main-content">
        <Text size="xl" fw={700} mb="md">
          Products
        </Text>
        <Text mb="md">Please sign in to view products.</Text>
        <Button component="a" href="/sign-in">
          Sign In
        </Button>
      </Container>
    </LayoutPage>
  );
}

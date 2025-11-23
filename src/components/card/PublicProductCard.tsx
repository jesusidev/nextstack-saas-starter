'use client';

import { ActionIcon, Badge, Box, Group, Text, Tooltip } from '@mantine/core';
import { useCallback, useRef, useState } from 'react';
import { Card } from '~/components/card/Card';
import { HeartIcon, type HeartIconHandle } from '~/components/icons/HeartIcon';
import { useAnalytics } from '~/hooks/analytics/useAnalytics';
import type { TriggerSource } from '~/hooks/use-signup-overlay';
import type { Product } from '~/types/product';
import classes from './styles/CardProduct.module.css';

/**
 * Props for PublicProductCard component
 */
interface PublicProductCardProps {
  /** Product data to display */
  product: Product;
  /** Callback to trigger sign-up overlay with specific source */
  onSignUpTrigger: (source: TriggerSource) => void;
}

/**
 * PublicProductCard Component
 *
 * Product card for unauthenticated users that triggers sign-up overlay
 * instead of navigating to product details. Uses the compound Card component
 * for consistent styling and behavior.
 *
 * Features:
 * - Prevents navigation to product details (triggers overlay instead)
 * - Shows "Sign in to view" badge
 * - Tracks analytics for card and favorite clicks
 * - Uses existing Card compound component for consistency
 * - Keyboard accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <PublicProductCard
 *   product={product}
 *   onSignUpTrigger={(source) => showOverlay(source)}
 * />
 * ```
 */
export function PublicProductCard({ product, onSignUpTrigger }: PublicProductCardProps) {
  const analytics = useAnalytics();
  const heartRef = useRef<HeartIconHandle>(null);
  const [heartBounce, setHeartBounce] = useState(false);

  /**
   * Handle card click - trigger sign-up overlay
   */
  const handleCardClick = useCallback(() => {
    analytics.track({
      event: 'conversion:card-clicked',
      properties: {
        productId: product.id,
        productName: product.name,
        isAuthenticated: false,
      },
    });
    onSignUpTrigger('card');
  }, [analytics, product.id, product.name, onSignUpTrigger]);

  /**
   * Handle favorite action - trigger sign-up overlay
   */
  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      setHeartBounce(true);
      setTimeout(() => setHeartBounce(false), 600);

      analytics.track({
        event: 'conversion:favorite-clicked',
        properties: {
          productId: product.id,
          productName: product.name,
          isAuthenticated: false,
        },
      });

      onSignUpTrigger('favorite');
    },
    [analytics, product.id, product.name, onSignUpTrigger]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick]
  );

  /**
   * Handle favorite keyboard navigation
   */
  const handleFavoriteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        handleFavoriteClick(e as unknown as React.MouseEvent);
      }
    },
    [handleFavoriteClick]
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: Cannot use button due to nested ActionIcon (button inside button is invalid HTML)
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name} - Sign in required`}
      className={classes.publicCardButton}
      data-testid="public-product-card"
    >
      <Card>
        <Card.PublicHeader title={product.name}>
          <Badge size="xs" variant="filled" color="blue">
            Sign in to view
          </Badge>
        </Card.PublicHeader>

        <Card.PublicImage
          image={product.images[0] ?? 'https://picsum.photos/800/800?random=2'}
          title={product.name}
        />

        <Card.Description description={product.description ?? 'No description available'} />

        <Box className={classes.footer}>
          <Card.Details
            user={product.user}
            quantity={product.remaining?.quantity}
            brand={product.brand ?? 'No Brand'}
            categories={product.categories}
          />

          {/* Custom Actions for public users */}
          <Group mt="xs">
            <Text size="sm" c="dimmed" style={{ flex: 1 }}>
              Sign in to view details
            </Text>
            <Tooltip label="Sign up to favorite this product" withArrow position="top">
              <ActionIcon
                variant="light"
                size={36}
                onClick={handleFavoriteClick}
                onKeyDown={handleFavoriteKeyDown}
                aria-label="Sign up to favorite this product"
                className={heartBounce ? classes.heartBounce : ''}
                data-testid="favorite-button"
                tabIndex={0}
                onMouseEnter={() => heartRef.current?.startAnimation()}
                onMouseLeave={() => heartRef.current?.stopAnimation()}
                onFocus={() => heartRef.current?.startAnimation()}
                onBlur={() => heartRef.current?.stopAnimation()}
              >
                <HeartIcon ref={heartRef} size={18} filled={false} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Box>
      </Card>
    </div>
  );
}

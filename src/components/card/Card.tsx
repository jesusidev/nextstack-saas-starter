'use client';

import {
  ActionIcon,
  Button,
  Center,
  Group,
  LoadingOverlay,
  Card as MantineCard,
  Menu,
  Text,
  Tooltip,
} from '@mantine/core';
import type { Prisma } from '@prisma/client';
import { IconDots, IconHash, IconShoppingBag, IconTags, IconUser } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { useCallback, useContext, useRef, useState } from 'react';
import { FavoriteOverlay } from '~/components/card/FavoriteOverlay';
import { HeartIcon, type HeartIconHandle } from '~/components/icons/HeartIcon';
import { useDebouncedFavorite } from '~/hooks/use-debounced-favorite';
import {
  CardAnimationContext,
  CardAnimationProvider,
  useCardAnimation,
} from '~/state/card-animation';
import type { Product } from '~/types/product';
import { mergeclasses } from '~/utils';
import classes from './styles/CardProduct.module.css';

interface LoadingOverlayProps {
  visible: boolean;
}

interface HeaderProps {
  children?: React.ReactNode;
  title: string;
  link: string;
}

interface ImageProps {
  image: string;
  title: string;
  link: string;
}

interface DescriptionProps {
  description: string;
}

interface DetailsProps {
  user?: Product['user'];
  quantity?: number;
  brand?: string;
  categories?: { category: Prisma.CategoryGetPayload<Record<string, never>> }[];
}

interface ActionsProps {
  link: string;
  productId: string;
  isFavorite: boolean;
}

interface ProductCardProps {
  children: React.ReactNode;
}

interface PublicHeaderProps {
  children?: React.ReactNode;
  title: string;
}

interface PublicImageProps {
  image: string;
  title: string;
}

interface ProductCardComponent extends React.FC<ProductCardProps> {
  LoadingOverlay: React.FC<LoadingOverlayProps>;
  Menu: React.FC<{ children: React.ReactNode }>;
  Header: React.FC<HeaderProps>;
  Image: React.FC<ImageProps>;
  PublicHeader: React.FC<PublicHeaderProps>;
  PublicImage: React.FC<PublicImageProps>;
  Description: React.FC<DescriptionProps>;
  Details: React.FC<DetailsProps>;
  Actions: React.FC<ActionsProps>;
  VariantFull: React.FC<ProductCardProps>;
}

function ProductCardBase({ children }: ProductCardProps) {
  return (
    <CardAnimationProvider>
      <ProductCardBaseContent>{children}</ProductCardBaseContent>
    </CardAnimationProvider>
  );
}

function ProductCardBaseContent({ children }: { children: React.ReactNode }) {
  const { showGlow, showOverlay, currentFavoriteState } = useCardAnimation();

  return (
    <MantineCard
      withBorder
      className={mergeclasses(classes.card, showGlow ? classes.cardGlow : undefined)}
    >
      {showOverlay && <FavoriteOverlay show={showOverlay} isFavorite={currentFavoriteState} />}
      {children}
    </MantineCard>
  );
}

export const Card = ProductCardBase as ProductCardComponent;

Card.VariantFull = function VariantFull({ children }: ProductCardProps) {
  return (
    <CardAnimationProvider>
      <VariantFullContent>{children}</VariantFullContent>
    </CardAnimationProvider>
  );
};

function VariantFullContent({ children }: { children: React.ReactNode }) {
  const { showGlow, showOverlay, currentFavoriteState } = useCardAnimation();

  return (
    <MantineCard
      withBorder
      className={mergeclasses(
        classes?.card,
        classes?.cardVariantFull,
        showGlow ? classes.cardGlow : undefined
      )}
    >
      {showOverlay && <FavoriteOverlay show={showOverlay} isFavorite={currentFavoriteState} />}
      {children}
    </MantineCard>
  );
}

Card.LoadingOverlay = function LoadingOverlayDefault({ visible }) {
  return (
    <LoadingOverlay
      visible={visible}
      zIndex={1}
      overlayProps={{ radius: 'sm', blur: 2 }}
      loaderProps={{ type: 'bars' }}
    />
  );
};

Card.Menu = function MenuDefault({ children }) {
  return (
    <Menu position="bottom-end" shadow="sm" withArrow arrowPosition="center">
      <Menu.Target>
        <ActionIcon aria-label="Card menu">
          <IconDots size="1rem" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>{children}</Menu.Dropdown>
    </Menu>
  );
};

Card.Header = function Header({ title, link, children }) {
  return (
    <MantineCard.Section className={classes.header}>
      <Group justify="space-between">
        <Link href={`products/${link}`} style={{ textDecoration: 'none' }}>
          <Text fw="800" truncate>
            {title}
          </Text>
        </Link>
        {children || null}
      </Group>
    </MantineCard.Section>
  );
};

Card.Image = function CardImage({ image, title, link }) {
  return (
    <MantineCard.Section>
      <Link href={`products/${link}`} style={{ textDecoration: 'none' }}>
        <Image
          src={image}
          width={272}
          height={200}
          alt={`product for ${title}`}
          className={classes.productImage}
        />
      </Link>
    </MantineCard.Section>
  );
};

Card.PublicHeader = function PublicHeader({ title, children }) {
  return (
    <MantineCard.Section className={classes.header}>
      <Group justify="space-between">
        <Text fw="800" truncate>
          {title}
        </Text>
        {children || null}
      </Group>
    </MantineCard.Section>
  );
};

Card.PublicImage = function PublicCardImage({ image, title }) {
  return (
    <MantineCard.Section>
      <Image
        src={image}
        width={272}
        height={200}
        alt={`product for ${title}`}
        className={classes.productImage}
      />
    </MantineCard.Section>
  );
};

Card.Description = function Description({ description }) {
  return (
    <Text fz="xs" lineClamp={4} h={100}>
      {description}
    </Text>
  );
};

Card.Details = function Details({ user, quantity, brand, categories }) {
  return (
    <MantineCard.Section className={classes.section} mt="md">
      <Group mb={-8}>
        {user && (
          <Center>
            <Tooltip label="User" withArrow position="top">
              <IconUser size="1.05rem" className={classes.icon} stroke={1.5} />
            </Tooltip>
            <Text size="xs">
              {user.firstName} {user.lastName}
            </Text>
          </Center>
        )}
        {quantity && (
          <Center>
            <Tooltip label="Quantity" withArrow position="top">
              <IconHash size="1.05rem" className={classes.icon} stroke={1.5} />
            </Tooltip>
            <Text size="xs">{quantity}</Text>
          </Center>
        )}
        {brand && (
          <Center>
            <Tooltip label="Brand" withArrow position="top">
              <IconShoppingBag size="1.05rem" className={classes.icon} stroke={1.5} />
            </Tooltip>
            <Text size="xs">{brand}</Text>
          </Center>
        )}
        {categories !== undefined && (
          <Center>
            <Tooltip label="Categories" withArrow position="top">
              <IconTags size="1.05rem" className={classes.icon} stroke={1.5} />
            </Tooltip>
            <Text size="xs">{categories[0]?.category.name}</Text>
          </Center>
        )}
      </Group>
    </MantineCard.Section>
  );
};

Card.Actions = function Actions({ link, productId, isFavorite }) {
  const heartRef = useRef<HeartIconHandle>(null);
  const [heartBounce, setHeartBounce] = useState(false);

  const animationContext = useContext(CardAnimationContext);

  const { toggleFavorite, isProcessing } = useDebouncedFavorite(productId, isFavorite);

  const handleFavoriteClick = useCallback(() => {
    if (isProcessing) {
      return;
    }
    setHeartBounce(true);
    toggleFavorite();
    animationContext?.triggerAnimation(!isFavorite);
    setTimeout(() => setHeartBounce(false), 600);
  }, [isProcessing, toggleFavorite, animationContext, isFavorite]);

  return (
    <Group mt="xs">
      <Button style={{ flex: 1 }} component={Link} href={`products/${link}`}>
        Show details
      </Button>
      <Tooltip label="Favorite" withArrow position="top">
        <ActionIcon
          variant="heart"
          size={36}
          data-testid="favorite-button"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={handleFavoriteClick}
          onMouseEnter={() => heartRef.current?.startAnimation()}
          onMouseLeave={() => heartRef.current?.stopAnimation()}
          className={heartBounce ? classes.heartBounce : ''}
          disabled={isProcessing}
          style={{ opacity: isProcessing ? 0.6 : 1 }}
        >
          <HeartIcon ref={heartRef} size={18} filled={isFavorite} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

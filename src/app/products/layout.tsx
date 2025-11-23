import type { Metadata } from 'next';

/**
 * Metadata for public products page
 * Optimized for SEO and social sharing
 */
export const metadata: Metadata = {
  title: 'Browse Products | NextStack SaaS Starter - Discover Amazing Products',
  description:
    'Explore thousands of curated products from our community. Find your next favorite item, track inventory, and organize your product collection on NextStack SaaS Starter.',
  keywords: [
    'product catalog',
    'browse products',
    'discover products',
    'product inventory',
    'product management',
    'curated products',
    'product organization',
    'inventory tracking',
  ],
  openGraph: {
    title: 'Browse Products | NextStack SaaS Starter',
    description:
      'Explore thousands of curated products from our community. Find your next favorite item on NextStack SaaS Starter.',
    type: 'website',
    url: 'https://nextstack-saas-starter.com/products?show=all',
    siteName: 'NextStack SaaS Starter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Products | NextStack SaaS Starter',
    description: 'Explore thousands of curated products from our community.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://nextstack-saas-starter.com/products',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

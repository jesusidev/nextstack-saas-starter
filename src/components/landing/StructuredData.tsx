export function StructuredData() {
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NextStack SaaS Starter',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    description:
      'Product organization and project management platform for teams. Manage inventory, organize projects, collaborate with your team, and track performance.',
    featureList: [
      'Product catalog management',
      'Multi-project organization',
      'Team collaboration',
      'Real-time search and filtering',
      'S3 image uploads',
      'Analytics and insights',
    ],
    screenshot: 'https://nextstack-saas-starter.com/images/dashboard-preview.png',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    url: 'https://nextstack-saas-starter.com',
    author: {
      '@type': 'Organization',
      name: 'NextStack SaaS Starter Team',
    },
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe (server-generated)
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
    />
  );
}

// @ts-check

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env.mjs'));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  // Enable standalone output for Docker optimization
  // This creates a minimal production server with only required files
  output: 'standalone',

  // Skip ESLint during production builds to avoid build failures from lint config/plugins
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Keep type-checking during build; set to true only if you need to bypass TS errors in CI
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimize for production deployment
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Compress responses
  compress: true,

  // Image configuration for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nextstack-saas-starter-dev-assets.s3.us-west-2.amazonaws.com',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'nextstack-saas-starter-qa-assets.s3.us-west-2.amazonaws.com',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'nextstack-saas-starter-prod-assets.s3.us-west-2.amazonaws.com',
        pathname: '/assets/**',
      },
    ],
  },
};
export default config;

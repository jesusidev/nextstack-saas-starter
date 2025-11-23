import { type NextRequest, NextResponse } from 'next/server';

type HealthResponse = {
  status: string;
  timestamp: string;
  environment: string;
  version?: string;
};

/**
 * Health check endpoint for monitoring application status
 * Used by deployment scripts and monitoring tools
 */
export async function GET(_request: NextRequest) {
  // Get environment from env var or default to development
  const environment = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';

  // Get version from package.json if available
  let version: string = 'unknown';
  try {
    // This is a simple way to get the version, but in production you might want to
    // inject this during the build process instead
    const packageJson = require('../../../../package.json');
    version = packageJson.version;
  } catch (_error) {
    // Ignore error if package.json can't be read
  }

  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment,
    version,
  };

  return NextResponse.json(response);
}

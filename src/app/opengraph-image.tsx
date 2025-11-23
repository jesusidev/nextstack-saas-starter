import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NextStack SaaS Starter - Organize Products Across Projects';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #0064E6 0%, #14B8A6 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 60,
          fontSize: 36,
          fontWeight: 900,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        NextStack SaaS Starter
      </div>

      {/* Main Headline */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: 'white',
          textAlign: 'center',
          maxWidth: '900px',
          lineHeight: 1.2,
          marginBottom: 30,
          textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        Organize Products Across Projects. Effortlessly.
      </div>

      {/* Subheadline */}
      <div
        style={{
          fontSize: 28,
          color: 'rgba(255, 255, 255, 0.95)',
          textAlign: 'center',
          maxWidth: '700px',
          lineHeight: 1.4,
        }}
      >
        Track inventory, manage projects, and collaborate with your team
      </div>

      {/* Features */}
      <div
        style={{
          display: 'flex',
          gap: 40,
          marginTop: 50,
          fontSize: 20,
          color: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>✓ Product Catalog</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>✓ Project Management</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>✓ Team Collaboration</div>
      </div>

      {/* URL */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 60,
          fontSize: 24,
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: 600,
        }}
      >
        nextstack-saas-starter.com
      </div>
    </div>,
    {
      ...size,
    }
  );
}

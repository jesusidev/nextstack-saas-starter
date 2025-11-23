import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NextStack SaaS Starter - Product Organization Platform';
export const size = { width: 1200, height: 600 };
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
        padding: '60px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 50,
          fontSize: 32,
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
          fontSize: 64,
          fontWeight: 900,
          color: 'white',
          textAlign: 'center',
          maxWidth: '900px',
          lineHeight: 1.2,
          marginBottom: 25,
          textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        Organize Products Across Projects
      </div>

      {/* Features Grid */}
      <div
        style={{
          display: 'flex',
          gap: 30,
          marginTop: 40,
          fontSize: 18,
          color: 'rgba(255, 255, 255, 0.95)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '800px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>✓ Product Catalog</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>✓ Projects</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>✓ Collaboration</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>✓ Search</div>
      </div>

      {/* URL */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          fontSize: 22,
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

# Social Media Images Guide

## Overview

This guide explains how to create and implement social media preview images (OpenGraph and Twitter Cards) for NextStack SaaS Starter.

---

## Required Images

### 1. OpenGraph Image
- **Filename:** `public/og-image.png`
- **Dimensions:** 1200 x 630 pixels
- **Format:** PNG or JPG
- **File Size:** < 1MB (ideally < 300KB)
- **Usage:** Facebook, LinkedIn, Slack, Discord, WhatsApp

### 2. Twitter Card Image
- **Filename:** `public/twitter-image.png`
- **Dimensions:** 1200 x 600 pixels (or use same as OG: 1200 x 630)
- **Format:** PNG or JPG
- **File Size:** < 1MB (ideally < 300KB)
- **Usage:** Twitter/X

---

## Design Specifications

### Brand Colors (from NextStack SaaS Starter theme)
```
Primary Blue: #0064E6 (rgb(0, 100, 230))
Teal: #14B8A6 (rgb(20, 184, 166))
Purple: #9333EA (rgb(147, 51, 234))
Dark Background: #1A1B1E
Light Background: #FFFFFF
```

### Typography
- **Headline Font:** Work Sans (Bold/Black)
- **Body Font:** Roboto (Regular/Medium)

### Layout Recommendations

#### OpenGraph Image (1200x630)
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Logo]                                     │
│                                             │
│         Organize Products                   │
│         Across Projects.                    │
│         Effortlessly.                       │
│                                             │
│  [Dashboard Preview/Mockup]                 │
│                                             │
│  nextstack-saas-starter.com                            │
└─────────────────────────────────────────────┘
```

#### Twitter Card Image (1200x600)
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Logo]    NextStack SaaS Starter                      │
│                                             │
│  Organize Products Across Projects          │
│                                             │
│  ✓ Product Catalog  ✓ Project Management   │
│  ✓ Team Collaboration  ✓ Instant Search    │
│                                             │
│  nextstack-saas-starter.com                            │
└─────────────────────────────────────────────┘
```

---

## Design Tools

### Option 1: Figma (Recommended)
1. Create new frame: 1200 x 630 px
2. Add gradient background (Blue → Teal)
3. Add headline text (Work Sans Bold, 72px)
4. Add dashboard screenshot or mockup
5. Add logo and URL
6. Export as PNG (2x resolution)

**Figma Template:** [Create from scratch or use template]

### Option 2: Canva
1. Use "Facebook Post" template (1200 x 630)
2. Customize with brand colors
3. Add text and images
4. Download as PNG

**Canva Template:** Search "OpenGraph" or "Social Media"

### Option 3: Adobe Photoshop/Illustrator
1. New document: 1200 x 630 px, 72 DPI
2. Design with brand guidelines
3. Export as PNG (Save for Web)

### Option 4: Online Tools
- **Bannerbear:** https://www.bannerbear.com/
- **Placid:** https://placid.app/
- **Cloudinary:** Dynamic image generation
- **Vercel OG:** https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation

---

## Content Guidelines

### Headline
- **Primary:** "Organize Products Across Projects. Effortlessly."
- **Alternative:** "Product Organization Made Simple"
- **Alternative:** "Manage Products & Projects in One Place"

### Subheadline (Optional)
- "Track inventory, manage projects, collaborate with your team"
- "The modern product organization platform"

### Visual Elements
- Dashboard screenshot (blurred or simplified)
- Product cards mockup
- Project board visualization
- Abstract shapes/patterns
- Gradient backgrounds

### Branding
- NextStack SaaS Starter logo (top-left or center)
- Website URL (bottom-right or center-bottom)
- Tagline (optional)

---

## Implementation Steps

### Step 1: Create Images

**Using Figma (Recommended):**
```
1. Open Figma
2. Create frame: 1200 x 630 px
3. Add gradient background:
   - Start: #0064E6 (top-left)
   - End: #14B8A6 (bottom-right)
4. Add headline:
   - Font: Work Sans Bold
   - Size: 72px
   - Color: White
   - Text: "Organize Products Across Projects. Effortlessly."
5. Add dashboard mockup (optional)
6. Add logo (top-left, 60px height)
7. Add URL (bottom-right, 24px)
8. Export as PNG (2x)
```

### Step 2: Optimize Images

**Using ImageOptim (Mac) or TinyPNG:**
```bash
# Install ImageOptim (Mac)
brew install --cask imageoptim

# Or use online: https://tinypng.com/
```

**Target file sizes:**
- OG Image: < 300KB
- Twitter Image: < 300KB

### Step 3: Add to Project

```bash
# Copy images to public directory
cp og-image.png /path/to/nextstack-saas-starter/public/
cp twitter-image.png /path/to/nextstack-saas-starter/public/

# Verify
ls -lh public/*.png
```

### Step 4: Update URLs (if needed)

If using a different domain or CDN:

```typescript
// src/app/layout.tsx
openGraph: {
  images: [
    {
      url: 'https://your-domain.com/og-image.png',
      width: 1200,
      height: 630,
    },
  ],
},
twitter: {
  images: ['https://your-domain.com/twitter-image.png'],
},
```

---

## Testing

### Test OpenGraph Tags

**Facebook Debugger:**
```
https://developers.facebook.com/tools/debug/
```
1. Enter URL: https://nextstack-saas-starter.com
2. Click "Debug"
3. Verify image appears
4. Click "Scrape Again" if needed

**LinkedIn Post Inspector:**
```
https://www.linkedin.com/post-inspector/
```

**Slack:**
```
Just paste URL in Slack channel
```

### Test Twitter Cards

**Twitter Card Validator:**
```
https://cards-dev.twitter.com/validator
```
1. Enter URL: https://nextstack-saas-starter.com
2. Click "Preview card"
3. Verify image and text

### Test Locally

**Using ngrok:**
```bash
# Start dev server
npm run dev

# In another terminal
ngrok http 3000

# Use ngrok URL in Facebook Debugger
```

---

## Placeholder Solution (Temporary)

If you need a quick placeholder while designing the final images:

### Create Simple Placeholder

```html
<!-- Use Vercel OG Image Generation -->
<!-- Add to src/app/opengraph-image.tsx -->

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NextStack SaaS Starter - Product Organization Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0064E6 0%, #14B8A6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: 'white',
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.2,
          }}
        >
          Organize Products Across Projects. Effortlessly.
        </div>
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.9)',
            marginTop: 40,
          }}
        >
          nextstack-saas-starter.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

**Benefits:**
- ✅ No image files needed
- ✅ Dynamic generation
- ✅ Fast deployment
- ✅ Easy to update

**Drawbacks:**
- ⚠️ Limited design flexibility
- ⚠️ No custom fonts (without setup)
- ⚠️ No images/screenshots

---

## Best Practices

### Design
- ✅ Use high contrast (text on background)
- ✅ Keep text large and readable
- ✅ Use brand colors consistently
- ✅ Include logo for brand recognition
- ✅ Add visual interest (gradient, shapes, images)
- ❌ Don't overcrowd with text
- ❌ Don't use small fonts (< 48px)
- ❌ Don't rely on fine details

### Technical
- ✅ Use PNG for graphics with text
- ✅ Use JPG for photos
- ✅ Optimize file size (< 300KB)
- ✅ Use 2x resolution for retina displays
- ✅ Test on multiple platforms
- ❌ Don't exceed 1MB file size
- ❌ Don't use animated GIFs (not supported)

### Content
- ✅ Clear value proposition
- ✅ Consistent with landing page
- ✅ Include call-to-action or URL
- ✅ Use action-oriented language
- ❌ Don't use jargon
- ❌ Don't make false claims

---

## Checklist

### Design Phase
- [ ] Choose design tool (Figma/Canva/Photoshop)
- [ ] Create OG image (1200x630)
- [ ] Create Twitter image (1200x600)
- [ ] Use brand colors and fonts
- [ ] Include headline and URL
- [ ] Add visual elements (mockup/gradient)
- [ ] Review with team

### Production Phase
- [ ] Optimize images (< 300KB each)
- [ ] Add to `public/` directory
- [ ] Verify filenames match layout.tsx
- [ ] Test locally
- [ ] Deploy to staging
- [ ] Test with Facebook Debugger
- [ ] Test with Twitter Card Validator
- [ ] Test with LinkedIn Inspector
- [ ] Deploy to production
- [ ] Verify live URLs

---

## Resources

### Design Inspiration
- **Dribbble:** Search "OpenGraph" or "Social Media Card"
- **Behance:** Search "Social Media Preview"
- **Twitter:** Look at tech companies' cards

### Tools
- **Figma:** https://figma.com
- **Canva:** https://canva.com
- **Bannerbear:** https://bannerbear.com
- **Vercel OG:** https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation

### Testing
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Inspector:** https://www.linkedin.com/post-inspector/
- **OpenGraph.xyz:** https://www.opengraph.xyz/

### Documentation
- **OpenGraph Protocol:** https://ogp.me/
- **Twitter Cards:** https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- **Next.js Metadata:** https://nextjs.org/docs/app/api-reference/functions/generate-metadata

---

## Support

For questions or assistance:
1. Check this guide
2. Review existing examples
3. Test with validators
4. Ask team for feedback

**Last Updated:** November 5, 2025

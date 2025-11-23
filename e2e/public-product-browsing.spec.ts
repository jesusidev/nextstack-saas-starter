import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import { signInTestUser } from './support/authHelpers';

test.describe('Public Product Browsing - Unauthenticated Users', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear session storage to start fresh
    await context.clearCookies();
    await page.goto('/products?show=all');
  });

  test('should display products for unauthenticated users', async ({ page }) => {
    // Verify page loads with correct URL
    await expect(page).toHaveURL(/\/products\?show=all/);

    // Verify header text
    await expect(page.getByText('Discover Amazing Products')).toBeVisible();

    // Verify products are visible
    const productCards = page.locator('[data-testid="public-product-card"]');
    const cardCount = await productCards.count();

    // Should have at least some products
    expect(cardCount).toBeGreaterThan(0);

    // Verify first card has required elements
    const firstCard = productCards.first();
    await expect(firstCard).toBeVisible();

    // Verify sign-in indicator
    await expect(page.getByText('Sign in to view')).toBeVisible();
  });

  test('should show sign-up overlay when card is clicked', async ({ page }) => {
    // Wait for products to load
    const productCards = page.locator('[data-testid="public-product-card"]');
    await productCards.first().waitFor({ state: 'visible' });

    // Click on first product card
    await productCards.first().click();

    // Verify overlay appears
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).toBeVisible();

    // Verify correct messaging for card click
    await expect(page.getByText(/sign in to view full product details/i)).toBeVisible();

    // Verify Sign Up and Sign In buttons are present
    await expect(page.getByTestId('signup-button')).toBeVisible();
    await expect(page.getByTestId('signin-button')).toBeVisible();

    // Verify URL did not change (no navigation)
    await expect(page).toHaveURL(/\/products\?show=all/);
  });

  test('should show sign-up overlay when favorite button is clicked', async ({ page }) => {
    // Wait for products to load
    const productCards = page.locator('[data-testid="public-product-card"]');
    await productCards.first().waitFor({ state: 'visible' });

    // Click favorite button on first card
    const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
    await favoriteButton.click();

    // Verify overlay appears
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).toBeVisible();

    // Verify correct messaging for favorite click
    await expect(page.getByText(/sign in to save your favorite products/i)).toBeVisible();
  });

  test('should show sign-up overlay after scrolling to 40%', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Calculate 40% scroll position
    const scrollHeight = await page.evaluate(() => {
      return document.documentElement.scrollHeight - window.innerHeight;
    });

    // Scroll to 40%
    await page.evaluate((scrollTarget) => {
      window.scrollTo(0, scrollTarget * 0.4);
    }, scrollHeight);

    // Wait for overlay to appear (may have slight delay)
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).toBeVisible({ timeout: 3000 });

    // Verify correct messaging for scroll trigger
    await expect(
      page.getByText(/join thousands of users discovering amazing products/i)
    ).toBeVisible();
  });

  test('should only show overlay once per session', async ({ page }) => {
    // Wait for products to load
    const productCards = page.locator('[data-testid="public-product-card"]');
    await productCards.first().waitFor({ state: 'visible' });

    // Trigger overlay via card click
    await productCards.first().click();

    // Verify overlay appears
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).toBeVisible();

    // Close overlay by clicking close button
    const closeButton = page.getByRole('button', { name: /close/i }).first();
    await closeButton.click();

    // Wait for overlay to close
    await expect(overlay).not.toBeVisible();

    // Try to trigger again via favorite button
    const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
    await favoriteButton.click();

    // Overlay should not appear
    await expect(overlay).not.toBeVisible({ timeout: 1000 });

    // Try to trigger via scrolling
    const scrollHeight = await page.evaluate(() => {
      return document.documentElement.scrollHeight - window.innerHeight;
    });

    await page.evaluate((scrollTarget) => {
      window.scrollTo(0, scrollTarget * 0.4);
    }, scrollHeight);

    // Overlay should still not appear
    await expect(overlay).not.toBeVisible({ timeout: 2000 });
  });

  test('should allow closing overlay with close button', async ({ page }) => {
    // Trigger overlay
    const productCards = page.locator('[data-testid="public-product-card"]');
    await productCards.first().waitFor({ state: 'visible' });
    await productCards.first().click();

    // Verify overlay is visible
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).toBeVisible();

    // Click close button
    const closeButton = page.getByRole('button', { name: /close/i }).first();
    await closeButton.click();

    // Verify overlay is closed
    await expect(overlay).not.toBeVisible();
  });

  test('should allow closing overlay with Escape key', async ({ page }) => {
    // Trigger overlay
    const productCards = page.locator('[data-testid="public-product-card"]');
    await productCards.first().waitFor({ state: 'visible' });
    await productCards.first().click();

    // Verify overlay is visible
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Verify overlay is closed
    await expect(overlay).not.toBeVisible();
  });

  test('should support search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('test');

    // Wait for filtering to happen
    await page.waitForTimeout(300);

    // Verify products are still visible (or show no results message)
    const productCards = page.locator('[data-testid="public-product-card"]');
    const noResults = page.getByText(/no products found/i);

    // Either products match or no results message
    const hasProducts = (await productCards.count()) > 0;
    const hasNoResults = await noResults.isVisible();

    expect(hasProducts || hasNoResults).toBe(true);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page
    await page.reload();

    // Verify products display correctly
    const productCards = page.locator('[data-testid="public-product-card"]');
    await productCards.first().waitFor({ state: 'visible' });

    // Trigger overlay
    await productCards.first().click();

    // Verify overlay is visible and fits viewport
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).toBeVisible();

    // Check overlay doesn't overflow
    const overlayBox = await overlay.boundingBox();
    if (overlayBox) {
      expect(overlayBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Wait for page to load
    const productCards = page.locator('[data-testid="public-product-card"]');
    await productCards.first().waitFor({ state: 'visible' });

    // Tab to first card (may need multiple tabs depending on page structure)
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to trigger overlay
    await page.keyboard.press('Enter');

    // Verify overlay appears
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).toBeVisible({ timeout: 2000 });
  });

  test('should display proper product information', async ({ page }) => {
    const productCards = page.locator('[data-testid="public-product-card"]');
    await productCards.first().waitFor({ state: 'visible' });

    const firstCard = productCards.first();

    // Card should have product name
    await expect(firstCard.locator('h3, [fw="800"]').first()).toBeVisible();

    // Card should have image
    await expect(firstCard.locator('img').first()).toBeVisible();

    // Card should have favorite button
    await expect(firstCard.locator('[data-testid="favorite-button"]')).toBeVisible();
  });

  test('should navigate to sign-up page when Sign Up button is clicked', async ({ page }) => {
    // Trigger overlay
    const firstCard = page.locator('[data-testid="public-product-card"]').first();
    await firstCard.click();

    // Wait for overlay
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).toBeVisible();

    // Click Sign Up button
    const signUpButton = page.getByTestId('signup-button');
    await signUpButton.click();

    // Verify navigation to sign-up page
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test('should navigate to sign-in page when Sign In button is clicked', async ({ page }) => {
    // Trigger overlay
    const firstCard = page.locator('[data-testid="public-product-card"]').first();
    await firstCard.click();

    // Wait for overlay
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).toBeVisible();

    // Click Sign In button
    const signInButton = page.getByTestId('signin-button');
    await signInButton.click();

    // Verify navigation to sign-in page
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Public Product Browsing - Authenticated Users', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
    await signInTestUser(page, '/products?show=all');
  });

  test('should show regular product cards for authenticated users', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    // Should NOT have public product cards
    const publicCards = page.locator('[data-testid="public-product-card"]');
    await expect(publicCards).toHaveCount(0);

    // Should have regular product cards or dashboard layout
    const dashboardLayout = page.locator('[data-testid="layout-dashboard"]');
    const regularCards = page.locator('[data-testid="product-card"]');

    // Either dashboard layout exists or regular cards exist
    const hasDashboard = await dashboardLayout.isVisible().catch(() => false);
    const hasRegularCards = (await regularCards.count()) > 0;

    expect(hasDashboard || hasRegularCards).toBe(true);
  });

  test('should allow navigation to product details when authenticated', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    // Find a product card
    const productCard = page.locator('[data-testid="product-card"]').first();

    if ((await productCard.count()) > 0) {
      await productCard.waitFor({ state: 'visible' });

      // Get product link
      const productLink = productCard.locator('a[href*="/products/"]').first();

      if (await productLink.isVisible()) {
        await productLink.click();

        // Should navigate to detail page
        await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9]+/);
      }
    }
  });

  test('should NOT show sign-up overlay to authenticated users', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    // Scroll to trigger position
    const scrollHeight = await page.evaluate(() => {
      return document.documentElement.scrollHeight - window.innerHeight;
    });

    await page.evaluate((scrollTarget) => {
      window.scrollTo(0, scrollTarget * 0.5);
    }, scrollHeight);

    // Wait a bit
    await page.waitForTimeout(1000);

    // Overlay should not appear
    const overlay = page.locator('[data-testid="signup-overlay"]');
    await expect(overlay).not.toBeVisible();
  });
});

import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

import { signInTestUser } from './support/authHelpers';

test.describe('Product Search', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
    await signInTestUser(page, '/products');
    // Wait for the search input to be visible instead of networkidle
    await expect(page.getByPlaceholder('Search products by name, brand, or SKU...')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');
    await expect(searchInput).toBeVisible();
  });

  test('should filter products by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    await searchInput.fill('Test Product');

    await page.waitForTimeout(100);

    const productCards = page.locator('[data-testid="product-card"]');
    const visibleCards = await productCards.count();

    if (visibleCards > 0) {
      const firstCard = productCards.first();
      await expect(firstCard).toContainText('Test Product', { ignoreCase: true });
    }
  });

  test('should filter products by brand', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    await searchInput.fill('Nike');

    await page.waitForTimeout(100);

    const productCards = page.locator('[data-testid="product-card"]');
    const visibleCards = await productCards.count();

    if (visibleCards > 0) {
      const firstCard = productCards.first();
      await expect(firstCard).toContainText('Nike', { ignoreCase: true });
    }
  });

  test('should filter products by SKU', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    await searchInput.fill('SKU123');

    await page.waitForTimeout(100);

    const productCards = page.locator('[data-testid="product-card"]');
    const visibleCards = await productCards.count();

    if (visibleCards > 0) {
      const firstCard = productCards.first();
      await expect(firstCard).toContainText('SKU123', { ignoreCase: true });
    }
  });

  test('should be case-insensitive', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    await searchInput.fill('NIKE');
    await page.waitForTimeout(100);
    const upperCaseCount = await page.locator('[data-testid="product-card"]').count();

    await searchInput.clear();
    await searchInput.fill('nike');
    await page.waitForTimeout(100);
    const lowerCaseCount = await page.locator('[data-testid="product-card"]').count();

    expect(upperCaseCount).toBe(lowerCaseCount);
  });

  test('should show all products when search is empty', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    const initialCount = await page.locator('[data-testid="product-card"]').count();

    await searchInput.fill('test');
    await page.waitForTimeout(100);

    await searchInput.clear();
    await page.waitForTimeout(100);

    const finalCount = await page.locator('[data-testid="product-card"]').count();

    expect(finalCount).toBe(initialCount);
  });

  test('should display empty state for no matches', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    await searchInput.fill('xyz999nonexistent');

    await page.waitForTimeout(100);

    const emptyStateText = page.getByText(/No products found matching/i);
    await expect(emptyStateText).toBeVisible();

    await expect(emptyStateText).toContainText('xyz999nonexistent');
  });

  test('should handle special characters', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    const specialChars = ['&', '-', '/', '(', ')'];

    for (const char of specialChars) {
      await searchInput.fill(`test${char}product`);
      await page.waitForTimeout(50);

      await expect(searchInput).toHaveValue(`test${char}product`);
    }
  });
});

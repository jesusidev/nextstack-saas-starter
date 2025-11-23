import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

import { signInTestUser } from './support/authHelpers';

test.describe('Dashboard Product Search', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
    await signInTestUser(page, '/dashboard');
  });

  test('should display search input on dashboard', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');
    await expect(searchInput).toBeVisible();
  });

  test('should filter products by name on dashboard', async ({ page }) => {
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

  test('should filter products by brand on dashboard', async ({ page }) => {
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

  test('should filter products by SKU on dashboard', async ({ page }) => {
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

  test('should be case-insensitive on dashboard', async ({ page }) => {
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

  test('should show all products when search is empty on dashboard', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    const initialCount = await page.locator('[data-testid="product-card"]').count();

    await searchInput.fill('Test');
    await page.waitForTimeout(100);

    await searchInput.clear();
    await page.waitForTimeout(100);

    const finalCount = await page.locator('[data-testid="product-card"]').count();

    expect(finalCount).toBe(initialCount);
  });

  test('should show empty state when no results found on dashboard', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    await searchInput.fill('NonExistentProduct12345XYZ');
    await page.waitForTimeout(100);

    const emptyState = page.getByText(/No products found matching/i);
    await expect(emptyState).toBeVisible();
  });

  test('should work in both card and table views on dashboard', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    // Test in card view
    await searchInput.fill('Test');
    await page.waitForTimeout(100);
    await page.locator('[data-testid="product-card"]').count();

    // Switch to table view
    const tableViewButton = page.getByRole('button', { name: /table/i });
    if (await tableViewButton.isVisible()) {
      await tableViewButton.click();
      await page.waitForTimeout(100);

      // Verify search still works in table view
      const tableRows = page.locator('table tbody tr');
      const tableRowCount = await tableRows.count();

      // Both views should show filtered results
      expect(tableRowCount).toBeGreaterThan(0);
    }
  });

  test('should clear search results when input is cleared on dashboard', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    const initialCount = await page.locator('[data-testid="product-card"]').count();

    await searchInput.fill('Test');
    await page.waitForTimeout(100);
    const filteredCount = await page.locator('[data-testid="product-card"]').count();

    await searchInput.clear();
    await page.waitForTimeout(100);
    const clearedCount = await page.locator('[data-testid="product-card"]').count();

    expect(clearedCount).toBe(initialCount);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should handle special characters in search on dashboard', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products by name, brand, or SKU...');

    const specialChars = ['@', '#', '$', '%', '&', '*'];

    for (const char of specialChars) {
      await searchInput.fill(char);
      await page.waitForTimeout(100);

      // Should not crash and should show either results or empty state
      const hasCards = (await page.locator('[data-testid="product-card"]').count()) > 0;
      const hasEmptyState = await page.getByText(/No products found matching/i).isVisible();

      expect(hasCards || hasEmptyState).toBe(true);

      await searchInput.clear();
    }
  });
});

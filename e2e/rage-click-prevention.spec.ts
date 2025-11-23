import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import { signInTestUser } from './support/authHelpers';

test.describe.configure({ mode: 'serial' });

test.describe('Rage-Click Prevention', () => {
  let productName: string;

  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
    await signInTestUser(page, '/dashboard');

    // Wait for dashboard to be fully loaded
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });

    // Create a test product for all tests
    productName = `Test Product ${Date.now()}`;
    await page.getByRole('main').getByRole('button', { name: 'Create Product' }).click();

    // Wait for modal to be visible
    await expect(page.getByLabel('Product Name')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('Product Name').fill(productName);

    await page
      .getByRole('button', { name: 'Create Product' })
      .filter({ hasText: 'Create Product' })
      .last()
      .click();

    // Wait for modal to close (it should disappear after successful creation)
    await expect(page.getByLabel('Product Name')).not.toBeVisible({ timeout: 10000 });

    // Wait for product to appear in the list
    await expect(page.getByRole('link', { name: productName, exact: true }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test.describe('Card View - Favorite Button', () => {
    test('disables button during processing to prevent rage clicks', async ({ page }) => {
      // Find the first favorite button
      const favoriteButton = page.getByTestId('favorite-button').first();
      await expect(favoriteButton).toBeVisible();

      // Click the favorite button once
      await favoriteButton.click();

      // Button should immediately be disabled
      await expect(favoriteButton).toBeDisabled();

      // Wait for debounce/processing to complete
      await page.waitForTimeout(700);

      // Button should be enabled again
      await expect(favoriteButton).toBeEnabled();
    });

    test('prevents rapid multiple clicks through disabled state', async ({ page }) => {
      const favoriteButton = page.getByRole('button', { name: /favorites/i }).first();
      await expect(favoriteButton).toBeVisible();

      // Click the button
      await favoriteButton.click();

      // Try to click rapidly while disabled (should be ignored)
      for (let i = 0; i < 5; i++) {
        await favoriteButton.click({ force: true, timeout: 100 }).catch(() => {
          // Expected to fail when disabled
        });
      }

      // Wait for processing
      await page.waitForTimeout(700);

      // Button should be enabled again after processing
      await expect(favoriteButton).toBeEnabled();
    });
  });

  test.describe('Table View - Favorite Button', () => {
    test('disables button during processing in table view', async ({ page }) => {
      // Switch to table view - click the last visible table option
      const tableViewOption = page.getByTestId('table-view-option-dashboard').last();
      await tableViewOption.click();

      // Wait for table to load
      await expect(page.getByRole('table')).toBeVisible({ timeout: 5000 });

      // Find the first favorite button in the table using data-testid
      const favoriteButton = page.getByRole('table').getByTestId('favorite-button').first();
      await expect(favoriteButton).toBeVisible();

      // Click the favorite button
      await favoriteButton.click();

      // Verify button is disabled during processing to prevent rage clicks
      await expect(favoriteButton).toBeDisabled();

      // Wait for processing to complete
      await page.waitForTimeout(700);

      // Verify button is enabled again
      await expect(favoriteButton).toBeEnabled();
    });
  });

  test.describe('Product Detail Page - Favorite Button', () => {
    test('disables button during processing on detail page', async ({ page }) => {
      // Click the product to go to detail page
      const productLink = page.getByRole('link', { name: productName, exact: true }).first();
      await productLink.click();

      // Wait for product detail page to load
      await page.waitForURL(/\/products\/.+/);
      await expect(page.getByRole('heading', { name: productName })).toBeVisible({
        timeout: 10000,
      });

      // Find the favorite button
      const favoriteButton = page.getByRole('button', { name: /favorites/i }).first();
      await expect(favoriteButton).toBeVisible();

      // Click the favorite button
      await favoriteButton.click();

      // Verify button is disabled during processing
      await expect(favoriteButton).toBeDisabled();

      // Wait for processing to complete
      await page.waitForTimeout(700);

      // Verify button is enabled again
      await expect(favoriteButton).toBeEnabled();
    });
  });
});

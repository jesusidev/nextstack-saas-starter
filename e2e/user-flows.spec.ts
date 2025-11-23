import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

import { signInTestUser } from './support/authHelpers';
import { getTestUser } from './support/clerkTestUser';

test.describe('Critical User Flows', () => {
  // Authentication tests
  test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
      await setupClerkTestingToken({ page });
    });

    test('user can sign in', async ({ page }) => {
      const { email, password } = getTestUser();

      // Navigate to the home page
      await page.goto('/');

      // Find and click on a sign-in button or link
      const signInButton = page.getByRole('link', { name: /sign in|log in|login/i });
      await signInButton.click();

      // Wait for the Clerk sign-in form to load
      await page.waitForSelector('.cl-signIn-root', { state: 'attached' });

      // Fill in the identifier (email) field
      await page.locator('input[name=identifier]').fill(email);
      await page.getByRole('button', { name: 'Continue', exact: true }).click();

      // Fill in the password field (appears after clicking Continue)
      await page.locator('input[name=password]').fill(password);
      await page.getByRole('button', { name: 'Continue', exact: true }).click();

      // Wait for redirect to dashboard and verify we're signed in
      await page.waitForURL('**/dashboard');
      await expect(page.getByRole('button', { name: 'Create Product' })).toBeVisible();
    });

    test('user can sign in using helper', async ({ page }) => {
      const { email, password } = getTestUser();

      await page.goto('/');
      await clerk.signIn({
        page,
        signInParams: {
          strategy: 'password',
          identifier: email,
          password: password,
        },
      });
      await page.goto('/dashboard');

      // Wait for any overlays to disappear (user verification modal if first-time user)
      await page
        .locator('.mantine-Modal-overlay')
        .waitFor({ state: 'detached', timeout: 5000 })
        .catch(() => {
          // No modal present, continue
        });

      // Verify we're on the dashboard by checking for the Create Product button
      await expect(page.getByRole('button', { name: 'Create Product' })).toBeVisible({
        timeout: 15000,
      });
    });

    test('user can sign up', async ({ page }) => {
      // Generate unique credentials for this sign-up test
      const uniqueEmail = `test.${Date.now()}@example.com`;
      const testPassword = `TestPass123!${Date.now()}`;

      // Navigate to the home page
      await page.goto('/');

      // Find and click on a sign-up button or link
      const signUpButton = page.getByRole('link', { name: /sign up|register|create account/i });
      await signUpButton.click();

      // Wait for the Clerk sign-up form to load
      await page.waitForSelector('.cl-signUp-root', { state: 'attached' });

      // Fill in the email field
      await page.locator('input[name=emailAddress]').fill(uniqueEmail);

      // Fill in the password field
      await page.locator('input[name=password]').fill(testPassword);

      // Click Continue button
      await page.getByRole('button', { name: 'Continue', exact: true }).click();

      // Verify we see the email verification prompt
      await expect(page.getByText(/verify.*email/i)).toBeVisible();
    });
  });

  // Core application workflow tests
  test.describe('Product Management', () => {
    // Sign in before exercising product flows
    test.beforeEach(async ({ page }) => {
      await signInTestUser(page, '/dashboard');

      // Wait for dashboard to be fully loaded - just check for the Create Product button
      await expect(page.getByRole('button', { name: 'Create Product' })).toBeVisible({
        timeout: 15000,
      });
    });

    test.afterEach(async ({ page }) => {
      await clerk.signOut({ page }).catch(() => {
        /* ignore sign-out failures so the suite can proceed */
      });
    });

    test('user can create a product', async ({ page }) => {
      const productName = `Playwright Product ${Date.now()}`;

      // Click the main "Create Product" button to open the modal
      await page.getByRole('main').getByRole('button', { name: 'Create Product' }).click();

      // Fill in the product name in the modal
      await page.getByLabel('Product Name').fill(productName);

      // Click the submit button inside the modal (type="submit")
      await page
        .getByRole('button', { name: 'Create Product' })
        .filter({ hasText: 'Create Product' })
        .last()
        .click();

      // Wait for product to appear in the list (use .first() since card has multiple links with same name)
      await expect(
        page.getByRole('link', { name: productName, exact: true }).first()
      ).toBeVisible();
    });

    test('user can delete a product', async ({ page }) => {
      const productName = `Playwright Product ${Date.now()}`;

      // Click the main "Create Product" button to open the modal
      await page.getByRole('main').getByRole('button', { name: 'Create Product' }).click();

      // Fill in the product name in the modal
      await page.getByLabel('Product Name').fill(productName);

      // Click the submit button inside the modal
      await page
        .getByRole('button', { name: 'Create Product' })
        .filter({ hasText: 'Create Product' })
        .last()
        .click();

      // Wait for product to appear in the list (use .first() since card has multiple links with same name)
      await expect(
        page.getByRole('link', { name: productName, exact: true }).first()
      ).toBeVisible();

      // Click the menu button (three dots) on the product card
      await page.getByRole('button', { name: 'Card menu' }).first().click();

      // Click the Delete menu item
      await page.getByRole('menuitem', { name: 'Delete' }).click();

      // If there's a confirmation modal, confirm the deletion
      const confirmButton = page.getByRole('button', { name: /delete|confirm|yes/i });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Wait for the success notification that product was deleted
      await expect(page.getByText(/deleted successfully|has been deleted/i)).toBeVisible({
        timeout: 10000,
      });
    });
  });

  // Error state and recovery tests
  test.describe('Error Handling', () => {
    test('shows error message for invalid login', async ({ page }) => {
      // Navigate to the sign-in page
      await page.goto('/sign-in');

      // Fill in invalid credentials
      await page.locator('input[name=identifier]').fill(`invalid+${Date.now()}@example.com`);
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.locator('input[name=password]').fill('wrongpassword');

      // Submit the form
      await page.getByRole('button', { name: 'Continue', exact: true }).click();

      // Wait for the error message from Clerk (it shows "Password is incorrect")
      await expect(
        page.getByText(/password is incorrect|invalid credentials|couldn't find your account/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test.skip('handles network errors gracefully', async ({ page, context }) => {
      // Navigate to the dashboard first while online
      await page.goto('/dashboard');

      // Simulate offline mode
      await context.setOffline(true);

      // Try to perform an action that requires network (like creating a product)
      await page.getByRole('main').getByRole('button', { name: 'Create Product' }).click();
      await page.getByLabel('Product Name').fill('Offline Test Product');

      // Try to submit - this should fail or show an error
      const createButton = page
        .getByRole('button', { name: 'Create Product' })
        .filter({ hasText: 'Create Product' })
        .last();

      await createButton.click();

      // Wait a moment for potential error
      await page.waitForTimeout(2000);

      // Restore online mode
      await context.setOffline(false);
    });
  });
});

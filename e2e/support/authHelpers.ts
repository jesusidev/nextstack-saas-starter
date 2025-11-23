import { clerk } from '@clerk/testing/playwright';
import type { Page } from '@playwright/test';
import { getTestUser } from './clerkTestUser';

/**
 * Signs in the test user and navigates to the specified page
 * @param page - Playwright page object
 * @param navigateTo - Path to navigate to after sign-in (default: '/dashboard')
 */
export async function signInTestUser(page: Page, navigateTo: string = '/dashboard') {
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
  await page.goto(navigateTo);
  await page.waitForLoadState('load'); // Changed from 'networkidle' to 'load' for better reliability

  // Handle the user verification modal if it appears (first-time user)
  const firstNameInput = page.getByLabel('FirstName');
  const isModalVisible = await firstNameInput.isVisible({ timeout: 3000 }).catch(() => false);

  if (isModalVisible) {
    await firstNameInput.fill('Test');
    await page.getByLabel('LastName').fill('User');

    // Click submit and wait for the form to process
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for the modal overlay to disappear
    await page.locator('.mantine-Modal-overlay').waitFor({ state: 'detached', timeout: 15000 });
  }
}

import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import { signInTestUser } from './support/authHelpers';

test.describe.configure({ mode: 'serial' });

test.describe('Project Name Update', () => {
  let projectName: string;

  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
    await signInTestUser(page, '/dashboard');

    // Create a unique project name
    projectName = `Test Project ${Date.now()}`;

    // Create a new project via navigation button
    await page.getByRole('navigation').getByRole('button').click();
    await page.getByRole('textbox', { name: 'Project Name:' }).fill(projectName);
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for project to appear in sidebar
    const projectLink = page.getByRole('link', { name: projectName });
    await expect(projectLink).toBeVisible({ timeout: 10000 });

    // Wait for modal to close and sidebar to stabilize
    await page.waitForTimeout(1000);

    // Click the project link (Playwright will auto-scroll if needed)
    await projectLink.click({ timeout: 10000 }); // Wait for navigation to project page
    await page.waitForURL(/\/projects\/.*/, { timeout: 15000 });

    // Wait for page to load - check for the Add product input which is always visible
    await expect(page.getByPlaceholder('Add product to project')).toBeVisible({ timeout: 15000 });
  });

  test('should update project name successfully', async ({ page }) => {
    // Wait for and click the three-dot menu button
    const menuButton = page.getByTestId('project-menu-button');
    await expect(menuButton).toBeVisible({ timeout: 50000 });
    await menuButton.click();

    // Wait for menu to appear and click "Edit Project Name"
    const editMenuItem = page.getByText('Edit Project Name');
    await expect(editMenuItem).toBeVisible();
    await editMenuItem.click();

    // Wait for modal input to appear (the modal itself may have visibility:hidden during animation)
    const input = page.getByTestId('project-name-input');
    await expect(input).toBeVisible({ timeout: 5000 });

    // Clear and enter new name
    const newProjectName = `Updated Project ${Date.now()}`;
    await input.clear();
    await input.fill(newProjectName);

    // Click Update button
    await page.getByRole('button', { name: /update/i }).click();

    // Wait for modal input to disappear (modal closed)
    await expect(input).not.toBeVisible({ timeout: 5000 });

    // Verify the project name is updated on the page
    await expect(page.locator('h1').filter({ hasText: newProjectName })).toBeVisible({
      timeout: 5000,
    });
  });

  test('should disable submit button when name is empty', async ({ page }) => {
    // Wait for and click the three-dot menu button
    const menuButton = page.getByTestId('project-menu-button');
    await expect(menuButton).toBeVisible({ timeout: 15000 });
    await menuButton.click();

    const editMenuItem = page.getByText('Edit Project Name');
    await expect(editMenuItem).toBeVisible();
    await editMenuItem.click();

    // Wait for modal input to appear
    const input = page.getByTestId('project-name-input');
    await expect(input).toBeVisible({ timeout: 5000 });

    // Clear the input by filling with empty string
    await input.fill('');

    // Verify submit button is disabled after clearing
    const submitButton = page.getByTestId('submit-button');
    await expect(submitButton).toBeDisabled();

    // Modal should still be open (input still visible)
    await expect(input).toBeVisible();
  });

  test('should cancel edit without saving', async ({ page }) => {
    // Wait for and click the three-dot menu button
    const menuButton = page.getByTestId('project-menu-button');
    await expect(menuButton).toBeVisible({ timeout: 15000 });
    await menuButton.click();
    const editMenuItem = page.getByText('Edit Project Name');
    await expect(editMenuItem).toBeVisible();
    await editMenuItem.click();

    // Wait for modal input to appear
    const input = page.getByTestId('project-name-input');
    await expect(input).toBeVisible({ timeout: 5000 });

    // Change the name
    await input.fill('This Should Not Be Saved');

    // Click Cancel
    await page.getByTestId('cancel-button').click();

    // Modal should close (input disappears)
    await expect(input).not.toBeVisible({ timeout: 5000 });

    // Original name should still be displayed
    await expect(page.locator('h1').filter({ hasText: projectName })).toBeVisible();
  });
});

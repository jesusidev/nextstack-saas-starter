import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import { signInTestUser } from './support/authHelpers';

test.describe('Project Status Toggle', () => {
  test('should toggle project from ACTIVE to INACTIVE', async ({ page }) => {
    await setupClerkTestingToken({ page });
    await signInTestUser(page, '/dashboard');

    // Create a unique project name
    const projectName = `Test Project ${Date.now()}`;

    // Create a new project via navigation button
    await page.getByRole('navigation').getByRole('button').click();
    await page.getByRole('textbox', { name: 'Project Name:' }).fill(projectName);
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for project to appear in sidebar and click it
    const projectLink = page.getByRole('link', { name: projectName });
    await expect(projectLink).toBeVisible({ timeout: 5000 });
    await projectLink.click();

    // Wait for navigation to project page
    await page.waitForURL(/\/projects\/.*/, { timeout: 10000 });

    // Verify we're on the project page with ACTIVE badge
    await expect(page.locator('h1').filter({ hasText: projectName })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('ACTIVE', { exact: true })).toBeVisible();

    // Open the three-dot menu using data-testid
    await page.getByTestId('project-menu-button').click();

    // Verify "Deactivate Project" option is visible
    await expect(page.getByText('Deactivate Project')).toBeVisible();

    // Click to deactivate
    await page.getByText('Deactivate Project').click();

    // Verify badge changes to INACTIVE
    await expect(page.getByText('INACTIVE', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('ACTIVE', { exact: true })).not.toBeVisible();

    // Verify menu now shows "Activate Project"
    await page.getByTestId('project-menu-button').click();
    await expect(page.getByText('Activate Project')).toBeVisible();
  });
});

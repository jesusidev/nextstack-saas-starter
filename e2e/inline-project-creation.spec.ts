import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

import { signInTestUser } from './support/authHelpers';

test.describe('Inline Project Creation', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
    await signInTestUser(page, '/dashboard');

    // Verify we're authenticated by checking for dashboard elements
    await expect(page.getByRole('button', { name: /create product/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test('should create new project inline from product form', async ({ page }) => {
    // Open product creation modal
    const createButton = page.getByRole('button', { name: /create product/i });
    await createButton.click();

    // Navigate to Project tab
    const projectTab = page.getByRole('tab', { name: /project/i });
    await projectTab.click();

    // Find the Project TextInput field by test ID
    const projectInput = page.getByTestId('select-with-create-input');
    await expect(projectInput).toBeVisible({ timeout: 5000 });

    // Type new project name directly in the field (dropdown opens automatically)
    const newProjectName = `Test Project ${Date.now()}`;
    await projectInput.click(); // Focus the input
    await projectInput.fill(newProjectName);

    // Click "Create..." option from the dropdown using data-testid
    const createOption = page.getByTestId('create-new-option');
    await expect(createOption).toBeVisible({ timeout: 2000 });
    await createOption.click();

    // Wait for dropdown to close (indicates successful creation)
    await expect(createOption).not.toBeVisible({ timeout: 5000 });

    // Verify project is selected in the input field
    await expect(projectInput).toHaveValue(newProjectName);

    // Close modal
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
  });

  test('should handle duplicate project name error', async ({ page }) => {
    // Create a unique project name
    const projectName = `Duplicate Test ${Date.now()}`;

    // Open product creation modal
    const createButton = page.getByRole('button', { name: /create product/i });
    await createButton.click();

    // Navigate to Project tab
    const projectTab = page.getByRole('tab', { name: /project/i });
    await projectTab.click();

    // Find the Project TextInput field by test ID
    const projectInput = page.getByTestId('select-with-create-input');

    // Create first project using test ID
    await projectInput.click();
    await projectInput.fill(projectName);
    const createOption = page.getByTestId('create-new-option');
    await expect(createOption).toBeVisible({ timeout: 2000 });
    await createOption.click();

    // Wait for creation to complete
    await expect(projectInput).toHaveValue(projectName, { timeout: 5000 });

    // Close and reopen modal to try creating duplicate
    await page.keyboard.press('Escape');
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Reopen modal
    const createButtonAgain = page.getByRole('button', { name: /create product/i });
    await createButtonAgain.click();

    // Navigate to Project tab again
    const projectTabAgain = page.getByRole('tab', { name: /project/i });
    await projectTabAgain.click();

    // Try to create the same project - but it should already exist in the dropdown
    const projectInputAgain = page.getByTestId('select-with-create-input');
    await projectInputAgain.click();
    await projectInputAgain.fill(projectName);

    // The create option should NOT appear because project already exists
    const secondCreateOption = page.getByTestId('create-new-option');
    await expect(secondCreateOption).not.toBeVisible({ timeout: 2000 });

    // Verify the existing project appears in dropdown
    const existingOption = page.getByRole('option', { name: projectName });
    await expect(existingOption).toBeVisible({ timeout: 2000 });

    // Close modal
    await page.keyboard.press('Escape'); // Close dropdown first
    const cancelButton2 = page.getByRole('button', { name: /cancel/i });
    await cancelButton2.click();
  });

  test('should create project using Enter key', async ({ page }) => {
    // Open product creation modal
    const createButton = page.getByRole('button', { name: /create product/i });
    await createButton.click();

    // Navigate to Project tab
    const projectTab = page.getByRole('tab', { name: /project/i });
    await projectTab.click();

    // Find the Project TextInput field by placeholder
    const projectInput = page.getByTestId('select-with-create-input');

    // Type new project name directly
    const newProjectName = `Enter Key Project ${Date.now()}`;
    await projectInput.click();
    await projectInput.fill(newProjectName);

    // Navigate to "Create..." option and press Enter
    await page.keyboard.press('ArrowDown'); // Move to create option
    await page.keyboard.press('Enter'); // Select create option

    // Wait for creation to complete (verify by checking input value)
    await expect(projectInput).toHaveValue(newProjectName, { timeout: 5000 });

    // Close modal
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
  });

  test('should only show Create option when input has valid text', async ({ page }) => {
    // Open product creation modal
    const createButton = page.getByRole('button', { name: /create product/i });
    await createButton.click();

    // Navigate to Project tab
    const projectTab = page.getByRole('tab', { name: /project/i });
    await projectTab.click();

    // Find the Project TextInput field by test ID
    const projectInput = page.getByTestId('select-with-create-input');
    await projectInput.click(); // Focus to open dropdown

    // Initially no create option (empty input) - use test ID
    const createOption = page.getByTestId('create-new-option');
    await expect(createOption).not.toBeVisible();

    // Type whitespace only, create option should not appear
    await projectInput.fill('   ');
    await expect(createOption).not.toBeVisible();

    // Type valid name, create option should appear
    const validName = 'Valid Project Name';
    await projectInput.fill(validName);
    await expect(createOption).toBeVisible({ timeout: 2000 });

    // Clear input, create option should disappear
    await projectInput.clear();
    await expect(createOption).not.toBeVisible();

    // Close modal
    await page.keyboard.press('Escape'); // Close dropdown
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
  });

  test('should integrate with product creation successfully', async ({ page }) => {
    // Open product creation modal
    const createButton = page.getByRole('button', { name: /create product/i });
    await createButton.click();

    // Navigate to Project tab
    const projectTab = page.getByRole('tab', { name: /project/i });
    await projectTab.click();

    // Find the Project TextInput field and create new project inline using test ID
    const projectInput = page.getByTestId('select-with-create-input');
    const newProjectName = `Integration Test Project ${Date.now()}`;
    await projectInput.click();
    await projectInput.fill(newProjectName);

    const createOption = page.getByTestId('create-new-option');
    await expect(createOption).toBeVisible({ timeout: 2000 });
    await createOption.click();

    // Wait for creation to complete (verify by checking input value)
    await expect(projectInput).toHaveValue(newProjectName, { timeout: 5000 });

    // Navigate to Product Info tab
    const productTab = page.getByRole('tab', { name: /product info/i });
    await productTab.click();

    // Fill in product details
    await page.getByPlaceholder(/enter product name/i).fill('Integration Test Product');
    await page.getByPlaceholder(/enter brand/i).fill('Test Brand');

    // Submit the form - use .last() to get the submit button in modal, not the dashboard button
    const submitButton = page.getByRole('button', { name: /create product/i }).last();
    await submitButton.click();

    // Wait for modal to close and return to dashboard (indicates success)
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

    // Verify we're back on dashboard
    await expect(page.getByRole('button', { name: /create product/i })).toBeVisible({
      timeout: 5000,
    });
  });
});

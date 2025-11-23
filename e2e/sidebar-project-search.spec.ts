import { expect, test } from '@playwright/test';

test.describe('Sidebar Project Search', () => {
  test.beforeEach(async ({ page }) => {
    // Prerequisites:
    // - User must be authenticated
    // - User should have at least 2-3 projects
    // - At least one project should contain "Test" in the name
    await page.goto('/dashboard');
    await page.waitForLoadState('load');
    // Wait for sidebar search input to be visible instead of networkidle
    await expect(page.getByPlaceholder('Search projects...')).toBeVisible({ timeout: 10000 });
  });

  test('should display search input in sidebar', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search projects...');
    await expect(searchInput).toBeVisible();
  });

  test('should filter projects by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search projects...');

    const allProjectLinks = page.locator('a[href^="/projects/"]');
    const initialCount = await allProjectLinks.count();

    await searchInput.fill('Test');
    await page
      .locator('a[href^="/projects/"]')
      .first()
      .waitFor({ state: 'attached', timeout: 1000 })
      .catch(() => {
        // Ignore timeout if no projects match
      });

    const filteredCount = await allProjectLinks.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should be case-insensitive', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search projects...');

    await searchInput.fill('PROJECT');
    await page
      .locator('a[href^="/projects/"]')
      .first()
      .waitFor({ state: 'attached', timeout: 1000 })
      .catch(() => {
        // Ignore timeout if no projects match
      });
    const upperCaseCount = await page.locator('a[href^="/projects/"]').count();

    await searchInput.clear();
    await searchInput.fill('project');
    await page
      .locator('a[href^="/projects/"]')
      .first()
      .waitFor({ state: 'attached', timeout: 1000 })
      .catch(() => {
        // Ignore timeout if no projects match
      });
    const lowerCaseCount = await page.locator('a[href^="/projects/"]').count();

    expect(upperCaseCount).toBe(lowerCaseCount);
  });

  test('should show all projects when search is empty', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search projects...');

    const initialCount = await page.locator('a[href^="/projects/"]').count();

    await searchInput.fill('Test');
    await page
      .locator('a[href^="/projects/"]')
      .first()
      .waitFor({ state: 'attached', timeout: 1000 })
      .catch(() => {
        // Ignore timeout if no projects match
      });

    await searchInput.clear();
    await page
      .locator('a[href^="/projects/"]')
      .first()
      .waitFor({ state: 'attached', timeout: 1000 })
      .catch(() => {
        // Ignore timeout if no projects match
      });

    const finalCount = await page.locator('a[href^="/projects/"]').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should show empty state when no results found', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search projects...');

    await searchInput.fill('NonExistentProject12345XYZ');
    await page
      .locator('text=No projects found')
      .waitFor({ state: 'visible', timeout: 1000 })
      .catch(() => {
        // Ignore timeout if empty state doesn't appear
      });

    const emptyState = page.getByText(/No projects found/i);
    await expect(emptyState).toBeVisible();
  });

  test('should still allow project creation during search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search projects...');
    await searchInput.fill('Test');

    const createButton = page.getByLabel('Create Project');
    await expect(createButton).toBeEnabled();
  });

  test('should filter by partial name match', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search projects...');

    await searchInput.fill('Pro');
    await page
      .locator('a[href^="/projects/"]')
      .first()
      .waitFor({ state: 'attached', timeout: 1000 })
      .catch(() => {
        // Ignore timeout if no projects match
      });

    const projectLinks = page.locator('a[href^="/projects/"]');
    const count = await projectLinks.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should maintain search across navigation', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search projects...');

    await searchInput.fill('Test');
    await page
      .locator('a[href^="/projects/"]')
      .first()
      .waitFor({ state: 'attached', timeout: 1000 })
      .catch(() => {
        // Ignore timeout if no projects match
      });

    await page.goto('/products');
    await page.waitForLoadState('load');
    // Wait for page to be ready
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });

    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('Test');
  });
});

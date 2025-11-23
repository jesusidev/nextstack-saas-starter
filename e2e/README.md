# End-to-End Testing

This directory contains end-to-end tests for the NextStack SaaS Starter using [Playwright](https://playwright.dev/).

## Quick Start

```bash
# Run all e2e tests
npm run test:e2e

# Run tests with the Playwright UI (interactive)
npm run test:e2e:ui

# Run tests in debug mode (step through)
npm run test:e2e:debug

# Run a specific test file
npm run test:e2e -- user-flows.spec.ts

# Run a specific test by name
npm run test:e2e -- -g "user can sign in"
```

## Test Files

- **`user-flows.spec.ts`** - Authentication, product management, and error handling flows
- **`inline-project-creation.spec.ts`** - Inline project creation within product forms
- **`rage-click-prevention.spec.ts`** - Tests debouncing behavior to prevent rapid-fire API requests
- **`navigation.spec.ts`** - Basic page navigation
- **`global.setup.ts`** - Global setup for authentication and test user management

## Authentication Setup

The tests use [Clerk](https://clerk.com/) authentication with **automatic test user creation** — no manual user setup required!

### Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXX
CLERK_SECRET_KEY=sk_test_XXX
```

Get your keys from the [Clerk Dashboard](https://dashboard.clerk.com/) → **API Keys** section.

### How It Works

1. **First Run**: `global.setup.ts` creates a test user via Clerk's API
   - Email: `playwright.[random]@example.com`
   - Password: Auto-generated secure password
   - Stored in: `playwright/.clerk/test-user.json`

2. **Subsequent Runs**: Reuses the existing test user for faster execution

3. **Authentication State**: Session is saved to `playwright/.clerk/user.json` and shared across tests

4. **Test Flow**:
   ```
   global setup → create/reuse user → authenticate → save state → run tests
   ```

### Features

✅ **Automatic user provisioning** - No manual Clerk Dashboard setup  
✅ **Persistent test users** - Same user across runs  
✅ **Shared authentication** - Single sign-in for all tests  
✅ **CI/CD ready** - Works in automated environments

## Test Coverage

### User Flows (`user-flows.spec.ts`)

**Authentication**
- ✅ User can sign in (manual form)
- ✅ User can sign in (Clerk helper)
- ✅ User can sign up

**Product Management**
- User can create a product
- User can delete a product

**Error Handling**
- Shows error message for invalid login
- Handles network errors gracefully

### Inline Project Creation (`inline-project-creation.spec.ts`)

Tests the ability to create projects directly within the product creation form:

- **Core Functionality**: Add button, keyboard support, form integration
- **Validation**: Duplicate names, empty inputs, error messages
- **UX**: Loading states, modal management, accessibility
- **Error Recovery**: Input preservation, retry workflows

### Rage-Click Prevention (`rage-click-prevention.spec.ts`)

Tests the debouncing behavior of favorite buttons to prevent rapid-fire API requests:

- **Card View**: 
  - Button disables during processing to prevent rage clicks
  - Multiple rapid clicks are blocked while debouncing
- **Table View**: 
  - Favorite button in table rows disables during processing
- **Product Detail Page**: 
  - Favorite button on detail page disables during processing

**Key Features Tested:**
- Button disabled state during 500ms debounce window
- Accessibility attributes (`aria-label`, `data-testid`)
- Consistent behavior across card view, table view, and detail pages
- Serial test execution to prevent race conditions

## Debugging

Playwright provides several debugging tools:

- **Screenshots**: Automatically captured on test failure
- **Traces**: Recorded on first retry for analysis (see Trace Viewer below)
- **UI Mode**: Interactive test runner with time-travel debugging
  ```bash
  npm run test:e2e:ui
  ```
- **Debug Mode**: Step through tests with debugger
  ```bash
  npm run test:e2e:debug
  ```
- **HTML Report**: View detailed test results
  ```bash
  npx playwright show-report
  ```

### Trace Viewer

The [Trace Viewer](https://playwright.dev/docs/trace-viewer) is a powerful debugging tool that records a complete trace of test execution, allowing you to step through each action with full context.

**When Traces are Recorded:**
- Automatically captured on the first retry of failed tests (configured in `playwright.config.ts`)
- Can be manually enabled by setting `trace: 'on'` or `trace: 'retain-on-failure'`

**Viewing Traces:**
```bash
# View trace from HTML report (after a test failure)
npx playwright show-report

# Or view a specific trace file directly
npx playwright show-trace test-results/*/trace.zip
```

**Best Practices:**

- **Local Development**: Use `trace: 'retain-on-failure'` or UI Mode for faster feedback
- **CI/CD**: Keep `trace: 'on-first-retry'` (current setting) to balance debugging needs with storage
- **Always Record Mode**: Only use `trace: 'on'` when actively debugging a specific issue
- **Clean Up**: Periodically delete old `test-results/` directories to free up space
- **Combine with UI Mode**: Use UI Mode for live debugging, Trace Viewer for post-mortem analysis

**Current Configuration:**
```typescript
// playwright.config.ts
use: {
  trace: 'on-first-retry',  // Only records on first retry attempt
  screenshot: 'only-on-failure',
}
```

**Alternative Trace Settings:**
```typescript
trace: 'on'                    // Always record (high overhead)
trace: 'off'                   // Never record
trace: 'on-first-retry'        // Record on first retry (recommended for CI)
trace: 'retain-on-failure'     // Record all runs, keep only failures
```

## Writing Tests

### Best Practices

1. **Use descriptive test names** - Clearly indicate what's being tested
2. **Group related tests** - Use `test.describe()` blocks
3. **Share setup logic** - Use `beforeEach` for common setup
4. **Use reliable selectors** - Prefer role-based selectors over CSS/XPath
5. **Wait appropriately** - Use `waitForURL()` and `waitForSelector()` instead of `networkidle`
6. **Test user workflows** - Focus on complete end-to-end scenarios
7. **Use serial mode when needed** - Use `test.describe.configure({ mode: 'serial' })` for tests that create shared state in `beforeEach`
8. **Add accessibility attributes** - Use `aria-label` and `data-testid` on interactive elements for reliable testing

### Helper Functions

The `e2e/support/` directory contains reusable helper functions:

**`authHelpers.ts`** - Authentication utilities
- `setupClerkTestingToken({ page })` - Sets up Clerk testing token for authentication
- `signInTestUser(page, navigateTo)` - Sign in and navigate to a page
  ```typescript
  import { setupClerkTestingToken, signInTestUser } from './support/authHelpers';
  
  test.beforeEach(async ({ page }) => {
    // Modern authentication pattern
    await setupClerkTestingToken({ page });
    await signInTestUser(page, '/dashboard');
  });
  ```

**`clerkTestUser.ts`** - Test user management
- `getTestUser()` - Get test user credentials
  ```typescript
  import { getTestUser } from './support/clerkTestUser';
  
  const { email, password } = getTestUser();
  ```

### Example Test Structure

#### Basic Test Pattern
```typescript
import { signInTestUser } from './support/authHelpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in and navigate to page
    await signInTestUser(page, '/dashboard');
    
    // Additional setup if needed
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should perform action', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: 'Action' }).click();
    
    // Act
    await page.getByLabel('Input').fill('value');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

#### Serial Mode Pattern (for shared state)
```typescript
import { setupClerkTestingToken, signInTestUser } from './support/authHelpers';

test.describe('Feature with Shared State', () => {
  // Use serial mode when tests share data created in beforeEach
  test.describe.configure({ mode: 'serial' });

  let sharedData: string;

  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
    await signInTestUser(page, '/dashboard');
    
    // Create shared test data
    sharedData = `Test Item ${Date.now()}`;
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByLabel('Name').fill(sharedData);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(sharedData)).toBeVisible();
  });

  test('first test using shared data', async ({ page }) => {
    const item = page.getByTestId('item').first();
    await expect(item).toBeVisible();
  });

  test('second test using shared data', async ({ page }) => {
    const item = page.getByTestId('item').first();
    await item.click();
    await expect(page.getByRole('heading', { name: sharedData })).toBeVisible();
  });
});
```

## Configuration

Test configuration is in `playwright.config.ts` at the project root:

- **Base URL**: `http://localhost:3001` (configurable via `PLAYWRIGHT_BASE_URL`)
- **Browsers**: Chromium, Firefox, WebKit
- **Timeouts**: 30s per test, 5s per assertion
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 1 on CI, parallel locally

## CI/CD

Tests are designed for CI/CD pipelines. Required environment variables:
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

The test suite will automatically create and manage test users in CI environments.
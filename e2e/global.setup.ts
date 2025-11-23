import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createClerkClient } from '@clerk/backend';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';

const TEST_USER_PATH = path.resolve(__dirname, '../playwright/.clerk/test-user.json');
const AUTH_STATE_PATH = path.join(__dirname, '../playwright/.clerk/user.json');

type StoredTestUser = {
  email: string;
  password: string;
  userId: string;
};

type ClerkUsersApi = {
  createUser: (params: Record<string, unknown>) => Promise<{ id: string }>;
};

// Ensures that Clerk setup is done before any tests run
setup.describe.configure({
  mode: 'serial',
});

const ensureDirectory = async (filePath: string) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
};

const writeTestUserFile = async (data: StoredTestUser) => {
  await ensureDirectory(TEST_USER_PATH);
  await fs.writeFile(TEST_USER_PATH, JSON.stringify(data, null, 2), 'utf8');
};

const readTestUserFile = async (): Promise<StoredTestUser | null> => {
  try {
    const raw = await fs.readFile(TEST_USER_PATH, 'utf8');
    return JSON.parse(raw) as StoredTestUser;
  } catch {
    return null;
  }
};

const generatePassword = () => `Pw!${randomBytes(9).toString('hex')}`;
const generateEmail = () => `playwright.${randomBytes(6).toString('hex')}@example.com`;

setup('global setup', async () => {
  await clerkSetup();

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY must be set for Playwright tests.');
  }

  // Check if we already have a test user
  let testUser = await readTestUserFile();

  // If no test user exists, create one
  if (!testUser) {
    const clerkClient = createClerkClient({ secretKey });
    const emailAddress = generateEmail();
    const password = generatePassword();

    const usersApi = clerkClient.users as ClerkUsersApi | undefined;
    if (!usersApi) {
      throw new Error('Failed to access Clerk users API.');
    }

    try {
      const createdUser = await usersApi.createUser({
        emailAddress: [emailAddress],
        password,
        skipEmailAddressVerification: true,
      });

      testUser = { email: emailAddress, password, userId: createdUser.id };
      await writeTestUserFile(testUser);
      console.log(`✓ Created test user: ${emailAddress}`);
    } catch (error) {
      throw new Error(`Failed to provision Clerk test user: ${String(error)}`);
    }
  } else {
    console.log(`✓ Using existing test user: ${testUser.email}`);
  }
});

setup('authenticate', async ({ page }) => {
  const testUser = await readTestUserFile();
  if (!testUser) {
    throw new Error('Test user not found. Global setup should have created one.');
  }

  await page.goto('/');

  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: testUser.email,
      password: testUser.password,
    },
  });

  // Navigate to dashboard and wait for it to be ready
  await page.goto('/dashboard');
  await page.waitForLoadState('domcontentloaded');

  // Handle the user verification modal if it appears (first-time user)
  const firstNameInput = page.getByLabel('FirstName');
  const isModalVisible = await firstNameInput.isVisible({ timeout: 3000 }).catch(() => false);

  if (isModalVisible) {
    console.log('✓ User verification modal detected, filling it out...');
    const randomFirstName = `Test${randomBytes(3).toString('hex')}`;
    await firstNameInput.fill(randomFirstName);
    await page.getByLabel('LastName').fill('User');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for the modal to close
    await page
      .locator('.mantine-Modal-overlay')
      .waitFor({ state: 'detached', timeout: 15000 })
      .catch(() => {
        console.log('⚠ Modal did not close as expected');
      });
  }

  // Wait for main content to be visible by looking
  // for class name mantine-AppShell-main
  await page.locator('.mantine-AppShell-main').waitFor({ state: 'visible', timeout: 10000 });

  // Save signed-in state to be reused in tests
  await page.context().storageState({ path: AUTH_STATE_PATH });
  console.log(`✓ Authenticated as: ${testUser.email}`);
});

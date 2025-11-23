import { readFileSync } from 'node:fs';
import path from 'node:path';

type TestUser = {
  email: string;
  password: string;
  userId: string;
};

const TEST_USER_PATH = path.resolve(__dirname, '../../playwright/.clerk/test-user.json');

let cachedUser: TestUser | null = null;

export const getTestUser = (): TestUser => {
  if (cachedUser) {
    return cachedUser;
  }

  try {
    const raw = readFileSync(TEST_USER_PATH, 'utf8');
    cachedUser = JSON.parse(raw) as TestUser;
    return cachedUser;
  } catch (error) {
    throw new Error(
      `Unable to load Clerk test user credentials at ${TEST_USER_PATH}: ${String(error)}`
    );
  }
};

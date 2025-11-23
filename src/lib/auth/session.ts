import { auth } from '@clerk/nextjs/server';
import { UnauthorizedError } from '~/types/api';

export async function getSessionUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function requireAuth(): Promise<string> {
  const userId = await getSessionUserId();

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return userId;
}

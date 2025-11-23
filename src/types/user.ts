import { z } from 'zod';
import type { RouterOutputs } from '~/utils/trpc';

type userOutput = RouterOutputs['user']['get'];

export type User = userOutput;
export const userInput = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

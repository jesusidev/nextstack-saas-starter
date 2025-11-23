import { z } from 'zod';
import type { RouterOutputs } from '~/utils/trpc';

type ProjectsOutput = RouterOutputs['project']['projects'];

// Handle the union type from consolidated endpoint
export type Project = ProjectsOutput extends Array<infer T>
  ? T
  : ProjectsOutput extends { name: string; id: string }
    ? ProjectsOutput
    : never;
export const projectInput = z.object({ name: z.string() });

export const updateProjectInput = z.object({
  id: z.string(),
  name: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectInput>;

// Consolidated query input - can get single project by ID or list
export const projectQueryInput = z
  .object({
    // Single project query
    id: z.string().optional(),
  })
  .optional();

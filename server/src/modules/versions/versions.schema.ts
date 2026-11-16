import { z } from 'zod';

export const createVersionSchema = z.object({
  name: z.string().trim().min(1, 'Snapshot name cannot be empty').max(100),
  description: z.string().max(500).optional(),
});

export type CreateVersionInput = z.infer<typeof createVersionSchema>;

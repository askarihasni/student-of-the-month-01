import { z } from 'zod';

export const createExportSchema = z.object({
  format: z.enum(['svg', 'pdf', 'json', 'png']).default('svg'),
  pageId: z.string().optional(),
  nodeIds: z.array(z.string()).optional(),
  scale: z.number().min(0.1).max(4).optional().default(1),
});

export type CreateExportInput = z.infer<typeof createExportSchema>;


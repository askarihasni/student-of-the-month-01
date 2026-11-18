import { z } from 'zod';

export const generateDesignSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt cannot be empty').max(2000, 'Prompt is too long'),
  targetPosition: z
    .object({
      x: z.number().optional().nullable(),
      y: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
  documentId: z.string().optional().nullable(),
  pageId: z.string().optional().nullable(),
  existingBounds: z
    .object({
      minX: z.number().optional(),
      minY: z.number().optional(),
      maxX: z.number().optional(),
      maxY: z.number().optional(),
    })
    .optional()
    .nullable(),
});

export type GenerateDesignInput = z.infer<typeof generateDesignSchema>;

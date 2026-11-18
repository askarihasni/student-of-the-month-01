import { z } from 'zod';

export const generateDesignSchema = z.object({
  prompt: z.string().min(2, 'Prompt must be at least 2 characters long').max(1000, 'Prompt is too long'),
  targetPosition: z.object({
    x: z.number().default(100),
    y: z.number().default(100),
  }).optional(),
  documentId: z.string().optional(),
  pageId: z.string().optional(),
  existingBounds: z.object({
    minX: z.number(),
    minY: z.number(),
    maxX: z.number(),
    maxY: z.number(),
  }).optional(),
});

export type GenerateDesignInput = z.infer<typeof generateDesignSchema>;


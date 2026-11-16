import { z } from 'zod';
import { documentSchema } from '../../shared/schemas/document.schema.js';

export const createDocumentSchema = z.object({
  name: z.string().trim().min(1, 'Document name cannot be empty').max(200).default('Untitled Design'),
  template: z.enum(['blank', 'mobile-app', 'design-system', 'brand-styleguide']).optional().default('blank'),
});

export const updateDocumentSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  isPublic: z.boolean().optional(),
});

export const syncDocumentSchema = z.object({
  expectedVersion: z.number().int().min(1, 'Expected version must be at least 1'),
  data: documentSchema,
  thumbnailUrl: z.string().optional().nullable(),
  nodeCount: z.number().int().optional(),
});

export const listDocumentsQuerySchema = z.object({
  filter: z.enum(['recent', 'drafts', 'shared', 'design-system', 'mobile-app']).optional().default('recent'),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['updatedAt', 'createdAt', 'name']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type SyncDocumentInput = z.infer<typeof syncDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

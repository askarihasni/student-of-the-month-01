import { z } from 'zod';

export const createCommentSchema = z.object({
  pageId: z.string().min(1, 'Page ID is required'),
  x: z.number(),
  y: z.number(),
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
});

export const replyCommentSchema = z.object({
  content: z.string().trim().min(1, 'Reply cannot be empty').max(2000),
});

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000).optional(),
  resolved: z.boolean().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ReplyCommentInput = z.infer<typeof replyCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

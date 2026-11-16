import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
});

export const searchUsersQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query cannot be empty'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

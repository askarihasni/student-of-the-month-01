import { z } from 'zod';
import { Role } from '@prisma/client';

export const inviteCollaboratorSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
  role: z.enum([Role.EDITOR, Role.VIEWER]).default(Role.VIEWER),
});

export const updatePermissionSchema = z.object({
  role: z.enum([Role.EDITOR, Role.VIEWER]),
});

export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;

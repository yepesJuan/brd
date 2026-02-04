import { z } from 'zod';

export const roleEnum = z.enum(['BUSINESS', 'PRODUCT', 'TECH']);
export const statusEnum = z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED']);

export const createRequirementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  filePath: z.string(),
  fileName: z.string(),
  epicLink: z.string().url().optional().or(z.literal('')),
});

export const signOffSchema = z.object({
  requirementId: z.string().uuid(),
  comment: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: roleEnum,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

import { z } from 'zod';

/**
 * Section interface - Groups related questions
 */
export interface Section {
  id: string;
  assessmentId: string;
  title: string;
  description?: string;
  order: number;
  maxScore: number;
}

/**
 * Zod validation schema for Section
 */
export const SectionSchema = z.object({
  id: z.string().uuid(),
  assessmentId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().min(0),
  maxScore: z.number().min(0)
});

/**
 * Schema for creating a new Section
 */
export const CreateSectionSchema = z.object({
  assessmentId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().min(0),
  maxScore: z.number().min(0)
});

export type CreateSectionInput = z.infer<typeof CreateSectionSchema>;

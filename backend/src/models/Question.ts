import { z } from 'zod';

/**
 * Question type enum
 */
export enum QuestionType {
  NUMERIC_SCALE = 'NUMERIC_SCALE',
  CHECKBOX = 'CHECKBOX',
  TEXT = 'TEXT',
  CONDITIONAL = 'CONDITIONAL'
}

/**
 * Question interface - Individual assessment item
 */
export interface Question {
  id: string;
  sectionId: string;
  type: QuestionType;
  text: string;
  description?: string;
  weight: number;
  required: boolean;
  order: number;
  // For NUMERIC_SCALE questions
  minValue?: number;
  maxValue?: number;
  // For conditional logic
  showIfQuestionId?: string;
  showIfValue?: string | number | boolean;
}

/**
 * Zod validation schema for Question
 */
export const QuestionSchema = z.object({
  id: z.string().uuid(),
  sectionId: z.string().uuid(),
  type: z.nativeEnum(QuestionType),
  text: z.string().min(1),
  description: z.string().optional(),
  weight: z.number().min(0),
  required: z.boolean(),
  order: z.number().int().min(0),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  showIfQuestionId: z.string().uuid().optional(),
  showIfValue: z.union([z.string(), z.number(), z.boolean()]).optional()
});

/**
 * Schema for creating a new Question
 */
export const CreateQuestionSchema = z.object({
  sectionId: z.string().uuid(),
  type: z.nativeEnum(QuestionType),
  text: z.string().min(1),
  description: z.string().optional(),
  weight: z.number().min(0),
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  showIfQuestionId: z.string().uuid().optional(),
  showIfValue: z.union([z.string(), z.number(), z.boolean()]).optional()
});

export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;

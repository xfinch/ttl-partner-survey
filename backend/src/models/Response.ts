import { z } from 'zod';

/**
 * Response value type - can be number, boolean, or string
 */
export type ResponseValue = number | boolean | string;

/**
 * Response interface - User answers to questions
 */
export interface Response {
  id: string;
  questionId: string;
  assessmentId: string;
  value: ResponseValue;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Zod validation schema for Response
 */
export const ResponseSchema = z.object({
  id: z.string().uuid(),
  questionId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  value: z.union([z.number(), z.boolean(), z.string()]),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

/**
 * Schema for creating a new Response
 */
export const CreateResponseSchema = z.object({
  questionId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  value: z.union([z.number(), z.boolean(), z.string()])
});

export type CreateResponseInput = z.infer<typeof CreateResponseSchema>;

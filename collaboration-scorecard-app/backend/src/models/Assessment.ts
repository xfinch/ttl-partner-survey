import { z } from 'zod';

/**
 * Assessment status enum
 */
export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Collaboration type enum
 */
export enum CollaborationType {
  AFFILIATE = 'AFFILIATE',
  REVENUE_SHARE = 'REVENUE_SHARE',
  PERFORMANCE_BASED = 'PERFORMANCE_BASED',
  JOINT_VENTURE = 'JOINT_VENTURE'
}

/**
 * Assessment interface - Parent container for a full evaluation
 */
export interface Assessment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: AssessmentStatus;
  respondentEmail: string;
  respondentName?: string;
  collaborationType: CollaborationType;
  companyName?: string;
  notes?: string;
}

/**
 * Zod validation schema for Assessment
 */
export const AssessmentSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.nativeEnum(AssessmentStatus),
  respondentEmail: z.string().email(),
  respondentName: z.string().optional(),
  collaborationType: z.nativeEnum(CollaborationType),
  companyName: z.string().optional(),
  notes: z.string().optional()
});

/**
 * Schema for creating a new Assessment
 */
export const CreateAssessmentSchema = z.object({
  respondentEmail: z.string().email(),
  respondentName: z.string().optional(),
  collaborationType: z.nativeEnum(CollaborationType),
  companyName: z.string().optional()
});

export type CreateAssessmentInput = z.infer<typeof CreateAssessmentSchema>;

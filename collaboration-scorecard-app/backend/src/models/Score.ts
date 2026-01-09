import { z } from 'zod';

/**
 * Section score breakdown
 */
export interface SectionScore {
  sectionId: string;
  sectionTitle: string;
  earnedScore: number;
  maxScore: number;
  percentage: number;
}

/**
 * Score interface - Calculated results for an assessment
 */
export interface Score {
  id: string;
  assessmentId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  sectionScores: SectionScore[];
  calculatedAt: Date;
}

/**
 * Zod validation schema for SectionScore
 */
export const SectionScoreSchema = z.object({
  sectionId: z.string().uuid(),
  sectionTitle: z.string(),
  earnedScore: z.number().min(0),
  maxScore: z.number().min(0),
  percentage: z.number().min(0).max(100)
});

/**
 * Zod validation schema for Score
 */
export const ScoreSchema = z.object({
  id: z.string().uuid(),
  assessmentId: z.string().uuid(),
  totalScore: z.number().min(0),
  maxScore: z.number().min(0),
  percentage: z.number().min(0).max(100),
  sectionScores: z.array(SectionScoreSchema),
  calculatedAt: z.date()
});

export type SectionScoreInput = z.infer<typeof SectionScoreSchema>;

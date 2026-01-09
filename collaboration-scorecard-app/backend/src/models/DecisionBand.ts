import { z } from 'zod';

/**
 * Decision band enum - Final recommendation categories
 */
export enum Decision {
  PROCEED = 'PROCEED',
  PROCEED_WITH_SAFEGUARDS = 'PROCEED_WITH_SAFEGUARDS',
  PAUSE = 'PAUSE'
}

/**
 * Decision band thresholds (out of 70 points max)
 */
export const DECISION_THRESHOLDS = {
  PROCEED_MIN: 55,        // 55-70 → PROCEED
  SAFEGUARDS_MIN: 45,     // 45-54 → PROCEED_WITH_SAFEGUARDS
  // < 45 → PAUSE
} as const;

/**
 * Max score constant
 */
export const MAX_SCORE = 70;

/**
 * DecisionBand interface - Final recommendation output
 */
export interface DecisionBand {
  id: string;
  assessmentId: string;
  scoreId: string;
  decision: Decision;
  explanation: string;
  riskFlags: string[];
  createdAt: Date;
}

/**
 * Zod validation schema for DecisionBand
 */
export const DecisionBandSchema = z.object({
  id: z.string().uuid(),
  assessmentId: z.string().uuid(),
  scoreId: z.string().uuid(),
  decision: z.nativeEnum(Decision),
  explanation: z.string(),
  riskFlags: z.array(z.string()),
  createdAt: z.date()
});

/**
 * Get explanation text for each decision band
 */
export function getDecisionExplanation(decision: Decision): string {
  switch (decision) {
    case Decision.PROCEED:
      return 'Strong alignment indicators. Recommended to proceed with collaboration.';
    case Decision.PROCEED_WITH_SAFEGUARDS:
      return 'Moderate alignment with some concerns. Consider proceeding with additional safeguards and monitoring.';
    case Decision.PAUSE:
      return 'Significant concerns identified. Recommend pausing to address issues before proceeding.';
  }
}

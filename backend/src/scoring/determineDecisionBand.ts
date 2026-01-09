import { Score } from '../models/Score';
import {
  Decision,
  DecisionBand,
  DECISION_THRESHOLDS,
  getDecisionExplanation
} from '../models/DecisionBand';
import { v4 as uuidv4 } from 'uuid';

/**
 * Determine the decision based on score thresholds
 *
 * Decision bands:
 * - 55-70: PROCEED
 * - 45-54: PROCEED_WITH_SAFEGUARDS
 * - <45: PAUSE
 */
export function determineDecision(totalScore: number): Decision {
  if (totalScore >= DECISION_THRESHOLDS.PROCEED_MIN) {
    return Decision.PROCEED;
  }
  if (totalScore >= DECISION_THRESHOLDS.SAFEGUARDS_MIN) {
    return Decision.PROCEED_WITH_SAFEGUARDS;
  }
  return Decision.PAUSE;
}

/**
 * Create a DecisionBand result from a Score
 *
 * @param score - The calculated score
 * @param riskFlags - Array of risk flags detected
 * @returns DecisionBand object with recommendation
 */
export function determineDecisionBand(
  score: Score,
  riskFlags: string[] = []
): DecisionBand {
  let decision = determineDecision(score.totalScore);

  // If there are critical risk flags, downgrade the decision
  const hasCriticalRisk = riskFlags.some(flag =>
    flag.toLowerCase().includes('critical') ||
    flag.toLowerCase().includes('non-negotiable')
  );

  if (hasCriticalRisk && decision === Decision.PROCEED) {
    decision = Decision.PROCEED_WITH_SAFEGUARDS;
  }

  const explanation = getDecisionExplanation(decision);

  return {
    id: uuidv4(),
    assessmentId: score.assessmentId,
    scoreId: score.id,
    decision,
    explanation,
    riskFlags,
    createdAt: new Date()
  };
}

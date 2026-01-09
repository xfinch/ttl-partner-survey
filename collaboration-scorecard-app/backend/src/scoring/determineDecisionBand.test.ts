import { determineDecision, determineDecisionBand } from './determineDecisionBand';
import { Decision, DECISION_THRESHOLDS } from '../models/DecisionBand';
import { Score } from '../models/Score';

describe('determineDecision', () => {
  it('should return PROCEED for scores >= 55', () => {
    expect(determineDecision(55)).toBe(Decision.PROCEED);
    expect(determineDecision(60)).toBe(Decision.PROCEED);
    expect(determineDecision(70)).toBe(Decision.PROCEED);
  });

  it('should return PROCEED_WITH_SAFEGUARDS for scores 45-54', () => {
    expect(determineDecision(45)).toBe(Decision.PROCEED_WITH_SAFEGUARDS);
    expect(determineDecision(50)).toBe(Decision.PROCEED_WITH_SAFEGUARDS);
    expect(determineDecision(54)).toBe(Decision.PROCEED_WITH_SAFEGUARDS);
  });

  it('should return PAUSE for scores < 45', () => {
    expect(determineDecision(0)).toBe(Decision.PAUSE);
    expect(determineDecision(30)).toBe(Decision.PAUSE);
    expect(determineDecision(44)).toBe(Decision.PAUSE);
  });

  it('should handle boundary cases correctly', () => {
    expect(determineDecision(DECISION_THRESHOLDS.PROCEED_MIN)).toBe(Decision.PROCEED);
    expect(determineDecision(DECISION_THRESHOLDS.PROCEED_MIN - 1)).toBe(Decision.PROCEED_WITH_SAFEGUARDS);
    expect(determineDecision(DECISION_THRESHOLDS.SAFEGUARDS_MIN)).toBe(Decision.PROCEED_WITH_SAFEGUARDS);
    expect(determineDecision(DECISION_THRESHOLDS.SAFEGUARDS_MIN - 1)).toBe(Decision.PAUSE);
  });
});

describe('determineDecisionBand', () => {
  const createMockScore = (totalScore: number): Score => ({
    id: 'score-1',
    assessmentId: 'assessment-1',
    totalScore,
    maxScore: 70,
    percentage: (totalScore / 70) * 100,
    sectionScores: [],
    calculatedAt: new Date()
  });

  it('should create DecisionBand with correct decision', () => {
    const score = createMockScore(60);
    const band = determineDecisionBand(score);

    expect(band.decision).toBe(Decision.PROCEED);
    expect(band.assessmentId).toBe('assessment-1');
    expect(band.scoreId).toBe('score-1');
    expect(band.riskFlags).toEqual([]);
  });

  it('should include risk flags in result', () => {
    const score = createMockScore(60);
    const riskFlags = ['Warning: Some concern'];
    const band = determineDecisionBand(score, riskFlags);

    expect(band.riskFlags).toEqual(riskFlags);
    expect(band.decision).toBe(Decision.PROCEED);
  });

  it('should downgrade PROCEED to SAFEGUARDS when critical risk flags exist', () => {
    const score = createMockScore(60);
    const riskFlags = ['Critical: Financial concerns identified'];
    const band = determineDecisionBand(score, riskFlags);

    expect(band.decision).toBe(Decision.PROCEED_WITH_SAFEGUARDS);
  });

  it('should downgrade PROCEED for non-negotiable risk flags', () => {
    const score = createMockScore(65);
    const riskFlags = ['Non-negotiable: Compliance agreement not accepted'];
    const band = determineDecisionBand(score, riskFlags);

    expect(band.decision).toBe(Decision.PROCEED_WITH_SAFEGUARDS);
  });

  it('should have explanation for each decision', () => {
    const proceedBand = determineDecisionBand(createMockScore(60));
    expect(proceedBand.explanation).toContain('Strong alignment');

    const safeguardsBand = determineDecisionBand(createMockScore(50));
    expect(safeguardsBand.explanation).toContain('safeguards');

    const pauseBand = determineDecisionBand(createMockScore(30));
    expect(pauseBand.explanation).toContain('pausing');
  });
});

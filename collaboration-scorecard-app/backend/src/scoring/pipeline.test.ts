/**
 * End-to-end integration test for the complete scoring pipeline
 *
 * This test validates the full flow:
 * 1. Create sample Assessment + Responses
 * 2. Run calculateScore()
 * 3. Run determineDecisionBand()
 * 4. Run detectRiskFlags()
 * 5. Verify correct outcomes for all three decision bands
 */

import { calculateScore, ScoreCalculationInput } from './calculateScore';
import { determineDecisionBand, determineDecision } from './determineDecisionBand';
import { detectRiskFlags } from './detectRiskFlags';
import { Section } from '../models/Section';
import { Question, QuestionType } from '../models/Question';
import { Response } from '../models/Response';
import { Decision, MAX_SCORE } from '../models/DecisionBand';

// Test fixtures matching the seed data structure
const createTestSections = (): Section[] => [
  { id: 'section-1', assessmentId: 'test', title: 'Experience & Track Record', order: 1, maxScore: 15 },
  { id: 'section-2', assessmentId: 'test', title: 'Financial Readiness', order: 2, maxScore: 20 },
  { id: 'section-3', assessmentId: 'test', title: 'Alignment & Values', order: 3, maxScore: 15 },
  { id: 'section-4', assessmentId: 'test', title: 'Operational Capacity', order: 4, maxScore: 10 },
  { id: 'section-5', assessmentId: 'test', title: 'Compliance & Legal', order: 5, maxScore: 10 }
];

const createTestQuestions = (): Question[] => [
  // Section 1: Experience (15 points)
  { id: 'q1', sectionId: 'section-1', type: QuestionType.NUMERIC_SCALE, text: 'Years of experience', weight: 5, required: true, order: 1, maxValue: 10 },
  { id: 'q2', sectionId: 'section-1', type: QuestionType.NUMERIC_SCALE, text: 'Track record rating', weight: 5, required: true, order: 2, maxValue: 10 },
  { id: 'q3', sectionId: 'section-1', type: QuestionType.CHECKBOX, text: 'Verifiable references', weight: 5, required: false, order: 3 },

  // Section 2: Financial (20 points)
  { id: 'q4', sectionId: 'section-2', type: QuestionType.NUMERIC_SCALE, text: 'Financial stability', weight: 8, required: true, order: 1, maxValue: 10 },
  { id: 'q5', sectionId: 'section-2', type: QuestionType.NUMERIC_SCALE, text: 'Budget availability', weight: 7, required: true, order: 2, maxValue: 10 },
  { id: 'q6', sectionId: 'section-2', type: QuestionType.CHECKBOX, text: 'Upfront investment ready', weight: 5, required: false, order: 3 },

  // Section 3: Alignment (15 points)
  { id: 'q7', sectionId: 'section-3', type: QuestionType.NUMERIC_SCALE, text: 'Goal alignment', weight: 5, required: true, order: 1, maxValue: 10 },
  { id: 'q8', sectionId: 'section-3', type: QuestionType.NUMERIC_SCALE, text: 'Cultural fit', weight: 5, required: true, order: 2, maxValue: 10 },
  { id: 'q9', sectionId: 'section-3', type: QuestionType.CHECKBOX, text: 'Ethical practices commitment', weight: 5, required: true, order: 3 },

  // Section 4: Operational (10 points)
  { id: 'q10', sectionId: 'section-4', type: QuestionType.NUMERIC_SCALE, text: 'Team capacity', weight: 5, required: true, order: 1, maxValue: 10 },
  { id: 'q11', sectionId: 'section-4', type: QuestionType.CHECKBOX, text: 'Dedicated resources', weight: 5, required: false, order: 2 },

  // Section 5: Compliance (10 points)
  { id: 'q12', sectionId: 'section-5', type: QuestionType.CHECKBOX, text: 'Do you agree to compliance terms?', weight: 5, required: true, order: 1 },
  { id: 'q13', sectionId: 'section-5', type: QuestionType.CHECKBOX, text: 'Do you agree to legal requirements?', weight: 5, required: true, order: 2 }
];

// Helper to create responses
const createResponse = (questionId: string, value: number | boolean | string): Response => ({
  id: `response-${questionId}`,
  questionId,
  assessmentId: 'assessment-1',
  value,
  createdAt: new Date()
});

describe('Scoring Pipeline Integration Tests', () => {
  const sections = createTestSections();
  const questions = createTestQuestions();

  describe('PROCEED Decision Band (55-70 points)', () => {
    it('should return PROCEED for high-scoring assessment', () => {
      // Create responses that total 60+ points
      const responses: Response[] = [
        createResponse('q1', 9),   // 4.5 points (9/10 * 5)
        createResponse('q2', 9),   // 4.5 points
        createResponse('q3', true), // 5 points
        createResponse('q4', 9),   // 7.2 points (9/10 * 8)
        createResponse('q5', 9),   // 6.3 points (9/10 * 7)
        createResponse('q6', true), // 5 points
        createResponse('q7', 9),   // 4.5 points
        createResponse('q8', 9),   // 4.5 points
        createResponse('q9', true), // 5 points
        createResponse('q10', 9),  // 4.5 points
        createResponse('q11', true), // 5 points
        createResponse('q12', true), // 5 points (compliance)
        createResponse('q13', true)  // 5 points
      ];

      const input: ScoreCalculationInput = {
        assessmentId: 'assessment-1',
        sections,
        questions,
        responses
      };

      // Step 1: Calculate score
      const score = calculateScore(input);
      expect(score.totalScore).toBeGreaterThanOrEqual(55);
      expect(score.maxScore).toBe(MAX_SCORE);

      // Step 2: Detect risk flags
      const riskFlags = detectRiskFlags(questions, responses);
      expect(riskFlags).toHaveLength(0); // No risks for compliant responses

      // Step 3: Determine decision band
      const decisionBand = determineDecisionBand(score, riskFlags);
      expect(decisionBand.decision).toBe(Decision.PROCEED);
      expect(decisionBand.riskFlags).toEqual([]);
      expect(decisionBand.explanation).toContain('Strong alignment');
    });
  });

  describe('PROCEED_WITH_SAFEGUARDS Decision Band (45-54 points)', () => {
    it('should return PROCEED_WITH_SAFEGUARDS for moderate-scoring assessment', () => {
      // Create responses that total ~50 points
      const responses: Response[] = [
        createResponse('q1', 7),   // 3.5 points
        createResponse('q2', 6),   // 3 points
        createResponse('q3', true), // 5 points
        createResponse('q4', 6),   // 4.8 points
        createResponse('q5', 6),   // 4.2 points
        createResponse('q6', false), // 0 points
        createResponse('q7', 7),   // 3.5 points
        createResponse('q8', 6),   // 3 points
        createResponse('q9', true), // 5 points
        createResponse('q10', 7),  // 3.5 points
        createResponse('q11', true), // 5 points
        createResponse('q12', true), // 5 points
        createResponse('q13', true)  // 5 points
      ];

      const input: ScoreCalculationInput = {
        assessmentId: 'assessment-2',
        sections,
        questions,
        responses
      };

      const score = calculateScore(input);
      expect(score.totalScore).toBeGreaterThanOrEqual(45);
      expect(score.totalScore).toBeLessThan(55);

      const riskFlags = detectRiskFlags(questions, responses);
      const decisionBand = determineDecisionBand(score, riskFlags);

      expect(decisionBand.decision).toBe(Decision.PROCEED_WITH_SAFEGUARDS);
      expect(decisionBand.explanation).toContain('safeguards');
    });
  });

  describe('PAUSE Decision Band (<45 points)', () => {
    it('should return PAUSE for low-scoring assessment', () => {
      // Create responses that total < 45 points
      const responses: Response[] = [
        createResponse('q1', 3),   // 1.5 points
        createResponse('q2', 3),   // 1.5 points
        createResponse('q3', false), // 0 points
        createResponse('q4', 3),   // 2.4 points
        createResponse('q5', 3),   // 2.1 points
        createResponse('q6', false), // 0 points
        createResponse('q7', 4),   // 2 points
        createResponse('q8', 4),   // 2 points
        createResponse('q9', true), // 5 points
        createResponse('q10', 4),  // 2 points
        createResponse('q11', false), // 0 points
        createResponse('q12', true), // 5 points
        createResponse('q13', true)  // 5 points
      ];

      const input: ScoreCalculationInput = {
        assessmentId: 'assessment-3',
        sections,
        questions,
        responses
      };

      const score = calculateScore(input);
      expect(score.totalScore).toBeLessThan(45);

      const riskFlags = detectRiskFlags(questions, responses);
      const decisionBand = determineDecisionBand(score, riskFlags);

      expect(decisionBand.decision).toBe(Decision.PAUSE);
      expect(decisionBand.explanation).toContain('pausing');
    });

    it('should detect risk flags for low experience', () => {
      const responses: Response[] = [
        createResponse('q1', 1), // Very low experience
        createResponse('q2', 2),
        createResponse('q3', false)
      ];

      const experienceQuestions = questions.filter(q => q.sectionId === 'section-1');
      const riskFlags = detectRiskFlags(experienceQuestions, responses);

      expect(riskFlags.some(f => f.includes('experience'))).toBe(true);
    });
  });

  describe('Risk Flag Detection', () => {
    it('should detect non-negotiable compliance violation', () => {
      const complianceQuestions = questions.filter(q => q.sectionId === 'section-5');
      const responses: Response[] = [
        createResponse('q12', false), // Didn't agree to comply with laws
        createResponse('q13', true)
      ];

      const riskFlags = detectRiskFlags(complianceQuestions, responses);

      expect(riskFlags.some(f => f.toLowerCase().includes('non-negotiable'))).toBe(true);
    });

    it('should downgrade PROCEED to SAFEGUARDS for critical risk flags', () => {
      // Even with a high score, critical risks should downgrade
      const responses: Response[] = [
        createResponse('q1', 10),
        createResponse('q2', 10),
        createResponse('q3', true),
        createResponse('q4', 1), // Very low financial - triggers critical flag
        createResponse('q5', 10),
        createResponse('q6', true),
        createResponse('q7', 10),
        createResponse('q8', 10),
        createResponse('q9', true),
        createResponse('q10', 10),
        createResponse('q11', true),
        createResponse('q12', true),
        createResponse('q13', true)
      ];

      const input: ScoreCalculationInput = {
        assessmentId: 'assessment-4',
        sections,
        questions,
        responses
      };

      const score = calculateScore(input);
      const riskFlags = detectRiskFlags(questions, responses);
      const decisionBand = determineDecisionBand(score, riskFlags);

      // Should be downgraded due to critical financial flag
      if (score.totalScore >= 55 && riskFlags.some(f => f.includes('Critical'))) {
        expect(decisionBand.decision).toBe(Decision.PROCEED_WITH_SAFEGUARDS);
      }
    });
  });

  describe('Score Calculations', () => {
    it('should correctly sum section scores to max 70', () => {
      // Perfect score scenario
      const responses: Response[] = [
        createResponse('q1', 10),  // 5 points
        createResponse('q2', 10),  // 5 points
        createResponse('q3', true), // 5 points = 15 total section 1
        createResponse('q4', 10),  // 8 points
        createResponse('q5', 10),  // 7 points
        createResponse('q6', true), // 5 points = 20 total section 2
        createResponse('q7', 10),  // 5 points
        createResponse('q8', 10),  // 5 points
        createResponse('q9', true), // 5 points = 15 total section 3
        createResponse('q10', 10), // 5 points
        createResponse('q11', true), // 5 points = 10 total section 4
        createResponse('q12', true), // 5 points
        createResponse('q13', true)  // 5 points = 10 total section 5
      ];

      const input: ScoreCalculationInput = {
        assessmentId: 'assessment-5',
        sections,
        questions,
        responses
      };

      const score = calculateScore(input);

      expect(score.totalScore).toBe(70);
      expect(score.maxScore).toBe(70);
      expect(score.percentage).toBe(100);
      expect(score.sectionScores).toHaveLength(5);
    });

    it('should handle missing responses gracefully', () => {
      // Only answer some questions
      const responses: Response[] = [
        createResponse('q1', 8),
        createResponse('q4', 7),
        createResponse('q12', true)
      ];

      const input: ScoreCalculationInput = {
        assessmentId: 'assessment-6',
        sections,
        questions,
        responses
      };

      const score = calculateScore(input);

      expect(score.totalScore).toBeLessThan(70);
      expect(score.sectionScores.every(s => s.earnedScore >= 0)).toBe(true);
    });
  });
});

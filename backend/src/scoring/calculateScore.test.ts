import { calculateScore, ScoreCalculationInput } from './calculateScore';
import { Section } from '../models/Section';
import { Question, QuestionType } from '../models/Question';
import { Response } from '../models/Response';

describe('calculateScore', () => {
  const mockSection: Section = {
    id: 'section-1',
    assessmentId: 'assessment-1',
    title: 'Experience & Track Record',
    order: 1,
    maxScore: 20
  };

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      sectionId: 'section-1',
      type: QuestionType.NUMERIC_SCALE,
      text: 'Rate your experience level',
      weight: 10,
      required: true,
      order: 1,
      minValue: 1,
      maxValue: 10
    },
    {
      id: 'q2',
      sectionId: 'section-1',
      type: QuestionType.CHECKBOX,
      text: 'Do you agree to compliance terms?',
      weight: 10,
      required: true,
      order: 2
    }
  ];

  it('should calculate score correctly for numeric scale questions', () => {
    const responses: Response[] = [
      {
        id: 'r1',
        questionId: 'q1',
        assessmentId: 'assessment-1',
        value: 8, // 8/10 = 80% of weight 10 = 8 points
        createdAt: new Date()
      },
      {
        id: 'r2',
        questionId: 'q2',
        assessmentId: 'assessment-1',
        value: true, // Full weight = 10 points
        createdAt: new Date()
      }
    ];

    const input: ScoreCalculationInput = {
      assessmentId: 'assessment-1',
      sections: [mockSection],
      questions: mockQuestions,
      responses
    };

    const score = calculateScore(input);

    expect(score.assessmentId).toBe('assessment-1');
    expect(score.totalScore).toBe(18); // 8 + 10 = 18
    expect(score.maxScore).toBe(70);
    expect(score.sectionScores).toHaveLength(1);
    expect(score.sectionScores[0].earnedScore).toBe(18);
  });

  it('should return 0 for missing responses', () => {
    const input: ScoreCalculationInput = {
      assessmentId: 'assessment-1',
      sections: [mockSection],
      questions: mockQuestions,
      responses: []
    };

    const score = calculateScore(input);

    expect(score.totalScore).toBe(0);
    expect(score.sectionScores[0].earnedScore).toBe(0);
  });

  it('should handle checkbox responses correctly', () => {
    const responses: Response[] = [
      {
        id: 'r1',
        questionId: 'q1',
        assessmentId: 'assessment-1',
        value: 5,
        createdAt: new Date()
      },
      {
        id: 'r2',
        questionId: 'q2',
        assessmentId: 'assessment-1',
        value: false, // Should be 0 points
        createdAt: new Date()
      }
    ];

    const input: ScoreCalculationInput = {
      assessmentId: 'assessment-1',
      sections: [mockSection],
      questions: mockQuestions,
      responses
    };

    const score = calculateScore(input);

    expect(score.totalScore).toBe(5); // 5 from numeric + 0 from checkbox
  });

  it('should calculate percentage correctly', () => {
    const responses: Response[] = [
      {
        id: 'r1',
        questionId: 'q1',
        assessmentId: 'assessment-1',
        value: 10,
        createdAt: new Date()
      },
      {
        id: 'r2',
        questionId: 'q2',
        assessmentId: 'assessment-1',
        value: true,
        createdAt: new Date()
      }
    ];

    const input: ScoreCalculationInput = {
      assessmentId: 'assessment-1',
      sections: [mockSection],
      questions: mockQuestions,
      responses
    };

    const score = calculateScore(input);

    // 20 points out of 70 max
    expect(score.percentage).toBeCloseTo(28.57, 1);
  });

  it('should handle multiple sections', () => {
    const sections: Section[] = [
      { ...mockSection, id: 'section-1', order: 1, maxScore: 20 },
      { ...mockSection, id: 'section-2', title: 'Financial Readiness', order: 2, maxScore: 30 }
    ];

    const questions: Question[] = [
      ...mockQuestions,
      {
        id: 'q3',
        sectionId: 'section-2',
        type: QuestionType.NUMERIC_SCALE,
        text: 'Budget availability',
        weight: 15,
        required: true,
        order: 1,
        maxValue: 10
      }
    ];

    const responses: Response[] = [
      { id: 'r1', questionId: 'q1', assessmentId: 'assessment-1', value: 10, createdAt: new Date() },
      { id: 'r2', questionId: 'q2', assessmentId: 'assessment-1', value: true, createdAt: new Date() },
      { id: 'r3', questionId: 'q3', assessmentId: 'assessment-1', value: 6, createdAt: new Date() }
    ];

    const input: ScoreCalculationInput = {
      assessmentId: 'assessment-1',
      sections,
      questions,
      responses
    };

    const score = calculateScore(input);

    expect(score.sectionScores).toHaveLength(2);
    expect(score.totalScore).toBe(29); // 10 + 10 + 9 (6/10 * 15)
  });
});

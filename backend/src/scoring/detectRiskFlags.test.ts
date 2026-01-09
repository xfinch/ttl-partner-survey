import { detectRiskFlags, hasNonNegotiableFlags, hasCriticalFlags } from './detectRiskFlags';
import { Question, QuestionType } from '../models/Question';
import { Response } from '../models/Response';

describe('detectRiskFlags', () => {
  const createQuestion = (id: string, text: string, required = false): Question => ({
    id,
    sectionId: 'section-1',
    type: QuestionType.CHECKBOX,
    text,
    weight: 10,
    required,
    order: 1
  });

  const createResponse = (questionId: string, value: Response['value']): Response => ({
    id: `response-${questionId}`,
    questionId,
    assessmentId: 'assessment-1',
    value,
    createdAt: new Date()
  });

  it('should detect compliance non-negotiable flag', () => {
    const questions = [createQuestion('q1', 'Do you agree to compliance terms?')];
    const responses = [createResponse('q1', false)];

    const flags = detectRiskFlags(questions, responses);

    expect(flags).toContain('Non-negotiable: Compliance agreement not accepted');
  });

  it('should detect financial critical flag', () => {
    const questions = [
      {
        ...createQuestion('q1', 'How would you rate your budget availability?'),
        type: QuestionType.NUMERIC_SCALE
      }
    ];
    const responses = [createResponse('q1', 1)];

    const flags = detectRiskFlags(questions, responses);

    expect(flags).toContain('Critical: Financial concerns identified');
  });

  it('should detect missing required response', () => {
    const questions = [createQuestion('q1', 'Required question here', true)];
    const responses: Response[] = [];

    const flags = detectRiskFlags(questions, responses);

    expect(flags.some(f => f.includes('Required question unanswered'))).toBe(true);
  });

  it('should not flag when compliance is accepted', () => {
    const questions = [createQuestion('q1', 'Do you agree to compliance terms?')];
    const responses = [createResponse('q1', true)];

    const flags = detectRiskFlags(questions, responses);

    expect(flags).not.toContain('Non-negotiable: Compliance agreement not accepted');
  });

  it('should return unique flags only', () => {
    const questions = [
      createQuestion('q1', 'Compliance agreement'),
      createQuestion('q2', 'Legal compliance required')
    ];
    const responses = [
      createResponse('q1', false),
      createResponse('q2', false)
    ];

    const flags = detectRiskFlags(questions, responses);

    // Should deduplicate
    const complianceFlags = flags.filter(f => f.includes('Compliance'));
    expect(complianceFlags.length).toBe(1);
  });

  it('should detect experience warning', () => {
    const questions = [
      {
        ...createQuestion('q1', 'Rate your experience level'),
        type: QuestionType.NUMERIC_SCALE
      }
    ];
    const responses = [createResponse('q1', 1)];

    const flags = detectRiskFlags(questions, responses);

    expect(flags).toContain('Warning: Limited experience indicated');
  });
});

describe('hasNonNegotiableFlags', () => {
  it('should return true when non-negotiable flags exist', () => {
    const flags = ['Non-negotiable: Compliance agreement not accepted'];
    expect(hasNonNegotiableFlags(flags)).toBe(true);
  });

  it('should return false when no non-negotiable flags exist', () => {
    const flags = ['Warning: Some concern', 'Critical: Other issue'];
    expect(hasNonNegotiableFlags(flags)).toBe(false);
  });
});

describe('hasCriticalFlags', () => {
  it('should return true when critical flags exist', () => {
    const flags = ['Critical: Financial concerns identified'];
    expect(hasCriticalFlags(flags)).toBe(true);
  });

  it('should return false when no critical flags exist', () => {
    const flags = ['Warning: Some concern'];
    expect(hasCriticalFlags(flags)).toBe(false);
  });
});

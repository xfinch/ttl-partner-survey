import { Question, QuestionType } from '../models/Question';
import { Response } from '../models/Response';

/**
 * Risk flag definition
 */
interface RiskFlagRule {
  questionText: string | RegExp;
  condition: (value: Response['value']) => boolean;
  flag: string;
  severity: 'warning' | 'critical' | 'non-negotiable';
}

/**
 * Default risk flag rules
 * These identify non-negotiable violations and concerns
 */
const DEFAULT_RISK_RULES: RiskFlagRule[] = [
  {
    questionText: /compliance|agree.*terms|legal/i,
    condition: (value) => value === false || value === 'false' || value === 0,
    flag: 'Non-negotiable: Compliance agreement not accepted',
    severity: 'non-negotiable'
  },
  {
    questionText: /exclusive|exclusivity/i,
    condition: (value) => value === false || value === 'false' || value === 0,
    flag: 'Warning: Exclusivity concerns',
    severity: 'warning'
  },
  {
    questionText: /revenue.*share|payment.*terms/i,
    condition: (value) => {
      if (typeof value === 'number') return value < 3;
      return false;
    },
    flag: 'Warning: Low confidence in payment terms',
    severity: 'warning'
  },
  {
    questionText: /experience|track.*record/i,
    condition: (value) => {
      if (typeof value === 'number') return value <= 2;
      return false;
    },
    flag: 'Warning: Limited experience indicated',
    severity: 'warning'
  },
  {
    questionText: /timeline|deadline|urgent/i,
    condition: (value) => {
      if (typeof value === 'number') return value <= 2;
      if (typeof value === 'string') return value.toLowerCase().includes('asap');
      return false;
    },
    flag: 'Warning: Rushed timeline concerns',
    severity: 'warning'
  },
  {
    questionText: /budget|funding|financial/i,
    condition: (value) => {
      if (typeof value === 'number') return value <= 2;
      if (typeof value === 'boolean') return value === false;
      return false;
    },
    flag: 'Critical: Financial concerns identified',
    severity: 'critical'
  }
];

/**
 * Detect risk flags from assessment responses
 *
 * @param questions - Assessment questions
 * @param responses - User responses
 * @param customRules - Optional custom risk rules
 * @returns Array of risk flag strings
 */
export function detectRiskFlags(
  questions: Question[],
  responses: Response[],
  customRules?: RiskFlagRule[]
): string[] {
  const rules = customRules || DEFAULT_RISK_RULES;
  const flags: string[] = [];

  for (const question of questions) {
    const response = responses.find(r => r.questionId === question.id);

    if (!response) {
      // Missing required response is a risk
      if (question.required) {
        flags.push(`Warning: Required question unanswered - "${question.text.substring(0, 50)}..."`);
      }
      continue;
    }

    // Check against all rules
    for (const rule of rules) {
      const matches = typeof rule.questionText === 'string'
        ? question.text.toLowerCase().includes(rule.questionText.toLowerCase())
        : rule.questionText.test(question.text);

      if (matches && rule.condition(response.value)) {
        flags.push(rule.flag);
      }
    }
  }

  // Remove duplicates
  return [...new Set(flags)];
}

/**
 * Check if any flags are non-negotiable (deal breakers)
 */
export function hasNonNegotiableFlags(flags: string[]): boolean {
  return flags.some(flag =>
    flag.toLowerCase().includes('non-negotiable')
  );
}

/**
 * Check if any flags are critical
 */
export function hasCriticalFlags(flags: string[]): boolean {
  return flags.some(flag =>
    flag.toLowerCase().includes('critical')
  );
}

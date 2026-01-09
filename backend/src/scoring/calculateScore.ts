import { Question, QuestionType } from '../models/Question';
import { Response } from '../models/Response';
import { Section } from '../models/Section';
import { Score, SectionScore } from '../models/Score';
import { MAX_SCORE } from '../models/DecisionBand';
import { v4 as uuidv4 } from 'uuid';

/**
 * Input data for score calculation
 */
export interface ScoreCalculationInput {
  assessmentId: string;
  sections: Section[];
  questions: Question[];
  responses: Response[];
}

/**
 * Calculate the score for a single question based on response
 */
function calculateQuestionScore(question: Question, response: Response | undefined): number {
  if (!response) {
    return 0;
  }

  const { type, weight, maxValue } = question;
  const { value } = response;

  switch (type) {
    case QuestionType.NUMERIC_SCALE:
      // Numeric responses are scaled by weight
      // If maxValue is set, normalize the response
      if (typeof value === 'number') {
        if (maxValue && maxValue > 0) {
          // Normalize to weight (e.g., response 8/10 with weight 5 = 4 points)
          return (value / maxValue) * weight;
        }
        // Direct value capped at weight
        return Math.min(value, weight);
      }
      return 0;

    case QuestionType.CHECKBOX:
      // Boolean responses: full weight if true, 0 if false
      if (typeof value === 'boolean') {
        return value ? weight : 0;
      }
      // Handle string "true"/"false"
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' ? weight : 0;
      }
      return 0;

    case QuestionType.TEXT:
      // Text questions don't typically contribute to score
      // But if they have a weight, give full points for any non-empty response
      if (typeof value === 'string' && value.trim().length > 0) {
        return weight;
      }
      return 0;

    case QuestionType.CONDITIONAL:
      // Conditional questions behave like their base type
      // Treat as numeric scale by default
      if (typeof value === 'number') {
        return Math.min(value, weight);
      }
      if (typeof value === 'boolean') {
        return value ? weight : 0;
      }
      return 0;

    default:
      return 0;
  }
}

/**
 * Calculate section score from questions and responses
 */
function calculateSectionScore(
  section: Section,
  questions: Question[],
  responses: Response[]
): SectionScore {
  const sectionQuestions = questions.filter(q => q.sectionId === section.id);

  let earnedScore = 0;
  let maxPossibleScore = 0;

  for (const question of sectionQuestions) {
    const response = responses.find(r => r.questionId === question.id);
    earnedScore += calculateQuestionScore(question, response);
    maxPossibleScore += question.weight;
  }

  // Use the section's maxScore if specified, otherwise use calculated max
  const maxScore = section.maxScore > 0 ? section.maxScore : maxPossibleScore;
  const percentage = maxScore > 0 ? (earnedScore / maxScore) * 100 : 0;

  return {
    sectionId: section.id,
    sectionTitle: section.title,
    earnedScore: Math.round(earnedScore * 100) / 100, // Round to 2 decimals
    maxScore,
    percentage: Math.round(percentage * 100) / 100
  };
}

/**
 * Calculate total score for an assessment
 *
 * @param input - Assessment data including sections, questions, and responses
 * @returns Calculated Score object
 */
export function calculateScore(input: ScoreCalculationInput): Score {
  const { assessmentId, sections, questions, responses } = input;

  // Calculate scores for each section
  const sectionScores: SectionScore[] = sections
    .sort((a, b) => a.order - b.order)
    .map(section => calculateSectionScore(section, questions, responses));

  // Calculate totals
  const totalScore = sectionScores.reduce((sum, s) => sum + s.earnedScore, 0);
  const maxScoreFromSections = sectionScores.reduce((sum, s) => sum + s.maxScore, 0);

  // Use MAX_SCORE (70) as the official max, but track actual section max
  const maxScore = MAX_SCORE;
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return {
    id: uuidv4(),
    assessmentId,
    totalScore: Math.round(totalScore * 100) / 100,
    maxScore,
    percentage: Math.round(percentage * 100) / 100,
    sectionScores,
    calculatedAt: new Date()
  };
}

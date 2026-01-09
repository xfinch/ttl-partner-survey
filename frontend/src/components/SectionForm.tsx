import type { Section, Question } from '../types';
import QuestionRenderer from './questions/QuestionRenderer';

interface SectionFormProps {
  section: Section;
  responses: Record<string, string | number | boolean>;
  onResponseChange: (questionId: string, value: string | number | boolean) => void;
  errors: Record<string, string>;
}

/**
 * Check if a conditional question should be shown
 */
function shouldShowQuestion(
  question: Question,
  responses: Record<string, string | number | boolean>
): boolean {
  if (!question.showIfQuestionId) {
    return true;
  }

  const dependentValue = responses[question.showIfQuestionId];
  const expectedValue = question.showIfValue;

  if (expectedValue === undefined) {
    return true;
  }

  // Convert to string for comparison since showIfValue is stored as string
  return String(dependentValue) === String(expectedValue);
}

export default function SectionForm({
  section,
  responses,
  onResponseChange,
  errors
}: SectionFormProps) {
  // Sort questions by order
  const sortedQuestions = [...section.questions].sort((a, b) => a.order - b.order);

  // Filter questions based on conditional logic
  const visibleQuestions = sortedQuestions.filter((q) =>
    shouldShowQuestion(q, responses)
  );

  return (
    <div className="section-form">
      <h2 className="section-title">{section.title}</h2>
      {section.description && (
        <p className="section-description">{section.description}</p>
      )}
      <div className="questions">
        {visibleQuestions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={responses[question.id]}
            onChange={onResponseChange}
            error={errors[question.id]}
          />
        ))}
      </div>
    </div>
  );
}

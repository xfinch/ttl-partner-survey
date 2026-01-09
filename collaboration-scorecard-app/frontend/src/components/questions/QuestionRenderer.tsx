import type { Question } from '../../types';
import { QuestionType } from '../../types';
import NumericScale from './NumericScale';
import Checkbox from './Checkbox';
import TextArea from './TextArea';

interface QuestionRendererProps {
  question: Question;
  value: string | number | boolean | undefined;
  onChange: (questionId: string, value: string | number | boolean) => void;
  error?: string;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  error
}: QuestionRendererProps) {
  const handleChange = (newValue: string | number | boolean) => {
    onChange(question.id, newValue);
  };

  switch (question.type) {
    case QuestionType.NUMERIC_SCALE:
      return (
        <NumericScale
          question={question}
          value={value as number | undefined}
          onChange={handleChange}
          error={error}
        />
      );

    case QuestionType.CHECKBOX:
      return (
        <Checkbox
          question={question}
          value={value as boolean | undefined}
          onChange={handleChange}
          error={error}
        />
      );

    case QuestionType.TEXT:
    case QuestionType.CONDITIONAL:
      return (
        <TextArea
          question={question}
          value={value as string | undefined}
          onChange={handleChange}
          error={error}
        />
      );

    default:
      return <p>Unknown question type: {question.type}</p>;
  }
}

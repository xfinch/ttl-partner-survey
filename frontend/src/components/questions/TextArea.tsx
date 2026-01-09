import type { Question } from '../../types';

interface TextAreaProps {
  question: Question;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
}

export default function TextArea({
  question,
  value,
  onChange,
  error
}: TextAreaProps) {
  return (
    <div className="question text-area">
      <label className="question-text">
        {question.text}
        {question.required && <span className="required">*</span>}
      </label>
      {question.description && (
        <p className="question-description">{question.description}</p>
      )}
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Enter your response..."
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

import type { Question } from '../../types';

interface CheckboxProps {
  question: Question;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  error?: string;
}

export default function Checkbox({
  question,
  value,
  onChange,
  error
}: CheckboxProps) {
  return (
    <div className="question checkbox">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={value ?? false}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="checkbox-text">
          {question.text}
          {question.required && <span className="required">*</span>}
        </span>
      </label>
      {question.description && (
        <p className="question-description">{question.description}</p>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

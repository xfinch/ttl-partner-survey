import type { Question } from '../../types';

interface NumericScaleProps {
  question: Question;
  value: number | undefined;
  onChange: (value: number) => void;
  error?: string;
}

export default function NumericScale({
  question,
  value,
  onChange,
  error
}: NumericScaleProps) {
  const min = question.minValue ?? 1;
  const max = question.maxValue ?? 10;
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="question numeric-scale">
      <label className="question-text">
        {question.text}
        {question.required && <span className="required">*</span>}
      </label>
      {question.description && (
        <p className="question-description">{question.description}</p>
      )}
      <div className="scale-options">
        {options.map((num) => (
          <button
            key={num}
            type="button"
            className={`scale-option ${value === num ? 'selected' : ''}`}
            onClick={() => onChange(num)}
            aria-pressed={value === num}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="scale-labels">
        <span>Low</span>
        <span>High</span>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

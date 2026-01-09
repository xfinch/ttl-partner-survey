interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels
}: ProgressIndicatorProps) {
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="progress-indicator">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="progress-steps">
        {stepLabels.map((label, index) => (
          <div
            key={label}
            className={`progress-step ${
              index < currentStep
                ? 'completed'
                : index === currentStep
                ? 'current'
                : 'pending'
            }`}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>
      <p className="progress-text">
        Step {currentStep + 1} of {totalSteps}: {stepLabels[currentStep]}
      </p>
    </div>
  );
}

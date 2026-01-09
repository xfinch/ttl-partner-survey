import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { AssessmentResult } from '../../types';
import { Decision } from '../../types';
import * as api from '../../api/client';
import './summary.css';

const DECISION_CONFIG = {
  [Decision.PROCEED]: {
    label: 'Proceed',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    icon: '✓'
  },
  [Decision.PROCEED_WITH_SAFEGUARDS]: {
    label: 'Proceed with Safeguards',
    color: '#eab308',
    bgColor: '#fefce8',
    icon: '⚠'
  },
  [Decision.PAUSE]: {
    label: 'Pause',
    color: '#dc2626',
    bgColor: '#fef2f2',
    icon: '✕'
  }
};

export default function SummaryPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) return;

    api
      .getAssessmentResult(assessmentId)
      .then(setResult)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load result');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [assessmentId]);

  if (isLoading) {
    return (
      <div className="summary-page">
        <div className="loading">Loading assessment result...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="summary-page">
        <div className="error-container">
          <h2>Unable to load result</h2>
          <p>{error || 'Assessment not found'}</p>
          <Link to="/" className="btn btn-primary">
            Start New Assessment
          </Link>
        </div>
      </div>
    );
  }

  const { assessment, score, decisionBand } = result;
  const decisionConfig = DECISION_CONFIG[decisionBand.decision];

  return (
    <div className="summary-page">
      <header className="summary-header">
        <h1>Assessment Complete</h1>
        <p>Thank you for completing the collaboration scorecard</p>
      </header>

      <main className="summary-main">
        {/* Decision Band */}
        <div
          className="decision-card"
          style={{
            borderColor: decisionConfig.color,
            backgroundColor: decisionConfig.bgColor
          }}
        >
          <div className="decision-icon\" style={{ color: decisionConfig.color }}>
            {decisionConfig.icon}
          </div>
          <h2 style={{ color: decisionConfig.color }}>{decisionConfig.label}</h2>
          <p className="decision-explanation">{decisionBand.explanation}</p>
        </div>

        {/* Score Summary */}
        <div className="score-card">
          <h3>Score Summary</h3>
          <div className="total-score">
            <span className="score-value">{score.totalScore}</span>
            <span className="score-max">/ {score.maxScore}</span>
          </div>
          <div className="score-percentage">{score.percentage.toFixed(1)}%</div>

          <div className="score-bar">
            <div
              className="score-fill"
              style={{
                width: `${score.percentage}%`,
                backgroundColor: decisionConfig.color
              }}
            />
          </div>

          <div className="score-thresholds">
            <span className="threshold pause">0-44: Pause</span>
            <span className="threshold safeguards">45-54: Safeguards</span>
            <span className="threshold proceed">55-70: Proceed</span>
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="sections-card">
          <h3>Section Breakdown</h3>
          <div className="section-scores">
            {score.sectionScores.map((section) => (
              <div key={section.sectionId} className="section-score">
                <div className="section-info">
                  <span className="section-name">{section.sectionTitle}</span>
                  <span className="section-points">
                    {section.earnedScore} / {section.maxScore}
                  </span>
                </div>
                <div className="section-bar">
                  <div
                    className="section-fill"
                    style={{ width: `${section.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Flags */}
        {decisionBand.riskFlags.length > 0 && (
          <div className="risk-card">
            <h3>Risk Flags</h3>
            <ul className="risk-list">
              {decisionBand.riskFlags.map((flag, index) => (
                <li key={index} className="risk-item">
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assessment Info */}
        <div className="info-card">
          <h3>Assessment Details</h3>
          <dl className="info-list">
            <dt>Email</dt>
            <dd>{assessment.respondentEmail}</dd>
            {assessment.respondentName && (
              <>
                <dt>Name</dt>
                <dd>{assessment.respondentName}</dd>
              </>
            )}
            {assessment.companyName && (
              <>
                <dt>Company</dt>
                <dd>{assessment.companyName}</dd>
              </>
            )}
            <dt>Collaboration Type</dt>
            <dd>{assessment.collaborationType.replace(/_/g, ' ')}</dd>
            <dt>Submitted</dt>
            <dd>{new Date(score.calculatedAt).toLocaleString()}</dd>
          </dl>
        </div>

        {/* Actions */}
        <div className="actions">
          <Link to="/" className="btn btn-secondary">
            Start New Assessment
          </Link>
        </div>
      </main>
    </div>
  );
}

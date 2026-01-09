import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Assessment } from '../../types';
import { AssessmentStatus } from '../../types';
import * as api from '../../api/client';
import './admin.css';

const STATUS_LABELS: Record<AssessmentStatus, string> = {
  [AssessmentStatus.DRAFT]: 'Draft',
  [AssessmentStatus.IN_PROGRESS]: 'In Progress',
  [AssessmentStatus.SUBMITTED]: 'Submitted',
  [AssessmentStatus.REVIEWED]: 'Reviewed',
  [AssessmentStatus.ARCHIVED]: 'Archived'
};

export default function AdminPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAllAssessments()
      .then(setAssessments)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load assessments');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading assessments...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Review and manage collaboration assessments</p>
      </header>

      <main className="admin-main">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{assessments.length}</span>
            <span className="stat-label">Total Assessments</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {assessments.filter((a) => a.status === AssessmentStatus.SUBMITTED).length}
            </span>
            <span className="stat-label">Pending Review</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {assessments.filter((a) => a.status === AssessmentStatus.REVIEWED).length}
            </span>
            <span className="stat-label">Reviewed</span>
          </div>
        </div>

        <div className="assessments-card">
          <h2>Assessments</h2>

          {assessments.length === 0 ? (
            <div className="empty-state">
              <p>No assessments yet</p>
              <Link to="/" className="btn btn-primary">
                Create First Assessment
              </Link>
            </div>
          ) : (
            <table className="assessments-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td>
                      <span className="email">{assessment.respondentEmail}</span>
                      {assessment.respondentName && (
                        <span className="name">{assessment.respondentName}</span>
                      )}
                    </td>
                    <td>{assessment.companyName || '-'}</td>
                    <td>
                      <span className="collab-type">
                        {assessment.collaborationType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`status status-${assessment.status.toLowerCase()}`}>
                        {STATUS_LABELS[assessment.status]}
                      </span>
                    </td>
                    <td>
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        to={`/summary/${assessment.id}`}
                        className="btn btn-small"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

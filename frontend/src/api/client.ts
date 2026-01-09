import type {
  Assessment,
  Section,
  Response,
  AssessmentResult,
  CollaborationType
} from '../types';

// Use environment variable for API URL in production, fallback to /api for dev proxy
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message);
  }

  return response.json();
}

// Assessment endpoints
export async function createAssessment(data: {
  respondentEmail: string;
  respondentName?: string;
  companyName?: string;
  collaborationType: CollaborationType;
}): Promise<Assessment> {
  return request<Assessment>('/assessments', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getAssessment(id: string): Promise<Assessment> {
  return request<Assessment>(`/assessments/${id}`);
}

export async function updateAssessment(
  id: string,
  data: Partial<Assessment>
): Promise<Assessment> {
  return request<Assessment>(`/assessments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

// Section endpoints
export async function getSections(): Promise<Section[]> {
  return request<Section[]>('/sections');
}

// Response endpoints
export async function saveResponses(
  assessmentId: string,
  responses: Array<{ questionId: string; value: string | number | boolean }>
): Promise<Response[]> {
  return request<Response[]>(`/assessments/${assessmentId}/responses`, {
    method: 'POST',
    body: JSON.stringify({ responses })
  });
}

export async function getResponses(assessmentId: string): Promise<Response[]> {
  return request<Response[]>(`/assessments/${assessmentId}/responses`);
}

// Submit and calculate score
export async function submitAssessment(assessmentId: string): Promise<AssessmentResult> {
  return request<AssessmentResult>(`/assessments/${assessmentId}/submit`, {
    method: 'POST'
  });
}

// Get result (for summary page)
export async function getAssessmentResult(assessmentId: string): Promise<AssessmentResult> {
  return request<AssessmentResult>(`/assessments/${assessmentId}/result`);
}

// Admin endpoints
export async function getAllAssessments(): Promise<Assessment[]> {
  return request<Assessment[]>('/admin/assessments');
}

export async function overrideScore(
  assessmentId: string,
  data: { newScore: number; reason: string }
): Promise<AssessmentResult> {
  return request<AssessmentResult>(`/admin/assessments/${assessmentId}/override`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

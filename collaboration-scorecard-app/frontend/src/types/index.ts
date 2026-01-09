// Shared types matching backend models

export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  ARCHIVED = 'ARCHIVED'
}

export enum CollaborationType {
  AFFILIATE = 'AFFILIATE',
  REVENUE_SHARE = 'REVENUE_SHARE',
  PERFORMANCE_BASED = 'PERFORMANCE_BASED',
  JOINT_VENTURE = 'JOINT_VENTURE'
}

export enum QuestionType {
  NUMERIC_SCALE = 'NUMERIC_SCALE',
  CHECKBOX = 'CHECKBOX',
  TEXT = 'TEXT',
  CONDITIONAL = 'CONDITIONAL'
}

export enum Decision {
  PROCEED = 'PROCEED',
  PROCEED_WITH_SAFEGUARDS = 'PROCEED_WITH_SAFEGUARDS',
  PAUSE = 'PAUSE'
}

export interface Assessment {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: AssessmentStatus;
  respondentEmail: string;
  respondentName?: string;
  collaborationType: CollaborationType;
  companyName?: string;
  notes?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  maxScore: number;
  questions: Question[];
}

export interface Question {
  id: string;
  sectionId: string;
  type: QuestionType;
  text: string;
  description?: string;
  weight: number;
  required: boolean;
  order: number;
  minValue?: number;
  maxValue?: number;
  showIfQuestionId?: string;
  showIfValue?: string;
}

export interface Response {
  id?: string;
  questionId: string;
  assessmentId: string;
  value: string | number | boolean;
}

export interface SectionScore {
  sectionId: string;
  sectionTitle: string;
  earnedScore: number;
  maxScore: number;
  percentage: number;
}

export interface Score {
  id: string;
  assessmentId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  sectionScores: SectionScore[];
  calculatedAt: string;
}

export interface DecisionBand {
  id: string;
  assessmentId: string;
  scoreId: string;
  decision: Decision;
  explanation: string;
  riskFlags: string[];
  createdAt: string;
}

export interface AssessmentResult {
  assessment: Assessment;
  score: Score;
  decisionBand: DecisionBand;
}

// Form state types
export interface IntakeFormData {
  respondentEmail: string;
  respondentName: string;
  companyName: string;
  collaborationType: CollaborationType;
  responses: Record<string, string | number | boolean>;
}

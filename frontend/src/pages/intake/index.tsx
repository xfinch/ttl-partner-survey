import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Section, CollaborationType } from '../../types';
import { CollaborationType as CT, QuestionType } from '../../types';
import SectionForm from '../../components/SectionForm';
import ProgressIndicator from '../../components/ProgressIndicator';
import * as api from '../../api/client';
import './intake.css';

// Mock sections for development (will be fetched from API)
const MOCK_SECTIONS: Section[] = [
  {
    id: 'section-1',
    title: 'Experience & Track Record',
    description: 'Help us understand your relevant experience and past performance',
    order: 1,
    maxScore: 15,
    questions: [
      {
        id: 'q1',
        sectionId: 'section-1',
        type: QuestionType.NUMERIC_SCALE,
        text: 'How many years of experience do you have in this industry?',
        description: '1 = Less than 1 year, 10 = 10+ years',
        weight: 5,
        required: true,
        order: 1,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'q2',
        sectionId: 'section-1',
        type: QuestionType.NUMERIC_SCALE,
        text: 'How would you rate your track record of successful collaborations?',
        description: '1 = No prior collaborations, 10 = Extensive successful partnerships',
        weight: 5,
        required: true,
        order: 2,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'q3',
        sectionId: 'section-1',
        type: QuestionType.CHECKBOX,
        text: 'Do you have verifiable references from past partners?',
        weight: 5,
        required: false,
        order: 3
      }
    ]
  },
  {
    id: 'section-2',
    title: 'Financial Readiness',
    description: 'Evaluate financial stability and resource availability',
    order: 2,
    maxScore: 20,
    questions: [
      {
        id: 'q4',
        sectionId: 'section-2',
        type: QuestionType.NUMERIC_SCALE,
        text: 'How would you rate your current financial stability?',
        description: '1 = Significant challenges, 10 = Very stable',
        weight: 8,
        required: true,
        order: 1,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'q5',
        sectionId: 'section-2',
        type: QuestionType.NUMERIC_SCALE,
        text: 'Do you have budget allocated for this collaboration?',
        description: '1 = No budget, 10 = Fully funded',
        weight: 7,
        required: true,
        order: 2,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'q6',
        sectionId: 'section-2',
        type: QuestionType.CHECKBOX,
        text: 'Are you prepared to invest resources upfront if required?',
        weight: 5,
        required: false,
        order: 3
      }
    ]
  },
  {
    id: 'section-3',
    title: 'Alignment & Values',
    description: 'Assess cultural and strategic alignment',
    order: 3,
    maxScore: 15,
    questions: [
      {
        id: 'q7',
        sectionId: 'section-3',
        type: QuestionType.NUMERIC_SCALE,
        text: 'How aligned are your business goals with this partnership?',
        description: '1 = Not aligned, 10 = Perfectly aligned',
        weight: 5,
        required: true,
        order: 1,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'q8',
        sectionId: 'section-3',
        type: QuestionType.NUMERIC_SCALE,
        text: 'How would you rate the cultural fit between our organizations?',
        description: '1 = Poor fit, 10 = Excellent fit',
        weight: 5,
        required: true,
        order: 2,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'q9',
        sectionId: 'section-3',
        type: QuestionType.CHECKBOX,
        text: 'Do you share our commitment to ethical business practices?',
        weight: 5,
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'section-4',
    title: 'Operational Capacity',
    description: 'Evaluate ability to execute and deliver',
    order: 4,
    maxScore: 10,
    questions: [
      {
        id: 'q10',
        sectionId: 'section-4',
        type: QuestionType.NUMERIC_SCALE,
        text: "How would you rate your team's capacity to take on this project?",
        description: '1 = Very limited, 10 = Fully available',
        weight: 5,
        required: true,
        order: 1,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'q11',
        sectionId: 'section-4',
        type: QuestionType.CHECKBOX,
        text: 'Do you have dedicated resources for this collaboration?',
        weight: 5,
        required: false,
        order: 2
      }
    ]
  },
  {
    id: 'section-5',
    title: 'Compliance & Legal',
    description: 'Verify legal and compliance requirements',
    order: 5,
    maxScore: 10,
    questions: [
      {
        id: 'q12',
        sectionId: 'section-5',
        type: QuestionType.CHECKBOX,
        text: 'Do you agree to comply with all applicable laws and regulations?',
        weight: 5,
        required: true,
        order: 1
      },
      {
        id: 'q13',
        sectionId: 'section-5',
        type: QuestionType.CHECKBOX,
        text: 'Do you agree to our standard terms and conditions?',
        weight: 5,
        required: true,
        order: 2
      },
      {
        id: 'q14',
        sectionId: 'section-5',
        type: QuestionType.TEXT,
        text: 'Please describe any compliance concerns or limitations.',
        description: 'This question appears if you indicated compliance concerns',
        weight: 0,
        required: false,
        order: 3,
        showIfQuestionId: 'q12',
        showIfValue: 'false'
      }
    ]
  }
];

interface IntakeFormState {
  respondentEmail: string;
  respondentName: string;
  companyName: string;
  collaborationType: CollaborationType;
  responses: Record<string, string | number | boolean>;
}

export default function IntakePage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [sections, setSections] = useState<Section[]>(MOCK_SECTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<IntakeFormState>({
    respondentEmail: '',
    respondentName: '',
    companyName: '',
    collaborationType: CT.PERFORMANCE_BASED,
    responses: {}
  });

  // Steps: Info + sections
  const totalSteps = sections.length + 1;
  const stepLabels = ['Your Info', ...sections.map((s) => s.title)];

  // Try to fetch sections from API
  useEffect(() => {
    api.getSections().then(setSections).catch(() => {
      // Use mock sections if API unavailable
    });
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      // Validate info step
      if (!formData.respondentEmail.trim()) {
        newErrors.respondentEmail = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.respondentEmail)) {
        newErrors.respondentEmail = 'Please enter a valid email';
      }
    } else {
      // Validate section questions
      const section = sections[currentStep - 1];
      section.questions.forEach((question) => {
        if (question.required) {
          const value = formData.responses[question.id];
          if (value === undefined || value === '' || value === null) {
            // Check conditional visibility
            if (!question.showIfQuestionId) {
              newErrors[question.id] = 'This field is required';
            } else {
              // Only require if the question is visible
              const depValue = formData.responses[question.showIfQuestionId];
              if (String(depValue) === String(question.showIfValue)) {
                newErrors[question.id] = 'This field is required';
              }
            }
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData, sections]);

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleResponseChange = (
    questionId: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: value
      }
    }));
    // Clear error for this field
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    try {
      // Create assessment
      const assessment = await api.createAssessment({
        respondentEmail: formData.respondentEmail,
        respondentName: formData.respondentName || undefined,
        companyName: formData.companyName || undefined,
        collaborationType: formData.collaborationType
      });

      // Save responses
      const responsesToSave = Object.entries(formData.responses).map(
        ([questionId, value]) => ({
          questionId,
          value
        })
      );
      await api.saveResponses(assessment.id, responsesToSave);

      // Submit and calculate score
      await api.submitAssessment(assessment.id);

      // Navigate to summary
      navigate(`/summary/${assessment.id}`);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to submit assessment'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isLastStep = currentStep === totalSteps - 1;
  const currentSection = currentStep > 0 ? sections[currentStep - 1] : null;

  return (
    <div className="intake-page">
      <header className="intake-header">
        <h1>Collaboration Scorecard</h1>
        <p>Performance-based partnership qualification</p>
      </header>

      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabels={stepLabels}
      />

      <main className="intake-main">
        {currentStep === 0 ? (
          <div className="info-form">
            <h2>Your Information</h2>
            <p className="form-intro">
              Please provide your contact information to begin the assessment.
            </p>

            <div className="form-field">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.respondentEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    respondentEmail: e.target.value
                  }))
                }
                placeholder="your@email.com"
              />
              {errors.respondentEmail && (
                <p className="error">{errors.respondentEmail}</p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                value={formData.respondentName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    respondentName: e.target.value
                  }))
                }
                placeholder="John Doe"
              />
            </div>

            <div className="form-field">
              <label htmlFor="company">Company Name</label>
              <input
                id="company"
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyName: e.target.value
                  }))
                }
                placeholder="Acme Inc."
              />
            </div>

            <div className="form-field">
              <label htmlFor="collab-type">Collaboration Type</label>
              <select
                id="collab-type"
                value={formData.collaborationType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    collaborationType: e.target.value as CollaborationType
                  }))
                }
              >
                <option value={CT.PERFORMANCE_BASED}>Performance Based</option>
                <option value={CT.AFFILIATE}>Affiliate</option>
                <option value={CT.REVENUE_SHARE}>Revenue Share</option>
                <option value={CT.JOINT_VENTURE}>Joint Venture</option>
              </select>
            </div>
          </div>
        ) : currentSection ? (
          <SectionForm
            section={currentSection}
            responses={formData.responses}
            onResponseChange={handleResponseChange}
            errors={errors}
          />
        ) : null}

        {submitError && (
          <div className="submit-error">
            <p>{submitError}</p>
          </div>
        )}

        <div className="navigation-buttons">
          {currentStep > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </button>
          )}
          {isLastStep ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              Continue
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

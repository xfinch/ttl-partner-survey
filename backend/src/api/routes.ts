import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateScore, ScoreCalculationInput } from '../scoring/calculateScore';
import { determineDecisionBand } from '../scoring/determineDecisionBand';
import { detectRiskFlags } from '../scoring/detectRiskFlags';
import { Question, QuestionType } from '../models/Question';
import { Section } from '../models/Section';
import { Response as ResponseModel } from '../models/Response';

const router = Router();
const prisma = new PrismaClient();

// =====================
// Assessment Endpoints
// =====================

// Create new assessment
router.post('/assessments', async (req: Request, res: Response) => {
  try {
    const { respondentEmail, respondentName, companyName, collaborationType } = req.body;

    if (!respondentEmail || !collaborationType) {
      return res.status(400).json({ message: 'Email and collaboration type are required' });
    }

    const assessment = await prisma.assessment.create({
      data: {
        respondentEmail,
        respondentName,
        companyName,
        collaborationType,
        status: 'DRAFT'
      }
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ message: 'Failed to create assessment' });
  }
});

// Get assessment by ID
router.get('/assessments/:id', async (req: Request, res: Response) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id }
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ message: 'Failed to get assessment' });
  }
});

// Update assessment
router.patch('/assessments/:id', async (req: Request, res: Response) => {
  try {
    const assessment = await prisma.assessment.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(assessment);
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ message: 'Failed to update assessment' });
  }
});

// =====================
// Section Endpoints
// =====================

// Get all sections with questions
router.get('/sections', async (_req: Request, res: Response) => {
  try {
    const sections = await prisma.section.findMany({
      orderBy: { order: 'asc' },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json(sections);
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ message: 'Failed to get sections' });
  }
});

// =====================
// Response Endpoints
// =====================

// Save responses for an assessment
router.post('/assessments/:id/responses', async (req: Request, res: Response) => {
  try {
    const { id: assessmentId } = req.params;
    const { responses } = req.body;

    if (!Array.isArray(responses)) {
      return res.status(400).json({ message: 'Responses must be an array' });
    }

    // Upsert each response
    const savedResponses = await Promise.all(
      responses.map(async (r: { questionId: string; value: string | number | boolean }) => {
        return prisma.response.upsert({
          where: {
            questionId_assessmentId: {
              questionId: r.questionId,
              assessmentId
            }
          },
          update: {
            value: String(r.value)
          },
          create: {
            questionId: r.questionId,
            assessmentId,
            value: String(r.value)
          }
        });
      })
    );

    // Update assessment status
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: 'IN_PROGRESS' }
    });

    res.json(savedResponses);
  } catch (error) {
    console.error('Save responses error:', error);
    res.status(500).json({ message: 'Failed to save responses' });
  }
});

// Get responses for an assessment
router.get('/assessments/:id/responses', async (req: Request, res: Response) => {
  try {
    const responses = await prisma.response.findMany({
      where: { assessmentId: req.params.id }
    });

    res.json(responses);
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ message: 'Failed to get responses' });
  }
});

// =====================
// Submit & Score
// =====================

// Submit assessment and calculate score
router.post('/assessments/:id/submit', async (req: Request, res: Response) => {
  try {
    const { id: assessmentId } = req.params;

    // Get assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Get sections and questions
    const dbSections = await prisma.section.findMany({
      orderBy: { order: 'asc' },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // Get responses
    const dbResponses = await prisma.response.findMany({
      where: { assessmentId }
    });

    // Convert DB models to scoring models
    const sections: Section[] = dbSections.map(s => ({
      id: s.id,
      assessmentId,
      title: s.title,
      description: s.description || undefined,
      order: s.order,
      maxScore: s.maxScore
    }));

    const questions: Question[] = dbSections.flatMap(s =>
      s.questions.map(q => ({
        id: q.id,
        sectionId: q.sectionId,
        type: q.type as QuestionType,
        text: q.text,
        description: q.description || undefined,
        weight: q.weight,
        required: q.required,
        order: q.order,
        minValue: q.minValue || undefined,
        maxValue: q.maxValue || undefined,
        showIfQuestionId: q.showIfQuestionId || undefined,
        showIfValue: q.showIfValue || undefined
      }))
    );

    const responses: ResponseModel[] = dbResponses.map(r => ({
      id: r.id,
      questionId: r.questionId,
      assessmentId: r.assessmentId,
      value: parseResponseValue(r.value, questions.find(q => q.id === r.questionId)),
      createdAt: r.createdAt
    }));

    // Calculate score
    const scoreInput: ScoreCalculationInput = {
      assessmentId,
      sections,
      questions,
      responses
    };

    const score = calculateScore(scoreInput);

    // Detect risk flags
    const riskFlags = detectRiskFlags(questions, responses);

    // Determine decision band
    const decisionBand = determineDecisionBand(score, riskFlags);

    // Save score to database
    const savedScore = await prisma.score.create({
      data: {
        assessmentId,
        totalScore: score.totalScore,
        maxScore: score.maxScore,
        percentage: score.percentage,
        sectionScores: JSON.parse(JSON.stringify(score.sectionScores))
      }
    });

    // Save decision band to database
    const savedDecisionBand = await prisma.decisionBand.create({
      data: {
        assessmentId,
        scoreId: savedScore.id,
        decision: decisionBand.decision,
        explanation: decisionBand.explanation,
        riskFlags: JSON.parse(JSON.stringify(decisionBand.riskFlags))
      }
    });

    // Update assessment status
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: 'SUBMITTED' }
    });

    res.json({
      assessment: updatedAssessment,
      score: {
        ...savedScore,
        sectionScores: score.sectionScores
      },
      decisionBand: savedDecisionBand
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ message: 'Failed to submit assessment' });
  }
});

// Get assessment result
router.get('/assessments/:id/result', async (req: Request, res: Response) => {
  try {
    const { id: assessmentId } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const score = await prisma.score.findFirst({
      where: { assessmentId },
      orderBy: { calculatedAt: 'desc' }
    });

    const decisionBand = await prisma.decisionBand.findFirst({
      where: { assessmentId },
      orderBy: { createdAt: 'desc' }
    });

    if (!score || !decisionBand) {
      return res.status(404).json({ message: 'Assessment has not been submitted' });
    }

    res.json({
      assessment,
      score,
      decisionBand
    });
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ message: 'Failed to get result' });
  }
});

// =====================
// Admin Endpoints
// =====================

// Get all assessments
router.get('/admin/assessments', async (_req: Request, res: Response) => {
  try {
    const assessments = await prisma.assessment.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(assessments);
  } catch (error) {
    console.error('Get all assessments error:', error);
    res.status(500).json({ message: 'Failed to get assessments' });
  }
});

// Override score
router.post('/admin/assessments/:id/override', async (req: Request, res: Response) => {
  try {
    const { id: assessmentId } = req.params;
    const { newScore, reason, adminEmail = 'admin@system' } = req.body;

    // Get current score
    const currentScore = await prisma.score.findFirst({
      where: { assessmentId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!currentScore) {
      return res.status(404).json({ message: 'No score found for assessment' });
    }

    // Log the override
    await prisma.adminOverride.create({
      data: {
        assessmentId,
        adminEmail,
        previousScore: currentScore.totalScore,
        newScore,
        reason
      }
    });

    // Update the score
    const updatedScore = await prisma.score.update({
      where: { id: currentScore.id },
      data: {
        totalScore: newScore,
        percentage: (newScore / currentScore.maxScore) * 100
      }
    });

    // Recalculate decision band
    const decisionBand = determineDecisionBand(
      { ...currentScore, totalScore: newScore, percentage: (newScore / currentScore.maxScore) * 100 } as any,
      []
    );

    // Update decision band
    const updatedDecisionBand = await prisma.decisionBand.updateMany({
      where: { scoreId: currentScore.id },
      data: {
        decision: decisionBand.decision,
        explanation: decisionBand.explanation
      }
    });

    // Update assessment status
    const assessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: 'REVIEWED' }
    });

    const latestDecisionBand = await prisma.decisionBand.findFirst({
      where: { scoreId: currentScore.id }
    });

    res.json({
      assessment,
      score: updatedScore,
      decisionBand: latestDecisionBand
    });
  } catch (error) {
    console.error('Override score error:', error);
    res.status(500).json({ message: 'Failed to override score' });
  }
});

// Helper function to parse response values
function parseResponseValue(
  value: string,
  question?: Question
): string | number | boolean {
  if (!question) return value;

  switch (question.type) {
    case QuestionType.NUMERIC_SCALE:
      return parseFloat(value) || 0;
    case QuestionType.CHECKBOX:
      return value === 'true';
    default:
      return value;
  }
}

export default router;

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed data for the Collaboration Scorecard App
 *
 * Sections and questions are designed to total 70 points max:
 * - Section 1: Experience & Track Record (15 points)
 * - Section 2: Financial Readiness (20 points)
 * - Section 3: Alignment & Values (15 points)
 * - Section 4: Operational Capacity (10 points)
 * - Section 5: Compliance & Legal (10 points)
 *
 * Total: 70 points
 */
async function main() {
  console.log('Seeding database...');

  // Clear existing data (idempotent)
  await prisma.decisionBand.deleteMany();
  await prisma.score.deleteMany();
  await prisma.response.deleteMany();
  await prisma.adminOverride.deleteMany();
  await prisma.question.deleteMany();
  await prisma.section.deleteMany();
  await prisma.assessment.deleteMany();

  // Section 1: Experience & Track Record (15 points)
  const section1 = await prisma.section.create({
    data: {
      title: 'Experience & Track Record',
      description: 'Assess the partner\'s relevant experience and past performance',
      order: 1,
      maxScore: 15,
      questions: {
        create: [
          {
            type: 'NUMERIC_SCALE',
            text: 'How many years of experience do you have in this industry?',
            description: '1 = Less than 1 year, 10 = 10+ years',
            weight: 5,
            required: true,
            order: 1,
            minValue: 1,
            maxValue: 10
          },
          {
            type: 'NUMERIC_SCALE',
            text: 'How would you rate your track record of successful collaborations?',
            description: '1 = No prior collaborations, 10 = Extensive successful partnerships',
            weight: 5,
            required: true,
            order: 2,
            minValue: 1,
            maxValue: 10
          },
          {
            type: 'CHECKBOX',
            text: 'Do you have verifiable references from past partners?',
            weight: 5,
            required: false,
            order: 3
          }
        ]
      }
    }
  });

  // Add conditional reference detail questions
  const referencesQuestion = await prisma.question.findFirst({
    where: {
      sectionId: section1.id,
      text: { contains: 'verifiable references' }
    }
  });

  if (referencesQuestion) {
    await prisma.question.createMany({
      data: [
        {
          sectionId: section1.id,
          type: 'TEXT',
          text: 'Reference Contact Name',
          description: 'Full name of your reference contact',
          weight: 0,
          required: false,
          order: 4,
          showIfQuestionId: referencesQuestion.id,
          showIfValue: 'true'
        },
        {
          sectionId: section1.id,
          type: 'TEXT',
          text: 'Reference Email Address',
          description: 'Email address for your reference',
          weight: 0,
          required: false,
          order: 5,
          showIfQuestionId: referencesQuestion.id,
          showIfValue: 'true'
        },
        {
          sectionId: section1.id,
          type: 'TEXT',
          text: 'Reference Website',
          description: 'Company or personal website URL',
          weight: 0,
          required: false,
          order: 6,
          showIfQuestionId: referencesQuestion.id,
          showIfValue: 'true'
        },
        {
          sectionId: section1.id,
          type: 'TEXT',
          text: 'Reference Social Media Handles',
          description: 'LinkedIn, Facebook, Instagram, X (Twitter) - include all that apply',
          weight: 0,
          required: false,
          order: 7,
          showIfQuestionId: referencesQuestion.id,
          showIfValue: 'true'
        }
      ]
    });
  }

  // Section 2: Financial Readiness (20 points)
  const section2 = await prisma.section.create({
    data: {
      title: 'Financial Readiness',
      description: 'Evaluate financial stability and resource availability',
      order: 2,
      maxScore: 20,
      questions: {
        create: [
          {
            type: 'NUMERIC_SCALE',
            text: 'How would you rate your current financial stability?',
            description: '1 = Significant challenges, 10 = Very stable',
            weight: 8,
            required: true,
            order: 1,
            minValue: 1,
            maxValue: 10
          },
          {
            type: 'NUMERIC_SCALE',
            text: 'Do you have budget allocated for this collaboration?',
            description: '1 = No budget, 10 = Fully funded',
            weight: 7,
            required: true,
            order: 2,
            minValue: 1,
            maxValue: 10
          },
          {
            type: 'CHECKBOX',
            text: 'Are you prepared to invest resources upfront if required?',
            weight: 5,
            required: false,
            order: 3
          }
        ]
      }
    }
  });

  // Add conditional question for resources investment
  const investResourcesQuestion = await prisma.question.findFirst({
    where: {
      sectionId: section2.id,
      text: { contains: 'prepared to invest resources' }
    }
  });

  if (investResourcesQuestion) {
    await prisma.question.create({
      data: {
        sectionId: section2.id,
        type: 'TEXT',
        text: 'What resources are you prepared to invest?',
        description: 'e.g., small budget, contact list, barter with limited amounts',
        weight: 0,
        required: false,
        order: 4,
        showIfQuestionId: investResourcesQuestion.id,
        showIfValue: 'true'
      }
    });
  }

  // Section 3: Alignment & Values (15 points)
  const section3 = await prisma.section.create({
    data: {
      title: 'Alignment & Values',
      description: 'Assess cultural and strategic alignment',
      order: 3,
      maxScore: 15,
      questions: {
        create: [
          {
            type: 'NUMERIC_SCALE',
            text: 'How aligned are your business goals with this partnership?',
            description: '1 = Not aligned, 10 = Perfectly aligned',
            weight: 5,
            required: true,
            order: 1,
            minValue: 1,
            maxValue: 10
          },
          {
            type: 'NUMERIC_SCALE',
            text: 'How would you rate the cultural fit between our organizations?',
            description: '1 = Poor fit, 10 = Excellent fit',
            weight: 5,
            required: true,
            order: 2,
            minValue: 1,
            maxValue: 10
          },
          {
            type: 'CHECKBOX',
            text: 'Do you share our commitment to ethical business practices?',
            weight: 5,
            required: true,
            order: 3
          }
        ]
      }
    }
  });

  // Section 4: Operational Capacity (10 points)
  const section4 = await prisma.section.create({
    data: {
      title: 'Operational Capacity',
      description: 'Evaluate ability to execute and deliver',
      order: 4,
      maxScore: 10,
      questions: {
        create: [
          {
            type: 'NUMERIC_SCALE',
            text: 'How would you rate your team\'s capacity to take on this project?',
            description: '1 = Very limited, 10 = Fully available',
            weight: 5,
            required: true,
            order: 1,
            minValue: 1,
            maxValue: 10
          },
          {
            type: 'CHECKBOX',
            text: 'Do you have dedicated resources for this collaboration?',
            weight: 5,
            required: false,
            order: 2
          }
        ]
      }
    }
  });

  // Add conditional questions for dedicated resources
  const dedicatedResourcesQuestion = await prisma.question.findFirst({
    where: {
      sectionId: section4.id,
      text: { contains: 'dedicated resources' }
    }
  });

  if (dedicatedResourcesQuestion) {
    await prisma.question.createMany({
      data: [
        {
          sectionId: section4.id,
          type: 'CHECKBOX',
          text: 'Team Members',
          description: 'Will you have team members dedicated to this collaboration?',
          weight: 0,
          required: false,
          order: 3,
          showIfQuestionId: dedicatedResourcesQuestion.id,
          showIfValue: 'true'
        },
        {
          sectionId: section4.id,
          type: 'CHECKBOX',
          text: 'Other Resources',
          description: 'Do you have other resources to dedicate?',
          weight: 0,
          required: false,
          order: 6,
          showIfQuestionId: dedicatedResourcesQuestion.id,
          showIfValue: 'true'
        }
      ]
    });

    // Get the Team Members checkbox to add sub-questions
    const teamMembersQuestion = await prisma.question.findFirst({
      where: {
        sectionId: section4.id,
        text: 'Team Members'
      }
    });

    if (teamMembersQuestion) {
      await prisma.question.createMany({
        data: [
          {
            sectionId: section4.id,
            type: 'TEXT',
            text: 'Number of team members',
            description: 'How many team members will be dedicated?',
            weight: 0,
            required: false,
            order: 4,
            showIfQuestionId: teamMembersQuestion.id,
            showIfValue: 'true'
          },
          {
            sectionId: section4.id,
            type: 'TEXT',
            text: 'Hours per week',
            description: 'How many hours per week can they dedicate?',
            weight: 0,
            required: false,
            order: 5,
            showIfQuestionId: teamMembersQuestion.id,
            showIfValue: 'true'
          }
        ]
      });
    }

    // Get the Other Resources checkbox to add sub-question
    const otherResourcesQuestion = await prisma.question.findFirst({
      where: {
        sectionId: section4.id,
        text: 'Other Resources'
      }
    });

    if (otherResourcesQuestion) {
      await prisma.question.create({
        data: {
          sectionId: section4.id,
          type: 'TEXT',
          text: 'Please describe your other resources',
          description: 'What other resources can you dedicate to this collaboration?',
          weight: 0,
          required: false,
          order: 7,
          showIfQuestionId: otherResourcesQuestion.id,
          showIfValue: 'true'
        }
      });
    }
  }

  // Section 5: Compliance & Legal (10 points) - includes conditional compliance question
  const section5 = await prisma.section.create({
    data: {
      title: 'Compliance & Legal',
      description: 'Verify legal and compliance requirements',
      order: 5,
      maxScore: 10,
      questions: {
        create: [
          {
            type: 'CHECKBOX',
            text: 'Do you agree to comply with all applicable laws and regulations?',
            weight: 5,
            required: true,
            order: 1
          },
          {
            type: 'CHECKBOX',
            text: 'Do you agree to our standard terms and conditions?',
            weight: 5,
            required: true,
            order: 2
          }
        ]
      }
    }
  });

  // Add conditional compliance question
  const complianceQuestion = await prisma.question.findFirst({
    where: {
      sectionId: section5.id,
      text: { contains: 'comply with all applicable laws' }
    }
  });

  if (complianceQuestion) {
    await prisma.question.create({
      data: {
        sectionId: section5.id,
        type: 'TEXT',
        text: 'Please describe any compliance concerns or limitations.',
        description: 'This question appears if you indicated compliance concerns',
        weight: 0, // Informational only
        required: false,
        order: 3,
        showIfQuestionId: complianceQuestion.id,
        showIfValue: 'false'
      }
    });
  }

  console.log('Created sections:');
  console.log(`  - ${section1.title} (${section1.maxScore} points)`);
  console.log(`  - ${section2.title} (${section2.maxScore} points)`);
  console.log(`  - ${section3.title} (${section3.maxScore} points)`);
  console.log(`  - ${section4.title} (${section4.maxScore} points)`);
  console.log(`  - ${section5.title} (${section5.maxScore} points)`);

  const totalMaxScore = section1.maxScore + section2.maxScore + section3.maxScore + section4.maxScore + section5.maxScore;
  console.log(`\nTotal max score: ${totalMaxScore} points`);

  // Count questions
  const questionCount = await prisma.question.count();
  console.log(`Total questions created: ${questionCount}`);

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface JourneyStepTemplate {
  step: number;
  title: string;
  description: string;
  category: string;
  estimatedDuration: string;
  canBeRemote: boolean;
  requiresInPerson: boolean;
  preparationSteps: string[];
  whatToExpect: string;
  afterCare: string;
  iconName: string;
  patientTips: string[];
}

function generateJourneySteps(treatmentType: string = 'IVF'): JourneyStepTemplate[] {
  const baseSteps: JourneyStepTemplate[] = [
    {
      step: 1,
      title: "Initial Consultation",
      description: "Meet with your fertility specialist to discuss your medical history, concerns, and treatment options.",
      category: "consultation",
      estimatedDuration: "60-90 minutes",
      canBeRemote: true,
      requiresInPerson: false,
      preparationSteps: [
        "Gather all previous medical records",
        "List your questions and concerns",
        "Bring your partner if applicable",
        "Note your menstrual cycle patterns"
      ],
      whatToExpect: "Your doctor will review your history, perform a basic examination, and discuss potential treatment options. You'll have plenty of time for questions.",
      afterCare: "Schedule recommended tests and follow-up appointments",
      iconName: "UserCheck",
      patientTips: [
        "Write down questions beforehand",
        "Bring a support person if it helps",
        "Take notes during the consultation",
        "Don't hesitate to ask for clarification"
      ]
    },
    {
      step: 2,
      title: "Comprehensive Fertility Testing",
      description: "Complete blood work, imaging studies, and other tests to understand your fertility status.",
      category: "test",
      estimatedDuration: "2-3 weeks",
      canBeRemote: false,
      requiresInPerson: true,
      preparationSteps: [
        "Fast if blood work requires it",
        "Schedule tests for appropriate cycle days",
        "Arrange time off for appointments",
        "Drink water before ultrasounds"
      ],
      whatToExpect: "Multiple appointments for blood draws, ultrasounds, and possibly an HSG. Some tests may cause mild discomfort.",
      afterCare: "Rest if needed after procedures; results typically available in 1-2 weeks",
      iconName: "Activity",
      patientTips: [
        "Stay hydrated",
        "Bring headphones for relaxation",
        "Plan light activities after procedures",
        "Ask about pain management options"
      ]
    },
    {
      step: 3,
      title: "Treatment Planning Session",
      description: "Review test results and finalize your personalized treatment protocol.",
      category: "consultation",
      estimatedDuration: "45-60 minutes",
      canBeRemote: true,
      requiresInPerson: false,
      preparationSteps: [
        "Review your test results beforehand",
        "Research treatment options",
        "Prepare questions about the protocol",
        "Consider your schedule for treatment timing"
      ],
      whatToExpect: "Detailed discussion of your results, treatment options, success rates, and timeline. You'll receive your medication protocol.",
      afterCare: "Order medications and schedule medication training",
      iconName: "FileText",
      patientTips: [
        "Take detailed notes",
        "Ask about alternative protocols",
        "Understand the timeline fully",
        "Discuss backup plans"
      ]
    }
  ];

  const ivfSpecificSteps: JourneyStepTemplate[] = [
    {
      step: 4,
      title: "Medication Training",
      description: "Learn how to properly administer your fertility medications.",
      category: "medication",
      estimatedDuration: "30-45 minutes",
      canBeRemote: true,
      requiresInPerson: false,
      preparationSteps: [
        "Ensure medications have arrived",
        "Set up a clean injection area",
        "Have your partner present if helpful",
        "Prepare questions about techniques"
      ],
      whatToExpect: "Detailed demonstration of injection techniques, storage requirements, and what to do if you miss a dose.",
      afterCare: "Practice with saline if provided; set up medication schedule",
      iconName: "Syringe",
      patientTips: [
        "Practice on an orange first",
        "Set daily alarms for consistency",
        "Keep injection supplies organized",
        "Ice the area before injecting"
      ]
    },
    {
      step: 5,
      title: "Stimulation Phase Monitoring",
      description: "Regular monitoring appointments to track follicle development during medication phase.",
      category: "procedure",
      estimatedDuration: "15-20 minutes per visit",
      canBeRemote: false,
      requiresInPerson: true,
      preparationSteps: [
        "Take medications as scheduled",
        "Arrive with a full bladder for ultrasounds",
        "Track any symptoms or side effects",
        "Keep flexible schedule for appointments"
      ],
      whatToExpect: "Brief transvaginal ultrasounds and blood draws every 2-3 days to monitor response to medications.",
      afterCare: "Continue medications as directed; adjustments may be made based on results",
      iconName: "Monitor",
      patientTips: [
        "Wear comfortable clothing",
        "Stay hydrated",
        "Ask about follicle progress",
        "Be patient with scheduling changes"
      ]
    },
    {
      step: 6,
      title: "Egg Retrieval Procedure",
      description: "Minor surgical procedure to collect mature eggs for fertilization.",
      category: "procedure",
      estimatedDuration: "20-30 minutes",
      canBeRemote: false,
      requiresInPerson: true,
      preparationSteps: [
        "Fast after midnight before procedure",
        "Arrange transportation home",
        "Take prescribed pre-medications",
        "Remove nail polish and jewelry"
      ],
      whatToExpect: "Brief procedure under conscious sedation. You'll rest for 1-2 hours afterward before going home.",
      afterCare: "Rest for the remainder of the day; light activities the next day",
      iconName: "Target",
      patientTips: [
        "Bring comfortable clothes to change into",
        "Plan a restful day afterward",
        "Stay hydrated",
        "Take prescribed pain medication if needed"
      ]
    },
    {
      step: 7,
      title: "Embryo Transfer",
      description: "Placement of the embryo(s) into your uterus.",
      category: "procedure",
      estimatedDuration: "15-20 minutes",
      canBeRemote: false,
      requiresInPerson: true,
      preparationSteps: [
        "Drink water to fill bladder",
        "Take prescribed medications",
        "Arrive relaxed and on time",
        "Bring your partner if desired"
      ],
      whatToExpect: "A gentle procedure similar to a pap smear. You'll see the embryo on ultrasound as it's transferred.",
      afterCare: "Rest for 15-30 minutes, then resume normal activities with some restrictions",
      iconName: "Heart",
      patientTips: [
        "Visualize success during the procedure",
        "Ask to see the embryo on screen",
        "Plan something special for after",
        "Trust the process"
      ]
    },
    {
      step: 8,
      title: "Pregnancy Test",
      description: "Blood test to determine if the treatment was successful.",
      category: "test",
      estimatedDuration: "5-10 minutes",
      canBeRemote: false,
      requiresInPerson: true,
      preparationSteps: [
        "Avoid home pregnancy tests",
        "Continue medications as directed",
        "Plan for both possible outcomes",
        "Arrange support for results"
      ],
      whatToExpect: "A simple blood draw followed by a wait for results (usually same day).",
      afterCare: "Continue medications until instructed otherwise; celebrate your courage regardless of outcome",
      iconName: "TestTube",
      patientTips: [
        "Stay busy during the wait",
        "Have support available",
        "Remember you've been incredibly brave",
        "Focus on the present moment"
      ]
    }
  ];

  return treatmentType === 'IVF' ? [...baseSteps, ...ivfSpecificSteps] : baseSteps;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, treatmentType = 'IVF' } = body;

    if (!patientCode) {
      return NextResponse.json(
        { error: 'Patient code is required' },
        { status: 400 }
      );
    }

    // Find patient
    const patient = await prisma.patient.findUnique({
      where: { patientCode }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Delete existing journey steps for this patient
    await prisma.journeyStep.deleteMany({
      where: { patientId: patient.id }
    });

    // Generate new journey steps
    const stepTemplates = generateJourneySteps(treatmentType);

    // Save steps to database
    const savedSteps = [];
    for (const template of stepTemplates) {
      const savedStep = await prisma.journeyStep.create({
        data: {
          patientId: patient.id,
          step: template.step,
          title: template.title,
          description: template.description,
          category: template.category,
          estimatedDuration: template.estimatedDuration,
          canBeRemote: template.canBeRemote,
          requiresInPerson: template.requiresInPerson,
          preparationSteps: template.preparationSteps,
          whatToExpect: template.whatToExpect,
          afterCare: template.afterCare,
          iconName: template.iconName,
          patientTips: template.patientTips,
          status: template.step === 1 ? 'current' : 'upcoming'
        }
      });
      savedSteps.push(savedStep);
    }

    // Update patient journey progress
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        currentPhase: patient.currentPhase || 1,
        estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
      }
    });

    return NextResponse.json({
      success: true,
      journeySteps: savedSteps,
      totalSteps: savedSteps.length,
      currentStep: 1,
      treatmentType: treatmentType,
      message: `Journey steps generated for ${treatmentType} treatment`
    });

  } catch (error) {
    console.error('Error generating journey steps:', error);
    return NextResponse.json(
      { error: 'Failed to generate journey steps' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { stepId, status, completedDate } = body;

    if (!stepId || !status) {
      return NextResponse.json(
        { error: 'Step ID and status are required' },
        { status: 400 }
      );
    }

    // Update journey step
    const updatedStep = await prisma.journeyStep.update({
      where: { id: stepId },
      data: {
        status: status,
        completedDate: status === 'completed' ? (completedDate || new Date().toISOString()) : null
      }
    });

    return NextResponse.json({
      success: true,
      step: updatedStep,
      message: `Step marked as ${status}`
    });

  } catch (error) {
    console.error('Error updating journey step:', error);
    return NextResponse.json(
      { error: 'Failed to update journey step' },
      { status: 500 }
    );
  }
}

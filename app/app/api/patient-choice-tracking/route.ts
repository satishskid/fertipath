
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      patientCode,
      treatmentPathwayId,
      selectedOption,
      choiceReason,
      reasoning,
      confidence,
      costImportance,
      timelineImportance,
      successRateImportance,
      invasivenessImportance,
      alternativesConsidered,
      preferredStartDate,
      maxTimelineMonths,
      additionalConcerns,
      partnerInvolvement
    } = body;

    // Validation
    if (!patientCode) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Patient code is required',
          errorCode: 'MISSING_PATIENT_CODE'
        },
        { status: 400 }
      );
    }

    if (!selectedOption) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Selected treatment option is required',
          errorCode: 'MISSING_SELECTED_OPTION'
        },
        { status: 400 }
      );
    }

    // Find patient
    const patient = await prisma.patient.findUnique({
      where: { patientCode }
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient not found',
          errorCode: 'PATIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check if there's an existing choice for this patient
    const existingChoice = await prisma.patientChoice.findFirst({
      where: { 
        patientId: patient.id,
        status: { in: ['pending', 'confirmed'] }
      }
    });

    let patientChoice;

    if (existingChoice) {
      // Update existing choice
      patientChoice = await prisma.patientChoice.update({
        where: { id: existingChoice.id },
        data: {
          treatmentPathwayId,
          selectedOption,
          choiceReason,
          reasoning,
          confidence,
          costImportance,
          timelineImportance,
          successRateImportance,
          invasivenessImportance,
          alternativesConsidered,
          preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : null,
          maxTimelineMonths,
          additionalConcerns,
          partnerInvolvement,
          status: 'confirmed',
          lastModified: new Date()
        }
      });
    } else {
      // Create new choice
      patientChoice = await prisma.patientChoice.create({
        data: {
          patientId: patient.id,
          treatmentPathwayId: treatmentPathwayId || '',
          selectedOption,
          choiceReason,
          reasoning,
          confidence,
          costImportance,
          timelineImportance,
          successRateImportance,
          invasivenessImportance,
          alternativesConsidered,
          preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : null,
          maxTimelineMonths,
          additionalConcerns,
          partnerInvolvement,
          status: 'confirmed'
        }
      });
    }

    // Create a timeline event for this choice
    try {
      await prisma.timeline.create({
        data: {
          patientId: patient.id,
          date: new Date(),
          title: `Treatment Choice: ${selectedOption}`,
          category: 'consultation',
          details: `Patient selected ${selectedOption}. Reasoning: ${reasoning || 'Not specified'}`,
          sourceFile: 'Patient Choice',
          extractedData: {
            choice: selectedOption,
            reasons: choiceReason,
            confidence: confidence,
            preferences: {
              cost: costImportance,
              timeline: timelineImportance,
              success_rate: successRateImportance,
              invasiveness: invasivenessImportance
            }
          }
        }
      });
    } catch (timelineError) {
      console.error('Failed to create timeline event for choice:', timelineError);
      // Continue without timeline event
    }

    return NextResponse.json({
      success: true,
      patientChoice: {
        id: patientChoice.id,
        selectedOption: patientChoice.selectedOption,
        confidence: patientChoice.confidence,
        status: patientChoice.status,
        decisionDate: patientChoice.decisionDate
      },
      message: 'Patient choice recorded successfully'
    });

  } catch (error) {
    console.error('Error recording patient choice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to record patient choice',
      errorCode: 'CHOICE_RECORDING_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientCode = searchParams.get('patientCode');

    if (!patientCode) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Patient code is required',
          errorCode: 'MISSING_PATIENT_CODE'
        },
        { status: 400 }
      );
    }

    // Find patient with choices
    const patient = await prisma.patient.findUnique({
      where: { patientCode },
      include: {
        patientChoices: {
          orderBy: { decisionDate: 'desc' }
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient not found',
          errorCode: 'PATIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      patientChoices: patient.patientChoices,
      currentChoice: patient.patientChoices.find(choice => choice.status === 'confirmed') || null
    });

  } catch (error) {
    console.error('Error fetching patient choices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch patient choices',
      errorCode: 'FETCH_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}

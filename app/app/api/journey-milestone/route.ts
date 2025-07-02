
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      patientCode,
      milestoneType,
      title,
      description,
      category,
      expectedDate,
      actualDate,
      status,
      progressPercent,
      patientNotes,
      satisfactionScore,
      experienceRating,
      clinicalNotes,
      outcomes,
      complications,
      nextMilestone,
      preparationNeeded,
      adviceGiven,
      wasRemote,
      remoteSessionId
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

    if (!milestoneType) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Milestone type is required',
          errorCode: 'MISSING_MILESTONE_TYPE'
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Milestone title is required',
          errorCode: 'MISSING_TITLE'
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

    // Create journey milestone
    const journeyMilestone = await prisma.patientJourneyMilestone.create({
      data: {
        patientId: patient.id,
        milestoneType,
        title,
        description,
        category: category || 'milestone',
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        actualDate: actualDate ? new Date(actualDate) : null,
        status: status || 'upcoming',
        progressPercent: progressPercent || 0,
        patientNotes,
        satisfactionScore,
        experienceRating,
        clinicalNotes,
        outcomes: outcomes || null,
        complications,
        nextMilestone,
        preparationNeeded: preparationNeeded || null,
        adviceGiven,
        wasRemote: wasRemote === true,
        remoteSessionId
      }
    });

    // Create timeline event for this milestone
    try {
      await prisma.timeline.create({
        data: {
          patientId: patient.id,
          date: actualDate ? new Date(actualDate) : (expectedDate ? new Date(expectedDate) : new Date()),
          title: `Milestone: ${title}`,
          category: category || 'milestone',
          details: description || `${milestoneType} milestone reached`,
          sourceFile: 'Journey Milestone',
          extractedData: {
            milestone_type: milestoneType,
            status: status,
            progress: progressPercent,
            satisfaction: satisfactionScore,
            was_remote: wasRemote
          }
        }
      });
    } catch (timelineError) {
      console.error('Failed to create timeline event for milestone:', timelineError);
      // Continue without timeline event
    }

    return NextResponse.json({
      success: true,
      journeyMilestone: {
        id: journeyMilestone.id,
        milestoneType: journeyMilestone.milestoneType,
        title: journeyMilestone.title,
        status: journeyMilestone.status,
        progressPercent: journeyMilestone.progressPercent,
        createdAt: journeyMilestone.createdAt
      },
      message: 'Journey milestone created successfully'
    });

  } catch (error) {
    console.error('Error creating journey milestone:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create journey milestone',
      errorCode: 'MILESTONE_CREATION_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientCode = searchParams.get('patientCode');
    const status = searchParams.get('status');

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

    // Find patient with journey milestones
    const patient = await prisma.patient.findUnique({
      where: { patientCode },
      include: {
        journeyMilestones: {
          where: status ? { status } : {},
          orderBy: [
            { expectedDate: 'asc' },
            { createdAt: 'asc' }
          ]
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

    // Calculate overall progress
    const totalMilestones = patient.journeyMilestones.length;
    const completedMilestones = patient.journeyMilestones.filter((m: any) => m.status === 'completed').length;
    const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return NextResponse.json({
      success: true,
      journeyMilestones: patient.journeyMilestones,
      progress: {
        total: totalMilestones,
        completed: completedMilestones,
        percentage: overallProgress
      }
    });

  } catch (error) {
    console.error('Error fetching journey milestones:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch journey milestones',
      errorCode: 'FETCH_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      milestoneId,
      status,
      actualDate,
      progressPercent,
      patientNotes,
      satisfactionScore,
      experienceRating,
      clinicalNotes,
      outcomes,
      complications
    } = body;

    if (!milestoneId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Milestone ID is required',
          errorCode: 'MISSING_MILESTONE_ID'
        },
        { status: 400 }
      );
    }

    // Update journey milestone
    const updatedMilestone = await prisma.patientJourneyMilestone.update({
      where: { id: milestoneId },
      data: {
        status: status || undefined,
        actualDate: actualDate ? new Date(actualDate) : undefined,
        progressPercent: progressPercent !== undefined ? progressPercent : undefined,
        patientNotes: patientNotes || undefined,
        satisfactionScore: satisfactionScore || undefined,
        experienceRating: experienceRating || undefined,
        clinicalNotes: clinicalNotes || undefined,
        outcomes: outcomes || undefined,
        complications: complications || undefined
      }
    });

    return NextResponse.json({
      success: true,
      journeyMilestone: updatedMilestone,
      message: 'Journey milestone updated successfully'
    });

  } catch (error) {
    console.error('Error updating journey milestone:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update journey milestone',
      errorCode: 'UPDATE_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}

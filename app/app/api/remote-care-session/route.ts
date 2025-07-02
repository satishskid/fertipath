
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      patientCode,
      sessionType,
      title,
      description,
      category,
      canBeRemote,
      requiresInPerson,
      uploadedFiles,
      scheduledDate,
      priority
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

    if (!sessionType) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Session type is required',
          errorCode: 'MISSING_SESSION_TYPE'
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Session title is required',
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

    // Create remote care session
    const remoteCareSession = await prisma.remoteCareSession.create({
      data: {
        patientId: patient.id,
        sessionType,
        title,
        description,
        category: category || 'monitoring',
        canBeRemote: canBeRemote !== false, // Default to true
        requiresInPerson: requiresInPerson === true, // Default to false
        uploadedFiles: uploadedFiles || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        priority: priority || 'normal',
        status: 'pending'
      }
    });

    // Create a timeline event for this session
    try {
      await prisma.timeline.create({
        data: {
          patientId: patient.id,
          date: scheduledDate ? new Date(scheduledDate) : new Date(),
          title: `Remote Care: ${title}`,
          category: category || 'consultation',
          details: description || `${sessionType} session scheduled`,
          sourceFile: 'Remote Care Session',
          extractedData: {
            session_type: sessionType,
            can_be_remote: canBeRemote,
            requires_in_person: requiresInPerson,
            priority: priority
          }
        }
      });
    } catch (timelineError) {
      console.error('Failed to create timeline event for remote care session:', timelineError);
      // Continue without timeline event
    }

    return NextResponse.json({
      success: true,
      remoteCareSession: {
        id: remoteCareSession.id,
        sessionType: remoteCareSession.sessionType,
        title: remoteCareSession.title,
        status: remoteCareSession.status,
        scheduledDate: remoteCareSession.scheduledDate,
        canBeRemote: remoteCareSession.canBeRemote
      },
      message: 'Remote care session created successfully'
    });

  } catch (error) {
    console.error('Error creating remote care session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create remote care session',
      errorCode: 'SESSION_CREATION_ERROR',
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

    // Find patient with remote care sessions
    const patient = await prisma.patient.findUnique({
      where: { patientCode },
      include: {
        remoteCareSession: {
          where: status ? { status } : {},
          orderBy: { createdAt: 'desc' }
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
      remoteCareSession: patient.remoteCareSession,
      total: patient.remoteCareSession.length
    });

  } catch (error) {
    console.error('Error fetching remote care sessions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch remote care sessions',
      errorCode: 'FETCH_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sessionId,
      status,
      reviewedBy,
      providerNotes,
      recommendations,
      followUpRequired,
      followUpType,
      followUpDate,
      priority
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Session ID is required',
          errorCode: 'MISSING_SESSION_ID'
        },
        { status: 400 }
      );
    }

    // Update remote care session
    const updatedSession = await prisma.remoteCareSession.update({
      where: { id: sessionId },
      data: {
        status: status || undefined,
        reviewedBy: reviewedBy || undefined,
        reviewedAt: reviewedBy ? new Date() : undefined,
        providerNotes: providerNotes || undefined,
        recommendations: recommendations || undefined,
        followUpRequired: followUpRequired !== undefined ? followUpRequired : undefined,
        followUpType: followUpType || undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        priority: priority || undefined,
        completedDate: status === 'completed' ? new Date() : undefined
      }
    });

    return NextResponse.json({
      success: true,
      remoteCareSession: updatedSession,
      message: 'Remote care session updated successfully'
    });

  } catch (error) {
    console.error('Error updating remote care session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update remote care session',
      errorCode: 'UPDATE_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}


export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId') || 'default_provider';
    const urgencyFilter = searchParams.get('urgency');
    const statusFilter = searchParams.get('status');

    // Get all remote care sessions that need provider attention
    const remoteCareQuery: any = {
      where: {},
      include: {
        patient: {
          select: {
            patientCode: true,
            femaleAge: true,
            currentPhase: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    };

    if (urgencyFilter) {
      remoteCareQuery.where.priority = urgencyFilter;
    }

    if (statusFilter) {
      remoteCareQuery.where.status = statusFilter;
    }

    const pendingRemoteSessions = await prisma.remoteCareSession.findMany(remoteCareQuery);

    // Get recent provider reviews
    const recentReviews = await prisma.providerReview.findMany({
      where: {
        providerId: providerId
      },
      include: {
        patient: {
          select: {
            patientCode: true,
            femaleAge: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Get patients requiring urgent attention
    const urgentPatients = await prisma.patient.findMany({
      where: {
        remoteCareSession: {
          some: {
            priority: 'urgent',
            status: { in: ['pending', 'requires_attention'] }
          }
        }
      },
      include: {
        remoteCareSession: {
          where: {
            priority: 'urgent',
            status: { in: ['pending', 'requires_attention'] }
          }
        }
      },
      take: 10
    });

    // Get summary statistics
    const stats = {
      pending_sessions: await prisma.remoteCareSession.count({
        where: { status: 'pending' }
      }),
      urgent_sessions: await prisma.remoteCareSession.count({
        where: { priority: 'urgent', status: { not: 'completed' } }
      }),
      completed_today: await prisma.remoteCareSession.count({
        where: {
          status: 'completed',
          completedDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      total_patients: await prisma.patient.count(),
      reviews_pending: await prisma.providerReview.count({
        where: { status: 'draft' }
      })
    };

    // Get recent medical files that need review
    const filesNeedingReview = await prisma.medicalFile.findMany({
      where: {
        analysisStatus: { in: ['failed', 'completed'] },
        // Files uploaded in last 7 days
        uploadedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        patient: {
          select: {
            patientCode: true,
            femaleAge: true
          }
        }
      },
      orderBy: { uploadedAt: 'desc' },
      take: 15
    });

    return NextResponse.json({
      success: true,
      dashboard: {
        pending_remote_sessions: pendingRemoteSessions,
        recent_reviews: recentReviews,
        urgent_patients: urgentPatients,
        files_needing_review: filesNeedingReview,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Error fetching provider dashboard:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch provider dashboard',
      errorCode: 'DASHBOARD_FETCH_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      patientCode,
      providerId,
      providerName,
      providerRole,
      reviewType,
      title,
      findings,
      recommendations,
      reviewedFileIds,
      urgencyLevel,
      actionRequired,
      actionItems,
      treatmentChanges,
      newRecommendations
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

    if (!providerId || !providerName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Provider ID and name are required',
          errorCode: 'MISSING_PROVIDER_INFO'
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

    // Create provider review
    const providerReview = await prisma.providerReview.create({
      data: {
        patientId: patient.id,
        providerId,
        providerName,
        providerRole: providerRole || 'doctor',
        reviewType: reviewType || 'file_review',
        title: title || 'Provider Review',
        findings,
        recommendations,
        reviewedFileIds: reviewedFileIds || [],
        urgencyLevel: urgencyLevel || 'normal',
        actionRequired: actionRequired === true,
        actionItems: actionItems || [],
        treatmentChanges: treatmentChanges === true,
        newRecommendations: newRecommendations || null,
        status: 'submitted'
      }
    });

    // Create timeline event for this review
    try {
      await prisma.timeline.create({
        data: {
          patientId: patient.id,
          date: new Date(),
          title: `Provider Review: ${title}`,
          category: 'consultation',
          details: findings || 'Provider review completed',
          sourceFile: 'Provider Review',
          extractedData: {
            provider: providerName,
            urgency: urgencyLevel,
            action_required: actionRequired,
            treatment_changes: treatmentChanges
          }
        }
      });
    } catch (timelineError) {
      console.error('Failed to create timeline event for provider review:', timelineError);
      // Continue without timeline event
    }

    return NextResponse.json({
      success: true,
      providerReview: {
        id: providerReview.id,
        title: providerReview.title,
        urgencyLevel: providerReview.urgencyLevel,
        actionRequired: providerReview.actionRequired,
        createdAt: providerReview.createdAt
      },
      message: 'Provider review created successfully'
    });

  } catch (error) {
    console.error('Error creating provider review:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create provider review',
      errorCode: 'REVIEW_CREATION_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}

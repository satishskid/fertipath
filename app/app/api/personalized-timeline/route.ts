
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Generate personalized timeline using AI
async function generateTimelineWithAI(
  treatmentPath: string, 
  patientProfile: any,
  patientChoice: any
): Promise<any> {
  try {
    const aiRequest = {
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: `Generate a detailed, personalized fertility treatment timeline for:

Treatment Path: ${treatmentPath}
Patient Profile: ${JSON.stringify(patientProfile)}
Patient Choice Details: ${JSON.stringify(patientChoice)}

Create a comprehensive timeline with:
1. Multiple phases (preparation, treatment cycles, monitoring, follow-up)
2. Specific milestones with dates
3. Patient-specific advice for each phase
4. Preparation requirements
5. Recovery guidance

Consider:
- Patient age and medical history
- Chosen treatment preferences
- Timeline preferences
- Specific concerns mentioned

Return structured JSON with:
{
  "total_duration": "3-4 months",
  "phases": [
    {
      "phase_name": "Preparation Phase",
      "duration": "2-3 weeks", 
      "start_offset_days": 0,
      "tasks": [
        {
          "task": "Initial consultation",
          "timeline": "Day 1-3",
          "category": "consultation",
          "can_be_remote": false,
          "preparation": ["Bring medical records", "List current medications"],
          "what_to_expect": "Detailed discussion of treatment plan"
        }
      ],
      "advice": "Focus on lifestyle optimization during this phase"
    }
  ],
  "milestones": [
    {
      "milestone": "Treatment Start",
      "expected_day": 21,
      "category": "treatment",
      "importance": "high"
    }
  ],
  "phase_advice": {
    "preparation": "Tips for preparation phase",
    "treatment": "Tips for treatment phase",
    "recovery": "Tips for recovery"
  },
  "personalized_tips": [
    "Based on your age, consider...",
    "Given your preference for minimal invasiveness..."
  ]
}

Respond with raw JSON only.`
        }
      ],
      response_format: { type: "json_object" }
    };

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify(aiRequest),
    });

    if (!response.ok) {
      throw new Error(`AI API failed with status ${response.status}`);
    }

    const aiResult = await response.json();
    let jsonContent = aiResult.choices[0].message.content.trim();
    
    // Clean up JSON response
    jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('AI timeline generation error:', error);
    
    // Return basic fallback timeline
    return {
      total_duration: "3-4 months",
      phases: [
        {
          phase_name: "Preparation Phase",
          duration: "2-3 weeks",
          start_offset_days: 0,
          tasks: [
            {
              task: "Initial consultation and assessment",
              timeline: "Week 1",
              category: "consultation",
              can_be_remote: false,
              preparation: ["Gather medical records", "List current medications"],
              what_to_expect: "Comprehensive fertility assessment"
            }
          ],
          advice: "Focus on optimizing health and preparing for treatment"
        },
        {
          phase_name: `${treatmentPath} Treatment Phase`,
          duration: "4-6 weeks",
          start_offset_days: 21,
          tasks: [
            {
              task: "Begin treatment protocol",
              timeline: "Week 4",
              category: "treatment",
              can_be_remote: false,
              preparation: ["Follow medication schedule", "Attend monitoring appointments"],
              what_to_expect: "Regular monitoring and treatment procedures"
            }
          ],
          advice: "Maintain medication schedule and attend all monitoring appointments"
        }
      ],
      milestones: [
        {
          milestone: "Treatment Start",
          expected_day: 21,
          category: "treatment",
          importance: "high"
        },
        {
          milestone: "Pregnancy Test",
          expected_day: 70,
          category: "test",
          importance: "high"
        }
      ],
      phase_advice: {
        preparation: "Use this time to optimize your health and prepare mentally for treatment",
        treatment: "Stay consistent with medications and communicate any concerns with your team",
        recovery: "Allow time for physical and emotional recovery regardless of outcome"
      },
      personalized_tips: [
        "Timeline generated successfully but AI customization temporarily unavailable",
        "Please consult with your healthcare provider for personalized advice"
      ]
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      patientCode,
      treatmentPathway,
      startDate,
      patientPreferences
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

    if (!treatmentPathway) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Treatment pathway is required',
          errorCode: 'MISSING_TREATMENT_PATHWAY'
        },
        { status: 400 }
      );
    }

    // Find patient with related data
    const patient = await prisma.patient.findUnique({
      where: { patientCode },
      include: {
        patientChoices: {
          where: { status: 'confirmed' },
          orderBy: { decisionDate: 'desc' },
          take: 1
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

    // Prepare patient profile for AI
    const patientProfile = {
      age: patient.femaleAge,
      medical_history: {
        fertility_history: patient.fertilityHistory,
        conditions: patient.femaleConditions,
        time_trying: patient.timeTrying,
        previous_treatments: patient.previousTreatments
      },
      lifestyle: patient.femaleLifestyle,
      emotional_state: patient.emotionalState,
      financial_comfort: patient.financialComfort
    };

    const patientChoice = patient.patientChoices[0] || null;

    console.log('Generating personalized timeline with AI...');
    const aiTimeline = await generateTimelineWithAI(treatmentPathway, patientProfile, patientChoice);

    // Calculate dates based on start date
    const timelineStartDate = startDate ? new Date(startDate) : new Date();
    const estimatedEndDate = new Date(timelineStartDate);
    
    // Add estimated duration (extract months from total_duration)
    const durationMatch = aiTimeline.total_duration?.match(/(\d+)-?(\d+)?\s*months?/);
    const estimatedMonths = durationMatch ? parseInt(durationMatch[2] || durationMatch[1]) : 4;
    estimatedEndDate.setMonth(estimatedEndDate.getMonth() + estimatedMonths);

    // Check for existing timeline and update or create new
    const existingTimeline = await prisma.personalizedTimeline.findFirst({
      where: { 
        patientId: patient.id,
        treatmentPathway,
        isActive: true
      }
    });

    let personalizedTimeline;

    if (existingTimeline) {
      // Update existing timeline
      personalizedTimeline = await prisma.personalizedTimeline.update({
        where: { id: existingTimeline.id },
        data: {
          totalDuration: aiTimeline.total_duration,
          startDate: timelineStartDate,
          estimatedEndDate: estimatedEndDate,
          phases: aiTimeline.phases,
          milestones: aiTimeline.milestones,
          patientAge: parseInt(patient.femaleAge || '0') || null,
          medicalHistory: patientProfile.medical_history,
          selectedOptions: patientChoice,
          phaseAdvice: aiTimeline.phase_advice,
          preparationTips: aiTimeline.personalized_tips,
          status: 'active'
        }
      });
    } else {
      // Create new timeline
      personalizedTimeline = await prisma.personalizedTimeline.create({
        data: {
          patientId: patient.id,
          treatmentPathway,
          totalDuration: aiTimeline.total_duration,
          startDate: timelineStartDate,
          estimatedEndDate: estimatedEndDate,
          phases: aiTimeline.phases,
          milestones: aiTimeline.milestones,
          patientAge: parseInt(patient.femaleAge || '0') || null,
          medicalHistory: patientProfile.medical_history,
          selectedOptions: patientChoice,
          currentPhase: aiTimeline.phases[0]?.phase_name || 'Preparation',
          phaseAdvice: aiTimeline.phase_advice,
          preparationTips: aiTimeline.personalized_tips,
          status: 'active'
        }
      });
    }

    return NextResponse.json({
      success: true,
      timeline: personalizedTimeline,
      aiGenerated: true,
      message: 'Personalized timeline generated successfully'
    });

  } catch (error) {
    console.error('Error generating personalized timeline:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate personalized timeline',
      errorCode: 'TIMELINE_GENERATION_ERROR',
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

    // Find patient with timelines
    const patient = await prisma.patient.findUnique({
      where: { patientCode },
      include: {
        personalizedTimelines: {
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

    const activeTimeline = patient.personalizedTimelines.find(t => t.isActive && t.status === 'active');

    return NextResponse.json({
      success: true,
      timelines: patient.personalizedTimelines,
      activeTimeline: activeTimeline || null
    });

  } catch (error) {
    console.error('Error fetching personalized timelines:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch personalized timelines',
      errorCode: 'FETCH_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}

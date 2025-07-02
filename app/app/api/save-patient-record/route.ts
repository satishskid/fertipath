
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientProfile, treatmentPathways, selectedPathway } = await request.json();

    if (!patientProfile || !patientProfile.patientCode) {
      return NextResponse.json(
        { error: 'Patient profile and code are required' },
        { status: 400 }
      );
    }

    // Save patient record to database
    const savedPatient = await prisma.patient.upsert({
      where: {
        patientCode: patientProfile.patientCode,
      },
      update: {
        femaleAge: patientProfile.femaleProfile.age,
        femaleCycle: patientProfile.femaleProfile.cycle,
        femaleConditions: patientProfile.femaleProfile.conditions || [],
        femaleLifestyle: patientProfile.femaleProfile.lifestyle || {},
        maleAge: patientProfile.maleProfile.age,
        maleConditions: patientProfile.maleProfile.conditions || [],
        timeTrying: patientProfile.coupleHistory.timeTrying,
        previousTreatments: patientProfile.coupleHistory.previousTreatments,
        fertilityHistory: patientProfile.coupleHistory || {},
        emotionalState: patientProfile.holistic.emotionalState,
        financialComfort: patientProfile.holistic.financialComfort,
        updatedAt: new Date(),
      },
      create: {
        patientCode: patientProfile.patientCode,
        femaleAge: patientProfile.femaleProfile.age,
        femaleCycle: patientProfile.femaleProfile.cycle,
        femaleConditions: patientProfile.femaleProfile.conditions || [],
        femaleLifestyle: patientProfile.femaleProfile.lifestyle || {},
        maleAge: patientProfile.maleProfile.age,
        maleConditions: patientProfile.maleProfile.conditions || [],
        timeTrying: patientProfile.coupleHistory.timeTrying,
        previousTreatments: patientProfile.coupleHistory.previousTreatments,
        fertilityHistory: patientProfile.coupleHistory || {},
        emotionalState: patientProfile.holistic.emotionalState,
        financialComfort: patientProfile.holistic.financialComfort,
      },
    });

    // Save treatment pathways
    if (treatmentPathways && treatmentPathways.length > 0) {
      // Delete existing pathways for this patient
      await prisma.treatmentPathway.deleteMany({
        where: {
          patientId: savedPatient.id,
        },
      });

      // Create new pathways
      for (const pathway of treatmentPathways) {
        await prisma.treatmentPathway.create({
          data: {
            patientId: savedPatient.id,
            name: pathway.name,
            description: pathway.description,
            successRate: pathway.successRate,
            timeline: pathway.timeline,
            costMin: pathway.costMin,
            costMax: pathway.costMax,
            suitability: pathway.suitability,
            pros: pathway.pros || [],
            cons: pathway.cons || [],
            recommendation: pathway.recommendation,
            priority: pathway.priority || 0,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      patientId: savedPatient.id,
      patientCode: savedPatient.patientCode,
      message: 'Patient record saved successfully',
    });

  } catch (error) {
    console.error('Error saving patient record:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to save patient record. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

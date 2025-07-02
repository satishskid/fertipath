
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, interfaceMode } = body;

    if (!patientCode) {
      return NextResponse.json(
        { error: 'Patient code is required' },
        { status: 400 }
      );
    }

    if (!interfaceMode || !['patient', 'doctor'].includes(interfaceMode)) {
      return NextResponse.json(
        { error: 'Valid interface mode is required (patient or doctor)' },
        { status: 400 }
      );
    }

    // Find and update patient
    const patient = await prisma.patient.findUnique({
      where: { patientCode }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Update interface mode
    const updatedPatient = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        interfaceMode: interfaceMode
      }
    });

    return NextResponse.json({
      success: true,
      interfaceMode: updatedPatient.interfaceMode,
      message: `Interface switched to ${interfaceMode} mode`
    });

  } catch (error) {
    console.error('Error toggling interface mode:', error);
    return NextResponse.json(
      { error: 'Failed to toggle interface mode' },
      { status: 500 }
    );
  }
}


export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Enhanced AI text parsing for medical data
async function parseDataWithAI(text: string, entryType: string): Promise<any> {
  try {
    const aiRequest = {
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: `Parse this medical data and extract structured information. This appears to be ${entryType} type data.

Original text:
${text}

Extract relevant medical information and return structured JSON. For different types:
- lab_results: Extract test names, values, units, reference ranges, dates
- ultrasound: Extract measurements, findings, dates
- consultation_notes: Extract symptoms, diagnoses, recommendations, dates
- sperm_analysis: Extract counts, motility, morphology values
- hormone_levels: Extract hormone names, values, units, reference ranges

Return structured data with these fields:
{
  "extracted_data": {
    "date": "test/procedure date if found",
    "type": "specific test type",
    "values": [
      {
        "parameter": "name",
        "value": "numerical value",
        "unit": "unit",
        "reference_range": "normal range if available",
        "status": "normal/high/low/abnormal"
      }
    ],
    "findings": "key findings or observations",
    "recommendations": "any recommendations mentioned",
    "facility": "lab/clinic name if mentioned",
    "doctor": "doctor name if mentioned"
  },
  "confidence": 0.8,
  "data_quality": "good/fair/poor",
  "missing_info": ["list of missing important info"]
}

Respond with raw JSON only. Do not include code blocks.`
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
    console.error('AI parsing error:', error);
    // Return basic structured fallback
    return {
      extracted_data: {
        date: new Date().toISOString().split('T')[0],
        type: entryType,
        values: [],
        findings: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        recommendations: 'Manual review recommended'
      },
      confidence: 0.1,
      data_quality: 'poor',
      missing_info: ['AI parsing failed - manual entry required']
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      patientCode, 
      entryType, 
      sourceType, 
      originalText, 
      structuredData,
      testDate,
      facilityName,
      doctorName 
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

    if (!entryType) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Entry type is required',
          errorCode: 'MISSING_ENTRY_TYPE'
        },
        { status: 400 }
      );
    }

    if (!originalText && !structuredData) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Either original text or structured data is required',
          errorCode: 'MISSING_DATA'
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

    let finalStructuredData = structuredData;
    let aiExtracted = null;
    let confidence = 1.0;

    // If we have original text, parse it with AI
    if (originalText && !structuredData) {
      console.log('Parsing text with AI...');
      const aiResult = await parseDataWithAI(originalText, entryType);
      aiExtracted = aiResult;
      finalStructuredData = aiResult.extracted_data;
      confidence = aiResult.confidence || 0.5;
    }

    // Create manual data entry record
    const dataEntry = await prisma.manualDataEntry.create({
      data: {
        patientId: patient.id,
        entryType,
        sourceType: sourceType || 'manual_entry',
        originalText,
        structuredData: finalStructuredData,
        aiProcessed: !!originalText,
        aiExtracted,
        confidence,
        testDate: testDate ? new Date(testDate) : null,
        facilityName,
        doctorName
      }
    });

    // Create timeline event if structured data has date and findings
    let timelineEvent = null;
    if (finalStructuredData?.date && finalStructuredData?.findings) {
      try {
        timelineEvent = await prisma.timeline.create({
          data: {
            patientId: patient.id,
            date: new Date(finalStructuredData.date),
            title: `${entryType.replace('_', ' ')} - Manual Entry`,
            category: entryType === 'lab_results' ? 'lab_results' : 'consultation',
            details: finalStructuredData.findings,
            sourceFile: 'Manual Data Entry',
            extractedData: finalStructuredData
          }
        });

        // Update the data entry with timeline reference
        await prisma.manualDataEntry.update({
          where: { id: dataEntry.id },
          data: { timelineEventId: timelineEvent.id }
        });
      } catch (timelineError) {
        console.error('Failed to create timeline event:', timelineError);
        // Continue without timeline event
      }
    }

    return NextResponse.json({
      success: true,
      dataEntry: {
        id: dataEntry.id,
        entryType: dataEntry.entryType,
        confidence: dataEntry.confidence,
        aiProcessed: dataEntry.aiProcessed
      },
      structuredData: finalStructuredData,
      timelineCreated: !!timelineEvent,
      message: 'Data entry created successfully'
    });

  } catch (error) {
    console.error('Error creating manual data entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create data entry',
      errorCode: 'CREATION_ERROR',
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

    // Find patient
    const patient = await prisma.patient.findUnique({
      where: { patientCode },
      include: {
        manualDataEntries: {
          orderBy: { entryDate: 'desc' },
          take: 50 // Limit to recent entries
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
      dataEntries: patient.manualDataEntries,
      total: patient.manualDataEntries.length
    });

  } catch (error) {
    console.error('Error fetching manual data entries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data entries',
      errorCode: 'FETCH_ERROR',
      details: errorMessage
    }, { status: 500 });
  }
}

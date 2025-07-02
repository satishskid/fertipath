
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Enhanced file type validation and sanitization
const SUPPORTED_FILE_TYPES = {
  // Images (including WhatsApp images)
  'image/jpeg': { extension: 'jpg', category: 'image' },
  'image/jpg': { extension: 'jpg', category: 'image' },
  'image/png': { extension: 'png', category: 'image' },
  'image/gif': { extension: 'gif', category: 'image' },
  'image/webp': { extension: 'webp', category: 'image' },
  'image/heic': { extension: 'heic', category: 'image' },
  'image/heif': { extension: 'heif', category: 'image' },
  'image/bmp': { extension: 'bmp', category: 'image' },
  'image/tiff': { extension: 'tiff', category: 'image' },
  
  // Documents
  'application/pdf': { extension: 'pdf', category: 'document' },
  'application/msword': { extension: 'doc', category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { extension: 'docx', category: 'document' },
  'text/plain': { extension: 'txt', category: 'document' },
  'application/rtf': { extension: 'rtf', category: 'document' },
  
  // Spreadsheets
  'application/vnd.ms-excel': { extension: 'xls', category: 'document' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { extension: 'xlsx', category: 'document' },
  'text/csv': { extension: 'csv', category: 'document' },
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

function sanitizeFilename(filename: string): string {
  // Handle WhatsApp images and other files with special characters
  // Remove or replace problematic characters while preserving readability
  return filename
    .replace(/[^\w\s.-]/g, '_') // Replace special chars with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}

function detectFileCategory(filename: string, mimeType: string): string {
  const lowerFilename = filename.toLowerCase();
  
  // Check for WhatsApp images
  if (lowerFilename.includes('whatsapp')) {
    return 'whatsapp_image';
  }
  
  // Check for specific medical document types
  if (lowerFilename.includes('ultrasound') || lowerFilename.includes('usg') || lowerFilename.includes('sonography')) {
    return 'ultrasound';
  }
  
  if (lowerFilename.includes('sperm') || lowerFilename.includes('semen') || lowerFilename.includes('semenogram')) {
    return 'sperm_analysis';
  }
  
  if (lowerFilename.includes('embryo') || lowerFilename.includes('blastocyst')) {
    return 'embryo_image';
  }
  
  if (lowerFilename.includes('lab') || lowerFilename.includes('blood') || lowerFilename.includes('hormone')) {
    return 'lab_results';
  }
  
  // Fall back to MIME type category
  const fileInfo = SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES];
  return fileInfo?.category === 'image' ? 'medical_image' : 'document';
}

export async function POST(request: NextRequest) {
  const processingStartTime = Date.now();
  let uploadedFile = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const patientCode = formData.get('patientCode') as string;

    // Enhanced validation
    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No file provided',
          errorCode: 'MISSING_FILE',
          details: 'Please select a file to upload'
        },
        { status: 400 }
      );
    }

    if (!patientCode) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Patient code is required',
          errorCode: 'MISSING_PATIENT_CODE',
          details: 'Patient identification is required for file processing'
        },
        { status: 400 }
      );
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'File too large',
          errorCode: 'FILE_TOO_LARGE',
          details: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
        },
        { status: 400 }
      );
    }

    // Enhanced MIME type validation
    const detectedMimeType = file.type || 'application/octet-stream';
    const supportedType = SUPPORTED_FILE_TYPES[detectedMimeType as keyof typeof SUPPORTED_FILE_TYPES];
    
    if (!supportedType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported file type',
          errorCode: 'UNSUPPORTED_FILE_TYPE',
          details: `File type "${detectedMimeType}" is not supported. Supported types: ${Object.keys(SUPPORTED_FILE_TYPES).join(', ')}`
        },
        { status: 400 }
      );
    }

    // Sanitize filename for storage and processing
    const originalFileName = file.name;
    const sanitizedFileName = sanitizeFilename(originalFileName);
    const fileCategory = detectFileCategory(originalFileName, detectedMimeType);

    // Find patient
    const patient = await prisma.patient.findUnique({
      where: { patientCode }
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient not found',
          errorCode: 'PATIENT_NOT_FOUND',
          details: `No patient found with code: ${patientCode}`
        },
        { status: 404 }
      );
    }

    // Convert file to buffer for AI processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save file record to database first
    uploadedFile = await prisma.medicalFile.create({
      data: {
        patientId: patient.id,
        fileName: sanitizedFileName,
        originalFileName: originalFileName,
        fileType: detectedMimeType,
        fileSize: file.size,
        fileUrl: `temp://${sanitizedFileName}`, // Temporary URL
        category: fileCategory,
        analysisStatus: 'processing'
      }
    });

    // Enhanced AI request based on file type
    let aiRequest;
    
    if (supportedType.category === 'image') {
      // For images (including WhatsApp images)
      aiRequest = {
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this medical image and extract relevant information. This appears to be a ${fileCategory} type image.
                
                For medical images, please extract:
                1. Date of the scan/procedure (if visible)
                2. Type of medical examination (ultrasound, X-ray, lab report photo, etc.)
                3. Key measurements, values, or findings
                4. Any visible annotations or medical observations
                5. Patient information (if visible and appropriate)
                6. Clinical recommendations or next steps mentioned
                
                If this is a WhatsApp image of a medical document, focus on extracting the text content and medical data.
                
                Return structured data that can be used to create a medical timeline entry. Respond with raw JSON only.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${detectedMimeType};base64,${buffer.toString('base64')}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      };
    } else {
      // For documents (PDF, DOC, etc.)
      aiRequest = {
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this medical document and extract key information to create a structured timeline entry.
                
                Extract:
                1. Date of the document/procedure
                2. Type of document (consultation notes, lab results, ultrasound report, treatment summary, etc.)
                3. Key findings, values, or measurements
                4. Important notes, observations, or recommendations
                5. Patient information and demographics
                6. Healthcare provider information
                7. Next steps or follow-up recommendations
                
                Focus on creating accurate timeline data that will help track the patient's fertility journey.
                Return structured data. Respond with raw JSON only.`
              },
              {
                type: 'file',
                file: {
                  filename: sanitizedFileName,
                  file_data: `data:${detectedMimeType};base64,${buffer.toString('base64')}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      };
    }

    // Call AI API with enhanced error handling
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify(aiRequest),
    });

    let aiResult, extractedData;
    const processingTime = Date.now() - processingStartTime;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API failed with status ${response.status}: ${errorText}`);
    }

    try {
      aiResult = await response.json();
      
      if (!aiResult.choices?.[0]?.message?.content) {
        throw new Error('Invalid AI response format');
      }

      // Robust JSON parsing with cleanup
      let jsonContent = aiResult.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      // Remove any trailing commas and fix common JSON issues
      jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
      
      extractedData = JSON.parse(jsonContent);
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      
      // Create fallback structured data
      extractedData = {
        date: new Date().toISOString().split('T')[0],
        type: fileCategory.replace('_', ' '),
        category: 'consultation',
        findings: `Document uploaded successfully. Original filename: ${originalFileName}`,
        notes: 'AI processing encountered an issue, but file was uploaded successfully.',
        confidence: 0.5
      };
    }

    // Create timeline events from extracted data
    const timelineEvents = [];
    if (extractedData) {
      timelineEvents.push({
        id: Math.random().toString(36).substr(2, 9),
        date: extractedData.date || new Date().toISOString().split('T')[0],
        title: extractedData.title || `${extractedData.type || fileCategory} - ${originalFileName}`,
        category: extractedData.category || 'consultation',
        details: extractedData.details || extractedData.findings || 'Medical document processed',
        sourceFile: originalFileName,
        extractedData: extractedData
      });
    }

    // Update file record with results
    await prisma.medicalFile.update({
      where: { id: uploadedFile.id },
      data: {
        analysisStatus: 'completed',
        extractedData: extractedData,
        processingTime: processingTime,
        confidence: extractedData.confidence || null
      }
    });

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.id,
      originalFileName: originalFileName,
      sanitizedFileName: sanitizedFileName,
      fileCategory: fileCategory,
      extractedData,
      timelineEvents,
      processingTime: processingTime,
      message: `Successfully processed ${originalFileName}`
    });

  } catch (error) {
    console.error('Error processing medical file:', error);
    
    const processingTime = Date.now() - processingStartTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Update file record with error if it was created
    if (uploadedFile) {
      try {
        await prisma.medicalFile.update({
          where: { id: uploadedFile.id },
          data: {
            analysisStatus: 'failed',
            errorMessage: errorMessage,
            processingTime: processingTime
          }
        });
      } catch (dbError) {
        console.error('Failed to update file record with error:', dbError);
      }
    }
    
    // Determine error type and provide appropriate response
    if (errorMessage.includes('API') || errorMessage.includes('fetch')) {
      return NextResponse.json({
        success: false,
        error: 'AI processing service temporarily unavailable',
        errorCode: 'AI_SERVICE_ERROR',
        details: 'The AI processing service is currently experiencing issues. Please try again later.',
        processingTime: processingTime
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'File processing failed',
      errorCode: 'PROCESSING_ERROR',
      details: errorMessage,
      processingTime: processingTime
    }, { status: 500 });
  }
}

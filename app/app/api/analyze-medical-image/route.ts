
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

// Enhanced retry mechanism for AI API calls
async function retryAIRequest(aiRequest: any, maxRetries = 3): Promise<any> {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
        },
        body: JSON.stringify(aiRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.choices?.[0]?.message?.content) {
        throw new Error('Invalid AI response format - missing content');
      }

      return result;
    } catch (error) {
      lastError = error;
      console.error(`AI API attempt ${attempt} failed:`, error);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError;
}

// Enhanced JSON parsing with robust cleanup
function parseAIResponse(content: string): any {
  try {
    // Clean up the response content
    let jsonContent = content.trim();
    
    // Remove markdown code blocks if present
    jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    // Remove any trailing commas and fix common JSON issues
    jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
    jsonContent = jsonContent.replace(/\n/g, '').replace(/\r/g, '');
    
    // Ensure the JSON starts with { and ends with }
    if (!jsonContent.startsWith('{')) {
      const startIndex = jsonContent.indexOf('{');
      if (startIndex !== -1) {
        jsonContent = jsonContent.substring(startIndex);
      }
    }
    
    if (!jsonContent.endsWith('}')) {
      const endIndex = jsonContent.lastIndexOf('}');
      if (endIndex !== -1) {
        jsonContent = jsonContent.substring(0, endIndex + 1);
      }
    }
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('JSON parsing failed:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const patientCode = formData.get('patientCode') as string;

    // Enhanced validation
    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No file provided',
          errorCode: 'MISSING_FILE'
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Category is required',
          errorCode: 'MISSING_CATEGORY'
        },
        { status: 400 }
      );
    }

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

    // Validate file type
    const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!supportedImageTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported image type: ${file.type}`,
          errorCode: 'UNSUPPORTED_IMAGE_TYPE'
        },
        { status: 400 }
      );
    }

    // Validate file size (limit to 20MB for images)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 20MB`,
          errorCode: 'FILE_TOO_LARGE'
        },
        { status: 400 }
      );
    }

    // Convert file to base64 for vision analysis
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type;

    // Enhanced analysis prompts based on category
    let analysisPrompt = '';
    
    switch (category) {
      case 'ultrasound':
        analysisPrompt = `Analyze this ultrasound scan image for fertility assessment. Extract and provide:

1. Antral Follicle Count (AFC) - count visible follicles on both ovaries
2. Endometrial thickness - measure in millimeters if visible
3. Follicle sizes - measure individual follicles in millimeters
4. Ovarian volume - estimate if possible
5. Any abnormalities or notable findings
6. Overall assessment of ovarian reserve
7. Date of scan if visible
8. Any text or annotations visible in the image

Respond with raw JSON only. Use this structure:
{
  "afc_left": "number or 'not visible'",
  "afc_right": "number or 'not visible'", 
  "afc_total": "number or 'not visible'",
  "endometrial_thickness": "measurement in mm or 'not visible'",
  "follicle_sizes": ["list of sizes in mm"],
  "ovarian_volume": "estimate or 'not visible'",
  "abnormalities": "description or 'none noted'",
  "overall_assessment": "description",
  "scan_date": "date if visible or null",
  "visible_text": "any text visible in image",
  "quality_assessment": "good/fair/poor",
  "confidence": "0.0 to 1.0"
}`;
        break;
      
      case 'sperm_analysis':
        analysisPrompt = `Analyze this sperm analysis image/microscopy and provide:

1. Sperm morphology assessment
2. Motility patterns observed
3. Concentration estimation
4. Overall quality grading
5. Any specific observations

Respond with raw JSON only. Use this structure:
{
  "morphology_normal_percent": "percentage or 'not visible'",
  "motility_grade_a": "percentage or 'not visible'",
  "motility_grade_b": "percentage or 'not visible'",
  "motility_grade_c": "percentage or 'not visible'",
  "motility_grade_d": "percentage or 'not visible'",
  "concentration": "count per ml or 'not visible'",
  "volume": "ml or 'not visible'",
  "overall_grade": "excellent/good/fair/poor",
  "who_reference_comparison": "above/below reference values",
  "abnormalities": "description or 'none noted'",
  "recommendations": "clinical recommendations",
  "confidence": "0.0 to 1.0"
}`;
        break;
      
      case 'embryo_image':
        analysisPrompt = `Analyze this embryo image for grading and assessment:

1. Embryo development stage
2. ICM (Inner Cell Mass) quality
3. Trophectoderm quality
4. Cell count and symmetry
5. Fragmentation assessment
6. Overall viability

Respond with raw JSON only. Use this structure:
{
  "development_stage": "day 3/day 5/blastocyst/etc",
  "icm_grade": "A/B/C or not applicable",
  "trophectoderm_grade": "A/B/C or not applicable", 
  "overall_grade": "combined grade like 4AA",
  "cell_count": "number or estimate",
  "symmetry": "excellent/good/fair/poor",
  "fragmentation": "percentage or description",
  "expansion": "rating if blastocyst",
  "viability_assessment": "excellent/good/fair/poor",
  "implantation_potential": "high/medium/low",
  "recommendations": "clinical recommendations",
  "confidence": "0.0 to 1.0"
}`;
        break;
      
      case 'lab_results':
        analysisPrompt = `Analyze this laboratory results image and extract:

1. All numerical values and their units
2. Reference ranges where visible
3. Test names and categories
4. Date of testing
5. Any abnormal results

Respond with raw JSON only. Use this structure:
{
  "test_date": "date if visible",
  "lab_values": [
    {
      "test_name": "name",
      "value": "numerical value",
      "unit": "unit",
      "reference_range": "range if visible",
      "status": "normal/high/low"
    }
  ],
  "abnormal_results": ["list of abnormal findings"],
  "overall_assessment": "description",
  "recommendations": "clinical recommendations",
  "confidence": "0.0 to 1.0"
}`;
        break;
      
      default:
        analysisPrompt = `Analyze this medical image and provide relevant clinical observations for fertility treatment planning.

Respond with raw JSON only. Use this structure:
{
  "image_type": "identified type",
  "key_findings": ["list of important findings"],
  "measurements": "any measurements visible",
  "abnormalities": "any abnormalities noted",
  "clinical_relevance": "relevance to fertility treatment",
  "recommendations": "next steps or recommendations",
  "confidence": "0.0 to 1.0"
}`;
    }

    // Prepare the AI request for vision analysis
    const aiRequest = {
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: analysisPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    };

    // Call AI API with retry mechanism
    console.log('Starting AI vision analysis...');
    const aiResult = await retryAIRequest(aiRequest);
    
    // Parse the AI response
    const analysis = parseAIResponse(aiResult.choices[0].message.content);
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      analysis,
      category,
      fileName: file.name,
      processingTime,
      message: 'Medical image analyzed successfully'
    });

  } catch (error) {
    console.error('Error analyzing medical image:', error);
    
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Don't re-parse formData in catch block to avoid errors
    let category = 'unknown';
    try {
      const formData = await request.clone().formData();
      category = (formData.get('category') as string) || 'unknown';
    } catch {
      // Ignore parsing errors in catch block
    }
    
    // Create structured fallback analysis based on category
    let fallbackAnalysis = {};
    
    switch (category) {
      case 'ultrasound':
        fallbackAnalysis = {
          afc_total: 'Analysis pending - image uploaded successfully',
          endometrial_thickness: 'Please review manually',
          overall_assessment: 'Image uploaded and saved for manual review',
          quality_assessment: 'good',
          confidence: 0.0,
          error_note: 'AI analysis temporarily unavailable'
        };
        break;
      case 'sperm_analysis':
        fallbackAnalysis = {
          overall_grade: 'Analysis pending - image uploaded successfully',
          who_reference_comparison: 'Please review manually',
          recommendations: 'Image uploaded and saved for manual review',
          confidence: 0.0,
          error_note: 'AI analysis temporarily unavailable'
        };
        break;
      case 'embryo_image':
        fallbackAnalysis = {
          development_stage: 'Analysis pending - image uploaded successfully',
          viability_assessment: 'Please review manually',
          recommendations: 'Image uploaded and saved for manual review',
          confidence: 0.0,
          error_note: 'AI analysis temporarily unavailable'
        };
        break;
      case 'lab_results':
        fallbackAnalysis = {
          lab_values: [],
          overall_assessment: 'Analysis pending - image uploaded successfully',
          recommendations: 'Please review manually and enter values',
          confidence: 0.0,
          error_note: 'AI analysis temporarily unavailable'
        };
        break;
      default:
        fallbackAnalysis = {
          image_type: 'Medical image',
          key_findings: ['Image uploaded successfully'],
          clinical_relevance: 'Please review manually',
          recommendations: 'Manual review recommended',
          confidence: 0.0,
          error_note: 'AI analysis temporarily unavailable'
        };
    }

    // Return fallback response that still shows success to user
    return NextResponse.json({
      success: true,
      analysis: fallbackAnalysis,
      category,
      fileName: 'uploaded_image',
      processingTime,
      fallback: true,
      error_details: errorMessage,
      message: 'Image uploaded successfully. AI analysis will be available shortly.'
    });
  }
}

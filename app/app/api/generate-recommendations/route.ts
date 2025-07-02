
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { patientProfile, patientCode } = await request.json();

    if (!patientProfile || !patientCode) {
      return NextResponse.json(
        { error: 'Patient profile and code are required' },
        { status: 400 }
      );
    }

    // Prepare AI request for generating clinical recommendations
    const prompt = `Based on the following patient fertility profile, generate personalized clinical recommendations:

Patient Profile:
- Female Age: ${patientProfile.femaleProfile.age || 'Not specified'}
- Menstrual Cycle: ${patientProfile.femaleProfile.cycle || 'Not specified'}
- Female Medical Conditions: ${(patientProfile.femaleProfile.conditions || []).join(', ') || 'None specified'}
- Male Age: ${patientProfile.maleProfile.age || 'Not specified'}
- Male Medical Conditions: ${(patientProfile.maleProfile.conditions || []).join(', ') || 'None specified'}
- Time Trying to Conceive: ${patientProfile.coupleHistory.timeTrying || 'Not specified'}
- Previous Treatments: ${patientProfile.coupleHistory.previousTreatments || 'None'}
- Emotional State: ${patientProfile.holistic.emotionalState || 'Not specified'}
- Financial Comfort: ${patientProfile.holistic.financialComfort || 'Not specified'}

Generate clinical recommendations in the following categories:
1. Additional Tests - What new tests or updated tests should be considered?
2. Lifestyle Recommendations - Diet, exercise, supplements, stress management
3. Treatment Considerations - Specific treatment approaches based on the profile

For each recommendation, include:
- Title (concise)
- Description (detailed explanation)
- Priority (high/medium/low)
- Clinical reasoning

Return as a structured JSON with an array of recommendations.`;

    const aiRequest = {
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    };

    // Call AI API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify(aiRequest),
    });

    if (!response.ok) {
      throw new Error('AI recommendation generation failed');
    }

    const aiResult = await response.json();
    const recommendationsData = JSON.parse(aiResult.choices[0].message.content);

    // Format recommendations to match our interface
    const formattedRecommendations = (recommendationsData.recommendations || []).map((rec: any, index: number) => ({
      id: Math.random().toString(36).substr(2, 9),
      category: rec.category || 'treatment_considerations',
      title: rec.title || `Recommendation ${index + 1}`,
      description: rec.description || '',
      priority: rec.priority || 'medium',
      source: 'ai_analysis',
      isActionable: true
    }));

    return NextResponse.json({
      success: true,
      recommendations: formattedRecommendations,
      message: 'Clinical recommendations generated successfully'
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    // Return sample recommendations as fallback
    const sampleRecommendations = [
      {
        id: '1',
        category: 'additional_tests',
        title: 'Updated Hormone Panel',
        description: 'Consider fresh AMH, FSH, and thyroid function tests as hormone levels can change over time.',
        priority: 'high',
        source: 'ai_analysis',
        isActionable: true
      },
      {
        id: '2',
        category: 'lifestyle',
        title: 'Fertility Optimization Protocol',
        description: 'Ensure folic acid supplementation (400-800 mcg daily), maintain healthy BMI, and consider CoQ10 supplementation.',
        priority: 'medium',
        source: 'clinical_guidelines',
        isActionable: true
      },
      {
        id: '3',
        category: 'treatment_considerations',
        title: 'Treatment Strategy Discussion',
        description: 'Based on patient profile, discuss appropriate treatment options including timing and approach.',
        priority: 'high',
        source: 'ai_analysis',
        isActionable: true
      }
    ];

    return NextResponse.json({
      success: true,
      recommendations: sampleRecommendations,
      message: 'Sample recommendations provided (AI service unavailable)'
    });
  }
}

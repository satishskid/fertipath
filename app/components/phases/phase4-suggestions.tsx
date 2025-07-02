
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Lightbulb,
  Target,
  Activity,
  Loader2,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientProfile, ClinicalRecommendation } from '@/lib/types';
import { toast } from 'sonner';

interface Phase4SuggestionsProps {
  patientProfile: PatientProfile;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  markPhaseComplete: (phase: number) => void;
  proceedToNextPhase: () => void;
}

export default function Phase4Suggestions({ 
  patientProfile, 
  updatePatientProfile, 
  markPhaseComplete,
  proceedToNextPhase 
}: Phase4SuggestionsProps) {
  const [recommendations, setRecommendations] = useState<ClinicalRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientProfile,
          patientCode: patientProfile.patientCode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const result = await response.json();
      setRecommendations(result.recommendations || getSampleRecommendations());
      setIsComplete(true);
      markPhaseComplete(4);
      toast.success('Clinical recommendations generated successfully');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Use sample recommendations as fallback
      setRecommendations(getSampleRecommendations());
      setIsComplete(true);
      markPhaseComplete(4);
      toast.info('Using sample recommendations due to API unavailability');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSampleRecommendations = (): ClinicalRecommendation[] => {
    const age = parseInt(patientProfile.femaleProfile.age?.split('-')[0] || '30');
    const conditions = patientProfile.femaleProfile.conditions || [];
    const timeTrying = patientProfile.coupleHistory.timeTrying;
    const previousTreatments = patientProfile.coupleHistory.previousTreatments;

    const baseRecommendations: ClinicalRecommendation[] = [
      {
        id: '1',
        category: 'additional_tests',
        title: 'Updated Hormone Panel',
        description: 'Consider fresh AMH, FSH, and thyroid function tests as hormone levels can change over time, especially if previous tests are over 6 months old.',
        priority: 'high',
        source: 'clinical_guidelines',
        isActionable: true
      },
      {
        id: '2',
        category: 'additional_tests',
        title: 'Recent Semen Analysis',
        description: 'If the last semen analysis is over 12 months old, a fresh analysis is recommended as sperm parameters can vary significantly over time.',
        priority: 'high',
        source: 'clinical_guidelines',
        isActionable: true
      }
    ];

    // Age-specific recommendations
    if (age > 35) {
      baseRecommendations.push({
        id: '3',
        category: 'treatment_considerations',
        title: 'Consider PGT-A Testing',
        description: 'Given age over 35, preimplantation genetic testing (PGT-A) may improve IVF success rates by selecting chromosomally normal embryos.',
        priority: 'high',
        source: 'ai_analysis',
        isActionable: true
      });
    }

    // PCOS-specific recommendations
    if (conditions.includes('pcos')) {
      baseRecommendations.push({
        id: '4',
        category: 'lifestyle',
        title: 'PCOS Management Protocol',
        description: 'Optimize insulin sensitivity through diet modifications, consider metformin therapy, and ensure vitamin D supplementation for improved ovulation.',
        priority: 'medium',
        source: 'clinical_guidelines',
        isActionable: true
      });
    }

    // Endometriosis-specific recommendations
    if (conditions.includes('endometriosis')) {
      baseRecommendations.push({
        id: '5',
        category: 'treatment_considerations',
        title: 'Endometriosis Protocol',
        description: 'Consider GnRH agonist pre-treatment before IVF to improve implantation rates. Anti-inflammatory supplements may also be beneficial.',
        priority: 'medium',
        source: 'clinical_guidelines',
        isActionable: true
      });
    }

    // Time trying specific recommendations
    if (timeTrying === '> 3 years') {
      baseRecommendations.push({
        id: '6',
        category: 'treatment_considerations',
        title: 'Expedited Treatment Approach',
        description: 'Given prolonged time trying to conceive, consider moving directly to more advanced treatments rather than starting with conservative approaches.',
        priority: 'high',
        source: 'ai_analysis',
        isActionable: true
      });
    }

    // Previous treatment specific recommendations
    if (previousTreatments === 'ivf') {
      baseRecommendations.push({
        id: '7',
        category: 'treatment_considerations',
        title: 'IVF Protocol Optimization',
        description: 'Review previous IVF protocol details. Consider different stimulation protocols, immune testing, or endometrial receptivity analysis (ERA) for improved outcomes.',
        priority: 'high',
        source: 'ai_analysis',
        isActionable: true
      });
    }

    // Lifestyle recommendations
    baseRecommendations.push({
      id: '8',
      category: 'lifestyle',
      title: 'Fertility Optimization Protocol',
      description: 'Ensure folic acid supplementation (400-800 mcg daily), maintain healthy BMI, limit alcohol consumption, and consider CoQ10 supplementation for egg quality.',
      priority: 'medium',
      source: 'clinical_guidelines',
      isActionable: true
    });

    return baseRecommendations;
  };

  const handleProceedToNext = () => {
    if (isComplete) {
      toast.success('Clinical suggestions reviewed');
      proceedToNextPhase();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return Info;
      case 'low': return CheckCircle2;
      default: return Info;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'additional_tests': return Activity;
      case 'lifestyle': return TrendingUp;
      case 'treatment_considerations': return Target;
      default: return Lightbulb;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'additional_tests': return 'Additional Tests';
      case 'lifestyle': return 'Lifestyle Recommendations';
      case 'treatment_considerations': return 'Treatment Considerations';
      default: return 'Recommendations';
    }
  };

  const groupedRecommendations = recommendations.reduce((groups, rec) => {
    if (!groups[rec.category]) {
      groups[rec.category] = [];
    }
    groups[rec.category].push(rec);
    return groups;
  }, {} as Record<string, ClinicalRecommendation[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>AI-Generated Clinical Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Personalized Clinical Insights</p>
              <p>
                Based on the patient profile, medical history, and current evidence-based guidelines, 
                here are AI-generated recommendations to optimize treatment planning and outcomes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isGenerating && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analyzing Patient Profile</h3>
            <p className="text-muted-foreground">
              Our AI is reviewing the medical history and generating personalized recommendations...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {!isGenerating && recommendations.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedRecommendations).map(([category, recs], categoryIndex) => {
            const CategoryIcon = getCategoryIcon(category);
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <CategoryIcon className="w-5 h-5 text-primary" />
                      <span>{getCategoryTitle(category)}</span>
                      <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {recs.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recs.map((rec, index) => {
                        const PriorityIcon = getPriorityIcon(rec.priority);
                        
                        return (
                          <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                            className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
                          >
                            <div className="flex items-start space-x-3">
                              <PriorityIcon className="w-5 h-5 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold">{rec.title}</h4>
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      rec.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {rec.priority.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm mb-2">{rec.description}</p>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <span>Source: {rec.source.replace('_', ' ')}</span>
                                  {rec.isActionable && (
                                    <>
                                      <span>•</span>
                                      <span className="text-green-600">Actionable</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isGenerating ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <CheckCircle2 className={`w-5 h-5 ${isComplete ? 'text-green-600' : 'text-gray-400'}`} />
              )}
              <div>
                <p className={`font-medium ${isComplete ? 'text-green-800' : 'text-gray-600'}`}>
                  {isGenerating ? 'Generating Recommendations...' : 
                   isComplete ? 'Recommendations Generated' : 'Pending Analysis'}
                </p>
                <p className="text-sm text-gray-500">
                  {isGenerating ? 'Please wait while AI analyzes the patient profile' :
                   isComplete ? `${recommendations.length} clinical recommendations ready for review` :
                   'Waiting for analysis to complete'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isGenerating && (
                <Button 
                  variant="outline"
                  onClick={generateRecommendations}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerate</span>
                </Button>
              )}
              
              <Button 
                onClick={handleProceedToNext}
                disabled={isGenerating}
                className="flex items-center space-x-2"
              >
                <span>Generate Treatment Pathways</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

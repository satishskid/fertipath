
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle,
  Calculator,
  Download,
  Save,
  RotateCcw,
  Loader2,
  Heart,
  Activity,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PatientProfile, TreatmentPathway } from '@/lib/types';
import { toast } from 'sonner';

interface Phase5PathwaysProps {
  patientProfile: PatientProfile;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  markPhaseComplete: (phase: number) => void;
  proceedToNextPhase: () => void;
  treatmentPathways: TreatmentPathway[];
  calculatePathways: () => void;
}

export default function Phase5Pathways({ 
  patientProfile, 
  updatePatientProfile, 
  markPhaseComplete,
  proceedToNextPhase,
  treatmentPathways,
  calculatePathways
}: Phase5PathwaysProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (treatmentPathways.length === 0) {
      handleCalculatePathways();
    } else {
      setIsComplete(true);
      markPhaseComplete(5);
    }
  }, []);

  const handleCalculatePathways = async () => {
    setIsCalculating(true);
    
    try {
      // Call the calculation function
      calculatePathways();
      
      // Simulate calculation time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsComplete(true);
      markPhaseComplete(5);
      toast.success('Treatment pathways calculated successfully');
    } catch (error) {
      console.error('Error calculating pathways:', error);
      toast.error('Failed to calculate pathways');
    } finally {
      setIsCalculating(false);
    }
  };

  const generatePatientSummary = async () => {
    try {
      const response = await fetch('/api/generate-patient-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientProfile,
          treatmentPathways,
          selectedPathway
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${patientProfile.patientCode}_fertility_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Patient summary downloaded successfully');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate patient summary');
    }
  };

  const savePatientRecord = async () => {
    try {
      const response = await fetch('/api/save-patient-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientProfile,
          treatmentPathways,
          selectedPathway
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save record');
      }

      toast.success('Patient record saved successfully');
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save patient record');
    }
  };

  const formatCost = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 100000) {
        return `₹${(num / 100000).toFixed(1)}L`;
      }
      return `₹${(num / 1000).toFixed(0)}K`;
    };
    
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const getPathwayRecommendation = (pathway: TreatmentPathway) => {
    if (pathway.priority === 1) return 'Highly Recommended';
    if (pathway.priority === 2) return 'Recommended';
    if (pathway.priority === 3) return 'Consider';
    return 'Alternative Option';
  };

  const getRecommendationColor = (priority: number) => {
    if (priority === 1) return 'text-green-600 bg-green-50 border-green-200';
    if (priority === 2) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (priority === 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Personalized Treatment Pathways</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Info className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="text-sm text-purple-800">
              <p className="font-semibold mb-1">AI-Calculated Treatment Options</p>
              <p>
                Based on comprehensive analysis of patient profile, medical history, and evidence-based 
                protocols, here are personalized treatment pathways with success predictions, costs, 
                and timelines tailored for the Indian context.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Loading */}
      {isCalculating && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Calculating Treatment Pathways</h3>
            <p className="text-muted-foreground mb-4">
              Analyzing patient profile and generating personalized recommendations...
            </p>
            <Progress value={66} className="w-64 mx-auto" />
          </CardContent>
        </Card>
      )}

      {/* Treatment Pathways */}
      {!isCalculating && treatmentPathways.length > 0 && (
        <div className="space-y-6">
          {treatmentPathways.map((pathway, index) => (
            <motion.div
              key={pathway.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`pathway-card cursor-pointer transition-all duration-300 ${
                selectedPathway === pathway.name ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedPathway(pathway.name)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-primary">{pathway.name}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                      getRecommendationColor(pathway.priority)
                    }`}>
                      {getPathwayRecommendation(pathway)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{pathway.description}</p>
                </div>
                
                {/* Success Rate Display */}
                <div className="text-center ml-6">
                  <div className="relative w-20 h-20 mb-2">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${pathway.successRate}, 100`}
                        strokeLinecap="round"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{pathway.successRate}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Success Rate</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Timeline</p>
                    <p className="text-sm font-medium">{pathway.timeline}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <IndianRupee className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Estimated Cost</p>
                    <p className="text-sm font-medium">{formatCost(pathway.costMin, pathway.costMax)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Suitability</p>
                    <p className="text-sm font-medium">{pathway.suitability}%</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Priority</p>
                    <p className="text-sm font-medium">#{pathway.priority}</p>
                  </div>
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Advantages
                  </h4>
                  <ul className="text-sm space-y-1">
                    {pathway.pros.map((pro, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Considerations
                  </h4>
                  <ul className="text-sm space-y-1">
                    {pathway.cons.map((con, i) => (
                      <li key={i} className="flex items-start">
                        <AlertCircle className="w-3 h-3 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendation */}
              {pathway.recommendation && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Clinical Recommendation:</strong> {pathway.recommendation}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary Comparison */}
      {treatmentPathways.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Treatment Comparison Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Treatment</th>
                    <th className="text-center py-2">Success Rate</th>
                    <th className="text-center py-2">Timeline</th>
                    <th className="text-center py-2">Cost Range</th>
                    <th className="text-center py-2">Suitability</th>
                  </tr>
                </thead>
                <tbody>
                  {treatmentPathways.map((pathway, index) => (
                    <tr key={index} className="border-b hover:bg-muted/30">
                      <td className="py-3 font-medium">{pathway.name}</td>
                      <td className="py-3 text-center">
                        <span className="font-semibold text-primary">{pathway.successRate}%</span>
                      </td>
                      <td className="py-3 text-center">{pathway.timeline}</td>
                      <td className="py-3 text-center">{formatCost(pathway.costMin, pathway.costMax)}</td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          pathway.suitability >= 80 ? 'bg-green-100 text-green-800' :
                          pathway.suitability >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {pathway.suitability}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className={`w-5 h-5 ${isComplete ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`font-medium ${isComplete ? 'text-green-800' : 'text-gray-600'}`}>
                    {isComplete ? 'Treatment Pathways Ready' : 'Calculating Pathways...'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isComplete 
                      ? `${treatmentPathways.length} personalized treatment options generated`
                      : 'Please wait while pathways are being calculated'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={generatePatientSummary}
                disabled={!isComplete}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Patient Report</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={savePatientRecord}
                disabled={!isComplete}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Patient Record</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleCalculatePathways}
                disabled={isCalculating}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recalculate</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

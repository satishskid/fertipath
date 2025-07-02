
'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Eye, 
  Camera, 
  Video, 
  Image as ImageIcon,
  Microscope,
  Heart,
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientProfile } from '@/lib/types';
import { toast } from 'sonner';

interface Phase3AnalysisProps {
  patientProfile: PatientProfile;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  markPhaseComplete: (phase: number) => void;
  proceedToNextPhase: () => void;
}

interface AnalysisFile {
  id: string;
  fileName: string;
  fileType: string;
  category: 'ultrasound' | 'sperm_analysis' | 'embryo_image';
  uploadedAt: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  analysisResults?: any;
  preview?: string;
}

export default function Phase3Analysis({ 
  patientProfile, 
  updatePatientProfile, 
  markPhaseComplete,
  proceedToNextPhase 
}: Phase3AnalysisProps) {
  const [analysisFiles, setAnalysisFiles] = useState<AnalysisFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);

  const ultrasoundRef = useRef<HTMLInputElement>(null);
  const spermRef = useRef<HTMLInputElement>(null);
  const embryoRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    category: 'ultrasound' | 'sperm_analysis' | 'embryo_image'
  ) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    for (const file of files) {
      const newFile: AnalysisFile = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileType: file.type,
        category,
        uploadedAt: new Date().toISOString(),
        analysisStatus: 'pending',
        preview: URL.createObjectURL(file)
      };

      setAnalysisFiles(prev => [...prev, newFile]);
      
      // Process file with AI vision analysis
      await processWithAIVision(newFile, file);
    }

    // Clear input
    event.target.value = '';
  };

  const processWithAIVision = async (fileData: AnalysisFile, file: File) => {
    setCurrentAnalysis(fileData.id);
    setIsProcessing(true);

    try {
      // Update file status to processing
      setAnalysisFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, analysisStatus: 'processing' } : f
      ));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', fileData.category);
      formData.append('patientCode', patientProfile.patientCode);

      const response = await fetch('/api/analyze-medical-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();

      // Update file with analysis results
      setAnalysisFiles(prev => prev.map(f => 
        f.id === fileData.id ? { 
          ...f, 
          analysisStatus: 'completed',
          analysisResults: result.analysis 
        } : f
      ));

      toast.success(`Successfully analyzed ${fileData.fileName}`);
    } catch (error) {
      console.error('Error analyzing file:', error);
      
      setAnalysisFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, analysisStatus: 'failed' } : f
      ));
      
      toast.error(`Failed to analyze ${fileData.fileName}`);
    } finally {
      setCurrentAnalysis(null);
      setIsProcessing(false);
    }
  };

  const handleProceedToNext = () => {
    const completedAnalyses = analysisFiles.filter(f => f.analysisStatus === 'completed');
    
    if (completedAnalyses.length > 0 || analysisFiles.length === 0) {
      markPhaseComplete(3);
      toast.success('Analysis phase completed');
      proceedToNextPhase();
    } else {
      toast.error('Please wait for analysis to complete or skip this phase');
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'ultrasound': return 'Ultrasound Analysis';
      case 'sperm_analysis': return 'Sperm Analysis';
      case 'embryo_image': return 'Embryo Grading';
      default: return 'Analysis';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'ultrasound': return 'AFC count, follicle sizes, endometrial thickness';
      case 'sperm_analysis': return 'Morphology, motility patterns, concentration';
      case 'embryo_image': return 'Quality grading, development stage, viability';
      default: return 'AI-powered analysis';
    }
  };

  const renderAnalysisResults = (file: AnalysisFile) => {
    if (!file.analysisResults) return null;

    return (
      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <h5 className="font-semibold text-green-800 mb-2 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          {getCategoryTitle(file.category)} Results
        </h5>
        <div className="text-sm text-green-700 space-y-1">
          {file.category === 'ultrasound' && (
            <>
              <p>• AFC Count: {file.analysisResults.afcCount || 'Processing...'}</p>
              <p>• Endometrial Thickness: {file.analysisResults.endometrialThickness || 'Processing...'}</p>
              <p>• Follicle Assessment: {file.analysisResults.follicleAssessment || 'Processing...'}</p>
            </>
          )}
          {file.category === 'sperm_analysis' && (
            <>
              <p>• Morphology Score: {file.analysisResults.morphologyScore || 'Processing...'}</p>
              <p>• Motility Pattern: {file.analysisResults.motilityPattern || 'Processing...'}</p>
              <p>• Quality Grade: {file.analysisResults.qualityGrade || 'Processing...'}</p>
            </>
          )}
          {file.category === 'embryo_image' && (
            <>
              <p>• Embryo Grade: {file.analysisResults.embryoGrade || 'Processing...'}</p>
              <p>• Development Stage: {file.analysisResults.developmentStage || 'Processing...'}</p>
              <p>• Quality Assessment: {file.analysisResults.qualityAssessment || 'Processing...'}</p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>AI-Powered Medical Image Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Advanced Vision Analysis</p>
              <p>
                Upload ultrasound scans, sperm analysis images/videos, and embryo images for 
                AI-powered quality assessment and biomarker analysis. This provides detailed 
                insights to support clinical decision-making.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Zones */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Ultrasound Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2 text-blue-600">
                <Camera className="w-5 h-5" />
                <span>Ultrasound Scans</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="upload-zone">
                <Microscope className="mx-auto h-8 w-8 text-blue-400 mb-3" />
                <h4 className="font-semibold mb-2">AFC & Endometrial Analysis</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload ultrasound images for automated follicle counting and endometrial assessment
                </p>
                <input
                  type="file"
                  ref={ultrasoundRef}
                  onChange={(e) => handleFileUpload(e, 'ultrasound')}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  onClick={() => ultrasoundRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload USG
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sperm Analysis Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2 text-green-600">
                <Video className="w-5 h-5" />
                <span>Sperm Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="upload-zone">
                <Eye className="mx-auto h-8 w-8 text-green-400 mb-3" />
                <h4 className="font-semibold mb-2">Morphology & Motility</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload microscopy images or videos for detailed sperm analysis beyond standard reports
                </p>
                <input
                  type="file"
                  ref={spermRef}
                  onChange={(e) => handleFileUpload(e, 'sperm_analysis')}
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                />
                <Button
                  onClick={() => spermRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Media
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Embryo Analysis Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2 text-purple-600">
                <ImageIcon className="w-5 h-5" />
                <span>Embryo Images</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="upload-zone">
                <Heart className="mx-auto h-8 w-8 text-purple-400 mb-3" />
                <h4 className="font-semibold mb-2">Quality Grading</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload embryo images or time-lapse videos for AI-assisted quality grading and selection
                </p>
                <input
                  type="file"
                  ref={embryoRef}
                  onChange={(e) => handleFileUpload(e, 'embryo_image')}
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                />
                <Button
                  onClick={() => embryoRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analysis Results */}
      {analysisFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <span>Analysis Results ({analysisFiles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-start space-x-4">
                    {file.preview && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={file.preview} 
                          alt={file.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{file.fileName}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {getCategoryTitle(file.category)}
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            {file.analysisStatus === 'processing' ? (
                              <>
                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                <span className="text-sm text-blue-600">Analyzing...</span>
                              </>
                            ) : file.analysisStatus === 'completed' ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">Analysis Complete</span>
                              </>
                            ) : file.analysisStatus === 'failed' ? (
                              <>
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-red-600">Analysis Failed</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-600">Pending Analysis</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {renderAnalysisResults(file)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Status */}
      <Card className={`border-2 ${
        analysisFiles.some(f => f.analysisStatus === 'completed') ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className={`w-5 h-5 ${
                analysisFiles.some(f => f.analysisStatus === 'completed') ? 'text-green-600' : 'text-gray-400'
              }`} />
              <div>
                <p className={`font-medium ${
                  analysisFiles.some(f => f.analysisStatus === 'completed') ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {analysisFiles.some(f => f.analysisStatus === 'completed') 
                    ? 'Analysis Complete' 
                    : analysisFiles.length > 0 
                    ? 'Analysis in Progress' 
                    : 'No Files for Analysis'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {analysisFiles.length > 0 
                    ? `${analysisFiles.filter(f => f.analysisStatus === 'completed').length} of ${analysisFiles.length} files analyzed`
                    : 'Upload medical images for AI analysis or skip to continue'
                  }
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleProceedToNext}
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              <span>Continue to Suggestions</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Heart, 
  Brain, 
  Calendar, 
  Eye, 
  Target, 
  CheckCircle, 
  Circle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  SkipForward,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PatientProfile, TreatmentPathway } from '@/lib/types';
import { calculateTreatmentPathways } from '@/lib/pathway-calculator';
import { toast } from 'sonner';

// Import phase components
import Phase1Profile from './phases/phase1-profile';
import Phase2Timeline from './phases/phase2-timeline';
import Phase3Analysis from './phases/phase3-analysis';
import Phase4Suggestions from './phases/phase4-suggestions';
import Phase5EnhancedPathways from './phases/phase5-enhanced-pathways';
import Phase6EnhancedFeatures from './phases/phase6-enhanced-features';
import InterfaceModeToggle from './interface-mode-toggle';

const phases = [
  {
    id: 1,
    title: 'Patient Profile',
    description: 'Complete medical history and current situation',
    icon: User,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Medical Timeline',
    description: 'Upload and organize medical documents',
    icon: Calendar,
    color: 'bg-green-500'
  },
  {
    id: 3,
    title: 'Deep Analysis',
    description: 'AI analysis of scans and images',
    icon: Eye,
    color: 'bg-purple-500'
  },
  {
    id: 4,
    title: 'Clinical Suggestions',
    description: 'AI-powered recommendations',
    icon: Brain,
    color: 'bg-orange-500'
  },
  {
    id: 5,
    title: 'Treatment Pathways',
    description: 'Personalized treatment options',
    icon: Target,
    color: 'bg-red-500'
  },
  {
    id: 6,
    title: 'Enhanced Features',
    description: 'Remote care and advanced tools',
    icon: Sparkles,
    color: 'bg-purple-600'
  }
];

export default function FertilityPlanner() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [patientCode, setPatientCode] = useState('');
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    patientCode: '',
    femaleProfile: {},
    maleProfile: {},
    coupleHistory: {},
    holistic: {}
  });
  const [treatmentPathways, setTreatmentPathways] = useState<TreatmentPathway[]>([]);
  const [phaseCompletion, setPhaseCompletion] = useState<Record<number, boolean>>({});
  const [phaseSkipped, setPhaseSkipped] = useState<Record<number, boolean>>({});
  const [interfaceMode, setInterfaceMode] = useState<'patient' | 'doctor'>('patient');
  const [dataCompleteness, setDataCompleteness] = useState<Record<number, number>>({});
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentPathway | null>(null);
  const [patientChoices, setPatientChoices] = useState<any>({});

  const generatePatientCode = useCallback(() => {
    const code = 'SNT' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setPatientCode(code);
    setPatientProfile(prev => ({ ...prev, patientCode: code }));
    toast.success(`Patient code generated: ${code}`);
  }, []);

  const updatePatientProfile = useCallback((updates: Partial<PatientProfile>) => {
    setPatientProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const markPhaseComplete = useCallback((phase: number) => {
    setPhaseCompletion(prev => ({ ...prev, [phase]: true }));
  }, []);

  const markPhaseSkipped = useCallback((phase: number) => {
    setPhaseSkipped(prev => ({ ...prev, [phase]: true }));
    toast.info(`Phase ${phase} skipped - you can return to it anytime`);
  }, []);

  const updateDataCompleteness = useCallback((phase: number, score: number) => {
    setDataCompleteness(prev => ({ ...prev, [phase]: score }));
  }, []);

  const handleInterfaceMode = useCallback((mode: 'patient' | 'doctor') => {
    setInterfaceMode(mode);
  }, []);

  const handlePatientChoice = useCallback((choice: any) => {
    setPatientChoices((prev: any) => ({ ...prev, ...choice }));
  }, []);

  const handleTreatmentSelection = useCallback((treatment: TreatmentPathway) => {
    setSelectedTreatment(treatment);
    toast.success(`Treatment plan selected: ${treatment.name}`);
  }, []);

  const canProceedToPhase = useCallback((phase: number): boolean => {
    if (phase === 1) return true;
    // Allow progression if previous phase is completed OR skipped
    return phaseCompletion[phase - 1] || phaseSkipped[phase - 1] || false;
  }, [phaseCompletion, phaseSkipped]);

  const calculateOverallDataScore = useCallback((): number => {
    const scores = Object.values(dataCompleteness);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [dataCompleteness]);

  const getDataCompletenessImpact = useCallback((score: number): string => {
    if (score >= 80) return "High confidence - comprehensive data for accurate recommendations";
    if (score >= 60) return "Good confidence - sufficient data for reliable recommendations";
    if (score >= 40) return "Moderate confidence - some data gaps may affect accuracy";
    return "Limited confidence - more data would significantly improve recommendations";
  }, []);

  const proceedToNextPhase = useCallback(() => {
    if (currentPhase < 6 && canProceedToPhase(currentPhase + 1)) {
      setCurrentPhase(prev => prev + 1);
    }
  }, [currentPhase, canProceedToPhase]);

  const goToPreviousPhase = useCallback(() => {
    if (currentPhase > 1) {
      setCurrentPhase(prev => prev - 1);
    }
  }, [currentPhase]);

  const handleCalculatePathways = useCallback(() => {
    if (patientProfile.patientCode) {
      const pathways = calculateTreatmentPathways(patientProfile);
      setTreatmentPathways(pathways);
      markPhaseComplete(5);
      toast.success('Treatment pathways calculated successfully');
    }
  }, [patientProfile, markPhaseComplete]);

  const resetPlanner = useCallback(() => {
    setCurrentPhase(1);
    setPatientCode('');
    setPatientProfile({
      patientCode: '',
      femaleProfile: {},
      maleProfile: {},
      coupleHistory: {},
      holistic: {}
    });
    setTreatmentPathways([]);
    setPhaseCompletion({});
    setPhaseSkipped({});
    setDataCompleteness({});
    setSelectedTreatment(null);
    setPatientChoices({});
    setInterfaceMode('patient');
    toast.info('Planner reset for new patient');
  }, []);

  const PhaseIndicator = () => {
    const overallDataScore = calculateOverallDataScore();
    
    return (
      <div className="w-full mb-8">
        {/* Data Completeness Score Display */}
        {overallDataScore > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">
                        Data Completeness: {overallDataScore}%
                      </p>
                      <p className="text-sm text-blue-600">
                        {getDataCompletenessImpact(overallDataScore)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={overallDataScore >= 60 ? "default" : "secondary"}>
                    {overallDataScore >= 80 ? "Excellent" : overallDataScore >= 60 ? "Good" : "Improving"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="flex justify-center items-center space-x-4 mb-4">
          {phases.map((phase, index) => {
            const isActive = currentPhase === phase.id;
            const isCompleted = phaseCompletion[phase.id];
            const isSkipped = phaseSkipped[phase.id];
            const isAccessible = canProceedToPhase(phase.id);
            const phaseScore = dataCompleteness[phase.id] || 0;
            
            return (
              <React.Fragment key={phase.id}>
                <motion.div
                  className={`relative flex flex-col items-center cursor-pointer ${
                    isAccessible ? 'opacity-100' : 'opacity-50'
                  }`}
                  onClick={() => isAccessible && setCurrentPhase(phase.id)}
                  whileHover={isAccessible ? { scale: 1.05 } : {}}
                  whileTap={isAccessible ? { scale: 0.95 } : {}}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 relative ${
                      isCompleted
                        ? 'bg-green-500 shadow-lg'
                        : isSkipped
                        ? 'bg-orange-500 shadow-lg'
                        : isActive
                        ? phase.color + ' shadow-lg'
                        : 'bg-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : isSkipped ? (
                      <SkipForward className="w-5 h-5" />
                    ) : (
                      <phase.icon className="w-6 h-6" />
                    )}
                    
                    {/* Data completeness indicator */}
                    {phaseScore > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-current flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${
                          phaseScore >= 80 ? 'bg-green-500' : 
                          phaseScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`} />
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-xs font-medium text-gray-700">{phase.title}</p>
                    <p className="text-xs text-gray-500 max-w-24 text-center">
                      {phase.description}
                    </p>
                    {isSkipped && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Skipped
                      </Badge>
                    )}
                    {phaseScore > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        {phaseScore}% data
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-2 w-2 h-2 bg-primary rounded-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
                
                {index < phases.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-300 mx-2">
                    <div
                      className={`h-full transition-all duration-500 ${
                        phaseCompletion[phase.id] 
                          ? 'bg-green-500' 
                          : phaseSkipped[phase.id] 
                          ? 'bg-orange-500'
                          : 'bg-gray-300'
                      }`}
                      style={{
                        width: (phaseCompletion[phase.id] || phaseSkipped[phase.id]) ? '100%' : '0%'
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Enhanced Progress bar */}
        <div className="w-full max-w-2xl mx-auto">
          <Progress 
            value={((Object.keys(phaseCompletion).length + Object.keys(phaseSkipped).length) / 6) * 100} 
            className="h-2"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-600">
              {Object.keys(phaseCompletion).length + Object.keys(phaseSkipped).length} of 6 phases completed
            </p>
            {Object.keys(phaseSkipped).length > 0 && (
              <p className="text-xs text-orange-600">
                {Object.keys(phaseSkipped).length} skipped
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentPhase = () => {
    const commonProps = {
      patientProfile,
      updatePatientProfile,
      markPhaseComplete,
      proceedToNextPhase,
      markPhaseSkipped,
      updateDataCompleteness,
      interfaceMode,
      handlePatientChoice,
      handleTreatmentSelection,
      selectedTreatment,
      patientChoices
    };

    switch (currentPhase) {
      case 1:
        return (
          <Phase1Profile
            {...commonProps}
            patientCode={patientCode}
            generatePatientCode={generatePatientCode}
          />
        );
      case 2:
        return <Phase2Timeline {...commonProps} />;
      case 3:
        return <Phase3Analysis {...commonProps} />;
      case 4:
        return <Phase4Suggestions {...commonProps} />;
      case 5:
        return (
          <Phase5EnhancedPathways
            {...commonProps}
            treatmentPathways={treatmentPathways}
            setTreatmentPathways={setTreatmentPathways}
          />
        );
      case 6:
        return (
          <Phase6EnhancedFeatures
            {...commonProps}
            treatmentPathways={treatmentPathways}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-2 mb-4"
        >
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">
            Fertility Pathway Planner
          </h1>
        </motion.div>
        
        <p className="text-lg text-gray-600 mb-4">
          AI-powered fertility treatment planning for healthcare professionals
        </p>
        
        {patientCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-4"
          >
            <span className="text-sm font-medium text-primary">
              Patient Code: {patientCode}
            </span>
          </motion.div>
        )}

        {/* Interface Mode Toggle */}
        {patientCode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <InterfaceModeToggle
              currentMode={interfaceMode}
              patientCode={patientCode}
              onModeChange={handleInterfaceMode}
            />
          </motion.div>
        )}
      </div>

      {/* Phase Indicator */}
      <PhaseIndicator />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {renderCurrentPhase()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Data Completeness Impact Guide */}
            {calculateOverallDataScore() > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Data Impact:</strong> {getDataCompletenessImpact(calculateOverallDataScore())}
                  {calculateOverallDataScore() < 60 && (
                    <span className="text-orange-600">
                      {" "}Consider completing skipped phases for more accurate recommendations.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={goToPreviousPhase}
                disabled={currentPhase === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-4">
                {/* Skip Current Phase Button */}
                {currentPhase > 1 && currentPhase < 6 && !phaseCompletion[currentPhase] && !phaseSkipped[currentPhase] && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      markPhaseSkipped(currentPhase);
                      if (currentPhase < 6) proceedToNextPhase();
                    }}
                    className="flex items-center space-x-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Skip This Phase</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={resetPlanner}
                  className="flex items-center space-x-2"
                >
                  <Circle className="w-4 h-4" />
                  <span>New Patient</span>
                </Button>

                {currentPhase < 6 && (
                  <Button
                    onClick={proceedToNextPhase}
                    className="flex items-center space-x-2"
                  >
                    <span>Next Phase</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Helpful Tips */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                💡 Tip: You can skip any phase and return to it later. More data improves recommendation accuracy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
      >
        <p className="text-sm text-yellow-800">
          <strong>Medical Disclaimer:</strong> This AI-powered tool is designed to support 
          healthcare professionals by organizing information and outlining potential treatment 
          paths. The predictions are based on scientific data and provided information. This 
          is an educational guide and not a substitute for direct medical consultation. All 
          treatment decisions must be made with qualified medical professionals.
        </p>
      </motion.div>
    </div>
  );
}

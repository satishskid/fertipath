
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
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PatientProfile, TreatmentPathway } from '@/lib/types';
import { calculateTreatmentPathways } from '@/lib/pathway-calculator';
import { toast } from 'sonner';

// Import phase components
import Phase1Profile from './phases/phase1-profile';
import Phase2Timeline from './phases/phase2-timeline';
import Phase3Analysis from './phases/phase3-analysis';
import Phase4Suggestions from './phases/phase4-suggestions';
import Phase5EnhancedPathways from './phases/phase5-enhanced-pathways';

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

  const canProceedToPhase = useCallback((phase: number): boolean => {
    if (phase === 1) return true;
    return phaseCompletion[phase - 1] || false;
  }, [phaseCompletion]);

  const proceedToNextPhase = useCallback(() => {
    if (currentPhase < 5 && canProceedToPhase(currentPhase + 1)) {
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
    toast.info('Planner reset for new patient');
  }, []);

  const PhaseIndicator = () => (
    <div className="w-full mb-8">
      <div className="flex justify-center items-center space-x-4 mb-4">
        {phases.map((phase, index) => {
          const isActive = currentPhase === phase.id;
          const isCompleted = phaseCompletion[phase.id];
          const isAccessible = canProceedToPhase(phase.id);
          
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 shadow-lg'
                      : isActive
                      ? phase.color + ' shadow-lg'
                      : 'bg-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <phase.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs font-medium text-gray-700">{phase.title}</p>
                  <p className="text-xs text-gray-500 max-w-24 text-center">
                    {phase.description}
                  </p>
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
                      phaseCompletion[phase.id] ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{
                      width: phaseCompletion[phase.id] ? '100%' : '0%'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="w-full max-w-2xl mx-auto">
        <Progress 
          value={(Object.keys(phaseCompletion).length / 5) * 100} 
          className="h-2"
        />
        <p className="text-center text-sm text-gray-600 mt-2">
          {Object.keys(phaseCompletion).length} of 5 phases completed
        </p>
      </div>
    </div>
  );

  const renderCurrentPhase = () => {
    const commonProps = {
      patientProfile,
      updatePatientProfile,
      markPhaseComplete,
      proceedToNextPhase
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
        
        <p className="text-lg text-gray-600 mb-2">
          AI-powered fertility treatment planning for healthcare professionals
        </p>
        
        {patientCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full"
          >
            <span className="text-sm font-medium text-primary">
              Patient Code: {patientCode}
            </span>
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
              <Button
                variant="outline"
                onClick={resetPlanner}
                className="flex items-center space-x-2"
              >
                <Circle className="w-4 h-4" />
                <span>New Patient</span>
              </Button>

              {currentPhase < 5 && (
                <Button
                  onClick={proceedToNextPhase}
                  disabled={!canProceedToPhase(currentPhase + 1)}
                  className="flex items-center space-x-2"
                >
                  <span>Next Phase</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
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

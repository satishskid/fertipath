
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clipboard, 
  Heart, 
  Calendar, 
  Monitor, 
  Users, 
  Target,
  ArrowRight,
  CheckCircle,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PatientProfile } from '@/lib/types';

// Import the new components
import ManualDataEntry from '@/components/manual-data-entry';
import PatientChoiceSelector from '@/components/patient-choice-selector';
import PersonalizedTimelineDisplay from '@/components/personalized-timeline-display';
import RemoteCarePortal from '@/components/remote-care-portal';
import ProviderDashboard from '@/components/provider-dashboard';

interface Phase6EnhancedFeaturesProps {
  patientProfile: PatientProfile;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  markPhaseComplete: (phase: number) => void;
  proceedToNextPhase: () => void;
  treatmentPathways?: any[];
}

const features = [
  {
    id: 'manual-entry',
    title: 'Manual Data Entry',
    description: 'Enter lab results and medical findings manually',
    icon: Clipboard,
    color: 'bg-blue-500'
  },
  {
    id: 'patient-choice',
    title: 'Treatment Choice',
    description: 'Select your preferred treatment path with detailed reasoning',
    icon: Heart,
    color: 'bg-red-500'
  },
  {
    id: 'personalized-timeline',
    title: 'Personalized Timeline',
    description: 'View your customized treatment timeline with milestones',
    icon: Calendar,
    color: 'bg-green-500'
  },
  {
    id: 'remote-care',
    title: 'Remote Care Portal',
    description: 'Upload results, schedule virtual consultations',
    icon: Monitor,
    color: 'bg-purple-500'
  },
  {
    id: 'provider-dashboard',
    title: 'Provider Dashboard',
    description: 'Healthcare provider interface for patient management',
    icon: Users,
    color: 'bg-orange-500'
  }
];

export default function Phase6EnhancedFeatures({
  patientProfile,
  updatePatientProfile,
  markPhaseComplete,
  proceedToNextPhase,
  treatmentPathways = []
}: Phase6EnhancedFeaturesProps) {
  const [activeFeature, setActiveFeature] = useState('manual-entry');
  const [completedFeatures, setCompletedFeatures] = useState<Set<string>>(new Set());
  const [selectedTreatment, setSelectedTreatment] = useState('');

  const handleFeatureComplete = (featureId: string, data?: any) => {
    setCompletedFeatures(prev => new Set([...prev, featureId]));
    
    if (featureId === 'patient-choice' && data) {
      setSelectedTreatment(data.selectedOption);
    }
  };

  const renderFeatureContent = () => {
    const patientCode = patientProfile.patientCode;

    switch (activeFeature) {
      case 'manual-entry':
        return (
          <ManualDataEntry
            patientCode={patientCode}
            onDataSaved={(data) => handleFeatureComplete('manual-entry', data)}
          />
        );
      
      case 'patient-choice':
        return (
          <PatientChoiceSelector
            patientCode={patientCode}
            treatmentOptions={treatmentPathways}
            onChoiceSelected={(choice) => handleFeatureComplete('patient-choice', choice)}
          />
        );
      
      case 'personalized-timeline':
        return (
          <PersonalizedTimelineDisplay
            patientCode={patientCode}
            selectedTreatment={selectedTreatment}
            onTimelineGenerated={(timeline) => handleFeatureComplete('personalized-timeline', timeline)}
          />
        );
      
      case 'remote-care':
        return (
          <RemoteCarePortal
            patientCode={patientCode}
          />
        );
      
      case 'provider-dashboard':
        return (
          <ProviderDashboard
            providerId="demo_provider"
            providerName="Dr. Smith"
            providerRole="fertility_specialist"
          />
        );
      
      default:
        return null;
    }
  };

  const progressPercentage = (completedFeatures.size / features.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Care Features</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our comprehensive remote care management system with manual data entry, 
          patient choice tracking, personalized timelines, and provider dashboard.
        </p>

        {/* Progress Indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completedFeatures.size}/{features.length} features explored</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Feature Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span>Available Features</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Click on any feature below to explore its functionality
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeFeature === feature.id;
              const isCompleted = completedFeatures.has(feature.id);
              
              return (
                <motion.div
                  key={feature.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      isActive 
                        ? 'border-purple-500 bg-purple-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveFeature(feature.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="space-y-3">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full ${feature.color} mx-auto flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-sm">{feature.title}</h3>
                          <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                        </div>

                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Explored
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feature Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFeature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderFeatureContent()}
        </motion.div>
      </AnimatePresence>

      {/* Feature Information */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-500 rounded-lg">
              {React.createElement(features.find(f => f.id === activeFeature)?.icon || Target, {
                className: "w-5 h-5 text-white"
              })}
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-900">
                {features.find(f => f.id === activeFeature)?.title}
              </h3>
              <div className="text-sm text-purple-800">
                {activeFeature === 'manual-entry' && (
                  <div className="space-y-1">
                    <p>• Copy-paste lab results, ultrasound findings, or consultation notes</p>
                    <p>• AI automatically parses and structures medical data</p>
                    <p>• Creates timeline events for better tracking</p>
                  </div>
                )}
                {activeFeature === 'patient-choice' && (
                  <div className="space-y-1">
                    <p>• Select your preferred treatment option with detailed reasoning</p>
                    <p>• Rate importance of factors like cost, timeline, and success rate</p>
                    <p>• Track decision-making process for better care</p>
                  </div>
                )}
                {activeFeature === 'personalized-timeline' && (
                  <div className="space-y-1">
                    <p>• AI-generated timeline based on your specific treatment path</p>
                    <p>• Detailed phases with preparation tips and milestones</p>
                    <p>• Remote vs in-person requirements clearly marked</p>
                  </div>
                )}
                {activeFeature === 'remote-care' && (
                  <div className="space-y-1">
                    <p>• Upload blood test results and medication compliance photos</p>
                    <p>• Schedule virtual consultations with your care team</p>
                    <p>• Track session status and provider responses</p>
                  </div>
                )}
                {activeFeature === 'provider-dashboard' && (
                  <div className="space-y-1">
                    <p>• Healthcare provider interface for patient management</p>
                    <p>• Review urgent cases and pending remote sessions</p>
                    <p>• Create provider reviews and recommendations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Actions */}
      {completedFeatures.size >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-800">
                    Great! You've explored the key features
                  </h3>
                </div>
                
                <p className="text-green-700">
                  You now have access to comprehensive remote care management tools that will 
                  support you throughout your fertility journey.
                </p>

                <Button 
                  onClick={() => {
                    markPhaseComplete(6);
                    proceedToNextPhase();
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Enhanced Features Phase
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Need Help?</p>
              <p>Each feature is designed to enhance your fertility care experience. 
                 Explore them at your own pace to understand how they can support your journey.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Users,
  Video,
  MapPin,
  BookOpen,
  Activity,
  Brain,
  ExternalLink,
  Lightbulb,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PatientProfile, TreatmentPathway } from '@/lib/types';
import { toast } from 'sonner';
import StoryBoardJourney from '@/components/story-board-journey';
import DoctorRecommendations from '@/components/doctor-recommendations';
import InterfaceModeToggle from '@/components/interface-mode-toggle';

interface Phase5EnhancedPathwaysProps {
  patientProfile: PatientProfile;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  markPhaseComplete: (phase: number) => void;
  proceedToNextPhase: () => void;
  markPhaseSkipped?: (phase: number) => void;
  updateDataCompleteness?: (phase: number, score: number) => void;
  interfaceMode?: 'patient' | 'doctor';
  handlePatientChoice?: (choice: any) => void;
  handleTreatmentSelection?: (treatment: TreatmentPathway) => void;
  selectedTreatment?: TreatmentPathway | null;
  patientChoices?: any;
  treatmentPathways?: TreatmentPathway[];
  setTreatmentPathways?: (pathways: TreatmentPathway[]) => void;
}

export default function Phase5EnhancedPathways({ 
  patientProfile, 
  updatePatientProfile, 
  markPhaseComplete,
  proceedToNextPhase,
  markPhaseSkipped,
  updateDataCompleteness,
  interfaceMode = 'patient',
  handlePatientChoice,
  handleTreatmentSelection,
  selectedTreatment,
  patientChoices,
  treatmentPathways,
  setTreatmentPathways
}: Phase5EnhancedPathwaysProps) {
  const [pathways, setPathways] = useState<TreatmentPathway[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pathways' | 'journey' | 'doctors' | 'telemedicine'>('pathways');
  const [journeySteps, setJourneySteps] = useState<any[]>([]);

  useEffect(() => {
    generateEnhancedPathways();
    generateJourneySteps();
  }, [patientProfile.patientCode]);

  const generateEnhancedPathways = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientCode: patientProfile.patientCode,
          includeEvidence: interfaceMode === 'doctor',
          includeTelemedicine: true,
          includeAlternatives: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate pathways');
      }

      const result = await response.json();
      if (result.success) {
        setPathways(result.pathways);
        if (result.pathways.length > 0 && result.pathways[0].id) {
          setSelectedPathway(result.pathways[0].id);
        }
      }
    } catch (error) {
      console.error('Error generating pathways:', error);
      // Use sample data as fallback
      const samplePathways = generateSamplePathways();
      setPathways(samplePathways);
      if (samplePathways.length > 0 && samplePathways[0].id) {
        setSelectedPathway(samplePathways[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateJourneySteps = async () => {
    try {
      const response = await fetch('/api/journey-steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientCode: patientProfile.patientCode,
          treatmentType: 'IVF'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate journey steps');
      }

      const result = await response.json();
      if (result.success) {
        setJourneySteps(result.journeySteps);
      }
    } catch (error) {
      console.error('Error generating journey steps:', error);
    }
  };

  const generateSamplePathways = (): TreatmentPathway[] => {
    return [
      {
        id: '1',
        name: 'IVF with ICSI',
        description: 'In vitro fertilization with intracytoplasmic sperm injection for optimal fertilization',
        successRate: 65,
        timeline: '3-4 months per cycle',
        costMin: 180000,
        costMax: 250000,
        suitability: 85,
        pros: [
          'Highest success rates for your age group',
          'Addresses both male and female factors',
          'Can use genetic testing (PGT-A)',
          'Multiple embryos can be frozen for future use'
        ],
        cons: [
          'More invasive procedure',
          'Higher cost per cycle',
          'Requires multiple clinic visits',
          'Some side effects from medications'
        ],
        recommendation: 'Highly recommended based on your profile',
        priority: 1,
        evidenceLevel: 'high',
        researchLinks: [
          'https://pubmed.ncbi.nlm.nih.gov/example1',
          'https://pubmed.ncbi.nlm.nih.gov/example2'
        ],
        alternativePaths: ['IUI with Ovulation Induction', 'Natural Cycle IVF'],
        telemedicineSteps: {
          consultations: ['Initial consultation', 'Follow-up consultations', 'Results discussion'],
          monitoring: ['Some cycle monitoring (blood work)', 'Post-transfer follow-up'],
          counseling: ['Pre-treatment counseling', 'Support during treatment']
        },
        inPersonSteps: {
          required: ['Baseline ultrasounds', 'Egg retrieval', 'Embryo transfer'],
          optional: ['Some monitoring visits', 'Medication training']
        },
        remoteMonitoring: true,
        virtualConsults: true,
        estimatedDuration: '3-4 months',
        preparationSteps: {
          medical: ['Complete all baseline testing', 'Start prenatal vitamins', 'Optimize diet and exercise'],
          lifestyle: ['Reduce stress', 'Quit smoking/alcohol', 'Maintain healthy weight'],
          emotional: ['Consider counseling', 'Build support network', 'Set realistic expectations']
        },
        milestones: [
          { week: 1, title: 'Treatment Planning', description: 'Finalize protocol and medication orders' },
          { week: 2, title: 'Stimulation Start', description: 'Begin fertility medications' },
          { week: 4, title: 'Egg Retrieval', description: 'Minor procedure to collect eggs' },
          { week: 5, title: 'Embryo Transfer', description: 'Transfer best quality embryo' },
          { week: 7, title: 'Pregnancy Test', description: 'Blood test to confirm success' }
        ]
      },
      {
        id: '2',
        name: 'IUI with Ovulation Induction',
        description: 'Intrauterine insemination with fertility medications to enhance ovulation',
        successRate: 25,
        timeline: '1-2 months per cycle',
        costMin: 15000,
        costMax: 25000,
        suitability: 60,
        pros: [
          'Less invasive than IVF',
          'Lower cost per cycle',
          'Fewer clinic visits required',
          'Minimal side effects'
        ],
        cons: [
          'Lower success rates',
          'May need multiple cycles',
          'Less control over outcome',
          'Not suitable for all conditions'
        ],
        recommendation: 'Good starting option for unexplained infertility',
        priority: 2,
        evidenceLevel: 'moderate',
        researchLinks: [
          'https://pubmed.ncbi.nlm.nih.gov/example3'
        ],
        alternativePaths: ['Natural Cycle Monitoring', 'IVF with ICSI'],
        telemedicineSteps: {
          consultations: ['Initial consultation', 'Cycle review'],
          monitoring: ['Some cycle monitoring'],
          counseling: ['Treatment counseling']
        },
        inPersonSteps: {
          required: ['Monitoring ultrasounds', 'IUI procedure'],
          optional: ['Some consultations']
        },
        remoteMonitoring: false,
        virtualConsults: true,
        estimatedDuration: '1-2 months',
        preparationSteps: {
          medical: ['Confirm tubal patency', 'Optimize sperm parameters'],
          lifestyle: ['Track ovulation patterns', 'Maintain healthy lifestyle'],
          emotional: ['Set cycle expectations', 'Plan for multiple attempts']
        },
        milestones: [
          { week: 1, title: 'Cycle Start', description: 'Begin monitoring and medications' },
          { week: 2, title: 'Ovulation Trigger', description: 'Trigger ovulation with HCG shot' },
          { week: 2, title: 'IUI Procedure', description: 'Intrauterine insemination' },
          { week: 4, title: 'Pregnancy Test', description: 'Test for success' }
        ]
      }
    ];
  };

  const selectedPathwayData = pathways.find((p: TreatmentPathway) => p.id === selectedPathway);

  const handleInterfaceModeChange = (newMode: 'patient' | 'doctor') => {
    updatePatientProfile({ interfaceMode: newMode });
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 60) return 'text-green-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Interface Mode Toggle */}
      <InterfaceModeToggle
        currentMode={interfaceMode}
        patientCode={patientProfile.patientCode}
        onModeChange={handleInterfaceModeChange}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pathways" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Treatment Plans</span>
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Journey Story</span>
          </TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Find Doctors</span>
          </TabsTrigger>
          <TabsTrigger value="telemedicine" className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Telemedicine</span>
          </TabsTrigger>
        </TabsList>

        {/* Treatment Pathways Tab */}
        <TabsContent value="pathways" className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p>Generating personalized treatment recommendations...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pathway Selection */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Treatment Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pathways.map((pathway, index) => (
                      <motion.div
                        key={pathway.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div
                          className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedPathway === pathway.id
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'bg-muted/30 hover:bg-muted/50 border-2 border-transparent'
                          }`}
                          onClick={() => pathway.id && setSelectedPathway(pathway.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{pathway.name}</h3>
                            <Badge className={getSuitabilityColor(pathway.suitability)}>
                              {pathway.suitability}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {pathway.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className={`font-medium ${getSuccessColor(pathway.successRate)}`}>
                              {pathway.successRate}% success rate
                            </span>
                            <span className="text-muted-foreground">
                              ₹{pathway.costMin.toLocaleString()}-{pathway.costMax.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Pathway Details */}
              <div className="lg:col-span-2">
                {selectedPathwayData && (
                  <motion.div
                    key={selectedPathway}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl mb-2">
                              {selectedPathwayData.name}
                            </CardTitle>
                            <p className="text-muted-foreground">
                              {selectedPathwayData.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {selectedPathwayData.successRate}%
                            </div>
                            <div className="text-sm text-muted-foreground">Success Rate</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Timeline</p>
                              <p className="text-sm text-muted-foreground">{selectedPathwayData.timeline}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium">Cost Range</p>
                              <p className="text-sm text-muted-foreground">
                                ₹{selectedPathwayData.costMin.toLocaleString()}-{selectedPathwayData.costMax.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium">Suitability</p>
                              <p className="text-sm text-muted-foreground">{selectedPathwayData.suitability}% match</p>
                            </div>
                          </div>
                        </div>

                        {/* Telemedicine Integration */}
                        {selectedPathwayData.virtualConsults && (
                          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                            <div className="flex items-start space-x-2">
                              <Video className="w-5 h-5 text-green-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-green-800 mb-1">Telemedicine Available</p>
                                <p className="text-green-700 text-sm">
                                  Many consultations and follow-ups can be done virtually, reducing travel time and costs.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Pros and Cons */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold flex items-center space-x-2 mb-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span>Advantages</span>
                            </h4>
                            <ul className="space-y-2">
                              {selectedPathwayData.pros.map((pro, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm">
                                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold flex items-center space-x-2 mb-3">
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                              <span>Considerations</span>
                            </h4>
                            <ul className="space-y-2">
                              {selectedPathwayData.cons.map((con, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm">
                                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Evidence-Based Information (Doctor View) */}
                        {interfaceMode === 'doctor' && selectedPathwayData.evidenceLevel && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold flex items-center space-x-2 mb-2">
                              <Brain className="w-5 h-5 text-blue-600" />
                              <span>Clinical Evidence</span>
                            </h4>
                            <p className="text-sm text-blue-800 mb-2">
                              Evidence Level: <strong>{selectedPathwayData.evidenceLevel}</strong>
                            </p>
                            {selectedPathwayData.researchLinks && (
                              <div className="space-y-1">
                                {selectedPathwayData.researchLinks.map((link, index) => (
                                  <a
                                    key={index}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Research Reference {index + 1}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Treatment Milestones */}
                        {selectedPathwayData.milestones && (
                          <div>
                            <h4 className="font-semibold flex items-center space-x-2 mb-3">
                              <Activity className="w-5 h-5 text-purple-600" />
                              <span>Treatment Milestones</span>
                            </h4>
                            <div className="space-y-3">
                              {selectedPathwayData.milestones.map((milestone: any, index: number) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-800">
                                    {milestone.week}
                                  </div>
                                  <div>
                                    <p className="font-medium text-purple-900">{milestone.title}</p>
                                    <p className="text-sm text-purple-700">{milestone.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Patient Choice Selection Interface */}
          {!loading && pathways.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-2 border-blue-500 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-6 h-6 text-blue-600" />
                    <span>Make Your Treatment Choice</span>
                  </CardTitle>
                  <p className="text-blue-700">
                    Help us understand your preferences to provide personalized guidance
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Treatment Selection */}
                  <div>
                    <h4 className="font-semibold mb-3">Which treatment option do you prefer?</h4>
                    <div className="grid gap-3">
                      {pathways.map((pathway) => (
                        <label
                          key={pathway.id}
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedTreatment?.id === pathway.id
                              ? 'border-blue-500 bg-blue-100'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="treatment-choice"
                            value={pathway.id}
                            checked={selectedTreatment?.id === pathway.id}
                            onChange={() => handleTreatmentSelection && handleTreatmentSelection(pathway)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{pathway.name}</p>
                            <p className="text-sm text-gray-600">{pathway.successRate}% success rate • ₹{pathway.costMin.toLocaleString()}-{pathway.costMax.toLocaleString()}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Factor Importance Rating */}
                  <div>
                    <h4 className="font-semibold mb-3">How important are these factors to you?</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { key: 'cost', label: 'Treatment Cost', icon: DollarSign },
                        { key: 'success_rate', label: 'Success Rate', icon: TrendingUp },
                        { key: 'timeline', label: 'Treatment Timeline', icon: Clock },
                        { key: 'invasiveness', label: 'Procedure Complexity', icon: Activity }
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-gray-600" />
                            <label className="font-medium text-sm">{label}</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => handlePatientChoice && handlePatientChoice({ [`${key}_importance`]: rating })}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  (patientChoices?.[`${key}_importance`] || 0) >= rating
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : 'border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                <span className="text-xs font-medium">{rating}</span>
                              </button>
                            ))}
                            <span className="text-xs text-gray-500 ml-2">
                              {(patientChoices?.[`${key}_importance`] || 0) === 1 ? 'Not Important' : 
                               (patientChoices?.[`${key}_importance`] || 0) === 5 ? 'Very Important' : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confidence Level */}
                  <div>
                    <h4 className="font-semibold mb-3">How confident are you about this choice?</h4>
                    <div className="flex items-center space-x-4">
                      {[
                        { value: 'low', label: 'Need more information', color: 'bg-red-100 text-red-800' },
                        { value: 'medium', label: 'Somewhat confident', color: 'bg-yellow-100 text-yellow-800' },
                        { value: 'high', label: 'Very confident', color: 'bg-green-100 text-green-800' }
                      ].map(({ value, label, color }) => (
                        <button
                          key={value}
                          onClick={() => handlePatientChoice && handlePatientChoice({ confidence_level: value })}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            patientChoices?.confidence_level === value
                              ? `${color} border-current`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div>
                    <h4 className="font-semibold mb-3">Why did you choose this treatment? (Optional)</h4>
                    <textarea
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Share your thoughts about this treatment choice..."
                      value={patientChoices?.reasoning || ''}
                      onChange={(e) => handlePatientChoice && handlePatientChoice({ reasoning: e.target.value })}
                    />
                  </div>

                  {/* Partner Involvement */}
                  <div>
                    <h4 className="font-semibold mb-3">Partner Involvement</h4>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={patientChoices?.partner_involved || false}
                          onChange={(e) => handlePatientChoice && handlePatientChoice({ partner_involved: e.target.checked })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">My partner was involved in this decision</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button 
                      onClick={() => {
                        if (updateDataCompleteness) {
                          updateDataCompleteness(5, selectedTreatment ? 85 : 60);
                        }
                        markPhaseComplete(5);
                        toast.success('Treatment preference saved successfully');
                        proceedToNextPhase();
                      }}
                      className="flex items-center space-x-2"
                      disabled={!selectedTreatment}
                    >
                      <span>Save Choice & Continue</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (markPhaseSkipped) markPhaseSkipped(5);
                        if (updateDataCompleteness) updateDataCompleteness(5, 0);
                        proceedToNextPhase();
                      }}
                      className="flex items-center space-x-2"
                    >
                      <span>Skip Choice Selection</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* Journey Story Tab */}
        <TabsContent value="journey">
          <StoryBoardJourney 
            patientProfile={patientProfile} 
            interfaceMode={interfaceMode}
          />
        </TabsContent>

        {/* Doctor Recommendations Tab */}
        <TabsContent value="doctors">
          <DoctorRecommendations patientProfile={patientProfile} />
        </TabsContent>

        {/* Telemedicine Tab */}
        <TabsContent value="telemedicine" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="w-6 h-6 text-primary" />
                <span>Telemedicine Options</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Virtual consultations and remote monitoring options for your treatment
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedPathwayData?.telemedicineSteps && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold flex items-center space-x-2 mb-3">
                      <Video className="w-5 h-5 text-green-600" />
                      <span>Available Virtually</span>
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedPathwayData.telemedicineSteps).map(([category, items]: [string, any]) => (
                        <div key={category} className="p-3 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-800 capitalize mb-1">{category}:</p>
                          <ul className="text-sm text-green-700 space-y-1">
                            {items.map((item: string, index: number) => (
                              <li key={index} className="flex items-center space-x-2">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold flex items-center space-x-2 mb-3">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      <span>Requires In-Person Visit</span>
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedPathwayData.inPersonSteps).map(([category, items]: [string, any]) => (
                        <div key={category} className="p-3 bg-orange-50 rounded-lg">
                          <p className="font-medium text-orange-800 capitalize mb-1">{category}:</p>
                          <ul className="text-sm text-orange-700 space-y-1">
                            {items.map((item: string, index: number) => (
                              <li key={index} className="flex items-center space-x-2">
                                <AlertCircle className="w-3 h-3" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 mb-1">Benefits of Telemedicine</p>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Reduced travel time and costs</li>
                      <li>• More flexible scheduling options</li>
                      <li>• Comfort of home consultations</li>
                      <li>• Easier follow-up appointments</li>
                      <li>• Access to specialists regardless of location</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Completion Actions */}
      <Card className="border-2 border-green-500 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Treatment Plan Complete</p>
                <p className="text-sm text-green-600">
                  Your personalized fertility treatment plan is ready with {pathways.length} pathway options
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => {
                markPhaseComplete(5);
                toast.success('Fertility pathway plan completed successfully!');
              }}
              className="flex items-center space-x-2"
            >
              <Heart className="w-4 h-4" />
              <span>Complete Journey</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

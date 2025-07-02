
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  MapPin,
  Phone,
  Video,
  FileText,
  Heart,
  Zap,
  Target,
  Lightbulb,
  Users,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface PersonalizedTimelineDisplayProps {
  patientCode: string;
  selectedTreatment?: string;
  onTimelineGenerated?: (timeline: any) => void;
}

const categoryIcons = {
  consultation: Users,
  test: FileText,
  procedure: Zap,
  medication: Heart,
  monitoring: Target,
  milestone: CheckCircle
};

const phaseColors = {
  'Preparation Phase': 'bg-blue-500',
  'Treatment Phase': 'bg-green-500',
  'Monitoring Phase': 'bg-orange-500',
  'Recovery Phase': 'bg-purple-500'
};

export default function PersonalizedTimelineDisplay({ 
  patientCode, 
  selectedTreatment,
  onTimelineGenerated 
}: PersonalizedTimelineDisplayProps) {
  const [timeline, setTimeline] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExistingTimeline();
  }, [patientCode]);

  const loadExistingTimeline = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/personalized-timeline?patientCode=${patientCode}`);
      const result = await response.json();
      
      if (result.success && result.activeTimeline) {
        setTimeline(result.activeTimeline);
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeline = async () => {
    if (!selectedTreatment) {
      toast.error('Please select a treatment option first');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/personalized-timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientCode,
          treatmentPathway: selectedTreatment,
          startDate: new Date().toISOString().split('T')[0],
          patientPreferences: {}
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTimeline(result.timeline);
        toast.success('Personalized timeline generated successfully!');
        
        if (onTimelineGenerated) {
          onTimelineGenerated(result.timeline);
        }
      } else {
        throw new Error(result.error || 'Failed to generate timeline');
      }
    } catch (error) {
      console.error('Error generating timeline:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate timeline');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (!timeline?.phases) return 0;
    
    const totalTasks = timeline.phases.reduce((sum: number, phase: any) => 
      sum + (phase.tasks?.length || 0), 0);
    
    // For demo purposes, assume some progress
    return Math.min(25, totalTasks * 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Personalized Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timeline) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Personalized Timeline</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate a detailed, personalized timeline based on your chosen treatment path
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Timeline Generated Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Once you select a treatment option, we'll create a personalized timeline with detailed guidance for each phase.
            </p>
            <Button 
              onClick={generateTimeline}
              disabled={isGenerating || !selectedTreatment}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating Timeline...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Generate Timeline</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const phases = timeline.phases || [];
  const currentProgress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Timeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Your {timeline.treatmentPathway} Timeline</span>
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Duration: {timeline.totalDuration}
            </p>
            <Badge variant="outline" className="text-xs">
              {timeline.status === 'active' ? 'Active' : timeline.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{currentProgress}%</span>
              </div>
              <Progress value={currentProgress} className="h-2" />
            </div>

            {/* Key Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Start Date</p>
                <p className="text-sm text-gray-600">
                  {timeline.startDate ? formatDate(timeline.startDate) : 'To be scheduled'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Estimated Completion</p>
                <p className="text-sm text-gray-600">
                  {timeline.estimatedEndDate ? formatDate(timeline.estimatedEndDate) : 'TBD'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phases and Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Phases</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPhase.toString()} onValueChange={(value) => setSelectedPhase(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              {phases.map((phase: any, index: number) => (
                <TabsTrigger key={index} value={index.toString()} className="text-xs">
                  {phase.phase_name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {phases.map((phase: any, phaseIndex: number) => (
              <TabsContent key={phaseIndex} value={phaseIndex.toString()} className="space-y-6">
                {/* Phase Header */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${phaseColors[phase.phase_name as keyof typeof phaseColors] || 'bg-gray-500'}`} />
                    <h3 className="text-lg font-semibold">{phase.phase_name}</h3>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                  
                  <p className="text-gray-600">{phase.advice}</p>
                </div>

                {/* Phase Tasks */}
                <div className="space-y-4">
                  <h4 className="font-medium">Tasks & Appointments</h4>
                  <div className="space-y-3">
                    {phase.tasks?.map((task: any, taskIndex: number) => {
                      const Icon = categoryIcons[task.category as keyof typeof categoryIcons] || Circle;
                      return (
                        <motion.div
                          key={taskIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: taskIndex * 0.1 }}
                        >
                          <Card className="border-l-4 border-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <Icon className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium">{task.task}</h5>
                                    <div className="flex items-center space-x-2">
                                      {task.can_be_remote ? (
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                          <Home className="w-3 h-3 mr-1" />
                                          Remote OK
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                          <MapPin className="w-3 h-3 mr-1" />
                                          In-person
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600">{task.what_to_expect}</p>
                                  
                                  <div className="text-xs text-gray-500">
                                    <span className="font-medium">Timeline:</span> {task.timeline}
                                  </div>
                                  
                                  {task.preparation && task.preparation.length > 0 && (
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium text-gray-700">Preparation:</p>
                                      <ul className="text-xs text-gray-600 space-y-1">
                                        {task.preparation.map((prep: string, prepIndex: number) => (
                                          <li key={prepIndex} className="flex items-center space-x-1">
                                            <Circle className="w-2 h-2 fill-current" />
                                            <span>{prep}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Milestones */}
      {timeline.milestones && timeline.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <span>Key Milestones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeline.milestones.map((milestone: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    milestone.importance === 'high' ? 'bg-red-500' : 
                    milestone.importance === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium">{milestone.milestone}</p>
                    <p className="text-sm text-gray-600">Expected: Day {milestone.expected_day}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {milestone.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Tips */}
      {timeline.preparationTips && timeline.preparationTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span>Personalized Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeline.preparationTips.map((tip: string, index: number) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={loadExistingTimeline}>
          <Calendar className="w-4 h-4 mr-2" />
          Refresh Timeline
        </Button>
        
        <Button onClick={generateTimeline} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Updating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Update Timeline
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

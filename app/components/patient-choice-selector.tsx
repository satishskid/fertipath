
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Clock, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  Star,
  Calendar,
  MessageSquare,
  Users,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface PatientChoiceSelectorProps {
  patientCode: string;
  treatmentOptions: any[];
  onChoiceSelected?: (choice: any) => void;
}

const choiceReasons = [
  { id: 'cost', label: 'Cost considerations', icon: DollarSign },
  { id: 'timeline', label: 'Timeline preferences', icon: Clock },
  { id: 'success_rate', label: 'Success rate', icon: Star },
  { id: 'invasiveness', label: 'Invasiveness level', icon: Activity },
  { id: 'natural_approach', label: 'Natural approach', icon: Heart },
  { id: 'doctor_recommendation', label: 'Doctor recommendation', icon: CheckCircle }
];

const partnerInvolvementOptions = [
  { value: 'very_supportive', label: 'Very supportive and involved' },
  { value: 'supportive', label: 'Supportive' },
  { value: 'neutral', label: 'Neutral/undecided' },
  { value: 'concerned', label: 'Has concerns' },
  { value: 'not_involved', label: 'Not involved in decision' }
];

export default function PatientChoiceSelector({ 
  patientCode, 
  treatmentOptions, 
  onChoiceSelected 
}: PatientChoiceSelectorProps) {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [reasoning, setReasoning] = useState('');
  const [confidence, setConfidence] = useState([7]);
  const [costImportance, setCostImportance] = useState([5]);
  const [timelineImportance, setTimelineImportance] = useState([5]);
  const [successRateImportance, setSuccessRateImportance] = useState([8]);
  const [invasivenessImportance, setInvasivenessImportance] = useState([5]);
  const [alternativesConsidered, setAlternativesConsidered] = useState<string[]>([]);
  const [preferredStartDate, setPreferredStartDate] = useState('');
  const [maxTimelineMonths, setMaxTimelineMonths] = useState('');
  const [additionalConcerns, setAdditionalConcerns] = useState('');
  const [partnerInvolvement, setPartnerInvolvement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingChoice, setExistingChoice] = useState<any>(null);

  // Load existing choice if available
  useEffect(() => {
    const loadExistingChoice = async () => {
      try {
        const response = await fetch(`/api/patient-choice-tracking?patientCode=${patientCode}`);
        const result = await response.json();
        
        if (result.success && result.currentChoice) {
          const choice = result.currentChoice;
          setExistingChoice(choice);
          setSelectedOption(choice.selectedOption || '');
          setSelectedReasons(choice.choiceReason || []);
          setReasoning(choice.reasoning || '');
          setConfidence([choice.confidence || 7]);
          setCostImportance([choice.costImportance || 5]);
          setTimelineImportance([choice.timelineImportance || 5]);
          setSuccessRateImportance([choice.successRateImportance || 8]);
          setInvasivenessImportance([choice.invasivenessImportance || 5]);
          setAlternativesConsidered(choice.alternativesConsidered || []);
          setPreferredStartDate(choice.preferredStartDate ? choice.preferredStartDate.split('T')[0] : '');
          setMaxTimelineMonths(choice.maxTimelineMonths?.toString() || '');
          setAdditionalConcerns(choice.additionalConcerns || '');
          setPartnerInvolvement(choice.partnerInvolvement || '');
        }
      } catch (error) {
        console.error('Error loading existing choice:', error);
      }
    };

    if (patientCode) {
      loadExistingChoice();
    }
  }, [patientCode]);

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons(prev => 
      prev.includes(reasonId) 
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleAlternativeToggle = (optionName: string) => {
    setAlternativesConsidered(prev => 
      prev.includes(optionName)
        ? prev.filter(name => name !== optionName)
        : [...prev, optionName]
    );
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.error('Please select a treatment option');
      return;
    }

    if (selectedReasons.length === 0) {
      toast.error('Please select at least one reason for your choice');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/patient-choice-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientCode,
          treatmentPathwayId: selectedOption,
          selectedOption,
          choiceReason: selectedReasons,
          reasoning: reasoning.trim() || null,
          confidence: confidence[0],
          costImportance: costImportance[0],
          timelineImportance: timelineImportance[0],
          successRateImportance: successRateImportance[0],
          invasivenessImportance: invasivenessImportance[0],
          alternativesConsidered,
          preferredStartDate: preferredStartDate || null,
          maxTimelineMonths: maxTimelineMonths ? parseInt(maxTimelineMonths) : null,
          additionalConcerns: additionalConcerns.trim() || null,
          partnerInvolvement: partnerInvolvement || null
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Your treatment choice has been saved successfully!');
        
        if (onChoiceSelected) {
          onChoiceSelected(result.patientChoice);
        }
      } else {
        throw new Error(result.error || 'Failed to save choice');
      }
    } catch (error) {
      console.error('Error saving patient choice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save your choice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTreatment = treatmentOptions.find(option => option.name === selectedOption);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span>Choose Your Treatment Path</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select your preferred treatment option and help us understand your priorities
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Treatment Option Selection */}
          <div className="space-y-3">
            <Label>Treatment Options</Label>
            <div className="grid gap-3">
              {treatmentOptions.map((option) => (
                <motion.div
                  key={option.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedOption === option.name 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedOption(option.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              selectedOption === option.name 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {selectedOption === option.name && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <h3 className="font-semibold">{option.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{option.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>{option.successRate}% success</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{option.timeline}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span>₹{option.costMin?.toLocaleString()}-{option.costMax?.toLocaleString()}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {option.suitability}% match
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-6"
            >
              {/* Reason for Choice */}
              <div className="space-y-3">
                <Label>Why did you choose {selectedOption}? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {choiceReasons.map((reason) => {
                    const Icon = reason.icon;
                    return (
                      <div key={reason.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={reason.id}
                          checked={selectedReasons.includes(reason.id)}
                          onCheckedChange={() => handleReasonToggle(reason.id)}
                        />
                        <Label htmlFor={reason.id} className="flex items-center space-x-2 cursor-pointer">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span>{reason.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Reasoning */}
              <div className="space-y-2">
                <Label htmlFor="reasoning">Tell us more about your decision (optional)</Label>
                <Textarea
                  id="reasoning"
                  placeholder="Share any specific thoughts, concerns, or factors that influenced your choice..."
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Confidence Level */}
              <div className="space-y-3">
                <Label>How confident are you about this choice? ({confidence[0]}/10)</Label>
                <Slider
                  value={confidence}
                  onValueChange={setConfidence}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Not confident</span>
                  <span>Very confident</span>
                </div>
              </div>

              {/* Factor Importance */}
              <div className="space-y-4">
                <Label>How important are these factors to you? (1-10 scale)</Label>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Cost ({costImportance[0]}/10)</span>
                      <DollarSign className="w-4 h-4 text-gray-500" />
                    </div>
                    <Slider
                      value={costImportance}
                      onValueChange={setCostImportance}
                      max={10}
                      min={1}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Timeline ({timelineImportance[0]}/10)</span>
                      <Clock className="w-4 h-4 text-gray-500" />
                    </div>
                    <Slider
                      value={timelineImportance}
                      onValueChange={setTimelineImportance}
                      max={10}
                      min={1}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Success Rate ({successRateImportance[0]}/10)</span>
                      <Star className="w-4 h-4 text-gray-500" />
                    </div>
                    <Slider
                      value={successRateImportance}
                      onValueChange={setSuccessRateImportance}
                      max={10}
                      min={1}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Invasiveness ({invasivenessImportance[0]}/10)</span>
                      <Activity className="w-4 h-4 text-gray-500" />
                    </div>
                    <Slider
                      value={invasivenessImportance}
                      onValueChange={setInvasivenessImportance}
                      max={10}
                      min={1}
                      step={1}
                    />
                  </div>
                </div>
              </div>

              {/* Alternatives Considered */}
              <div className="space-y-3">
                <Label>Which other options did you consider?</Label>
                <div className="space-y-2">
                  {treatmentOptions
                    .filter(option => option.name !== selectedOption)
                    .map((option) => (
                      <div key={option.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`alt-${option.name}`}
                          checked={alternativesConsidered.includes(option.name)}
                          onCheckedChange={() => handleAlternativeToggle(option.name)}
                        />
                        <Label htmlFor={`alt-${option.name}`} className="cursor-pointer">
                          {option.name}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>

              {/* Timeline Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredStartDate">Preferred Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="preferredStartDate"
                      type="date"
                      value={preferredStartDate}
                      onChange={(e) => setPreferredStartDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxTimelineMonths">Maximum Timeline (months)</Label>
                  <Input
                    id="maxTimelineMonths"
                    type="number"
                    placeholder="e.g., 6"
                    value={maxTimelineMonths}
                    onChange={(e) => setMaxTimelineMonths(e.target.value)}
                    min="1"
                    max="24"
                  />
                </div>
              </div>

              {/* Partner Involvement */}
              <div className="space-y-2">
                <Label>Partner's involvement in this decision</Label>
                <Select value={partnerInvolvement} onValueChange={setPartnerInvolvement}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner involvement level" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerInvolvementOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Concerns */}
              <div className="space-y-2">
                <Label htmlFor="additionalConcerns">Any additional concerns or requirements?</Label>
                <Textarea
                  id="additionalConcerns"
                  placeholder="Share any other concerns, questions, or specific requirements you have..."
                  value={additionalConcerns}
                  onChange={(e) => setAdditionalConcerns(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedOption || selectedReasons.length === 0}
                  className="flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Choice...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{existingChoice ? 'Update Choice' : 'Save Choice'}</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

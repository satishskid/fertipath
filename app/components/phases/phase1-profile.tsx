
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Heart, 
  Brain, 
  RefreshCw,
  Activity,
  Stethoscope,
  MapPin,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  PatientProfile, 
  AGE_RANGES_FEMALE, 
  AGE_RANGES_MALE,
  CYCLE_PATTERNS,
  FEMALE_CONDITIONS,
  MALE_CONDITIONS,
  TIME_TRYING,
  PREVIOUS_TREATMENTS,
  EMOTIONAL_STATES,
  FINANCIAL_COMFORT
} from '@/lib/types';
import { toast } from 'sonner';

interface Phase1ProfileProps {
  patientProfile: PatientProfile;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  markPhaseComplete: (phase: number) => void;
  proceedToNextPhase: () => void;
  patientCode: string;
  generatePatientCode: () => void;
}

export default function Phase1Profile({ 
  patientProfile, 
  updatePatientProfile, 
  markPhaseComplete,
  proceedToNextPhase,
  patientCode,
  generatePatientCode 
}: Phase1ProfileProps) {
  const [isComplete, setIsComplete] = useState(false);

  // Check if phase is complete
  useEffect(() => {
    const { femaleProfile, maleProfile, coupleHistory, holistic } = patientProfile;
    const isPhaseComplete = 
      patientCode &&
      femaleProfile.age &&
      femaleProfile.cycle &&
      maleProfile.age &&
      coupleHistory.timeTrying &&
      coupleHistory.previousTreatments &&
      holistic.emotionalState &&
      holistic.financialComfort;

    setIsComplete(!!isPhaseComplete);
    
    if (isPhaseComplete) {
      markPhaseComplete(1);
    }
  }, [patientProfile, patientCode, markPhaseComplete]);

  const updateFemaleProfile = (field: string, value: any) => {
    updatePatientProfile({
      femaleProfile: { ...patientProfile.femaleProfile, [field]: value }
    });
  };

  const updateMaleProfile = (field: string, value: any) => {
    updatePatientProfile({
      maleProfile: { ...patientProfile.maleProfile, [field]: value }
    });
  };

  const updateCoupleHistory = (field: string, value: any) => {
    updatePatientProfile({
      coupleHistory: { ...patientProfile.coupleHistory, [field]: value }
    });
  };

  const updateHolistic = (field: string, value: any) => {
    updatePatientProfile({
      holistic: { ...patientProfile.holistic, [field]: value }
    });
  };

  const handleConditionChange = (conditionId: string, checked: boolean, type: 'female' | 'male') => {
    const profile = type === 'female' ? patientProfile.femaleProfile : patientProfile.maleProfile;
    const currentConditions = profile.conditions || [];
    
    let newConditions: string[];
    if (checked) {
      newConditions = [...currentConditions, conditionId];
    } else {
      newConditions = currentConditions.filter(c => c !== conditionId);
    }

    if (type === 'female') {
      updateFemaleProfile('conditions', newConditions);
    } else {
      updateMaleProfile('conditions', newConditions);
    }
  };

  const handleProceedToNext = () => {
    if (isComplete) {
      toast.success('Patient profile completed successfully');
      proceedToNextPhase();
    } else {
      toast.error('Please complete all required fields');
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            <span>Patient Registration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Enter Patient Code"
                value={patientCode}
                onChange={(e) => updatePatientProfile({ patientCode: e.target.value })}
                className="medical-form-input"
              />
            </div>
            <Button
              onClick={generatePatientCode}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Female Partner Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-pink-600">
                <User className="w-5 h-5" />
                <span>Female Partner Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age Range *</label>
                <Select 
                  value={patientProfile.femaleProfile.age || ""} 
                  onValueChange={(value) => updateFemaleProfile('age', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES_FEMALE.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Menstrual Cycle *</label>
                <Select 
                  value={patientProfile.femaleProfile.cycle || ""} 
                  onValueChange={(value) => updateFemaleProfile('cycle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLE_PATTERNS.map((pattern) => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Medical Conditions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {FEMALE_CONDITIONS.map((condition) => (
                    <div key={condition.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`female-${condition.id}`}
                        checked={(patientProfile.femaleProfile.conditions || []).includes(condition.id)}
                        onCheckedChange={(checked) => 
                          handleConditionChange(condition.id, checked as boolean, 'female')
                        }
                      />
                      <label 
                        htmlFor={`female-${condition.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {condition.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Male Partner Profile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-600">
                <User className="w-5 h-5" />
                <span>Male Partner Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age Range *</label>
                <Select 
                  value={patientProfile.maleProfile.age || ""} 
                  onValueChange={(value) => updateMaleProfile('age', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES_MALE.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Medical Conditions</label>
                <div className="space-y-2">
                  {MALE_CONDITIONS.map((condition) => (
                    <div key={condition.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`male-${condition.id}`}
                        checked={(patientProfile.maleProfile.conditions || []).includes(condition.id)}
                        onCheckedChange={(checked) => 
                          handleConditionChange(condition.id, checked as boolean, 'male')
                        }
                      />
                      <label 
                        htmlFor={`male-${condition.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {condition.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Couple's History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-600">
              <Heart className="w-5 h-5" />
              <span>Couple's Fertility History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Time Trying to Conceive *</label>
                <Select 
                  value={patientProfile.coupleHistory.timeTrying || ""} 
                  onValueChange={(value) => updateCoupleHistory('timeTrying', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_TRYING.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Previous Treatments *</label>
                <Select 
                  value={patientProfile.coupleHistory.previousTreatments || ""} 
                  onValueChange={(value) => updateCoupleHistory('previousTreatments', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select previous treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREVIOUS_TREATMENTS.map((treatment) => (
                      <SelectItem key={treatment.value} value={treatment.value}>
                        {treatment.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Holistic Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <Brain className="w-5 h-5" />
              <span>Holistic Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Emotional State *</label>
                <Select 
                  value={patientProfile.holistic.emotionalState || ""} 
                  onValueChange={(value) => updateHolistic('emotionalState', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select emotional state" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTIONAL_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Financial Comfort Level *</label>
                <Select 
                  value={patientProfile.holistic.financialComfort || ""} 
                  onValueChange={(value) => updateHolistic('financialComfort', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {FINANCIAL_COMFORT.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Location Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Location & Doctor Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">Your Zip Code</Label>
                <Input
                  id="zipCode"
                  placeholder="e.g., 400001"
                  value={patientProfile.location?.zipCode || ''}
                  onChange={(e) => updatePatientProfile({
                    location: {
                      ...patientProfile.location,
                      zipCode: e.target.value
                    }
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  For location-based doctor recommendations
                </p>
              </div>

              <div>
                <Label htmlFor="maxDistance">Maximum Distance (km)</Label>
                <Select value={patientProfile.location?.maxDistance?.toString() || '50'} 
                        onValueChange={(value) => updatePatientProfile({
                          location: {
                            ...patientProfile.location,
                            maxDistance: parseInt(value)
                          }
                        })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Within 10 km</SelectItem>
                    <SelectItem value="25">Within 25 km</SelectItem>
                    <SelectItem value="50">Within 50 km</SelectItem>
                    <SelectItem value="100">Within 100 km</SelectItem>
                    <SelectItem value="200">Within 200 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferredGender">Doctor Gender Preference</Label>
                <Select value={patientProfile.location?.preferredGender || 'no_preference'} 
                        onValueChange={(value) => updatePatientProfile({
                          location: {
                            ...patientProfile.location,
                            preferredGender: value as 'male' | 'female' | 'no_preference'
                          }
                        })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_preference">No Preference</SelectItem>
                    <SelectItem value="female">Female Doctor</SelectItem>
                    <SelectItem value="male">Male Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experienceLevel">Experience Level Preference</Label>
                <Select value={patientProfile.location?.experienceLevel || 'experienced'} 
                        onValueChange={(value) => updatePatientProfile({
                          location: {
                            ...patientProfile.location,
                            experienceLevel: value as 'junior' | 'experienced' | 'senior'
                          }
                        })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (1-5 years)</SelectItem>
                    <SelectItem value="experienced">Experienced (5-15 years)</SelectItem>
                    <SelectItem value="senior">Senior (15+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="specialization">Specialization Preference</Label>
                <Select value={patientProfile.location?.specialization || 'reproductive_endocrinology'} 
                        onValueChange={(value) => updatePatientProfile({
                          location: {
                            ...patientProfile.location,
                            specialization: value
                          }
                        })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reproductive_endocrinology">Reproductive Endocrinology</SelectItem>
                    <SelectItem value="ivf_specialist">IVF Specialist</SelectItem>
                    <SelectItem value="gynecologist">Gynecologist</SelectItem>
                    <SelectItem value="urologist">Urologist (Male Fertility)</SelectItem>
                    <SelectItem value="fertility_counselor">Fertility Counselor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Why we ask for location preferences:</p>
                <p>This helps us recommend fertility specialists and clinics in your area, 
                   along with telemedicine options and estimated costs specific to your region.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Completion Status */}
      <Card className={`border-2 ${isComplete ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className={`w-5 h-5 ${isComplete ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className={`font-medium ${isComplete ? 'text-green-800' : 'text-gray-600'}`}>
                  {isComplete ? 'Profile Complete' : 'Profile Incomplete'}
                </p>
                <p className="text-sm text-gray-500">
                  {isComplete 
                    ? 'All required information has been collected' 
                    : 'Please fill all required fields marked with *'
                  }
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleProceedToNext}
              disabled={!isComplete}
              className="flex items-center space-x-2"
            >
              <span>Save & Continue</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

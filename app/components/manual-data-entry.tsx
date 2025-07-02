
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clipboard, 
  Brain, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  PlusCircle,
  Calendar,
  Hospital,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ManualDataEntryProps {
  patientCode: string;
  onDataSaved?: (data: any) => void;
}

const entryTypes = [
  { value: 'lab_results', label: 'Lab Results', icon: FileText },
  { value: 'ultrasound', label: 'Ultrasound Findings', icon: Brain },
  { value: 'consultation_notes', label: 'Consultation Notes', icon: Clipboard },
  { value: 'sperm_analysis', label: 'Sperm Analysis', icon: FileText },
  { value: 'hormone_levels', label: 'Hormone Levels', icon: FileText }
];

const sampleTexts = {
  lab_results: `Date: 2024-01-15
AMH: 3.2 ng/mL (Normal: 1.0-4.0)
FSH: 8.5 mIU/mL (Normal: 3.0-12.0)
LH: 6.2 mIU/mL (Normal: 2.0-10.0)
Estradiol: 45 pg/mL (Normal: 20-80)
TSH: 2.1 mIU/L (Normal: 0.4-4.0)`,
  
  ultrasound: `Date: 2024-01-15
Antral Follicle Count:
- Right ovary: 8 follicles
- Left ovary: 7 follicles
- Total AFC: 15
Endometrial thickness: 8.2 mm
Ovarian volume: Normal
Findings: Good ovarian reserve, normal endometrial pattern`,
  
  consultation_notes: `Date: 2024-01-15
Chief complaint: Difficulty conceiving for 18 months
Medical history: Regular cycles, no known conditions
Physical exam: Normal
Assessment: Unexplained infertility
Plan: Start with IUI after fertility workup completion`,
  
  sperm_analysis: `Date: 2024-01-15
Volume: 3.2 mL
Concentration: 45 million/mL
Total count: 144 million
Motility: Grade A+B: 55%
Morphology: 14% normal forms
Assessment: Above WHO reference values`,
  
  hormone_levels: `Date: 2024-01-15
Day 3 Hormones:
FSH: 7.2 mIU/mL
LH: 5.8 mIU/mL
Estradiol: 35 pg/mL
Prolactin: 18 ng/mL
Thyroid: TSH 1.8 mIU/L`
};

export default function ManualDataEntry({ patientCode, onDataSaved }: ManualDataEntryProps) {
  const [entryType, setEntryType] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [testDate, setTestDate] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSampleText = (type: string) => {
    setOriginalText(sampleTexts[type as keyof typeof sampleTexts] || '');
    toast.success('Sample text loaded');
  };

  const handleSubmit = async () => {
    if (!entryType) {
      toast.error('Please select an entry type');
      return;
    }

    if (!originalText.trim()) {
      toast.error('Please enter some medical data');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/manual-data-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientCode,
          entryType,
          sourceType: 'manual_entry',
          originalText: originalText.trim(),
          testDate: testDate || null,
          facilityName: facilityName || null,
          doctorName: doctorName || null
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLastResult(result);
        toast.success('Data entry saved successfully!');
        
        // Clear form
        setOriginalText('');
        setTestDate('');
        setFacilityName('');
        setDoctorName('');
        
        if (onDataSaved) {
          onDataSaved(result);
        }
      } else {
        throw new Error(result.error || 'Failed to save data entry');
      }
    } catch (error) {
      console.error('Error saving data entry:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save data entry');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clipboard className="w-5 h-5 text-blue-500" />
            <span>Manual Data Entry</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Enter medical findings, lab results, or consultation notes manually
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Entry Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="entryType">Data Type</Label>
            <Select value={entryType} onValueChange={setEntryType}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of medical data" />
              </SelectTrigger>
              <SelectContent>
                {entryTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Sample Text Buttons */}
          {entryType && (
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleText(entryType)}
                  className="text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Load Sample
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.readText().then(text => {
                      setOriginalText(text);
                      toast.success('Text pasted from clipboard');
                    }).catch(() => {
                      toast.error('Failed to paste from clipboard');
                    });
                  }}
                  className="text-xs"
                >
                  <Clipboard className="w-3 h-3 mr-1" />
                  Paste from Clipboard
                </Button>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testDate">Test/Procedure Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="testDate"
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="facilityName">Facility/Lab Name</Label>
              <div className="relative">
                <Hospital className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="facilityName"
                  placeholder="e.g., City Hospital Lab"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="doctorName"
                  placeholder="e.g., Dr. Smith"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Text Entry Area */}
          <div className="space-y-2">
            <Label htmlFor="originalText">
              Medical Data {entryType && `(${entryTypes.find((t: any) => t.value === entryType)?.label})`}
            </Label>
            <Textarea
              id="originalText"
              placeholder={entryType ? 
                `Enter ${entryTypes.find((t: any) => t.value === entryType)?.label.toLowerCase()} data here. You can copy and paste from lab reports, consultation notes, or type manually.` : 
                'Select a data type first, then enter your medical data here'
              }
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Tip: You can copy-paste directly from lab reports, consultation notes, or ultrasound reports. 
              AI will automatically extract and structure the important information.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Brain className="w-4 h-4" />
              <span>AI will parse and structure your data automatically</span>
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isProcessing || !entryType || !originalText.trim()}
              className="flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Data Entry</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {lastResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span>Data Entry Saved Successfully</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Entry Type:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {entryTypes.find((t: any) => t.value === lastResult.dataEntry?.entryType)?.label}
                  </span>
                </div>
                
                {lastResult.dataEntry?.aiProcessed && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">AI Processing:</span>
                    <span className="flex items-center space-x-1 text-green-600">
                      <Brain className="w-3 h-3" />
                      <span>Completed</span>
                    </span>
                  </div>
                )}
                
                {lastResult.timelineCreated && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Timeline Updated:</span>
                    <span className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>Event Added</span>
                    </span>
                  </div>
                )}

                {lastResult.structuredData && (
                  <div className="space-y-2">
                    <span className="font-medium text-sm">Extracted Information:</span>
                    <div className="bg-white p-3 rounded border text-xs">
                      <pre className="whitespace-pre-wrap text-gray-700">
                        {JSON.stringify(lastResult.structuredData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

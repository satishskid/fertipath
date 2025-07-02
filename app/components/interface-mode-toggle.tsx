
'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  Stethoscope, 
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface InterfaceModeToggleProps {
  currentMode: 'patient' | 'doctor';
  patientCode: string;
  onModeChange: (mode: 'patient' | 'doctor') => void;
}

export default function InterfaceModeToggle({ 
  currentMode, 
  patientCode, 
  onModeChange 
}: InterfaceModeToggleProps) {
  const [switching, setSwitching] = useState(false);

  const toggleMode = async () => {
    const newMode = currentMode === 'patient' ? 'doctor' : 'patient';
    setSwitching(true);

    try {
      const response = await fetch('/api/toggle-interface-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientCode: patientCode,
          interfaceMode: newMode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch interface mode');
      }

      const result = await response.json();
      if (result.success) {
        onModeChange(newMode);
        toast.success(`Switched to ${newMode} interface`);
      } else {
        throw new Error(result.error || 'Failed to switch interface mode');
      }
    } catch (error) {
      console.error('Error switching interface mode:', error);
      toast.error('Failed to switch interface mode');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              currentMode === 'patient' 
                ? 'bg-blue-500 text-white' 
                : 'bg-purple-500 text-white'
            }`}>
              {currentMode === 'patient' ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <Stethoscope className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {currentMode === 'patient' ? 'Patient View' : 'Doctor View'}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentMode === 'patient' 
                  ? 'Simplified, patient-friendly explanations and guidance'
                  : 'Detailed clinical information and evidence-based data'
                }
              </p>
            </div>
          </div>
          
          <Button
            onClick={toggleMode}
            disabled={switching}
            variant="outline"
            className="flex items-center space-x-2"
          >
            {switching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : currentMode === 'patient' ? (
              <ToggleLeft className="w-5 h-5" />
            ) : (
              <ToggleRight className="w-5 h-5" />
            )}
            <span>
              Switch to {currentMode === 'patient' ? 'Doctor' : 'Patient'} View
            </span>
          </Button>
        </div>
        
        <div className="mt-3 p-3 bg-white/60 rounded-lg">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-700 mb-1">Patient View Features:</p>
              <ul className="text-blue-600 space-y-1">
                <li>• Story board journey visualization</li>
                <li>• Simple, encouraging explanations</li>
                <li>• Emotional support resources</li>
                <li>• Step-by-step guidance</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-purple-700 mb-1">Doctor View Features:</p>
              <ul className="text-purple-600 space-y-1">
                <li>• Clinical research references</li>
                <li>• Detailed success statistics</li>
                <li>• Evidence-based rationale</li>
                <li>• Technical medical details</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

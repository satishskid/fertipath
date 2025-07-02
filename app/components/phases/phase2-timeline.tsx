
'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Calendar, 
  Trash2, 
  Eye, 
  Download,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientProfile, MedicalFile, TimelineEvent } from '@/lib/types';
import { toast } from 'sonner';

interface Phase2TimelineProps {
  patientProfile: PatientProfile;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  markPhaseComplete: (phase: number) => void;
  proceedToNextPhase: () => void;
}

export default function Phase2Timeline({ 
  patientProfile, 
  updatePatientProfile, 
  markPhaseComplete,
  proceedToNextPhase 
}: Phase2TimelineProps) {
  const [uploadedFiles, setUploadedFiles] = useState<MedicalFile[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    for (const file of files) {
      const newFile: MedicalFile = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file),
        category: 'document',
        uploadedAt: new Date().toISOString(),
        analysisStatus: 'pending'
      };

      setUploadedFiles(prev => [...prev, newFile]);
      
      // Process file with AI
      await processFileWithAI(newFile, file);
    }

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFileWithAI = async (fileData: MedicalFile, file: File) => {
    setProcessingFile(fileData.id);
    setIsProcessing(true);

    try {
      // Update file status to processing
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, analysisStatus: 'processing' } : f
      ));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientCode', patientProfile.patientCode);

      const response = await fetch('/api/process-medical-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const result = await response.json();

      // Update file with extracted data
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileData.id ? { 
          ...f, 
          analysisStatus: 'completed',
          extractedData: result.extractedData 
        } : f
      ));

      // Add timeline events from extracted data
      if (result.timelineEvents && result.timelineEvents.length > 0) {
        setTimeline(prev => [...prev, ...result.timelineEvents]);
      }

      toast.success(`Successfully processed ${fileData.fileName}`);
    } catch (error) {
      console.error('Error processing file:', error);
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, analysisStatus: 'failed' } : f
      ));
      
      toast.error(`Failed to process ${fileData.fileName}`);
    } finally {
      setProcessingFile(null);
      setIsProcessing(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.info('File removed');
  };

  const handleProceedToNext = () => {
    if (uploadedFiles.length > 0) {
      markPhaseComplete(2);
      toast.success('Medical timeline created successfully');
      proceedToNextPhase();
    } else {
      toast.error('Please upload at least one medical file');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('image')) return Eye;
    return FileText;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Loader2;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  // Sample timeline events for demonstration
  const sampleTimelineEvents = [
    {
      id: '1',
      date: '2024-03-15',
      title: 'Initial Consultation',
      category: 'consultation' as const,
      details: 'First fertility consultation. Discussed trying for 2 years.',
      sourceFile: 'consultation_notes_mar2024.pdf'
    },
    {
      id: '2',
      date: '2024-04-10',
      title: 'Hormone Panel Results',
      category: 'lab_results' as const,
      details: 'AMH: 3.2 ng/mL, FSH: 6.1 mIU/mL, TSH: 2.4 µIU/mL',
      sourceFile: 'lab_results_apr2024.pdf'
    },
    {
      id: '3',
      date: '2024-05-20',
      title: 'HSG Procedure',
      category: 'procedure' as const,
      details: 'Hysterosalpingography completed. Both tubes patent.',
      sourceFile: 'hsg_report_may2024.pdf'
    }
  ];

  const timelineToDisplay = timeline.length > 0 ? timeline : sampleTimelineEvents;

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-primary" />
            <span>Medical History Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="upload-zone">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Medical Files</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Upload all past medical files including lab reports, ultrasound reports, 
              consultation notes, and treatment summaries. Our AI will automatically 
              read and organize them into a timeline.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{isProcessing ? 'Processing...' : 'Select Files'}</span>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Uploaded Files ({uploadedFiles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => {
                const FileIcon = getFileIcon(file.fileType);
                const StatusIcon = getStatusIcon(file.analysisStatus);
                
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.fileName}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <div className={`flex items-center space-x-1 ${getStatusColor(file.analysisStatus)}`}>
                            <StatusIcon className={`w-3 h-3 ${file.analysisStatus === 'processing' ? 'animate-spin' : ''}`} />
                            <span className="capitalize">{file.analysisStatus}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {file.analysisStatus === 'completed' && (
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Medical Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineToDisplay.length > 0 ? (
            <div className="space-y-4">
              {timelineToDisplay.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="timeline-item"
                >
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-primary">
                            {new Date(event.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            event.category === 'consultation' ? 'bg-blue-100 text-blue-800' :
                            event.category === 'lab_results' ? 'bg-green-100 text-green-800' :
                            event.category === 'treatment' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {event.category.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground mb-1">{event.title}</h4>
                        {event.details && (
                          <p className="text-sm text-muted-foreground mb-2">{event.details}</p>
                        )}
                        {event.sourceFile && (
                          <p className="text-xs text-muted-foreground">
                            Source: {event.sourceFile}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Upload medical files to automatically generate timeline
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Actions */}
      <Card className={`border-2 ${uploadedFiles.length > 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className={`w-5 h-5 ${uploadedFiles.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className={`font-medium ${uploadedFiles.length > 0 ? 'text-green-800' : 'text-gray-600'}`}>
                  {uploadedFiles.length > 0 ? 'Files Uploaded' : 'No Files Uploaded'}
                </p>
                <p className="text-sm text-gray-500">
                  {uploadedFiles.length > 0 
                    ? `${uploadedFiles.length} medical files processed and timeline generated`
                    : 'Upload medical files to create patient timeline'
                  }
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleProceedToNext}
              disabled={uploadedFiles.length === 0}
              className="flex items-center space-x-2"
            >
              <span>Continue to Analysis</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

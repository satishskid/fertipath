
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Upload, 
  Video, 
  MessageSquare, 
  FileText, 
  Camera,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Home,
  Stethoscope,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface RemoteCareSession {
  id: string;
  title: string;
  status: string;
  priority: string;
  sessionType: string;
  description?: string;
  scheduledDate?: string;
  completedDate?: string;
  providerNotes?: string;
  createdAt?: string;
  recommendations?: string;
  canBeRemote?: boolean;
}

interface RemoteCarePortalProps {
  patientCode: string;
}

const sessionTypes = [
  { value: 'blood_test_upload', label: 'Blood Test Results Upload', icon: FileText },
  { value: 'medication_photo', label: 'Medication Compliance Photo', icon: Camera },
  { value: 'symptom_report', label: 'Symptom Report', icon: Activity },
  { value: 'consultation_request', label: 'Consultation Request', icon: Video },
  { value: 'question', label: 'Ask a Question', icon: MessageSquare }
];

const priorityLevels = [
  { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
];

export default function RemoteCarePortal({ patientCode }: RemoteCarePortalProps) {
  const [activeTab, setActiveTab] = useState('new-session');
  const [sessions, setSessions] = useState<RemoteCareSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // New session form state
  const [sessionType, setSessionType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [scheduledDate, setScheduledDate] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [patientCode]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/remote-care-session?patientCode=${patientCode}`);
      const result = await response.json();
      
      if (result.success) {
        setSessions(result.remoteCareSession || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load remote care sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitSession = async () => {
    if (!sessionType) {
      toast.error('Please select a session type');
      return;
    }

    if (!title.trim()) {
      toast.error('Please provide a title');
      return;
    }

    setIsSubmitting(true);

    try {
      // For demo purposes, we'll create the session without actual file upload
      const filesData = uploadedFiles.map((file: File) => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));

      const response = await fetch('/api/remote-care-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientCode,
          sessionType,
          title: title.trim(),
          description: description.trim() || null,
          category: sessionType.includes('upload') ? 'monitoring' : 'consultation',
          canBeRemote: true,
          requiresInPerson: false,
          uploadedFiles: filesData.length > 0 ? filesData : null,
          scheduledDate: scheduledDate || null,
          priority
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Remote care session created successfully!');
        
        // Reset form
        setSessionType('');
        setTitle('');
        setDescription('');
        setPriority('normal');
        setScheduledDate('');
        setUploadedFiles([]);
        
        // Refresh sessions list
        await loadSessions();
        setActiveTab('sessions');
      } else {
        throw new Error(result.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'requires_attention':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-blue-500" />
          <span>Remote Care Portal</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload test results, request consultations, and communicate with your care team
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-session">New Session</TabsTrigger>
            <TabsTrigger value="sessions">My Sessions</TabsTrigger>
            <TabsTrigger value="telemedicine">Telemedicine</TabsTrigger>
          </TabsList>

          {/* New Session Tab */}
          <TabsContent value="new-session" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Session Type</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select what you need help with" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type: any) => {
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

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of your request"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details about your request, symptoms, or questions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((level: any) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Preferred Date/Time (optional)</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Files (optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload test results, photos, or documents
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports images, PDFs, and documents
                    </p>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded Files:</p>
                    {uploadedFiles.map((file: File, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSubmitSession}
                disabled={isSubmitting || !sessionType || !title.trim()}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Remote Session
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Remote Sessions Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first remote care session to get started.
                </p>
                <Button onClick={() => setActiveTab('new-session')}>
                  Create Session
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session: RemoteCareSession) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-l-4 border-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(session.status)}
                              <h3 className="font-medium">{session.title}</h3>
                              <Badge 
                                className={priorityLevels.find((p: any) => p.value === session.priority)?.color}
                              >
                                {session.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600">{session.description}</p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Type: {session.sessionType.replace('_', ' ')}</span>
                              <span>Created: {session.createdAt ? formatDate(session.createdAt) : 'N/A'}</span>
                              {session.scheduledDate && (
                                <span>Scheduled: {formatDate(session.scheduledDate)}</span>
                              )}
                            </div>

                            {session.providerNotes && (
                              <div className="mt-3 p-2 bg-blue-50 rounded">
                                <p className="text-sm text-blue-800">
                                  <strong>Provider Notes:</strong> {session.providerNotes}
                                </p>
                              </div>
                            )}

                            {session.recommendations && (
                              <div className="mt-2 p-2 bg-green-50 rounded">
                                <p className="text-sm text-green-800">
                                  <strong>Recommendations:</strong> {session.recommendations}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {session.canBeRemote && (
                              <Badge variant="outline" className="text-xs">
                                <Home className="w-3 h-3 mr-1" />
                                Remote
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Telemedicine Tab */}
          <TabsContent value="telemedicine" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="w-5 h-5 text-green-500" />
                    <span>Virtual Consultations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Connect with your healthcare provider from the comfort of your home.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Available for:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Follow-up consultations</li>
                        <li>• Result discussions</li>
                        <li>• Medication adjustments</li>
                        <li>• General questions</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Requirements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Stable internet connection</li>
                        <li>• Camera and microphone</li>
                        <li>• Quiet, private space</li>
                        <li>• Good lighting</li>
                      </ul>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Video className="w-4 h-4 mr-2" />
                    Schedule Virtual Consultation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span>Quick Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <Phone className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <p className="font-medium">Emergency Line</p>
                        <p className="text-sm text-gray-600">24/7 Support</p>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-500" />
                        <p className="font-medium">Chat Support</p>
                        <p className="text-sm text-gray-600">Quick Questions</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

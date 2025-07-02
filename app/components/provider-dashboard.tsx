
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Monitor,
  Activity,
  TrendingUp,
  Calendar,
  Eye,
  MessageSquare,
  Filter,
  Search,
  MoreHorizontal,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ProviderDashboardProps {
  providerId?: string;
  providerName?: string;
  providerRole?: string;
}

export default function ProviderDashboard({ 
  providerId = 'default_provider',
  providerName = 'Dr. Provider',
  providerRole = 'doctor'
}: ProviderDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [providerId, urgencyFilter, statusFilter]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        providerId,
        ...(urgencyFilter && { urgency: urgencyFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/provider-dashboard?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.dashboard);
      } else {
        throw new Error(result.error || 'Failed to load dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load provider dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReview = async (patientCode: string, reviewData: any) => {
    try {
      const response = await fetch('/api/provider-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientCode,
          providerId,
          providerName,
          providerRole,
          ...reviewData
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Review created successfully!');
        await loadDashboardData();
      } else {
        throw new Error(result.error || 'Failed to create review');
      }
    } catch (error) {
      console.error('Error creating review:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create review');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'in_progress': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'requires_attention': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-blue-500" />
            <span>Provider Dashboard</span>
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

  const stats = dashboardData?.statistics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-blue-500" />
              <span>Provider Dashboard</span>
            </div>
            <Badge variant="outline">{providerRole}</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Welcome back, {providerName}. Here's your patient overview.
          </p>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.pending_sessions || 0}</p>
                <p className="text-sm text-gray-600">Pending Sessions</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.urgent_sessions || 0}</p>
                <p className="text-sm text-gray-600">Urgent Cases</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completed_today || 0}</p>
                <p className="text-sm text-gray-600">Completed Today</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.total_patients || 0}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.reviews_pending || 0}</p>
                <p className="text-sm text-gray-600">Reviews Pending</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending-sessions" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending-sessions">Pending Sessions</TabsTrigger>
            <TabsTrigger value="urgent-patients">Urgent Patients</TabsTrigger>
            <TabsTrigger value="file-reviews">File Reviews</TabsTrigger>
            <TabsTrigger value="recent-reviews">Recent Reviews</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="requires_attention">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pending Sessions */}
        <TabsContent value="pending-sessions" className="space-y-4">
          {dashboardData?.pending_remote_sessions?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Pending Sessions
                </h3>
                <p className="text-gray-600">
                  All remote care sessions have been reviewed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dashboardData?.pending_remote_sessions?.map((session: any) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-l-4 border-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(session.status)}
                            <h3 className="font-medium">{session.title}</h3>
                            <Badge className={getPriorityColor(session.priority)}>
                              {session.priority}
                            </Badge>
                            <Badge variant="outline">
                              {session.patient?.patientCode}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600">{session.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Type: {session.sessionType.replace('_', ' ')}</span>
                            <span>Created: {formatDate(session.createdAt)}</span>
                            {session.scheduledDate && (
                              <span>Scheduled: {formatDate(session.scheduledDate)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Handle view details
                              toast.info('Opening session details...');
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => {
                              handleCreateReview(session.patient?.patientCode, {
                                reviewType: 'remote_session_review',
                                title: `Review: ${session.title}`,
                                findings: 'Session reviewed by provider',
                                recommendations: 'Follow standard protocol',
                                urgencyLevel: session.priority,
                                actionRequired: session.priority === 'urgent'
                              });
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Complete Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Urgent Patients */}
        <TabsContent value="urgent-patients" className="space-y-4">
          {dashboardData?.urgent_patients?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Urgent Cases
                </h3>
                <p className="text-gray-600">
                  All urgent patient cases have been addressed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dashboardData?.urgent_patients?.map((patient: any) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-l-4 border-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <h3 className="font-medium">Patient {patient.patientCode}</h3>
                            <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <p>Age: {patient.femaleAge}</p>
                            <p>Current Phase: {patient.currentPhase}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Urgent Sessions:</p>
                            {patient.remoteCareSession?.map((session: any) => (
                              <div key={session.id} className="text-xs text-gray-600 pl-4">
                                • {session.title} ({session.sessionType})
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200"
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                          
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Address Urgently
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* File Reviews */}
        <TabsContent value="file-reviews" className="space-y-4">
          {dashboardData?.files_needing_review?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Files to Review
                </h3>
                <p className="text-gray-600">
                  All uploaded files have been reviewed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dashboardData?.files_needing_review?.map((file: any) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <h3 className="font-medium">{file.originalFileName}</h3>
                            <Badge variant="outline">
                              {file.patient?.patientCode}
                            </Badge>
                            <Badge className={
                              file.analysisStatus === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }>
                              {file.analysisStatus}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <p>Category: {file.category}</p>
                            <p>Uploaded: {formatDate(file.uploadedAt)}</p>
                            <p>Size: {(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                          </div>

                          {file.confidence && (
                            <div className="text-sm">
                              <span className="font-medium">AI Confidence: </span>
                              <span className={file.confidence > 0.8 ? 'text-green-600' : 
                                             file.confidence > 0.5 ? 'text-orange-600' : 'text-red-600'}>
                                {(file.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View File
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => {
                              handleCreateReview(file.patient?.patientCode, {
                                reviewType: 'file_review',
                                title: `File Review: ${file.originalFileName}`,
                                findings: 'File reviewed by provider',
                                reviewedFileIds: [file.id],
                                urgencyLevel: 'normal'
                              });
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Reviewed
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recent Reviews */}
        <TabsContent value="recent-reviews" className="space-y-4">
          {dashboardData?.recent_reviews?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Recent Reviews
                </h3>
                <p className="text-gray-600">
                  Your recent provider reviews will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dashboardData?.recent_reviews?.map((review: any) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-5 h-5 text-green-500" />
                            <h3 className="font-medium">{review.title}</h3>
                            <Badge variant="outline">
                              {review.patient?.patientCode}
                            </Badge>
                            <Badge className={getPriorityColor(review.urgencyLevel)}>
                              {review.urgencyLevel}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600">{review.findings}</p>
                          
                          {review.recommendations && (
                            <p className="text-sm text-blue-600">
                              <strong>Recommendations:</strong> {review.recommendations}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Type: {review.reviewType.replace('_', ' ')}</span>
                            <span>Created: {formatDate(review.createdAt)}</span>
                            {review.actionRequired && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                                Action Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

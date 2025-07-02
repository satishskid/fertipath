
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Heart,
  Target,
  Activity,
  Calendar,
  Users,
  Lightbulb,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { StoryBoard, PatientProfile } from '@/lib/types';
import { toast } from 'sonner';

interface StoryBoardJourneyProps {
  patientProfile: PatientProfile;
  interfaceMode: 'patient' | 'doctor';
}

export default function StoryBoardJourney({ 
  patientProfile, 
  interfaceMode 
}: StoryBoardJourneyProps) {
  const [storyBoardChapters, setStoryBoardChapters] = useState<StoryBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'patient' | 'partner' | 'family'>('patient');

  useEffect(() => {
    generateStoryBoard();
  }, [patientProfile.patientCode]);

  const generateStoryBoard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-story-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientCode: patientProfile.patientCode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story board');
      }

      const result = await response.json();
      if (result.success) {
        setStoryBoardChapters(result.storyBoard);
        toast.success('Your personalized journey story has been created');
      } else {
        throw new Error(result.error || 'Failed to generate story board');
      }
    } catch (error) {
      console.error('Error generating story board:', error);
      toast.error('Failed to generate journey story');
    } finally {
      setLoading(false);
    }
  };

  const markChapterCompleted = async (chapterId: string) => {
    try {
      // Update local state immediately
      setStoryBoardChapters(prev => prev.map(chapter => 
        chapter.id === chapterId 
          ? { ...chapter, isCompleted: true, completedDate: new Date().toISOString() }
          : chapter
      ));

      // In a real app, you'd also update the database
      toast.success('Chapter marked as completed!');
    } catch (error) {
      console.error('Error marking chapter complete:', error);
      toast.error('Failed to update chapter status');
    }
  };

  const getChapterIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Heart,
      Activity,
      Target,
      Calendar,
      Clock
    };
    return icons[iconName] || BookOpen;
  };

  const getColorTheme = (theme: string) => {
    const themes = {
      hopeful: 'bg-green-100 border-green-500 text-green-800',
      scientific: 'bg-blue-100 border-blue-500 text-blue-800',
      supportive: 'bg-purple-100 border-purple-500 text-purple-800',
      empowering: 'bg-orange-100 border-orange-500 text-orange-800'
    };
    return themes[theme as keyof typeof themes] || themes.hopeful;
  };

  const currentChapter = storyBoardChapters.find((c: StoryBoard) => c.chapter === selectedChapter);
  const completedChapters = storyBoardChapters.filter((c: StoryBoard) => c.isCompleted).length;
  const progressPercentage = storyBoardChapters.length > 0 ? (completedChapters / storyBoardChapters.length) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p>Creating your personalized journey story...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Journey Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <span>Your Fertility Journey Story</span>
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                A visual guide through your personalized treatment pathway
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{completedChapters}/{storyBoardChapters.length}</p>
              <p className="text-sm text-muted-foreground">Chapters Complete</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Journey Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chapter Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Journey Chapters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {storyBoardChapters.map((chapter, index) => {
                const IconComponent = getChapterIcon(chapter.iconName || 'BookOpen');
                const isSelected = chapter.chapter === selectedChapter;
                
                return (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'bg-primary/10 border-2 border-primary' 
                          : 'bg-muted/30 hover:bg-muted/50 border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedChapter(chapter.chapter)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          chapter.isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isSelected 
                              ? 'bg-primary text-white' 
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {chapter.isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <IconComponent className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${
                            isSelected ? 'text-primary' : 'text-foreground'
                          }`}>
                            {chapter.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {chapter.estimatedTimeframe}
                          </p>
                        </div>
                        {chapter.isCompleted && (
                          <Badge variant="secondary" className="text-xs">
                            Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Chapter Content */}
        <div className="lg:col-span-2">
          {currentChapter && (
            <motion.div
              key={selectedChapter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`border-2 ${getColorTheme(currentChapter.colorTheme || 'hopeful')}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        Chapter {currentChapter.chapter}: {currentChapter.title}
                      </CardTitle>
                      {currentChapter.subtitle && (
                        <p className="text-lg text-muted-foreground mb-2">
                          {currentChapter.subtitle}
                        </p>
                      )}
                      <p className="text-sm">
                        {currentChapter.description}
                      </p>
                    </div>
                    {!currentChapter.isCompleted && (
                      <Button
                        onClick={() => markChapterCompleted(currentChapter.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Complete</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Content Tabs */}
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="patient">For You</TabsTrigger>
                      <TabsTrigger value="partner">For Partner</TabsTrigger>
                      <TabsTrigger value="family">For Family</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="patient" className="space-y-4">
                      <div className="p-4 bg-white/80 rounded-lg">
                        <p className="leading-relaxed">{currentChapter.patientContent}</p>
                      </div>
                      
                      {currentChapter.encouragementNote && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                          <div className="flex items-start space-x-2">
                            <Heart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-green-800 mb-1">Encouragement</p>
                              <p className="text-green-700 text-sm">{currentChapter.encouragementNote}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="partner" className="space-y-4">
                      <div className="p-4 bg-white/80 rounded-lg">
                        <p className="leading-relaxed">{currentChapter.partnerContent}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="family" className="space-y-4">
                      <div className="p-4 bg-white/80 rounded-lg">
                        <p className="leading-relaxed">{currentChapter.familyContent}</p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Items */}
                  {currentChapter.actionItems.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center space-x-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span>Action Items</span>
                      </h4>
                      <div className="grid gap-2">
                        {currentChapter.actionItems.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-white/60 rounded">
                            <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Support Tips */}
                  {currentChapter.supportTips.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center space-x-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        <span>Helpful Tips</span>
                      </h4>
                      <div className="grid gap-2">
                        {currentChapter.supportTips.map((tip, index) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded">
                            <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-yellow-800">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Concerns */}
                  {currentChapter.commonConcerns.length > 0 && interfaceMode === 'patient' && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span>Common Questions</span>
                      </h4>
                      <div className="grid gap-2">
                        {currentChapter.commonConcerns.map((concern, index) => (
                          <div key={index} className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                            "{concern}"
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
    </div>
  );
}

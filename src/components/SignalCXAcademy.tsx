import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  PlayCircle, 
  Target, 
  Shield,
  Users,
  Clock,
  ArrowRight,
  Medal,
  FileText,
  BookOpen,
  CheckCircle,
  Star
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  type: 'video' | 'reading' | 'hands-on';
  category: string;
  skills: string[];
  prerequisites?: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  modules: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completionRate: number;
}

interface ModuleProgress {
  progress: number;
  completed: boolean;
}

const learningModules: LearningModule[] = [
  // Fundamentals
  {
    id: 'fundamentals-intro',
    title: 'SignalCX Platform Overview',
    description: 'Learn the core concepts and capabilities of the SignalCX platform',
    duration: '15 min',
    difficulty: 'Beginner',
    completed: false,
    type: 'video',
    category: 'fundamentals',
    skills: ['Platform Navigation', 'Core Concepts', 'User Interface']
  },
  {
    id: 'account-health-monitoring',
    title: 'Understanding Account Health Scores',
    description: 'Master the art of interpreting and acting on customer health metrics',
    duration: '20 min',
    difficulty: 'Beginner',
    completed: false,
    type: 'video',
    category: 'fundamentals',
    skills: ['Health Scoring', 'Risk Assessment', 'Customer Analytics']
  },
  {
    id: 'signal-interpretation',
    title: 'Signal Detection and Analysis',
    description: 'Learn to identify, prioritize, and respond to customer signals effectively',
    duration: '25 min',
    difficulty: 'Intermediate',
    completed: false,
    type: 'hands-on',
    category: 'fundamentals',
    skills: ['Signal Analysis', 'Pattern Recognition', 'Data Interpretation']
  },
  // AI Workflows
  {
    id: 'ai-nba-generation',
    title: 'AI-Powered Next Best Actions',
    description: 'Understand how AI generates and prioritizes customer success recommendations',
    duration: '30 min',
    difficulty: 'Intermediate',
    completed: false,
    type: 'hands-on',
    category: 'ai-workflows',
    skills: ['AI Recommendations', 'Decision Making', 'Automation'],
    prerequisites: ['fundamentals-intro']
  },
  {
    id: 'predictive-analytics',
    title: 'Predictive Customer Analytics',
    description: 'Leverage machine learning for proactive customer success management',
    duration: '35 min',
    difficulty: 'Intermediate',
    completed: false,
    type: 'hands-on',
    category: 'ai-workflows',
    skills: ['Predictive Modeling', 'Risk Forecasting', 'Churn Prevention']
  },
  {
    id: 'workflow-automation',
    title: 'Automated Workflow Design',
    description: 'Create and manage automated workflows that respond to customer signals',
    duration: '40 min',
    difficulty: 'Advanced',
    completed: false,
    type: 'hands-on',
    category: 'ai-workflows',
    skills: ['Workflow Design', 'Process Automation', 'Trigger Management'],
    prerequisites: ['ai-nba-generation']
  },
  // Advanced
  {
    id: 'custom-segmentation',
    title: 'Advanced Customer Segmentation',
    description: 'Build sophisticated customer segments for targeted success strategies',
    duration: '45 min',
    difficulty: 'Advanced',
    completed: false,
    type: 'hands-on',
    category: 'advanced',
    skills: ['Customer Segmentation', 'Data Analysis', 'Strategy Development']
  },
  {
    id: 'custom-signals',
    title: 'Custom Signal Development',
    description: 'Create custom signals tailored to your business and customer base',
    duration: '50 min',
    difficulty: 'Advanced',
    completed: false,
    type: 'hands-on',
    category: 'advanced',
    skills: ['Signal Creation', 'Business Logic', 'Custom Analytics'],
    prerequisites: ['signal-interpretation']
  },
  // Integrations
  {
    id: 'dynamics-integration',
    title: 'Microsoft Dynamics 365 Integration',
    description: 'Connect SignalCX with your Dynamics 365 environment for seamless data flow',
    duration: '30 min',
    difficulty: 'Intermediate',
    completed: false,
    type: 'hands-on',
    category: 'integrations',
    skills: ['System Integration', 'Data Synchronization', 'CRM Management']
  },
  {
    id: 'teams-collaboration',
    title: 'Microsoft Teams & Outlook Integration',
    description: 'Enable real-time collaboration and notifications through Microsoft 365',
    duration: '25 min',
    difficulty: 'Beginner',
    completed: false,
    type: 'video',
    category: 'integrations',
    skills: ['Notifications', 'Collaboration', 'Communication']
  }
];

const learningPaths: LearningPath[] = [
  {
    id: 'customer-success-fundamentals',
    title: 'Customer Success Fundamentals',
    description: 'Start your SignalCX journey with essential concepts and basic workflows',
    estimatedTime: '2 hours',
    modules: ['fundamentals-intro', 'account-health-monitoring', 'signal-interpretation'],
    difficulty: 'Beginner',
    completionRate: 0
  },
  {
    id: 'ai-workflows-mastery',
    title: 'AI-Powered Workflows Mastery',
    description: 'Master advanced AI capabilities for automated customer success management',
    estimatedTime: '3 hours',
    modules: ['ai-nba-generation', 'predictive-analytics', 'workflow-automation'],
    difficulty: 'Intermediate',
    completionRate: 0
  },
  {
    id: 'advanced-practitioner',
    title: 'Advanced SignalCX Practitioner',
    description: 'Become a SignalCX expert with advanced segmentation and custom signal development',
    estimatedTime: '2 hours 30 minutes',
    modules: ['custom-segmentation', 'custom-signals'],
    difficulty: 'Advanced',
    completionRate: 0
  },
  {
    id: 'integration-specialist',
    title: 'Integration Specialist Track',
    description: 'Master all major integrations and become the go-to person for technical implementations',
    estimatedTime: '1 hour 30 minutes',
    modules: ['dynamics-integration', 'teams-collaboration'],
    difficulty: 'Intermediate',
    completionRate: 0
  }
];

export function SignalCXAcademy() {
  const [moduleProgress, setModuleProgress] = useKV<Record<string, ModuleProgress>>('academy-progress', {});
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);

  const safeModuleProgress = moduleProgress || {};

  const updateModuleProgress = (moduleId: string, progress: number, completed = false) => {
    setModuleProgress(prev => ({
      ...prev,
      [moduleId]: { progress, completed }
    }));
  };

  const startModule = (module: LearningModule) => {
    updateModuleProgress(module.id, 10);
    setActiveModule(module);
  };

  const completeModule = (module: LearningModule) => {
    updateModuleProgress(module.id, 100, true);
    setActiveModule(null);
  };

  const getModuleWithProgress = (module: LearningModule) => {
    const progress = safeModuleProgress[module.id] || { progress: 0, completed: false };
    return { ...module, ...progress };
  };

  const getPathProgress = (path: LearningPath) => {
    const completed = path.modules.filter(moduleId => 
      safeModuleProgress[moduleId]?.completed
    ).length;
    return Math.round((completed / path.modules.length) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'hands-on': return <Target className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const categoryModules = {
    fundamentals: learningModules.filter(m => m.category === 'fundamentals'),
    'ai-workflows': learningModules.filter(m => m.category === 'ai-workflows'),
    advanced: learningModules.filter(m => m.category === 'advanced'),
    integrations: learningModules.filter(m => m.category === 'integrations')
  };

  const overallProgress = learningModules.length > 0 ? 
    (Object.values(safeModuleProgress).filter(p => p.completed).length / learningModules.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="border-visible">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Medal className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">SignalCX Academy</CardTitle>
                <p className="text-sm text-muted-foreground">Master customer success with AI-powered learning</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(overallProgress)}%</div>
              <div className="text-xs text-muted-foreground">
                {Object.values(safeModuleProgress).filter(p => p.completed).length} of {learningModules.length} completed
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Learning Paths */}
      <Card className="border-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Learning Paths
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Structured learning journeys designed for different roles and experience levels
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {learningPaths.map((path) => {
            const progress = getPathProgress(path);
            return (
              <Card key={path.id} className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{path.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getDifficultyColor(path.difficulty)}>
                        {path.difficulty}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {path.modules.length} modules • {path.estimatedTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Progress value={progress} className="flex-1 mr-4" />
                    <Button 
                      size="sm" 
                      variant={progress === 100 ? "default" : "outline"}
                      onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
                    >
                      {progress === 100 ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-3 h-3 mr-1" />
                          {progress > 0 ? 'Continue' : 'Start'}
                        </>
                      )}
                    </Button>
                  </div>
                  {selectedPath === path.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2">
                        {path.modules.map((moduleId, index) => {
                          const module = learningModules.find(m => m.id === moduleId);
                          if (!module) return null;
                          const moduleWithProgress = getModuleWithProgress(module);
                          return (
                            <div key={moduleId} className="flex items-center gap-3 p-2 rounded-md border">
                              <div className="flex items-center gap-2">
                                {moduleWithProgress.completed ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                )}
                                <span className="text-sm font-medium">{index + 1}. {module.title}</span>
                              </div>
                              <div className="flex-1" />
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => startModule(module)}
                                disabled={moduleWithProgress.completed}
                              >
                                {moduleWithProgress.completed ? 'Completed' : 'Start'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Module Library */}
      <Card className="border-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Module Library
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Browse all available learning modules by category
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fundamentals" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
              <TabsTrigger value="ai-workflows">AI Workflows</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>
            
            {Object.entries(categoryModules).map(([category, modules]) => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.map((module) => {
                    const moduleWithProgress = getModuleWithProgress(module);
                    return (
                      <Card key={module.id} className="border-visible">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(module.type)}
                              <div>
                                <h3 className="font-semibold text-sm">{module.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs text-muted-foreground">{module.duration}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {module.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {moduleWithProgress.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <div className="w-5 h-5">
                                  {moduleWithProgress.progress > 0 && (
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{module.description}</p>
                          <div className="flex items-center justify-between">
                            <Button 
                              size="sm" 
                              variant={moduleWithProgress.completed ? "secondary" : "default"}
                              onClick={() => startModule(module)}
                              disabled={moduleWithProgress.completed}
                            >
                              {moduleWithProgress.completed ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </>
                              ) : moduleWithProgress.progress > 0 ? (
                                <>
                                  <PlayCircle className="w-3 h-3 mr-1" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="w-3 h-3 mr-1" />
                                  Start
                                </>
                              )}
                            </Button>
                            <Badge variant="outline" className={getDifficultyColor(module.difficulty)}>
                              <span className="text-xs text-white font-medium">{module.difficulty}</span>
                            </Badge>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {module.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {module.prerequisites && module.prerequisites.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-medium mb-1 text-muted-foreground">Prerequisites:</p>
                              <div className="flex flex-wrap gap-1">
                                {module.prerequisites.map((prereqId) => {
                                  const prereqModule = learningModules.find(m => m.id === prereqId);
                                  const isCompleted = safeModuleProgress[prereqId]?.completed;
                                  return (
                                    <div key={prereqId} className="flex items-center gap-1">
                                      <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                                        {isCompleted && <CheckCircle className="w-3 h-3 text-green-600" />}
                                        {prereqModule?.title || prereqId}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Active Module */}
      {activeModule && (
        <Card className="border-visible border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-primary" />
                Active Module
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveModule(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  {getTypeIcon(activeModule.type)}
                </div>
                <div>
                  <h3 className="font-semibold">{activeModule.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {activeModule.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm">{activeModule.description}</p>
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">What you'll learn:</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This is a simulated learning experience. In a real implementation, this would contain:
                </p>
                <ul className="space-y-2 text-sm">
                  {activeModule.type === 'video' && (
                    <li className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Interactive video content with guided demonstrations
                    </li>
                  )}
                  {activeModule.type === 'hands-on' && (
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Interactive exercises and knowledge checks
                    </li>
                  )}
                  {activeModule.type === 'reading' && (
                    <li className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Comprehensive reading materials and case studies
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Comprehensive resources and downloadable guides
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-between">
                <Button variant="outline">
                  Previous Module
                </Button>
                <Button 
                  onClick={() => completeModule(activeModule)}
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-visible">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-xl font-bold">
                  {Object.values(safeModuleProgress).filter(p => p.completed).length}
                </div>
                <p className="text-xs text-muted-foreground">Modules Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-visible">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-xl font-bold">
                  {Object.values(safeModuleProgress).filter(p => p.progress > 0 && !p.completed).length}
                </div>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-visible">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-xl font-bold">
                  {learningPaths.filter(path => getPathProgress(path) === 100).length}
                </div>
                <p className="text-xs text-muted-foreground">Paths Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap, 
  PlayCircle, 
  BookOpen, 
  Target, 
  TrendUp, 
  Shield,
  Brain,
  Users,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Lightbulb,
  Medal,
  Video,
  FileText,
  Headphones
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'fundamentals' | 'ai-workflows' | 'advanced' | 'integrations';
  completed: boolean;
  progress: number;
  type: 'video' | 'interactive' | 'reading' | 'hands-on';
  skills: string[];
  prerequisites?: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  modules: string[];
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completionRate: number;
}

const learningModules: LearningModule[] = [
  // Fundamentals
  {
    id: 'fundamentals-overview',
    title: 'SignalCX Platform Overview',
    description: 'Learn the core concepts of SignalCX and how it transforms customer success operations.',
    duration: '15 min',
    difficulty: 'Beginner',
    category: 'fundamentals',
    completed: false,
    progress: 0,
    type: 'video',
    skills: ['Platform Navigation', 'Account Management', 'Health Scoring']
  },
  {
    id: 'account-health-monitoring',
    title: 'Account Health Score Fundamentals',
    description: 'Understand how health scores are calculated and how to interpret them effectively.',
    duration: '20 min',
    difficulty: 'Beginner',
    category: 'fundamentals',
    completed: false,
    progress: 0,
    type: 'interactive',
    skills: ['Health Scoring', 'Risk Assessment', 'Early Warning Systems']
  },
  {
    id: 'signal-interpretation',
    title: 'Understanding Customer Signals',
    description: 'Master the art of interpreting various customer signals and their business implications.',
    duration: '25 min',
    difficulty: 'Intermediate',
    category: 'fundamentals',
    completed: false,
    progress: 0,
    type: 'hands-on',
    skills: ['Signal Analysis', 'Pattern Recognition', 'Customer Behavior']
  },
  
  // AI Workflows
  {
    id: 'ai-nba-generation',
    title: 'AI-Powered Next Best Actions',
    description: 'Learn how AI generates personalized recommendations and how to validate them.',
    duration: '30 min',
    difficulty: 'Intermediate',
    category: 'ai-workflows',
    completed: false,
    progress: 0,
    type: 'interactive',
    skills: ['AI Recommendations', 'Workflow Automation', 'Decision Making'],
    prerequisites: ['fundamentals-overview', 'signal-interpretation']
  },
  {
    id: 'predictive-analytics',
    title: 'Predictive Customer Analytics',
    description: 'Harness predictive models to forecast customer behavior and churn risk.',
    duration: '35 min',
    difficulty: 'Advanced',
    category: 'ai-workflows',
    completed: false,
    progress: 0,
    type: 'hands-on',
    skills: ['Predictive Modeling', 'Churn Prevention', 'Forecasting'],
    prerequisites: ['signal-interpretation', 'ai-nba-generation']
  },
  {
    id: 'workflow-automation',
    title: 'Building Automated Workflows',
    description: 'Create and manage automated workflows that respond to customer signals.',
    duration: '40 min',
    difficulty: 'Advanced',
    category: 'ai-workflows',
    completed: false,
    progress: 0,
    type: 'hands-on',
    skills: ['Workflow Design', 'Automation', 'Process Optimization'],
    prerequisites: ['ai-nba-generation']
  },
  
  // Advanced Features
  {
    id: 'advanced-segmentation',
    title: 'Advanced Customer Segmentation',
    description: 'Use AI-driven segmentation to create highly targeted customer groups.',
    duration: '45 min',
    difficulty: 'Advanced',
    category: 'advanced',
    completed: false,
    progress: 0,
    type: 'hands-on',
    skills: ['Customer Segmentation', 'Behavioral Analysis', 'Targeting'],
    prerequisites: ['predictive-analytics']
  },
  {
    id: 'custom-signals',
    title: 'Creating Custom Signal Types',
    description: 'Build custom signal types tailored to your business needs and industry.',
    duration: '50 min',
    difficulty: 'Advanced',
    category: 'advanced',
    completed: false,
    progress: 0,
    type: 'hands-on',
    skills: ['Signal Engineering', 'Custom Development', 'Business Logic'],
    prerequisites: ['signal-interpretation', 'workflow-automation']
  },
  
  // Integrations
  {
    id: 'dynamics-365-integration',
    title: 'Microsoft Dynamics 365 Integration',
    description: 'Set up and optimize the Dynamics 365 integration for seamless data flow.',
    duration: '30 min',
    difficulty: 'Intermediate',
    category: 'integrations',
    completed: false,
    progress: 0,
    type: 'hands-on',
    skills: ['CRM Integration', 'Data Synchronization', 'Opportunity Management']
  },
  {
    id: 'teams-notifications',
    title: 'Microsoft Teams & Outlook Integration',
    description: 'Configure real-time notifications and collaborative workflows.',
    duration: '25 min',
    difficulty: 'Beginner',
    category: 'integrations',
    completed: false,
    progress: 0,
    type: 'interactive',
    skills: ['Notifications', 'Collaboration', 'Communication']
  }
];

const learningPaths: LearningPath[] = [
  {
    id: 'customer-success-fundamentals',
    title: 'Customer Success Fundamentals',
    description: 'Start your SignalCX journey with essential concepts and basic platform navigation.',
    modules: ['fundamentals-overview', 'account-health-monitoring', 'signal-interpretation'],
    estimatedTime: '1 hour',
    difficulty: 'Beginner',
    completionRate: 0
  },
  {
    id: 'ai-powered-workflows',
    title: 'AI-Powered Workflows Mastery',
    description: 'Master AI-driven automation and predictive analytics for proactive customer success.',
    modules: ['ai-nba-generation', 'predictive-analytics', 'workflow-automation'],
    estimatedTime: '1.5 hours',
    difficulty: 'Intermediate',
    completionRate: 0
  },
  {
    id: 'advanced-practitioner',
    title: 'Advanced Practitioner Track',
    description: 'Become a SignalCX expert with advanced segmentation and custom signal development.',
    modules: ['advanced-segmentation', 'custom-signals', 'predictive-analytics'],
    estimatedTime: '2 hours',
    difficulty: 'Advanced',
    completionRate: 0
  },
  {
    id: 'integration-specialist',
    title: 'Integration Specialist',
    description: 'Master all platform integrations for maximum ecosystem connectivity.',
    modules: ['dynamics-365-integration', 'teams-notifications'],
    estimatedTime: '45 minutes',
    difficulty: 'Intermediate',
    completionRate: 0
  }
];

export function SignalCXAcademy() {
  const [moduleProgress, setModuleProgress] = useKV<Record<string, { completed: boolean; progress: number }>>('academy-progress', {});
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // Ensure moduleProgress is never undefined
  const safeModuleProgress = moduleProgress || {};

  const updateModuleProgress = (moduleId: string, progress: number, completed: boolean = false) => {
    setModuleProgress(prev => ({
      ...(prev || {}),
      [moduleId]: { progress, completed }
    }));
  };

  const startModule = (moduleId: string) => {
    setActiveModule(moduleId);
    updateModuleProgress(moduleId, 10, false);
  };

  const completeModule = (moduleId: string) => {
    updateModuleProgress(moduleId, 100, true);
    setActiveModule(null);
  };

  const getModuleWithProgress = (module: LearningModule) => ({
    ...module,
    completed: safeModuleProgress[module.id]?.completed || false,
    progress: safeModuleProgress[module.id]?.progress || 0
  });

  const getPathProgress = (path: LearningPath) => {
    const completedModules = path.modules.filter(moduleId => 
      safeModuleProgress[moduleId]?.completed
    ).length;
    return Math.round((completedModules / path.modules.length) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'interactive': return <Target className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'hands-on': return <Brain className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const modulesByCategory = {
    fundamentals: learningModules.filter(m => m.category === 'fundamentals'),
    'ai-workflows': learningModules.filter(m => m.category === 'ai-workflows'),
    advanced: learningModules.filter(m => m.category === 'advanced'),
    integrations: learningModules.filter(m => m.category === 'integrations')
  };

  const overallProgress = Math.round(
    (Object.values(safeModuleProgress).filter(p => p.completed).length / learningModules.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-visible">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">SignalCX Academy</CardTitle>
                <p className="text-sm text-muted-foreground">Master the platform with guided learning paths</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
              <p className="text-xs text-muted-foreground">Overall Progress</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Learning Progress</span>
              <span className="text-sm text-muted-foreground">
                {Object.values(safeModuleProgress).filter(p => p.completed).length} of {learningModules.length} modules completed
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningPaths.map((path) => {
              const progress = getPathProgress(path);
              return (
                <Card key={path.id} className="border-visible hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{path.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{path.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getDifficultyColor(path.difficulty)}`}>
                            {path.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {path.estimatedTime}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{progress}%</div>
                        <Progress value={progress} className="w-16 h-1 mt-1" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {path.modules.length} modules
                      </span>
                      <Button
                        size="sm"
                        variant={progress === 100 ? "outline" : "default"}
                        className="text-xs"
                        onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
                      >
                        {progress === 100 ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Review
                          </>
                        ) : progress > 0 ? (
                          <>
                            <PlayCircle className="w-3 h-3 mr-1" />
                            Continue
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3 h-3 mr-1" />
                            Start Path
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
                              <div key={moduleId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs font-medium">{module.title}</div>
                                  <div className="text-xs text-muted-foreground">{module.duration}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {moduleWithProgress.completed ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : moduleWithProgress.progress > 0 ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-primary">
                                      <div 
                                        className="w-full h-full rounded-full bg-primary"
                                        style={{ transform: `scale(${moduleWithProgress.progress / 100})` }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-6 px-2"
                                    onClick={() => startModule(moduleId)}
                                  >
                                    {moduleWithProgress.completed ? 'Review' : 'Start'}
                                  </Button>
                                </div>
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
            
            {Object.entries(modulesByCategory).map(([category, modules]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {modules.map((module) => {
                    const moduleWithProgress = getModuleWithProgress(module);
                    return (
                      <Card key={module.id} className="border-visible hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                {getTypeIcon(module.type)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1">{module.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{module.description}</p>
                                
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`text-xs ${getDifficultyColor(module.difficulty)}`}>
                                    {module.difficulty}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {module.duration}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {module.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              {moduleWithProgress.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : moduleWithProgress.progress > 0 ? (
                                <div className="w-5 h-5">
                                  <Progress value={moduleWithProgress.progress} className="h-5" />
                                </div>
                              ) : null}
                              
                              <Button
                                size="sm"
                                variant={moduleWithProgress.completed ? "outline" : "default"}
                                className="text-xs"
                                onClick={() => moduleWithProgress.completed ? null : startModule(module.id)}
                              >
                                {moduleWithProgress.completed ? (
                                  <>
                                    <Medal className="w-3 h-3 mr-1" />
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
                            </div>
                          </div>
                          
                          {moduleWithProgress.progress > 0 && !moduleWithProgress.completed && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Progress</span>
                                <span className="text-xs font-medium">{moduleWithProgress.progress}%</span>
                              </div>
                              <Progress value={moduleWithProgress.progress} className="h-1" />
                            </div>
                          )}
                          
                          {module.skills.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium mb-1">Skills you'll learn:</p>
                              <div className="flex flex-wrap gap-1">
                                {module.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {module.prerequisites && module.prerequisites.length > 0 && (
                            <div className="pt-3 border-t">
                              <p className="text-xs font-medium mb-1 text-muted-foreground">Prerequisites:</p>
                              <div className="space-y-1">
                                {module.prerequisites.map((prereqId) => {
                                  const prereq = learningModules.find(m => m.id === prereqId);
                                  if (!prereq) return null;
                                  const prereqCompleted = safeModuleProgress[prereqId]?.completed || false;
                                  
                                  return (
                                    <div key={prereqId} className="flex items-center gap-2 text-xs">
                                      {prereqCompleted ? (
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                      ) : (
                                        <div className="w-3 h-3 rounded-full border border-muted" />
                                      )}
                                      <span className={prereqCompleted ? 'text-foreground' : 'text-muted-foreground'}>
                                        {prereq.title}
                                      </span>
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

      {/* Active Module Simulator */}
      {activeModule && (
        <Card className="border-visible border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-primary" />
                Active Learning Module
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveModule(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const module = learningModules.find(m => m.id === activeModule);
              if (!module) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getTypeIcon(module.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {module.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Learning Simulation</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      This is a simulated learning experience. In a real implementation, this would contain:
                    </p>
                    <ul className="text-sm space-y-2">
                      {module.type === 'video' && (
                        <li className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-blue-500" />
                          Interactive video content with progress tracking
                        </li>
                      )}
                      {module.type === 'interactive' && (
                        <li className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-500" />
                          Interactive exercises and knowledge checks
                        </li>
                      )}
                      {module.type === 'hands-on' && (
                        <li className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-green-500" />
                          Hands-on practice with real platform features
                        </li>
                      )}
                      {module.type === 'reading' && (
                        <li className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          Comprehensive reading materials and resources
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => updateModuleProgress(activeModule, 50, false)}
                    >
                      Simulate Progress (50%)
                    </Button>
                    <Button
                      onClick={() => completeModule(activeModule)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-visible">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold">
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
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold">
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
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold">
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
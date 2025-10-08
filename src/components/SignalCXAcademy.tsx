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

interface TrainingContent {
  introduction: string;
  sections: {
    title: string;
    content: string;
    interactiveElements?: {
      type: 'quiz' | 'exercise' | 'checklist';
      items: string[];
    };
  }[];
  keyTakeaways: string[];
  nextSteps: string[];
}

const trainingContent: Record<string, TrainingContent> = {
  'fundamentals-intro': {
    introduction: 'Welcome to SignalCX! This comprehensive overview will introduce you to the core concepts and capabilities that make our platform the leading solution for AI-powered customer success management.',
    sections: [
      {
        title: 'Platform Architecture',
        content: 'SignalCX operates on four foundational pillars: Signal Detection, AI-Powered Analysis, Automated Workflows, and Predictive Intelligence. Each component works together to provide a 360-degree view of your customer relationships and drive proactive success outcomes.',
      },
      {
        title: 'Key Features Overview',
        content: 'Navigate through the main dashboard to access Account Health Monitoring, Real-time Signal Processing, NBA Generation, Predictive Analytics, and Integration Management. Each feature is designed with customer success professionals in mind.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Explore the Accounts Table and filter by health score',
            'Review the NBA Display for recommended actions',
            'Check the Live Signals feed for recent activity',
            'Access the AI Recommendation Engine'
          ]
        }
      },
      {
        title: 'User Interface Navigation',
        content: 'The SignalCX interface is organized into three main areas: Account Management (left), AI Insights (center), and System Controls (right). The tabbed interface allows you to focus on specific workflows while maintaining context across your customer portfolio.'
      }
    ],
    keyTakeaways: [
      'SignalCX combines AI-powered insights with automated workflows',
      'The platform provides proactive rather than reactive customer success management',
      'All features are designed to work together for comprehensive account oversight'
    ],
    nextSteps: [
      'Complete the Account Health Monitoring module',
      'Practice navigating between different sections',
      'Familiarize yourself with the notification system'
    ]
  },
  'account-health-monitoring': {
    introduction: 'Master the art of interpreting customer health metrics with SignalCX\'s comprehensive health scoring system. Learn to identify at-risk accounts before issues escalate and recognize expansion opportunities.',
    sections: [
      {
        title: 'Health Score Methodology',
        content: 'SignalCX calculates health scores using multiple data points including product usage, engagement metrics, support interactions, contract status, and relationship strength. Scores range from 0-100 with automated categorization into Good (80+), Watch (60-79), and At Risk (<60).'
      },
      {
        title: 'Risk Assessment Framework',
        content: 'Our AI analyzes patterns across hundreds of customer attributes to identify early warning signs. Key indicators include declining usage trends, reduced stakeholder engagement, increased support tickets, and approaching contract renewals without renewal signals.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Identify the top 3 at-risk accounts in your portfolio',
            'Analyze the factors contributing to declining health scores',
            'Create action plans for immediate intervention',
            'Set up monitoring alerts for key health indicators'
          ]
        }
      },
      {
        title: 'Proactive Intervention Strategies',
        content: 'Learn to act on health score changes before they become critical. Establish escalation protocols, create targeted engagement campaigns, and leverage automated workflows to maintain customer relationships.'
      }
    ],
    keyTakeaways: [
      'Health scores are predictive, not just descriptive',
      'Early intervention is exponentially more effective than crisis management',
      'Multiple data sources provide more accurate health assessments'
    ],
    nextSteps: [
      'Set up health score monitoring alerts',
      'Practice identifying risk patterns in your accounts',
      'Develop standard intervention playbooks'
    ]
  },
  'signal-interpretation': {
    introduction: 'Develop expertise in identifying, prioritizing, and responding to customer signals effectively. Learn to distinguish between noise and meaningful patterns that drive customer success outcomes.',
    sections: [
      {
        title: 'Signal Categories and Types',
        content: 'SignalCX processes five primary signal categories: Usage Patterns (login frequency, feature adoption), Engagement Signals (meeting attendance, response rates), Business Health (contract renewals, expansion indicators), Risk Indicators (support escalations, stakeholder changes), and Opportunity Signals (new use cases, team growth).'
      },
      {
        title: 'Pattern Recognition Techniques',
        content: 'Learn to identify meaningful trends across different signal types. Understand how seasonal variations, product updates, and external factors influence signal interpretation. Develop skills to correlate signals across multiple accounts to identify broader patterns.',
        interactiveElements: {
          type: 'quiz',
          items: [
            'What signal combination most strongly indicates expansion readiness?',
            'How do you differentiate between temporary usage dips and concerning trends?',
            'Which signals require immediate attention vs. monitoring?',
            'How do industry factors influence signal interpretation?'
          ]
        }
      },
      {
        title: 'Data-Driven Decision Making',
        content: 'Transform signals into actionable insights by establishing baseline metrics, tracking signal velocity (rate of change), and correlating multiple data points. Learn to validate signal accuracy and adjust thresholds based on historical outcomes.'
      }
    ],
    keyTakeaways: [
      'Not all signals have equal importance or urgency',
      'Context is crucial for accurate signal interpretation',
      'Historical correlation improves future signal accuracy'
    ],
    nextSteps: [
      'Practice signal analysis on current accounts',
      'Establish signal monitoring protocols',
      'Develop signal-specific response playbooks'
    ]
  },
  'ai-nba-generation': {
    introduction: 'Understand how SignalCX\'s AI engine generates and prioritizes next best actions. Learn to work effectively with AI recommendations while applying your customer success expertise.',
    sections: [
      {
        title: 'AI Recommendation Engine',
        content: 'The NBA engine combines machine learning algorithms with business rules to generate personalized recommendations. It considers account history, industry benchmarks, stakeholder preferences, and timing factors to suggest optimal actions with confidence scores.'
      },
      {
        title: 'Decision Making Process',
        content: 'Learn to evaluate AI recommendations by reviewing supporting data, understanding confidence levels, and applying contextual knowledge. Develop skills to modify, combine, or reject recommendations based on customer-specific circumstances.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Review 5 AI-generated NBAs for different account types',
            'Analyze the supporting data for each recommendation',
            'Practice modifying recommendations based on additional context',
            'Track outcomes of implemented vs. modified recommendations'
          ]
        }
      },
      {
        title: 'Automation and Human Oversight',
        content: 'Establish workflows that combine AI efficiency with human judgment. Learn to configure approval processes, set automation thresholds, and maintain quality control while scaling your customer success operations.'
      }
    ],
    keyTakeaways: [
      'AI recommendations are starting points, not final decisions',
      'Human context and relationship knowledge remain crucial',
      'Feedback loops improve AI accuracy over time'
    ],
    nextSteps: [
      'Configure NBA approval workflows',
      'Practice evaluating and modifying AI recommendations',
      'Establish outcome tracking for AI-generated actions'
    ]
  },
  'predictive-analytics': {
    introduction: 'Leverage machine learning for proactive customer success management. Learn to interpret predictive models, understand forecast confidence levels, and act on predictive insights.',
    sections: [
      {
        title: 'Predictive Modeling Fundamentals',
        content: 'SignalCX uses ensemble methods combining multiple algorithms to predict customer behavior. Models analyze historical patterns, current signals, and external factors to forecast outcomes with confidence intervals. Key predictions include churn risk, expansion probability, and engagement trends.'
      },
      {
        title: 'Risk Forecasting Techniques',
        content: 'Master the interpretation of churn probability models, renewal likelihood forecasts, and expansion opportunity predictions. Learn to understand model confidence levels, identify key contributing factors, and translate predictions into actionable strategies.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Interpret churn risk scores for your top 10 accounts',
            'Identify the primary risk factors for each at-risk account',
            'Develop intervention strategies based on risk categories',
            'Create monitoring dashboards for predictive metrics'
          ]
        }
      },
      {
        title: 'Churn Prevention Strategies',
        content: 'Develop systematic approaches to address different types of churn risk. Learn to create targeted retention campaigns, design stakeholder engagement programs, and implement predictive intervention workflows.'
      }
    ],
    keyTakeaways: [
      'Predictive analytics enable proactive rather than reactive strategies',
      'Model confidence levels guide intervention priorities',
      'Regular model validation ensures continued accuracy'
    ],
    nextSteps: [
      'Set up predictive monitoring dashboards',
      'Develop churn prevention playbooks',
      'Practice interpreting model outputs and confidence levels'
    ]
  },
  'workflow-automation': {
    introduction: 'Create and manage sophisticated automated workflows that respond intelligently to customer signals. Learn to design, test, and optimize automation while maintaining personal touch.',
    sections: [
      {
        title: 'Workflow Design Principles',
        content: 'Effective workflow automation follows key principles: clear trigger conditions, appropriate escalation paths, human oversight points, and measurable outcomes. Design workflows that enhance rather than replace human relationships.'
      },
      {
        title: 'Process Automation Framework',
        content: 'Learn to map customer journey touchpoints, identify automation opportunities, and design workflows with appropriate decision trees. Master trigger configuration, action sequencing, and error handling for robust automated processes.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Map the onboarding process for new customers',
            'Design automated health check workflows',
            'Create escalation paths for different risk levels',
            'Build renewal reminder and follow-up sequences'
          ]
        }
      },
      {
        title: 'Trigger Management and Optimization',
        content: 'Develop expertise in setting appropriate workflow triggers, managing workflow performance, and optimizing automation based on outcomes. Learn to balance automation efficiency with relationship quality.'
      }
    ],
    keyTakeaways: [
      'Automation should enhance, not replace, human relationships',
      'Proper trigger configuration is critical for workflow effectiveness',
      'Continuous monitoring and optimization improve automation ROI'
    ],
    nextSteps: [
      'Design your first automated workflow',
      'Test workflow logic with sample scenarios',
      'Establish performance monitoring for automated processes'
    ]
  },
  'custom-segmentation': {
    introduction: 'Build sophisticated customer segments that enable targeted success strategies. Learn advanced segmentation techniques and develop segments that drive better outcomes.',
    sections: [
      {
        title: 'Advanced Segmentation Methodologies',
        content: 'Move beyond simple demographic segmentation to behavior-based, value-based, and outcome-based segments. Learn to create dynamic segments that adapt to changing customer characteristics and business priorities.'
      },
      {
        title: 'Data Analysis for Segmentation',
        content: 'Master statistical techniques for identifying meaningful customer clusters. Learn to validate segment quality, measure segment stability, and ensure segments lead to differentiated strategies.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Analyze your customer base for natural segments',
            'Create behavior-based segments using usage data',
            'Develop value-based segments for different ARR tiers',
            'Test segment effectiveness with A/B comparisons'
          ]
        }
      },
      {
        title: 'Strategic Segment Application',
        content: 'Learn to translate segments into differentiated success strategies, resource allocation models, and targeted engagement approaches. Develop segment-specific playbooks and success metrics.'
      }
    ],
    keyTakeaways: [
      'Effective segments enable more targeted and efficient customer success',
      'Segments should be actionable and lead to different strategies',
      'Regular segment validation ensures continued relevance'
    ],
    nextSteps: [
      'Create 3-5 strategic customer segments',
      'Develop segment-specific success strategies',
      'Implement segment-based monitoring and reporting'
    ]
  },
  'custom-signals': {
    introduction: 'Create custom signals tailored to your unique business model and customer base. Learn to identify business-specific patterns and translate them into automated signal detection.',
    sections: [
      {
        title: 'Signal Creation Framework',
        content: 'Learn systematic approaches to identifying potential signals in your business. Understand data requirements, threshold setting, and validation methodologies for custom signals that truly predict customer outcomes.'
      },
      {
        title: 'Business Logic Development',
        content: 'Master the art of translating business insights into algorithmic logic. Learn to create conditional rules, combine multiple data sources, and establish appropriate signal sensitivity levels.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Identify 3 unique patterns specific to your business model',
            'Design signal logic for each identified pattern',
            'Test signal accuracy against historical data',
            'Refine signal parameters based on testing outcomes'
          ]
        }
      },
      {
        title: 'Custom Analytics Implementation',
        content: 'Develop skills in signal testing, validation, and deployment. Learn to measure signal effectiveness, adjust parameters based on outcomes, and integrate custom signals into broader workflows.'
      }
    ],
    keyTakeaways: [
      'Custom signals capture business-specific success patterns',
      'Proper testing and validation are essential for signal accuracy',
      'Regular refinement improves signal predictive power'
    ],
    nextSteps: [
      'Identify potential custom signals for your business',
      'Begin testing signal logic with historical data',
      'Plan integration of custom signals into existing workflows'
    ]
  },
  'dynamics-integration': {
    introduction: 'Master the integration between SignalCX and Microsoft Dynamics 365. Learn to establish seamless data flow, synchronize customer records, and leverage CRM data for enhanced customer success.',
    sections: [
      {
        title: 'Integration Architecture',
        content: 'Understand the technical architecture connecting SignalCX with Dynamics 365. Learn about API connections, data mapping, real-time synchronization, and security protocols that ensure reliable data exchange.'
      },
      {
        title: 'Data Synchronization Setup',
        content: 'Master field mapping between systems, establish synchronization schedules, and configure bi-directional data flow. Learn to handle data conflicts, maintain data quality, and troubleshoot common integration issues.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Configure basic field mapping between systems',
            'Set up account synchronization workflows',
            'Test opportunity data flow from D365 to SignalCX',
            'Verify contact and relationship data synchronization'
          ]
        }
      },
      {
        title: 'CRM Workflow Integration',
        content: 'Learn to leverage Dynamics 365 workflow capabilities within SignalCX processes. Create integrated workflows that update both systems, maintain data consistency, and enhance user experience across platforms.'
      }
    ],
    keyTakeaways: [
      'Successful integration requires careful planning and configuration',
      'Data quality in both systems affects integration effectiveness',
      'Regular monitoring ensures continued synchronization accuracy'
    ],
    nextSteps: [
      'Complete integration setup for your environment',
      'Test all data flows and workflows',
      'Establish monitoring and maintenance procedures'
    ]
  },
  'teams-collaboration': {
    introduction: 'Enable seamless collaboration and real-time notifications through Microsoft Teams and Outlook integration. Learn to configure automated notifications, facilitate team collaboration, and enhance communication workflows.',
    sections: [
      {
        title: 'Notification Configuration',
        content: 'Set up intelligent notification systems that alert team members about critical customer events. Learn to configure notification rules, customize message formats, and establish appropriate escalation protocols.'
      },
      {
        title: 'Collaboration Workflows',
        content: 'Design collaborative processes that leverage Teams channels for account discussions, shared decision-making, and knowledge sharing. Learn to create account-specific channels and automated collaboration triggers.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Set up Teams channels for high-value accounts',
            'Configure health score change notifications',
            'Create escalation workflows for critical signals',
            'Test notification delivery and formatting'
          ]
        }
      },
      {
        title: 'Communication Enhancement',
        content: 'Learn to use integration features that enhance customer communication, streamline internal coordination, and maintain comprehensive communication records within both systems.'
      }
    ],
    keyTakeaways: [
      'Integration improves team coordination and response times',
      'Proper notification configuration prevents alert fatigue',
      'Collaborative workflows enhance team effectiveness'
    ],
    nextSteps: [
      'Configure key notification workflows',
      'Set up team collaboration channels',
      'Train team members on new collaboration processes'
    ]
  }
};

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
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-4">{activeModule.description}</p>
                {trainingContent[activeModule.id] && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Course Introduction</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {trainingContent[activeModule.id].introduction}
                    </p>
                  </div>
                )}
              </div>

              {trainingContent[activeModule.id] && (
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Learning Content
                  </h4>
                  
                  {trainingContent[activeModule.id].sections.map((section, index) => (
                    <Card key={index} className="border-visible">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm leading-relaxed">{section.content}</p>
                        
                        {section.interactiveElements && (
                          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                            <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                              {section.interactiveElements.type === 'quiz' && <Target className="w-4 h-4" />}
                              {section.interactiveElements.type === 'exercise' && <PlayCircle className="w-4 h-4" />}
                              {section.interactiveElements.type === 'checklist' && <CheckCircle className="w-4 h-4" />}
                              {section.interactiveElements.type === 'quiz' && 'Knowledge Check'}
                              {section.interactiveElements.type === 'exercise' && 'Hands-on Exercise'}
                              {section.interactiveElements.type === 'checklist' && 'Practice Checklist'}
                            </h5>
                            <ul className="space-y-2">
                              {section.interactiveElements.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-3 text-sm">
                                  <div className="w-5 h-5 mt-0.5 border-2 border-accent/40 rounded flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 bg-accent/60 rounded-full"></div>
                                  </div>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-visible border-green-200 bg-green-50/50">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-green-800">
                          <CheckCircle className="w-5 h-5" />
                          Key Takeaways
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {trainingContent[activeModule.id].keyTakeaways.map((takeaway, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-green-800">{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-visible border-blue-200 bg-blue-50/50">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                          <Target className="w-5 h-5" />
                          Next Steps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {trainingContent[activeModule.id].nextSteps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-800 text-xs font-bold">{index + 1}</span>
                              </div>
                              <span className="text-blue-800">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activeModule.duration}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon(activeModule.type)}
                    {activeModule.type}
                  </Badge>
                  <Badge variant="outline">
                    {activeModule.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      updateModuleProgress(activeModule.id, 50);
                      setActiveModule(null);
                    }}
                  >
                    Save Progress
                  </Button>
                  <Button 
                    onClick={() => completeModule(activeModule)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete Module
                  </Button>
                </div>
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
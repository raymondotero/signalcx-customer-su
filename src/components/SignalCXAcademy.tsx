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
  Star,
  ChartBar
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface Assessment {
  id: string;
  moduleId: string;
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  passingScore: number;
}

interface Certification {
  id: string;
  title: string;
  description: string;
  requiredModules: string[];
  badgeColor: string;
  completedAt?: string;
}

const assessments: Assessment[] = [
  {
    id: 'fundamentals-assessment',
    moduleId: 'fundamentals-intro',
    title: 'SignalCX Platform Fundamentals Assessment',
    passingScore: 80,
    questions: [
      {
        question: 'What are the four foundational pillars of SignalCX?',
        options: [
          'Monitoring, Analysis, Reporting, Integration',
          'Signal Detection, AI-Powered Analysis, Automated Workflows, Predictive Intelligence',
          'Health Scoring, Risk Assessment, Recommendations, Automation',
          'Data Collection, Processing, Insights, Actions'
        ],
        correctAnswer: 1,
        explanation: 'SignalCX is built on four foundational pillars that work together to provide comprehensive customer success management.'
      },
      {
        question: 'How many data points does SignalCX analyze per customer?',
        options: ['50+', '200+', '500+', '1000+'],
        correctAnswer: 2,
        explanation: 'SignalCX processes over 500 data points per customer to create comprehensive success profiles.'
      },
      {
        question: 'What is the primary benefit of SignalCX\'s proactive approach?',
        options: [
          'Faster response to customer issues',
          'Better reporting capabilities',
          'Preventing issues before they become critical',
          'More integrations with other tools'
        ],
        correctAnswer: 2,
        explanation: 'SignalCX\'s proactive approach focuses on preventing issues before they become critical, rather than just responding to them.'
      }
    ]
  }
];

const certifications: Certification[] = [
  {
    id: 'signalcx-foundation',
    title: 'SignalCX Foundation Certified',
    description: 'Demonstrates mastery of core SignalCX concepts and basic workflows',
    requiredModules: ['fundamentals-intro', 'account-health-monitoring', 'signal-interpretation'],
    badgeColor: 'bg-green-500'
  },
  {
    id: 'ai-workflows-expert',
    title: 'AI Workflows Expert',
    description: 'Advanced certification in AI-powered customer success automation',
    requiredModules: ['ai-nba-generation', 'predictive-analytics', 'workflow-automation'],
    badgeColor: 'bg-blue-500'
  },
  {
    id: 'signalcx-master',
    title: 'SignalCX Master Practitioner',
    description: 'Highest level certification covering all advanced features and customization',
    requiredModules: ['custom-segmentation', 'custom-signals'],
    badgeColor: 'bg-purple-500'
  },
  {
    id: 'integration-specialist',
    title: 'Integration Specialist',
    description: 'Expert-level knowledge of all SignalCX integrations and technical implementation',
    requiredModules: ['dynamics-integration', 'teams-collaboration'],
    badgeColor: 'bg-orange-500'
  }
];

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
    introduction: 'Welcome to SignalCX! This comprehensive overview will introduce you to the core concepts and capabilities that make our platform the leading solution for AI-powered customer success management. You\'ll learn how our AI-first approach transforms traditional customer success into a predictive, data-driven discipline through real-world scenarios and proven methodologies.',
    sections: [
      {
        title: 'Platform Architecture & Core Philosophy',
        content: 'SignalCX operates on four foundational pillars: Signal Detection (real-time customer behavior analysis), AI-Powered Analysis (machine learning insights), Automated Workflows (intelligent response systems), and Predictive Intelligence (future outcome modeling). Our architecture processes over 500+ data points per customer to create a comprehensive success profile. \n\n**Real-World Example**: TechCorp Solutions, a $45M ARR customer, was showing declining usage patterns. Traditional CSMs would notice this 2-3 months after the trend began. SignalCX detected the signal within 72 hours by analyzing API call patterns, login frequency changes, and feature adoption velocity. The early detection enabled proactive intervention that prevented a potential $2.8M churn risk. \n\nThe platform integrates seamlessly with your existing tech stack including Dynamics 365, Teams, Outlook, and major CRMs, ensuring you enhance rather than replace your current workflows.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Navigate to the main dashboard and identify the four core pillars in action using TechCorp as an example',
            'Locate the System Health dialog and review current integrations - notice how D365 data flows in real-time',
            'Use the ROI Dashboard to understand platform value metrics - see actual savings from early detection',
            'Access the Help Guide to explore additional resources and find integration troubleshooting tips'
          ]
        }
      },
      {
        title: 'Key Features Deep Dive',
        content: 'Navigate through the main dashboard to access Account Health Monitoring (real-time customer health scoring), Real-time Signal Processing (automated behavior analysis), NBA Generation (AI-powered recommendations), Predictive Analytics (churn and expansion forecasting), and Integration Management (seamless data flow). Each feature leverages proprietary machine learning algorithms trained on thousands of customer success patterns.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Explore the Accounts Table and filter by health score ranges',
            'Review the NBA Display for AI-generated recommended actions',
            'Check the Live Signals feed for recent customer activity patterns',
            'Access the AI Recommendation Engine and review confidence scores',
            'Open the Predictive Heat Map to view risk/opportunity forecasting',
            'Test the notification system with sample alerts'
          ]
        }
      },
      {
        title: 'User Interface Navigation & Workflow Optimization',
        content: 'The SignalCX interface is strategically organized into three main areas: Account Management (left - your customer portfolio), AI Insights (center - intelligent recommendations), and System Controls (right - configuration and analytics). The tabbed interface allows you to maintain context while diving deep into specific workflows. Master keyboard shortcuts and quick navigation to maximize efficiency.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Practice switching between tabs using keyboard shortcuts',
            'Use the search functionality to quickly locate specific accounts',
            'Configure your dashboard layout for optimal workflow',
            'Set up personalized notification preferences'
          ]
        }
      }
    ],
    keyTakeaways: [
      'SignalCX combines AI-powered insights with automated workflows for 10x efficiency gains',
      'The platform provides proactive rather than reactive customer success management',
      'All features are designed to work together for comprehensive account oversight and predictive insights',
      'Integration capabilities ensure SignalCX enhances your existing workflows rather than replacing them'
    ],
    nextSteps: [
      'Complete the Account Health Monitoring module to master health scoring',
      'Practice navigating between different sections to build muscle memory',
      'Familiarize yourself with the notification system and alert configurations',
      'Set up your first automated workflow using the Workflow Demo'
    ]
  },
  'account-health-monitoring': {
    introduction: 'Master the art of interpreting customer health metrics with SignalCX\'s comprehensive health scoring system. Our proprietary algorithm analyzes 100+ data points to create predictive health scores. Learn to identify at-risk accounts before issues escalate and recognize expansion opportunities through advanced pattern recognition.',
    sections: [
      {
        title: 'Health Score Methodology & Advanced Metrics',
        content: 'SignalCX calculates health scores using a sophisticated ensemble model that analyzes multiple data dimensions: Product Usage Patterns (40% weight), Engagement Metrics (25% weight), Support Interactions (15% weight), Contract Status (10% weight), and Relationship Strength (10% weight). Scores range from 0-100 with automated categorization into Good (80-100), Watch (60-79), and At Risk (0-59). The algorithm also considers industry benchmarks, seasonal patterns, and account-specific baselines for maximum accuracy.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Analyze health score components for 5 different account types',
            'Compare health scores against industry benchmarks',
            'Identify which metrics contribute most to score changes',
            'Practice interpreting health score trends over time'
          ]
        }
      },
      {
        title: 'Advanced Risk Assessment Framework',
        content: 'Our AI analyzes patterns across thousands of customer attributes to identify early warning signs with 94% accuracy. Key predictive indicators include: Declining Usage Velocity (rate of change in feature adoption), Reduced Stakeholder Engagement (meeting attendance, email response rates), Increased Support Complexity (escalation patterns, resolution time), Approaching Contract Events (renewal timing, negotiation signals), and Ecosystem Health (integration usage, data flow quality). The system provides risk probability scores and recommended intervention timing.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Identify the top 3 at-risk accounts in your portfolio using multiple risk factors',
            'Analyze the primary and secondary risk factors for each at-risk account',
            'Create targeted action plans for immediate intervention based on risk type',
            'Set up automated monitoring alerts for key health indicators and thresholds',
            'Practice using the Predictive Heat Map to visualize portfolio risk'
          ]
        }
      },
      {
        title: 'Proactive Intervention Strategies & Playbook Development',
        content: 'Learn to act on health score changes before they become critical using our proven intervention framework. Establish risk-based escalation protocols: Health Score 60-79 (increased touchpoints, usage optimization), Health Score 40-59 (executive engagement, success plan revision), Health Score <40 (crisis management, retention campaign). Create targeted engagement campaigns using automated workflows and maintain detailed intervention tracking for continuous improvement.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Define intervention triggers for each health score range',
            'Create escalation workflows for different risk levels',
            'Design targeted outreach templates for various scenarios',
            'Set up success metrics tracking for intervention outcomes',
            'Establish executive escalation procedures for critical accounts'
          ]
        }
      }
    ],
    keyTakeaways: [
      'Health scores are predictive indicators, not just descriptive snapshots - they forecast future outcomes',
      'Early intervention is exponentially more effective than crisis management - act on trends, not events',
      'Multiple data sources provide more accurate health assessments than single metrics',
      'Continuous monitoring and automated alerts enable proactive rather than reactive customer success'
    ],
    nextSteps: [
      'Set up health score monitoring alerts for your key accounts',
      'Practice identifying risk patterns using the advanced analytics dashboard',
      'Develop standard intervention playbooks for each risk category',
      'Begin tracking intervention success rates to optimize your approach'
    ]
  },
  'signal-interpretation': {
    introduction: 'Develop expertise in identifying, prioritizing, and responding to customer signals effectively. Master SignalCX\'s advanced signal processing engine that analyzes 500+ signal types in real-time. Learn to distinguish between noise and meaningful patterns that drive customer success outcomes, and understand how our AI correlates signals across multiple dimensions to predict customer behavior.',
    sections: [
      {
        title: 'Signal Categories, Types & Advanced Classification',
        content: 'SignalCX processes five primary signal categories with advanced sub-classification: 1) Usage Patterns (login frequency, feature adoption velocity, data volume trends, session duration analysis), 2) Engagement Signals (meeting attendance rates, email response times, portal activity, content consumption), 3) Business Health (contract renewals, expansion indicators, procurement cycles, budget allocation signals), 4) Risk Indicators (support ticket escalations, stakeholder turnover, competitive activity, performance degradation), and 5) Opportunity Signals (new use cases discovery, team growth patterns, technology adoption, integration expansion). Each signal is weighted based on historical correlation with success outcomes.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Categorize 20 different signals from your current customer base',
            'Identify the highest-impact signals for your specific industry',
            'Practice distinguishing between leading and lagging indicators',
            'Map signals to customer journey stages for better context'
          ]
        }
      },
      {
        title: 'Advanced Pattern Recognition & Correlation Analysis',
        content: 'Learn to identify meaningful trends across different signal types using statistical analysis and machine learning insights. Understand how seasonal variations (quarterly budget cycles, holiday periods), product updates (feature releases, API changes), and external factors (market conditions, regulatory changes) influence signal interpretation. Master the art of signal correlation - how combining multiple weak signals can create strong predictive indicators. Our platform provides correlation matrices and trend analysis tools to support advanced pattern recognition.',
        interactiveElements: {
          type: 'quiz',
          items: [
            'What signal combination most strongly indicates expansion readiness in SaaS accounts?',
            'How do you differentiate between temporary usage dips and concerning long-term trends?',
            'Which signals require immediate attention vs. monitoring and why?',
            'How do industry factors and seasonal patterns influence signal interpretation accuracy?',
            'What correlation threshold indicates a reliable predictive signal combination?'
          ]
        }
      },
      {
        title: 'Data-Driven Decision Making & Signal Validation',
        content: 'Transform signals into actionable insights by establishing baseline metrics, tracking signal velocity (rate of change), and correlating multiple data points using advanced analytics. Learn to validate signal accuracy through backtesting, adjust detection thresholds based on historical outcomes, and create signal-specific response playbooks. Master the use of confidence intervals, statistical significance testing, and A/B testing for signal optimization. Understand how to balance signal sensitivity (catching all important events) with specificity (avoiding false positives).',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Set up baseline metrics for your top 10 accounts across all signal categories',
            'Create signal velocity dashboards to track rate of change',
            'Implement signal correlation analysis to identify pattern combinations',
            'Design and execute A/B tests for signal threshold optimization',
            'Build custom signal validation workflows using historical data'
          ]
        }
      }
    ],
    keyTakeaways: [
      'Not all signals have equal importance or urgency - prioritization is critical for effective customer success',
      'Context is crucial for accurate signal interpretation - same signal can mean different things for different customers',
      'Historical correlation analysis improves future signal accuracy and reduces false positives',
      'Signal velocity often matters more than absolute values - rate of change predicts outcomes',
      'Combining multiple weak signals often creates stronger predictive indicators than single strong signals'
    ],
    nextSteps: [
      'Practice advanced signal analysis on your current account portfolio',
      'Establish comprehensive signal monitoring protocols with proper thresholds',
      'Develop signal-specific response playbooks for different scenarios',
      'Begin tracking signal prediction accuracy to continuously improve your interpretation skills'
    ]
  },
  'ai-nba-generation': {
    introduction: 'Understand how SignalCX\'s advanced AI engine generates and prioritizes next best actions using proprietary machine learning algorithms. Our NBA system combines deep learning, reinforcement learning, and expert business rules to provide contextually relevant recommendations with measurable confidence scores. Learn to work effectively with AI recommendations while applying your customer success expertise to achieve optimal outcomes.',
    sections: [
      {
        title: 'AI Recommendation Engine Architecture & Machine Learning Models',
        content: 'The NBA engine employs a sophisticated ensemble approach combining multiple machine learning algorithms: Gradient Boosting Models (for pattern recognition), Neural Networks (for complex relationship modeling), Reinforcement Learning (for outcome optimization), and Rule-Based Systems (for business logic enforcement). The system considers 200+ variables including account history, industry benchmarks, stakeholder preferences, timing factors, resource availability, and success probability. Each recommendation comes with confidence scores (0-100%), expected outcome metrics, effort estimation, and risk assessment.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Review 10 AI-generated NBAs and analyze their confidence scores and reasoning',
            'Compare NBA recommendations across different account types and industries',
            'Examine the data points that contribute to high vs. low confidence recommendations',
            'Practice interpreting NBA effort estimation and resource requirements',
            'Use the AI metrics dashboard to track recommendation performance over time'
          ]
        }
      },
      {
        title: 'Advanced Decision Making Process & Human-AI Collaboration',
        content: 'Learn to evaluate AI recommendations through a structured decision framework: 1) Confidence Score Analysis (>90% high confidence, 70-90% medium, <70% requires human judgment), 2) Supporting Data Review (signal strength, historical patterns, peer comparisons), 3) Contextual Knowledge Application (relationship dynamics, timing considerations, strategic priorities), 4) Risk-Benefit Assessment (potential upside vs. implementation risk), and 5) Resource Allocation (effort required vs. available capacity). Master the art of human-AI collaboration by knowing when to trust, modify, or override AI recommendations.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Review 5 high-confidence AI-generated NBAs for different account scenarios',
            'Analyze and document the supporting data and reasoning for each recommendation',
            'Practice modifying recommendations based on additional contextual knowledge',
            'Track outcomes of implemented vs. modified vs. rejected recommendations',
            'Develop personal criteria for when to trust AI recommendations vs. apply human judgment',
            'Create feedback loops to improve AI recommendation accuracy over time'
          ]
        }
      },
      {
        title: 'Automation Strategies & Quality Control Framework',
        content: 'Establish sophisticated workflows that combine AI efficiency with human oversight and judgment. Learn to configure multi-tier approval processes: Automatic Execution (high-confidence, low-risk actions), Manager Approval (medium-confidence or high-impact actions), Executive Review (low-confidence or strategic actions). Set up automation thresholds based on account value, risk level, and action type. Implement quality control mechanisms including A/B testing, outcome tracking, and continuous model improvement. Master the balance between operational efficiency and relationship quality.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Configure NBA approval workflows based on confidence scores and impact levels',
            'Set up automated actions for high-confidence, low-risk recommendations',
            'Create escalation paths for different types of NBA recommendations',
            'Establish quality control metrics and monitoring dashboards',
            'Design feedback mechanisms to continuously improve AI accuracy',
            'Implement A/B testing for NBA recommendation optimization'
          ]
        }
      }
    ],
    keyTakeaways: [
      'AI NBA recommendations are powerful starting points that require human insight and contextual knowledge',
      'Confidence scores and supporting data help determine the level of human oversight required',
      'Human-AI collaboration produces better outcomes than either purely automated or purely manual approaches',
      'Continuous feedback loops and outcome tracking improve AI accuracy over time',
      'Proper automation balance maximizes efficiency while maintaining relationship quality and trust'
    ],
    nextSteps: [
      'Configure NBA approval workflows tailored to your organization\'s risk tolerance',
      'Practice evaluating and modifying AI recommendations using the structured decision framework',
      'Establish comprehensive outcome tracking for AI-generated actions to measure effectiveness',
      'Begin implementing automated actions for high-confidence, low-risk scenarios',
      'Set up continuous improvement processes to enhance AI recommendation accuracy'
    ]
  },
  'predictive-analytics': {
    introduction: 'Leverage machine learning for proactive customer success management using SignalCX\'s advanced predictive modeling suite. Our ensemble AI approach combines multiple algorithms to forecast customer behavior with 94% accuracy. Learn to interpret predictive models, understand forecast confidence levels, and act on predictive insights to drive measurable business outcomes.',
    sections: [
      {
        title: 'Advanced Predictive Modeling Fundamentals',
        content: 'SignalCX uses sophisticated ensemble methods combining Gradient Boosting, Random Forest, Neural Networks, and Time Series Analysis to predict customer behavior. Models analyze 12 months of historical patterns, current signal trends, market conditions, and peer benchmarks to forecast outcomes with precise confidence intervals. Key predictions include churn risk probability (30, 60, 90-day horizons), expansion opportunity likelihood, engagement trajectory forecasting, and renewal probability scoring. Each model undergoes continuous validation and retraining to maintain accuracy.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Examine predictive model outputs for 10 different customer scenarios',
            'Compare short-term vs. long-term prediction accuracy across model types',
            'Analyze how different input variables affect prediction confidence levels',
            'Practice interpreting confidence intervals and statistical significance markers'
          ]
        }
      },
      {
        title: 'Risk Forecasting Techniques & Advanced Analytics',
        content: 'Master the interpretation of sophisticated churn probability models that consider multiple risk dimensions: Behavioral Risk (usage patterns, engagement trends), Relationship Risk (stakeholder changes, satisfaction scores), Commercial Risk (contract terms, payment history), and Technical Risk (integration health, performance issues). Learn to understand model confidence levels (>95% high confidence, 85-95% medium, <85% requires validation), identify primary contributing factors using SHAP analysis, and translate predictions into actionable retention strategies. Our advanced analytics include cohort analysis, survival curves, and risk factor attribution.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Interpret churn risk scores for your top 20 accounts using multi-dimensional analysis',
            'Identify and analyze the primary and secondary risk factors for each at-risk account',
            'Develop targeted intervention strategies based on specific risk categories and timing',
            'Create comprehensive monitoring dashboards for predictive metrics and early warning systems',
            'Practice using survival analysis to understand customer lifecycle patterns'
          ]
        }
      },
      {
        title: 'Advanced Churn Prevention Strategies & Predictive Interventions',
        content: 'Develop systematic approaches to address different types of churn risk using predictive insights and automated intervention frameworks. Learn to create targeted retention campaigns based on risk profiles: High Usage, Low Engagement (focus on value demonstration), High Engagement, Low Usage (feature adoption programs), Low Overall Activity (relationship rehabilitation), Contract-Related Risk (renewal preparation), and Technical Issues (support escalation). Implement predictive intervention workflows that trigger automatically based on risk score changes, confidence levels, and timing optimization.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Design risk-specific intervention playbooks for each churn category',
            'Set up automated early warning systems with appropriate trigger thresholds',
            'Create predictive retention campaigns with personalized messaging',
            'Establish success metrics and ROI tracking for predictive interventions',
            'Implement predictive workflow automation for different risk scenarios',
            'Design executive escalation procedures for high-value at-risk accounts'
          ]
        }
      }
    ],
    keyTakeaways: [
      'Predictive analytics enable proactive rather than reactive customer success strategies with measurable ROI',
      'Model confidence levels and statistical significance guide intervention priorities and resource allocation',
      'Regular model validation and retraining ensure continued accuracy and relevance in changing markets',
      'Combining multiple predictive signals creates more accurate forecasts than single-model approaches',
      'Predictive interventions show 3-5x better outcomes compared to reactive approaches'
    ],
    nextSteps: [
      'Set up comprehensive predictive monitoring dashboards for your entire portfolio',
      'Develop and test advanced churn prevention playbooks for different risk categories',
      'Practice interpreting complex model outputs and confidence levels in real scenarios',
      'Implement automated predictive intervention workflows for high-confidence scenarios',
      'Begin tracking predictive intervention success rates to optimize your approach continuously'
    ]
  },
  'workflow-automation': {
    introduction: 'Create and manage sophisticated automated workflows that respond intelligently to customer signals using SignalCX\'s advanced workflow engine. Master the art of designing multi-step automation sequences that maintain the human touch while delivering consistent, timely responses at scale. Learn to build workflows that adapt dynamically to customer behavior patterns and business rules.',
    sections: [
      {
        title: 'Advanced Workflow Design Principles & Architecture',
        content: 'Effective workflow automation follows sophisticated design principles that balance efficiency with relationship quality: 1) Event-Driven Architecture (workflows triggered by specific customer signals), 2) Multi-Channel Coordination (seamless integration across email, Teams, CRM), 3) Conditional Logic Trees (decision points based on customer attributes and behavior), 4) Human-in-the-Loop Design (strategic oversight points for high-value interactions), 5) Rollback and Recovery Mechanisms (handling errors gracefully), and 6) Compliance and Audit Trails (maintaining full visibility). Each workflow should have clear success metrics, defined escalation paths, and built-in feedback loops for continuous improvement.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Design a multi-tier workflow architecture for customer onboarding with 3 decision points',
            'Create conditional logic for risk-based customer engagement strategies',
            'Map workflow touchpoints across Teams, Outlook, and Dynamics 365 integration',
            'Design error handling and rollback procedures for failed workflow steps',
            'Build compliance documentation and audit trails for workflow actions'
          ]
        }
      },
      {
        title: 'Comprehensive Process Automation Framework & Implementation',
        content: 'Learn to systematically identify, design, and implement automation opportunities across the entire customer lifecycle: Customer Journey Mapping (identify all touchpoints from onboarding to renewal), Signal-to-Action Workflows (automatic responses to specific behavioral patterns), Escalation Automation (tiered response system based on severity and impact), Cross-Functional Coordination (workflows spanning CS, Sales, and Support teams), Performance Monitoring (real-time workflow effectiveness tracking), and Continuous Optimization (A/B testing workflow variations). Master advanced trigger configuration including time-based delays, conditional branching, parallel processing, and exception handling for complex business scenarios.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Map your complete customer journey and identify 10+ automation opportunities',
            'Design signal-triggered workflows for the top 5 customer success scenarios',
            'Create automated escalation paths with appropriate stakeholder notifications',
            'Build cross-team workflows that coordinate CS, Sales, and Support actions',
            'Implement workflow performance dashboards with success metrics and KPIs',
            'Design A/B test frameworks for workflow optimization and improvement'
          ]
        }
      },
      {
        title: 'Advanced Trigger Management, Performance Optimization & Analytics',
        content: 'Develop expertise in sophisticated trigger management using statistical analysis, machine learning insights, and business intelligence: Dynamic Threshold Adjustment (triggers that adapt based on customer segments and historical patterns), Multi-Signal Correlation (workflows triggered by combinations of signals for higher accuracy), Time-Series Analysis (identifying optimal timing for workflow execution), Predictive Triggering (proactive workflows based on forecasted events), Load Balancing (distributing workflow execution for optimal performance), and Advanced Analytics (measuring workflow ROI, completion rates, and customer impact). Learn to optimize workflow performance through resource management, parallel processing, and intelligent queuing systems.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Configure dynamic triggers that adjust based on customer segment characteristics',
            'Set up multi-signal correlation workflows for complex customer scenarios',
            'Implement time-series analysis for optimal workflow timing and scheduling',
            'Design predictive workflow triggers based on forecasted customer events',
            'Create load balancing systems for high-volume workflow execution',
            'Build comprehensive workflow analytics dashboards with ROI calculations',
            'Establish continuous improvement processes for workflow optimization'
          ]
        }
      }
    ],
    keyTakeaways: [
      'Successful automation balances efficiency gains with relationship quality and maintains strategic human touchpoints',
      'Multi-signal triggers and conditional logic create more accurate and contextually relevant automated responses',
      'Proper workflow architecture includes error handling, rollback mechanisms, and comprehensive audit trails',
      'Continuous monitoring and optimization through A/B testing significantly improve workflow effectiveness over time',
      'Cross-functional workflows that coordinate multiple teams produce better customer outcomes than siloed automation'
    ],
    nextSteps: [
      'Design and implement your first multi-step automated workflow with proper error handling',
      'Set up comprehensive workflow monitoring dashboards and performance metrics',
      'Create A/B testing framework to optimize workflow timing and messaging',
      'Establish cross-team workflow coordination processes and escalation procedures',
      'Begin advanced trigger optimization using multi-signal correlation and predictive analytics'
    ]
  },
  'custom-segmentation': {
    introduction: 'Build sophisticated customer segmentation strategies that enable precision-targeted success approaches using advanced analytics and machine learning techniques. Move beyond simple demographic segmentation to behavior-based, value-based, and outcome-prediction models that drive measurable business impact. Learn to create dynamic segments that adapt to changing customer characteristics and deliver differentiated strategies.',
    sections: [
      {
        title: 'Advanced Segmentation Methodologies & Statistical Frameworks',
        content: 'Master multiple sophisticated segmentation approaches: Behavioral Clustering (using RFM analysis, usage patterns, and engagement metrics), Value-Based Segmentation (CLV modeling, expansion potential scoring, and profitability analysis), Outcome-Based Segmentation (success probability, churn risk, and growth trajectory), Psychographic Segmentation (company culture fit, decision-making patterns, and technology adoption profiles), and Dynamic Lifecycle Segmentation (adaptive segments based on customer maturity and evolution). Each methodology uses advanced statistical techniques including K-means clustering, hierarchical clustering, and machine learning algorithms to identify natural customer groupings with high predictive value.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Perform RFM analysis on your customer base to identify behavioral clusters',
            'Calculate Customer Lifetime Value (CLV) and create value-based segments',
            'Use machine learning clustering to identify natural customer groupings',
            'Develop psychographic profiles based on technology adoption patterns',
            'Create dynamic lifecycle segments that adapt over time'
          ]
        }
      },
      {
        title: 'Advanced Data Analysis & Validation Techniques for Segmentation Excellence',
        content: 'Learn sophisticated statistical methods for creating robust, actionable segments: Statistical Significance Testing (ensuring segment differences are meaningful), Discriminant Analysis (validating segment separation quality), Stability Testing (measuring segment consistency over time), Predictive Validation (testing segment effectiveness for forecasting outcomes), Cross-Validation Techniques (preventing overfitting and ensuring generalizability), and Segment Profiling (comprehensive characterization using multiple data dimensions). Master advanced analytics tools including correlation matrices, principal component analysis, and ensemble clustering methods to create segments with maximum business value and predictive accuracy.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Perform statistical significance testing on segment differences across key metrics',
            'Conduct discriminant analysis to validate segment quality and separation',
            'Implement stability testing to measure segment consistency across time periods',
            'Design predictive validation frameworks to test segment forecasting accuracy',
            'Create comprehensive segment profiles with behavioral and outcome characteristics',
            'Build cross-validation processes to ensure segment reliability and generalizability'
          ]
        }
      },
      {
        title: 'Strategic Segment Application & Advanced Operationalization Framework',
        content: 'Transform statistical segments into strategic business assets through systematic operationalization: Segment-Specific Value Propositions (tailored messaging and positioning), Differentiated Engagement Models (customized touchpoint strategies and communication cadence), Resource Allocation Optimization (CSM assignment, tool access, and service levels), Personalized Success Metrics (segment-appropriate KPIs and success definitions), Targeted Intervention Strategies (risk mitigation and expansion approaches), and Cross-Functional Alignment (Sales, Marketing, and Product coordination). Develop comprehensive playbooks that translate segment insights into actionable strategies with measurable outcomes and continuous improvement loops.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Develop segment-specific value propositions and messaging frameworks',
            'Design differentiated engagement models with customized touchpoint strategies',
            'Create resource allocation models optimized for each customer segment',
            'Define segment-appropriate success metrics and KPI frameworks',
            'Build targeted intervention playbooks for different segment risk profiles',
            'Establish cross-functional alignment processes for segment strategy execution',
            'Implement segment performance monitoring and continuous improvement systems'
          ]
        }
      }
    ],
    keyTakeaways: [
      'Effective segmentation requires advanced statistical validation and should demonstrate significant predictive power',
      'Dynamic segments that evolve with customers provide better long-term strategic value than static classifications',
      'Segments must translate into differentiated strategies and resource allocation to deliver business impact',
      'Cross-functional alignment and operationalization are critical for segment strategy success',
      'Regular validation and refinement ensure segments remain relevant and effective over time'
    ],
    nextSteps: [
      'Conduct comprehensive customer analysis to identify optimal segmentation variables',
      'Implement advanced clustering techniques and validate segment quality statistically',
      'Develop segment-specific strategies and resource allocation frameworks',
      'Create operationalization playbooks for each identified customer segment',
      'Establish measurement and continuous improvement processes for segmentation effectiveness'
    ]
  },
  'custom-signals': {
    introduction: 'Create powerful custom signals tailored to your unique business model, industry dynamics, and customer success patterns using advanced signal engineering techniques. Learn to identify business-specific behavioral patterns that traditional signals miss, translate domain expertise into algorithmic logic, and build predictive signals with measurable accuracy. Master the complete lifecycle from signal conception to deployment and continuous optimization.',
    sections: [
      {
        title: 'Advanced Signal Creation Framework & Business Logic Engineering',
        content: 'Learn systematic approaches to discovering and engineering high-value signals through comprehensive methodologies: Business Pattern Mining (identifying unique success/failure patterns in your customer base), Domain Expert Interviews (capturing tacit knowledge from experienced team members), Historical Data Analysis (statistical pattern recognition across customer outcomes), Competitive Intelligence Integration (signals based on market dynamics and competitor activity), Multi-Source Data Fusion (combining internal and external data sources), and Predictive Signal Validation (backtesting against historical outcomes). Master the translation of business intuition into algorithmic logic using conditional rules, mathematical formulas, and machine learning models that capture complex relationships and interactions.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Conduct comprehensive business pattern analysis to identify 5 unique success indicators',
            'Interview domain experts to capture tacit knowledge about customer behavior patterns',
            'Perform statistical analysis on historical data to discover hidden correlations',
            'Design algorithms that translate business insights into measurable signal logic',
            'Create multi-source data fusion strategies for comprehensive signal development',
            'Build validation frameworks using backtesting and statistical significance testing'
          ]
        }
      },
      {
        title: 'Sophisticated Business Logic Development & Algorithm Design',
        content: 'Master the art of translating complex business insights into robust, scalable algorithmic systems: Conditional Logic Trees (nested if-then rules for complex decision making), Mathematical Modeling (statistical formulas that capture business relationships), Feature Engineering (creating meaningful variables from raw data sources), Threshold Optimization (data-driven parameter setting for maximum accuracy), Multi-Dimensional Scoring (combining multiple factors into composite signals), and Real-Time Processing Architecture (ensuring signals respond to events immediately). Learn advanced techniques including weighted scoring models, ensemble methods, and adaptive thresholds that improve signal accuracy and reduce false positives while maintaining sensitivity to important events.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Design complex conditional logic trees for your top 3 business-specific patterns',
            'Develop mathematical models that capture key business relationships quantitatively',
            'Engineer features from raw data sources that provide predictive signal value',
            'Optimize signal thresholds using historical data and ROC curve analysis',
            'Create multi-dimensional scoring systems that combine multiple signal inputs',
            'Build real-time processing workflows for immediate signal detection and response',
            'Implement ensemble methods to improve signal accuracy and reliability'
          ]
        }
      },
      {
        title: 'Advanced Analytics Implementation, Validation & Continuous Optimization',
        content: 'Develop comprehensive skills in signal testing, deployment, and lifecycle management using sophisticated analytical frameworks: A/B Testing Methodologies (comparing signal effectiveness against baselines), Statistical Validation (ensuring signal reliability and significance), Performance Monitoring (real-time signal accuracy and false positive/negative rates), Adaptive Learning Systems (signals that improve based on outcomes), Integration Testing (ensuring signals work within broader workflows), and Continuous Optimization Loops (regular refinement based on performance metrics). Master advanced analytics including precision/recall optimization, signal drift detection, and automated retraining processes that maintain signal effectiveness over time.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Design comprehensive A/B testing frameworks for signal effectiveness validation',
            'Implement statistical validation processes including confidence intervals and significance testing',
            'Build real-time performance monitoring dashboards for signal accuracy tracking',
            'Create adaptive learning systems that improve signal performance based on outcomes',
            'Establish integration testing procedures for signal deployment in production workflows',
            'Develop continuous optimization processes including automated retraining and drift detection',
            'Design signal lifecycle management processes for long-term effectiveness maintenance'
          ]
        }
      }
    ],
    keyTakeaways: [
      'Custom signals capture business-specific patterns that generic signals miss, providing competitive advantage',
      'Proper statistical validation and backtesting are essential for reliable signal deployment in production',
      'Combining multiple data sources and algorithmic approaches creates more robust and accurate signals',
      'Continuous monitoring and optimization are critical for maintaining signal effectiveness over time',
      'Integration with existing workflows and business processes determines signal adoption and impact'
    ],
    nextSteps: [
      'Identify and validate 3-5 business-specific patterns for custom signal development',
      'Build comprehensive testing and validation frameworks for signal accuracy measurement',
      'Implement production-ready signal processing systems with real-time monitoring capabilities',
      'Establish continuous improvement processes for signal optimization and maintenance',
      'Begin integration of custom signals into automated workflows and decision-making processes'
    ]
  },
  'dynamics-integration': {
    introduction: 'Master the comprehensive integration between SignalCX and Microsoft Dynamics 365 to create a unified, intelligent customer success ecosystem. Learn to establish enterprise-grade data synchronization, implement bi-directional workflow automation, and leverage advanced CRM capabilities for enhanced customer success outcomes. Understand security protocols, performance optimization, and troubleshooting methodologies for mission-critical integrations.',
    sections: [
      {
        title: 'Enterprise Integration Architecture & Security Framework',
        content: 'Understand the sophisticated technical architecture that enables secure, scalable integration between SignalCX and Dynamics 365: OAuth 2.0 Authentication (secure API access with token management), RESTful API Architecture (standardized data exchange protocols), Data Encryption Standards (end-to-end security for sensitive customer information), Rate Limiting and Throttling (optimizing API calls for performance), Error Handling and Retry Logic (ensuring reliable data synchronization), and Audit Logging (comprehensive tracking for compliance and troubleshooting). Learn advanced security protocols including role-based access control, data residency requirements, and compliance frameworks (GDPR, SOC 2, ISO 27001) that ensure enterprise-grade security and regulatory adherence.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Configure OAuth 2.0 authentication and token management for secure API access',
            'Set up comprehensive audit logging for integration activities and data access',
            'Implement role-based access controls for different user types and data sensitivity levels',
            'Design error handling and retry logic for reliable integration performance',
            'Configure data encryption and security protocols for compliance requirements'
          ]
        }
      },
      {
        title: 'Advanced Data Synchronization & Field Mapping Strategies',
        content: 'Master sophisticated data synchronization techniques that ensure data consistency, integrity, and optimal performance: Bi-Directional Sync Patterns (managing data flow between systems without conflicts), Custom Field Mapping (translating data structures between platforms), Data Transformation Rules (cleaning and standardizing data during sync), Conflict Resolution Strategies (handling simultaneous updates across systems), Delta Synchronization (efficient updates of only changed data), and Data Validation Frameworks (ensuring data quality and consistency). Learn advanced techniques including custom object synchronization, relationship mapping, and performance optimization for large-scale data operations.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Configure comprehensive field mapping between SignalCX and Dynamics 365 entities',
            'Set up bi-directional synchronization workflows with conflict resolution protocols',
            'Implement data transformation rules for cleaning and standardizing information',
            'Create delta synchronization processes for efficient large-scale data updates',
            'Establish data validation frameworks to maintain consistency and quality',
            'Design custom object synchronization for business-specific requirements',
            'Test synchronization performance and optimize for enterprise-scale operations'
          ]
        }
      },
      {
        title: 'Integrated CRM Workflow Automation & Advanced Process Orchestration',
        content: 'Learn to create sophisticated integrated workflows that leverage the combined power of both platforms: Automated Lead-to-Customer Handoff (seamless transitions from Sales to Customer Success), Integrated Opportunity Management (coordinating expansion opportunities across teams), Cross-Platform Business Process Flows (workflows spanning multiple systems), Advanced Reporting and Analytics (unified dashboards with data from both systems), Notification and Alert Integration (coordinated messaging across platforms), and Performance Monitoring (tracking integrated workflow effectiveness). Master advanced orchestration techniques including event-driven workflows, conditional branching based on CRM data, and integrated escalation procedures that enhance customer outcomes.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Design automated handoff processes from Sales opportunities to Customer Success workflows',
            'Create integrated opportunity management workflows for expansion and upsell coordination',
            'Build cross-platform business process flows with appropriate decision points',
            'Implement unified reporting dashboards that combine data from both systems',
            'Set up coordinated notification systems across SignalCX and Dynamics 365',
            'Establish performance monitoring for integrated workflows with success metrics'
          ]
        }
      }
    ],
    keyTakeaways: [
      'Enterprise-grade integration requires comprehensive security, performance optimization, and monitoring frameworks',
      'Bi-directional synchronization with proper conflict resolution ensures data consistency across platforms',
      'Integrated workflows that span multiple systems provide superior customer outcomes compared to siloed operations',
      'Regular monitoring, validation, and optimization are essential for maintaining integration reliability',
      'Proper architecture and planning enable scalable integrations that grow with business needs'
    ],
    nextSteps: [
      'Complete comprehensive integration setup with full security and compliance configuration',
      'Implement and test all critical data synchronization flows with performance monitoring',
      'Design and deploy integrated workflows that enhance customer success operations',
      'Establish ongoing monitoring, maintenance, and optimization procedures for the integration',
      'Train team members on integrated workflow processes and troubleshooting procedures'
    ]
  },
  'teams-collaboration': {
    introduction: 'Enable seamless, intelligent collaboration and real-time communication through comprehensive Microsoft Teams and Outlook integration. Learn to configure advanced notification systems, facilitate cross-functional team coordination, and enhance communication workflows with AI-powered insights. Master the creation of collaborative customer success ecosystems that keep all stakeholders informed and engaged.',
    sections: [
      {
        title: 'Advanced Notification Configuration & Intelligent Alert Systems',
        content: 'Set up sophisticated, context-aware notification systems that deliver the right information to the right people at the optimal time: Role-Based Notification Routing (customized alerts based on user responsibilities and customer assignments), Severity-Tiered Alerting (escalation levels from informational to critical with appropriate urgency indicators), Intelligent Filtering (AI-powered relevance scoring to prevent alert fatigue), Notification Batching and Summarization (consolidating related alerts for improved efficiency), Cross-Channel Delivery (coordinated messaging across Teams, Outlook, and mobile), and Feedback Loops (tracking notification effectiveness and user response patterns). Learn advanced configuration techniques including conditional logic, time-based routing, and integration with external systems for comprehensive alert management.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Configure role-based notification routing for different team members and responsibilities',
            'Set up severity-tiered alerting systems with appropriate escalation procedures',
            'Implement intelligent filtering to reduce notification noise and improve relevance',
            'Design notification batching strategies for improved team efficiency and focus',
            'Create cross-channel delivery systems that reach users through preferred communication methods',
            'Establish feedback loops to measure notification effectiveness and optimize delivery'
          ]
        }
      },
      {
        title: 'Sophisticated Collaboration Workflows & Team Coordination Systems',
        content: 'Design advanced collaborative processes that leverage Teams channels and integrated communication for superior customer outcomes: Account-Specific Collaboration Spaces (dedicated channels with relevant stakeholders and automated information sharing), Cross-Functional Workflow Coordination (seamless handoffs between CS, Sales, Support, and Product teams), Real-Time Decision Support (collaborative decision-making with integrated data and AI recommendations), Knowledge Sharing Automation (automatic capture and distribution of customer insights and best practices), Stakeholder Engagement Tracking (monitoring participation and ensuring appropriate involvement), and Performance Analytics (measuring collaboration effectiveness and team coordination quality). Master advanced techniques including workflow orchestration, automated escalation, and collaborative decision trees.',
        interactiveElements: {
          type: 'exercise',
          items: [
            'Create account-specific Teams channels with automated information sharing and stakeholder coordination',
            'Design cross-functional workflows that ensure seamless handoffs and proper coordination',
            'Implement real-time decision support systems with integrated data and recommendations',
            'Set up knowledge sharing automation for capturing and distributing customer insights',
            'Establish stakeholder engagement tracking to monitor participation and involvement',
            'Build collaboration analytics to measure team coordination effectiveness and identify improvements'
          ]
        }
      },
      {
        title: 'Enhanced Communication Optimization & Relationship Management Integration',
        content: 'Learn to leverage advanced integration features that transform customer communication and internal coordination: Automated Context Sharing (relevant customer information automatically available in communication threads), Communication History Integration (complete conversation tracking across all channels and touchpoints), Intelligent Response Suggestions (AI-powered recommendations for communication content and timing), Sentiment Analysis Integration (real-time emotion detection in customer communications), Follow-up Automation (ensuring no communication falls through the cracks), and Relationship Mapping (visual representation of stakeholder relationships and communication patterns). Master sophisticated techniques including natural language processing, communication pattern analysis, and integrated relationship management for optimal customer engagement.',
        interactiveElements: {
          type: 'checklist',
          items: [
            'Configure automated context sharing for relevant customer information in all communications',
            'Set up comprehensive communication history integration across all channels and touchpoints',
            'Implement AI-powered response suggestions for improved communication quality and efficiency',
            'Enable sentiment analysis integration for real-time emotional intelligence in customer interactions',
            'Create follow-up automation systems to ensure consistent and timely communication',
            'Build relationship mapping visualizations for better stakeholder coordination and engagement',
            'Establish communication pattern analysis for continuous improvement and optimization'
          ]
        }
      }
    ],
    keyTakeaways: [
      'Intelligent notification systems with proper filtering and routing significantly improve team efficiency and response times',
      'Collaborative workflows that span multiple teams and systems produce superior customer outcomes',
      'Automated context sharing and communication history integration eliminate information silos and improve customer experience',
      'Proper configuration and training are essential for user adoption and integration effectiveness',
      'Continuous monitoring and optimization ensure collaboration systems remain effective and valuable over time'
    ],
    nextSteps: [
      'Configure comprehensive notification workflows with intelligent filtering and routing',
      'Set up advanced team collaboration channels with automated information sharing',
      'Implement enhanced communication features including context sharing and history integration',
      'Train team members on integrated collaboration processes and best practices',
      'Establish monitoring and optimization procedures for ongoing communication system improvement'
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

function AssessmentComponent({ assessment, onComplete }: { 
  assessment: Assessment, 
  onComplete: (assessment: Assessment, score: number, passed: boolean) => void 
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const correctAnswers = assessment.questions.filter((q, index) => 
      q.correctAnswer === answers[index]
    ).length;
    const score = Math.round((correctAnswers / assessment.questions.length) * 100);
    const passed = score >= assessment.passingScore;
    
    setShowResults(true);
    setTimeout(() => {
      onComplete(assessment, score, passed);
    }, 3000);
  };

  if (showResults) {
    const correctAnswers = assessment.questions.filter((q, index) => 
      q.correctAnswer === answers[index]
    ).length;
    const score = Math.round((correctAnswers / assessment.questions.length) * 100);
    const passed = score >= assessment.passingScore;

    return (
      <div className="text-center py-8">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
          passed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {passed ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : (
            <div className="w-10 h-10 rounded-full border-4 border-red-600" />
          )}
        </div>
        <h3 className="text-xl font-bold mb-2">
          {passed ? 'Congratulations!' : 'Keep Learning!'}
        </h3>
        <p className="text-lg mb-4">Your Score: {score}%</p>
        <p className="text-sm text-muted-foreground mb-4">
          Passing Score: {assessment.passingScore}%
        </p>
        <p className="text-sm text-muted-foreground">
          {passed ? 'You have successfully completed this assessment!' : 'Review the material and try again.'}
        </p>
      </div>
    );
  }

  const question = assessment.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestion + 1} of {assessment.questions.length}
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={answers[currentQuestion] === index ? "default" : "outline"}
              onClick={() => handleAnswer(index)}
              className="w-full text-left justify-start h-auto p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  answers[currentQuestion] === index ? 'border-primary bg-primary' : 'border-gray-300'
                }`}>
                  {answers[currentQuestion] === index && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm">{option}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button
          onClick={nextQuestion}
          disabled={answers[currentQuestion] === undefined}
        >
          {currentQuestion === assessment.questions.length - 1 ? 'Complete Assessment' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
}

export function SignalCXAcademy() {
  const [moduleProgress, setModuleProgress] = useKV<Record<string, ModuleProgress>>('academy-progress', {});
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [completedCertifications, setCompletedCertifications] = useKV<string[]>('completed-certifications', []);
  const [assessmentResults, setAssessmentResults] = useKV<Record<string, {score: number, passed: boolean, completedAt: string}>>('assessment-results', {});

  const safeModuleProgress = moduleProgress || {};
  const safeCompletedCertifications = completedCertifications || [];
  const safeAssessmentResults = assessmentResults || {};

  const updateModuleProgress = (moduleId: string, progress: number, completed = false) => {
    setModuleProgress(prev => ({
      ...prev,
      [moduleId]: { progress, completed }
    }));
  };

  const startModule = (module: LearningModule) => {
    updateModuleProgress(module.id, 10);
    setActiveModule(module);
    setActiveAssessment(null);
  };

  const completeModule = (module: LearningModule) => {
    updateModuleProgress(module.id, 100, true);
    // Check if there's an assessment for this module
    const assessment = assessments.find(a => a.moduleId === module.id);
    if (assessment) {
      setActiveAssessment(assessment);
    } else {
      setActiveModule(null);
      checkForCertification(module.id);
    }
  };

  const completeAssessment = (assessment: Assessment, score: number, passed: boolean) => {
    setAssessmentResults(prev => ({
      ...prev,
      [assessment.id]: {
        score,
        passed,
        completedAt: new Date().toISOString()
      }
    }));
    setActiveAssessment(null);
    setActiveModule(null);
    
    if (passed) {
      checkForCertification(assessment.moduleId);
    }
  };

  const checkForCertification = (completedModuleId: string) => {
    // Check if any certifications can be awarded
    certifications.forEach(cert => {
      if (!safeCompletedCertifications.includes(cert.id)) {
        const allModulesCompleted = cert.requiredModules.every(moduleId => 
          safeModuleProgress[moduleId]?.completed
        );
        
        if (allModulesCompleted) {
          setCompletedCertifications(prev => {
            const currentCerts = prev || [];
            return [...currentCerts, cert.id];
          });
          
          // Show celebration toast
          toast.success(`🎉 Congratulations! You've earned the ${cert.title} certification!`, {
            duration: 5000,
            description: cert.description
          });
        }
      }
    });
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

      {/* Certifications */}
      <Card className="border-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-purple-600" />
            Your Certifications
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Earn certifications by completing learning paths and passing assessments
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {certifications.map((cert) => {
              const isEarned = safeCompletedCertifications.includes(cert.id);
              const allModulesCompleted = cert.requiredModules.every(moduleId => 
                safeModuleProgress[moduleId]?.completed
              );
              const progress = cert.requiredModules.length > 0 ? 
                (cert.requiredModules.filter(moduleId => safeModuleProgress[moduleId]?.completed).length / cert.requiredModules.length) * 100 : 0;
              
              return (
                <Card key={cert.id} className={`border-visible ${isEarned ? 'border-gold bg-gradient-to-br from-yellow-50 to-orange-50' : ''}`}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${isEarned ? cert.badgeColor : 'bg-gray-200'}`}>
                      <Medal className={`w-8 h-8 ${isEarned ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <h3 className="font-semibold text-sm mb-2">{cert.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{cert.description}</p>
                    {isEarned ? (
                      <Badge variant="default" className="bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Earned
                      </Badge>
                    ) : (
                      <div>
                        <Progress value={progress} className="mb-2" />
                        <p className="text-xs text-muted-foreground">
                          {cert.requiredModules.filter(moduleId => safeModuleProgress[moduleId]?.completed).length} of {cert.requiredModules.length} modules completed
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
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

      {/* Assessment */}
      {activeAssessment && (
        <Card className="border-visible border-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Assessment: {activeAssessment.title}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveAssessment(null)}
              >
                Skip Assessment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AssessmentComponent 
              assessment={activeAssessment}
              onComplete={completeAssessment}
            />
          </CardContent>
        </Card>
      )}

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
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">Welcome to {activeModule.title}</h4>
                    <p className="text-sm font-medium text-foreground mb-4">{activeModule.description}</p>
                    {trainingContent[activeModule.id] && (
                      <div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {trainingContent[activeModule.id].introduction}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {trainingContent[activeModule.id] && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1"></div>
                    <h4 className="font-semibold text-lg flex items-center gap-2 text-primary">
                      <PlayCircle className="w-5 h-5" />
                      Training Modules
                    </h4>
                    <div className="h-px bg-gradient-to-r from-primary via-transparent to-transparent flex-1"></div>
                  </div>
                  
                  {trainingContent[activeModule.id].sections.map((section, index) => (
                    <Card key={index} className="border-visible overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                        <CardTitle className="text-base flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="text-primary">{section.title}</span>
                          <Badge variant="outline" className="ml-auto">
                            {section.interactiveElements?.type === 'exercise' ? '💡 Interactive' : 
                             section.interactiveElements?.type === 'quiz' ? '🧠 Quiz' : 
                             section.interactiveElements?.type === 'checklist' ? '✅ Checklist' : '📖 Reading'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="prose prose-sm max-w-none">
                          {section.content.split('\n\n').map((paragraph, pIndex) => {
                            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                              // Handle bold headers
                              return <h5 key={pIndex} className="font-semibold text-base mt-4 mb-2">{paragraph.slice(2, -2)}</h5>;
                            }
                            return <p key={pIndex} className="text-sm leading-relaxed mb-3 text-foreground">{paragraph}</p>;
                          })}
                        </div>
                        
                        {section.interactiveElements && (
                          <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg p-4 border border-accent/20">
                            <h5 className="font-medium text-sm mb-3 flex items-center gap-2 text-primary">
                              {section.interactiveElements.type === 'quiz' && <Target className="w-4 h-4" />}
                              {section.interactiveElements.type === 'exercise' && <PlayCircle className="w-4 h-4" />}
                              {section.interactiveElements.type === 'checklist' && <CheckCircle className="w-4 h-4" />}
                              {section.interactiveElements.type === 'quiz' && '🧠 Knowledge Check'}
                              {section.interactiveElements.type === 'exercise' && '💡 Hands-on Exercise'}
                              {section.interactiveElements.type === 'checklist' && '✅ Practice Checklist'}
                            </h5>
                            <div className="space-y-3">
                              {section.interactiveElements.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-start gap-3 p-3 bg-white/50 rounded-md border border-accent/10 hover:border-accent/30 transition-colors">
                                  <div className="w-6 h-6 mt-0.5 bg-primary/10 border-2 border-primary/20 rounded flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-sm text-foreground leading-relaxed">{item}</span>
                                    {section.interactiveElements?.type === 'exercise' && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="mt-2 text-xs h-6 px-2 text-primary hover:bg-primary/10"
                                        onClick={() => {
                                          // Navigate to relevant section of the application
                                          if (item.includes('dashboard') || item.includes('TechCorp')) {
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                            setTimeout(() => {
                                              // Simulate clicking on TechCorp in the accounts table
                                              const techCorpRow = Array.from(document.querySelectorAll('[data-slot="table-row"]'))
                                                .find(row => row.textContent?.includes('TechCorp'));
                                              if (techCorpRow) {
                                                (techCorpRow as HTMLElement).click();
                                                toast.success('Selected TechCorp to demonstrate signal analysis');
                                              }
                                            }, 1000);
                                            toast.success('Navigate to the main dashboard - look for TechCorp Solutions');
                                          } else if (item.includes('NBA') || item.includes('recommendations') || item.includes('AI-generated')) {
                                            const tabsSection = document.querySelector('[data-section="right-column"]');
                                            if (tabsSection) {
                                              tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                              setTimeout(() => {
                                                const aiEngineTab = document.querySelector('[value="ai-engine"]') as HTMLElement;
                                                if (aiEngineTab) {
                                                  aiEngineTab.click();
                                                  toast.success('Explore AI-generated recommendations and confidence scores');
                                                }
                                              }, 500);
                                            }
                                          } else if (item.includes('signals') || item.includes('Live Signals') || item.includes('signal')) {
                                            const tabsSection = document.querySelector('[data-section="right-column"]');
                                            if (tabsSection) {
                                              tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                              setTimeout(() => {
                                                const signalsTab = document.querySelector('[value="signals"]') as HTMLElement;
                                                if (signalsTab) {
                                                  signalsTab.click();
                                                  toast.success('Examine live customer signals and their severity levels');
                                                }
                                              }, 500);
                                            }
                                          } else if (item.includes('Heat Map') || item.includes('Predictive')) {
                                            const heatMapButton = document.querySelector('button:has-text("🔥 Heat Map")') as HTMLElement;
                                            if (heatMapButton) {
                                              heatMapButton.click();
                                              toast.success('Opening Predictive Heat Map for portfolio analysis');
                                            } else {
                                              toast.success('Look for the Heat Map button in the header for predictive analysis');
                                            }
                                          } else if (item.includes('Health') || item.includes('system') || item.includes('integration')) {
                                            const healthButtons = document.querySelectorAll('button');
                                            const systemHealthBtn = Array.from(healthButtons).find(btn => 
                                              btn.textContent?.includes('System') || btn.textContent?.includes('Health')
                                            );
                                            if (systemHealthBtn) {
                                              (systemHealthBtn as HTMLElement).click();
                                              toast.success('Opening System Health to review integrations');
                                            }
                                          } else if (item.includes('ROI') || item.includes('Dashboard')) {
                                            const roiButton = document.querySelector('button:has-text("ROI")') as HTMLElement;
                                            if (roiButton) {
                                              roiButton.click();
                                              toast.success('Opening ROI Dashboard to view platform value metrics');
                                            } else {
                                              toast.success('Look for the ROI Dashboard button in the header');
                                            }
                                          } else if (item.includes('notification') || item.includes('alert')) {
                                            const testNotificationBtn = Array.from(document.querySelectorAll('button'))
                                              .find(btn => btn.textContent?.includes('Test'));
                                            if (testNotificationBtn) {
                                              (testNotificationBtn as HTMLElement).click();
                                              toast.success('Testing notification system');
                                            } else {
                                              toast.success('Explore notification settings in the header area');
                                            }
                                          } else {
                                            toast.success('Exercise guidance provided - explore the mentioned features in the application');
                                          }
                                        }}
                                      >
                                        Try it →
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
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
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // Launch interactive demo based on module type
                      if (activeModule.id.includes('fundamentals')) {
                        // Demonstrate platform navigation
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setTimeout(() => {
                          const accountsSection = document.querySelector('.accounts-table');
                          if (accountsSection) {
                            accountsSection.scrollIntoView({ behavior: 'smooth' });
                            toast.success('🎯 Demo: Explore the Accounts Table - click on any account to see NBA recommendations');
                          }
                        }, 1000);
                      } else if (activeModule.id.includes('health-monitoring')) {
                        // Highlight health score features
                        const healthScoreElements = document.querySelectorAll('[data-health-score], .health-score');
                        healthScoreElements.forEach((el, index) => {
                          setTimeout(() => {
                            el.classList.add('highlight-demo');
                            setTimeout(() => el.classList.remove('highlight-demo'), 2000);
                          }, index * 500);
                        });
                        toast.success('🎯 Demo: Health scores are highlighted - notice the color coding for risk levels');
                      } else if (activeModule.id.includes('signal')) {
                        // Navigate to signals and demonstrate analysis
                        const tabsSection = document.querySelector('[data-section="right-column"]');
                        if (tabsSection) {
                          tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setTimeout(() => {
                            const signalsTab = document.querySelector('[value="signals"]') as HTMLElement;
                            if (signalsTab) {
                              signalsTab.click();
                              toast.success('🎯 Demo: Observe signal types, severity levels, and correlation patterns');
                            }
                          }, 500);
                        }
                      } else if (activeModule.id.includes('ai-nba')) {
                        // Show NBA generation process
                        const tabsSection = document.querySelector('[data-section="right-column"]');
                        if (tabsSection) {
                          tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setTimeout(() => {
                            const aiEngineTab = document.querySelector('[value="ai-engine"]') as HTMLElement;
                            if (aiEngineTab) {
                              aiEngineTab.click();
                              toast.success('🎯 Demo: Watch AI generate recommendations with confidence scores');
                            }
                          }, 500);
                        }
                      } else {
                        toast.success('🎯 Demo mode activated - explore the application features mentioned in this module');
                      }
                    }}
                    className="text-purple-700 border-purple-200 hover:bg-purple-50"
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    🎯 Live Demo
                  </Button>
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
                    {assessments.find(a => a.moduleId === activeModule.id) ? 'Take Assessment' : 'Complete Module'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Learning Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-visible">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-xl font-bold">
                  {Object.values(safeModuleProgress).filter(p => p.completed).length}
                </div>
                <p className="text-xs text-muted-foreground">Modules Completed</p>
                <p className="text-xs text-green-600 font-medium">
                  {Math.round((Object.values(safeModuleProgress).filter(p => p.completed).length / learningModules.length) * 100)}% Complete
                </p>
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
                <p className="text-xs text-blue-600 font-medium">
                  {learningModules.length - Object.values(safeModuleProgress).filter(p => p.completed).length} remaining
                </p>
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
                <p className="text-xs text-purple-600 font-medium">
                  {learningPaths.length - learningPaths.filter(path => getPathProgress(path) === 100).length} in progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-visible">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Medal className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-xl font-bold">
                  {safeCompletedCertifications.length}
                </div>
                <p className="text-xs text-muted-foreground">Certifications Earned</p>
                <p className="text-xs text-orange-600 font-medium">
                  {Math.round((safeCompletedCertifications.length / certifications.length) * 100)}% achievement rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress Summary */}
      <Card className="border-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-primary" />
            Learning Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryModules).map(([category, modules]) => {
              const completed = modules.filter(m => safeModuleProgress[m.id]?.completed).length;
              const progress = modules.length > 0 ? (completed / modules.length) * 100 : 0;
              
              return (
                <div key={category} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium capitalize">
                    {category.replace('-', ' ')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        {completed} of {modules.length} completed
                      </span>
                      <span className="text-sm font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
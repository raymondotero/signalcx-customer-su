import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Question, 
  BookOpen, 
  VideoCamera, 
  Lightbulb, 
  ChartLine, 
  Brain, 
  Target, 
  Database,
  Gear,
  Users,
  TrendUp,
  Shield,
  Play,
  FileText,
  Phone,
  ChatCircle,
  Monitor,
  CaretDown,
  CaretRight,
  Bug,
  Code,
  Download,
  Key,
  Warning,
  CheckCircle,
  Clock,
  ArrowRight,
  Link,
  MagnifyingGlass,
  Globe,
  Wrench
} from '@phosphor-icons/react';

interface ExpandableResource {
  id: string;
  title: string;
  icon: React.ReactNode;
  summary: string;
  content: React.ReactNode;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  resources?: ExpandableResource[];
}

const HelpGuide: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedResources, setExpandedResources] = useState<string[]>([]);

  const toggleResource = (resourceId: string) => {
    setExpandedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const ExpandableResourceComponent: React.FC<{ resource: ExpandableResource }> = ({ resource }) => {
    const isExpanded = expandedResources.includes(resource.id);
    
    return (
      <div className="space-y-2">
        <Card 
          className="border-visible cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => toggleResource(resource.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {resource.icon}
                <div>
                  <h4 className="font-medium text-sm">{resource.title}</h4>
                  <p className="text-xs text-muted-foreground">{resource.summary}</p>
                </div>
              </div>
              {isExpanded ? (
                <CaretDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <CaretRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>
        
        {isExpanded && (
          <Card className="border-visible ml-6">
            <CardContent className="p-4">
              {resource.content}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Play className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Welcome to SignalCX! This AI-powered platform helps Customer Success teams optimize account management through intelligent signal processing and automated workflows.
          </p>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI-Powered Features
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Real-time Next Best Action recommendations</p>
              <p>• Predictive health score forecasting</p>
              <p>• Automated workflow orchestration</p>
              <p>• Business value signal analysis</p>
            </CardContent>
          </Card>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ChartLine className="w-4 h-4" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <h4 className="font-medium mb-2">5-Minute Demo Flow:</h4>
              <ul className="space-y-1">
                <li>1. Start by selecting an account from the main dashboard</li>
                <li>2. Click "Generate NBA" to see AI recommendations</li>
                <li>3. Use the Business Value Dashboard to analyze signals</li>
                <li>4. Review expansion opportunities in ARR Growth</li>
                <li>5. Execute workflows via "Plan & Run" approvals</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ),
      resources: [
        {
          id: 'platform-overview',
          title: 'Platform Overview Video',
          icon: <VideoCamera className="w-4 h-4 text-blue-600" />,
          summary: 'Watch a 10-minute overview of SignalCX features',
          content: (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h5 className="font-medium text-sm text-blue-800 mb-2">What you'll learn:</h5>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Platform navigation and key features</li>
                  <li>• AI recommendation engine capabilities</li>
                  <li>• Integration with Microsoft ecosystem</li>
                  <li>• Customer success workflow optimization</li>
                </ul>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo Video
              </Button>
            </div>
          )
        },
        {
          id: 'first-login-checklist',
          title: 'First Login Checklist',
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          summary: 'Essential steps to configure your workspace',
          content: (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Set up data integrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Configure signal targets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Import customer accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Set up team roles and permissions</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Gear className="w-4 h-4 mr-2" />
                Open Setup Wizard
              </Button>
            </div>
          )
        },
        {
          id: 'keyboard-shortcuts',
          title: 'Keyboard Shortcuts',
          icon: <Key className="w-4 h-4 text-purple-600" />,
          summary: 'Boost productivity with keyboard shortcuts',
          content: (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Search accounts</span>
                    <kbd className="bg-muted px-1 rounded">Ctrl+K</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Generate NBA</span>
                    <kbd className="bg-muted px-1 rounded">Ctrl+G</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Toggle filters</span>
                    <kbd className="bg-muted px-1 rounded">Ctrl+F</kbd>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Export data</span>
                    <kbd className="bg-muted px-1 rounded">Ctrl+E</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Help guide</span>
                    <kbd className="bg-muted px-1 rounded">F1</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Settings</span>
                    <kbd className="bg-muted px-1 rounded">Ctrl+,</kbd>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'account-management',
      title: 'Account Management',
      icon: <Users className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Understand account health, ARR tracking, and customer success metrics.
          </p>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Health Score Indicators</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="status-good">Good</Badge>
                <span className="text-xs">Health score 70-100, low risk</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="status-watch">Watch</Badge>
                <span className="text-xs">Health score 40-69, moderate attention needed</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="status-risk">At Risk</Badge>
                <span className="text-xs">Health score 0-39, immediate action required</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>ARR:</strong> Annual Recurring Revenue</p>
              <p><strong>QoQ Growth:</strong> Quarter-over-Quarter revenue growth</p>
              <p><strong>Contract End:</strong> Renewal timeline and risk assessment</p>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-sm mb-2 text-blue-800">Pro Tips:</h4>
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Sort by health score to prioritize attention</li>
              <li>• Monitor QoQ growth trends for expansion opportunities</li>
              <li>• Use filters to focus on specific account segments</li>
            </ul>
          </div>
        </div>
      ),
      resources: [
        {
          id: 'health-score-guide',
          title: 'Health Score Calculation Guide',
          icon: <TrendUp className="w-4 h-4 text-green-600" />,
          summary: 'Understand how health scores are calculated',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Health Score Factors:</h5>
                <div className="pl-2 space-y-1">
                  <p>• Product usage and adoption (30%)</p>
                  <p>• Support ticket volume and sentiment (20%)</p>
                  <p>• Stakeholder engagement levels (20%)</p>
                  <p>• Payment and billing health (15%)</p>
                  <p>• Contract renewal indicators (15%)</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                View Detailed Methodology
              </Button>
            </div>
          )
        },
        {
          id: 'renewal-risk-playbook',
          title: 'Renewal Risk Playbook',
          icon: <Warning className="w-4 h-4 text-orange-600" />,
          summary: 'Best practices for at-risk account management',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Immediate Actions:</h5>
                <div className="pl-2 space-y-1">
                  <p>• Schedule stakeholder meetings within 48 hours</p>
                  <p>• Review recent support interactions</p>
                  <p>• Analyze product usage patterns</p>
                  <p>• Prepare value realization presentation</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Templates
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-1" />
                  Escalation
                </Button>
              </div>
            </div>
          )
        },
        {
          id: 'expansion-opportunities',
          title: 'Expansion Identification',
          icon: <TrendUp className="w-4 h-4 text-blue-600" />,
          summary: 'Identify and pursue growth opportunities',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Expansion Signals:</h5>
                <div className="pl-2 space-y-1">
                  <p>• High feature adoption rates</p>
                  <p>• API usage growth patterns</p>
                  <p>• Team size increases</p>
                  <p>• Additional department usage</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <ChartLine className="w-4 h-4 mr-2" />
                Run Expansion Analysis
              </Button>
            </div>
          )
        }
      ]
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      icon: <Brain className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Learn how to maximize the AI-powered features in SignalCX.
          </p>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Recommendation Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>The AI analyzes multiple data sources to generate Next Best Actions:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Customer usage patterns and trends</li>
                <li>Support interaction sentiment analysis</li>
                <li>Business value signal correlation</li>
                <li>Industry benchmarks and best practices</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ),
      resources: [
        {
          id: 'ai-recommendation-tuning',
          title: 'AI Recommendation Tuning',
          icon: <Target className="w-4 h-4 text-purple-600" />,
          summary: 'Optimize AI recommendations for your business',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Tuning Parameters:</h5>
                <div className="pl-2 space-y-1">
                  <p>• Industry-specific signal weights</p>
                  <p>• Customer segment preferences</p>
                  <p>• Risk tolerance thresholds</p>
                  <p>• Action priority scoring</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Gear className="w-4 h-4 mr-2" />
                Open AI Settings
              </Button>
            </div>
          )
        },
        {
          id: 'signal-configuration',
          title: 'Business Value Signals',
          icon: <Target className="w-4 h-4 text-green-600" />,
          summary: 'Configure and monitor business value signals',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Signal Categories:</h5>
                <div className="grid grid-cols-2 gap-1 pl-2">
                  <p>• Cost Optimization</p>
                  <p>• Agility Metrics</p>
                  <p>• Data Quality</p>
                  <p>• Risk Management</p>
                  <p>• Culture Adoption</p>
                  <p>• Performance KPIs</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Configure Targets
              </Button>
            </div>
          )
        },
        {
          id: 'workflow-automation',
          title: 'Workflow Automation',
          icon: <Gear className="w-4 h-4 text-blue-600" />,
          summary: 'Set up automated customer success workflows',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Available Workflows:</h5>
                <div className="pl-2 space-y-1">
                  <p>• Health score deterioration alerts</p>
                  <p>• Expansion opportunity notifications</p>
                  <p>• Renewal risk escalations</p>
                  <p>• Usage milestone celebrations</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          )
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Data Integration',
      icon: <Database className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect SignalCX with your existing tools and data sources.
          </p>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                Supported Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Microsoft Dynamics 365 & Power Platform</p>
              <p>• Salesforce CRM and Service Cloud</p>
              <p>• Azure Data Lake and Synapse Analytics</p>
              <p>• Power BI and Fabric environments</p>
              <p>• Custom APIs and webhooks</p>
            </CardContent>
          </Card>
        </div>
      ),
      resources: [
        {
          id: 'integration-wizard',
          title: 'Integration Setup Wizard',
          icon: <Wrench className="w-4 h-4 text-blue-600" />,
          summary: 'Step-by-step integration configuration',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Setup Steps:</h5>
                <div className="pl-2 space-y-1">
                  <p>1. Select data source type</p>
                  <p>2. Configure authentication</p>
                  <p>3. Map data fields</p>
                  <p>4. Set sync schedule</p>
                  <p>5. Test connection</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Gear className="w-4 h-4 mr-2" />
                Launch Wizard
              </Button>
            </div>
          )
        },
        {
          id: 'api-documentation',
          title: 'API Documentation',
          icon: <Code className="w-4 h-4 text-gray-600" />,
          summary: 'Complete API reference and examples',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">API Features:</h5>
                <div className="pl-2 space-y-1">
                  <p>• RESTful endpoints with OpenAPI spec</p>
                  <p>• Real-time webhooks for events</p>
                  <p>• Bulk data import/export</p>
                  <p>• Authentication via OAuth 2.0</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Code className="w-4 h-4 mr-1" />
                  View Docs
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  SDK
                </Button>
              </div>
            </div>
          )
        },
        {
          id: 'data-sync-troubleshooting',
          title: 'Data Sync Troubleshooting',
          icon: <Bug className="w-4 h-4 text-red-600" />,
          summary: 'Resolve common integration issues',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Common Issues:</h5>
                <div className="pl-2 space-y-1">
                  <p>• Authentication failures</p>
                  <p>• Rate limiting errors</p>
                  <p>• Data mapping mismatches</p>
                  <p>• Sync schedule conflicts</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <MagnifyingGlass className="w-4 h-4 mr-2" />
                Run Diagnostics
              </Button>
            </div>
          )
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <Bug className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Quick solutions for common issues and performance optimization.
          </p>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Common Issues</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• AI recommendations not generating</p>
              <p>• Slow dashboard loading times</p>
              <p>• Data sync failures</p>
              <p>• Permission and access errors</p>
            </CardContent>
          </Card>
        </div>
      ),
      resources: [
        {
          id: 'performance-optimization',
          title: 'Performance Optimization',
          icon: <TrendUp className="w-4 h-4 text-green-600" />,
          summary: 'Improve platform performance and speed',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Optimization Tips:</h5>
                <div className="pl-2 space-y-1">
                  <p>• Clear browser cache regularly</p>
                  <p>• Use filtered views for large datasets</p>
                  <p>• Optimize signal target configurations</p>
                  <p>• Schedule data syncs during off-peak hours</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Gear className="w-4 h-4 mr-2" />
                Performance Check
              </Button>
            </div>
          )
        },
        {
          id: 'error-codes',
          title: 'Error Code Reference',
          icon: <Warning className="w-4 h-4 text-orange-600" />,
          summary: 'Understand and resolve error messages',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Common Error Codes:</h5>
                <div className="pl-2 space-y-1">
                  <p>• AI_001: Model service unavailable</p>
                  <p>• DATA_002: Sync authentication failure</p>
                  <p>• API_003: Rate limit exceeded</p>
                  <p>• PERM_004: Insufficient permissions</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Full Error Guide
              </Button>
            </div>
          )
        },
        {
          id: 'system-status',
          title: 'System Status & Health',
          icon: <Monitor className="w-4 h-4 text-blue-600" />,
          summary: 'Check platform health and service status',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Health Indicators:</h5>
                <div className="pl-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>AI Services: Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Data Sync: Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>API Gateway: Degraded</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Globe className="w-4 h-4 mr-2" />
                Status Dashboard
              </Button>
            </div>
          )
        }
      ]
    },
    {
      id: 'support',
      title: 'Support & Training',
      icon: <Phone className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Access support resources, training materials, and community forums.
          </p>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Support Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>Technical Support:</strong> support@signalcx.com</p>
              <p><strong>Customer Success:</strong> success@signalcx.com</p>
              <p><strong>Emergency Escalation:</strong> Available 24/7 for critical issues</p>
            </CardContent>
          </Card>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <VideoCamera className="w-4 h-4" />
                Training Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• AI workflow training modules</p>
              <p>• Customer success best practices</p>
              <p>• Advanced analytics workshops</p>
            </CardContent>
          </Card>
        </div>
      ),
      resources: [
        {
          id: 'training-academy',
          title: 'SignalCX Academy',
          icon: <BookOpen className="w-4 h-4 text-blue-600" />,
          summary: 'Comprehensive training courses and certifications',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Available Courses:</h5>
                <div className="pl-2 space-y-1">
                  <p>• SignalCX Fundamentals (2 hours)</p>
                  <p>• AI-Powered Customer Success (4 hours)</p>
                  <p>• Advanced Analytics & Reporting (3 hours)</p>
                  <p>• Platform Administration (5 hours)</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Start Learning
              </Button>
            </div>
          )
        },
        {
          id: 'community-forums',
          title: 'Community Forums',
          icon: <ChatCircle className="w-4 h-4 text-green-600" />,
          summary: 'Connect with other SignalCX users',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Forum Categories:</h5>
                <div className="pl-2 space-y-1">
                  <p>• General Discussion</p>
                  <p>• Feature Requests</p>
                  <p>• Best Practices</p>
                  <p>• Technical Support</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <ChatCircle className="w-4 h-4 mr-2" />
                Join Community
              </Button>
            </div>
          )
        },
        {
          id: 'office-hours',
          title: 'Weekly Office Hours',
          icon: <Clock className="w-4 h-4 text-purple-600" />,
          summary: 'Live Q&A sessions with product experts',
          content: (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <h5 className="font-medium">Schedule:</h5>
                <div className="pl-2 space-y-1">
                  <p>• Tuesdays 2:00 PM PST - General Q&A</p>
                  <p>• Thursdays 10:00 AM EST - Technical Deep Dive</p>
                  <p>• Fridays 1:00 PM GMT - EMEA Session</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Reserve Spot
              </Button>
            </div>
          )
        }
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Question className="w-4 h-4" />
          Guide Me
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-1/3 border-r bg-muted/20 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                <h2 className="font-semibold text-lg mb-4">SignalCX Guide</h2>
                {guideSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      {section.icon}
                      <span className="text-sm">{section.title}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">
                  {guideSections.find(s => s.id === activeSection)?.title}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <Play className="w-3 h-3 mr-1" />
                    Interactive Guide
                  </Badge>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl space-y-6">
                {/* Main Content */}
                <div>
                  {guideSections.find(s => s.id === activeSection)?.content}
                </div>
                
                {/* Expandable Resources */}
                {guideSections.find(s => s.id === activeSection)?.resources && (
                  <div className="space-y-4">
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Quick Resources
                      </h3>
                      <div className="space-y-3">
                        {guideSections.find(s => s.id === activeSection)?.resources?.map((resource) => (
                          <ExpandableResourceComponent key={resource.id} resource={resource} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">SignalCX Help Center</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Close Guide
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpGuide;
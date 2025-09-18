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
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-medium text-sm text-blue-800 mb-3">🎬 Video Library</h5>
                
                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-blue-800">SignalCX in 10 Minutes</h6>
                      <Badge variant="outline" className="text-xs">New User</Badge>
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <p>🎯 Platform navigation and key features overview</p>
                      <p>🤖 AI recommendation engine introduction</p>
                      <p>📊 Dashboard tour and metrics explanation</p>
                      <p>🔄 Basic workflow demonstration</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-600">⏱️ 10:32 • 👀 4.2k views</span>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          <Play className="w-3 h-3 mr-1" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-blue-800">Customer Success Workflows</h6>
                      <Badge variant="outline" className="text-xs">Deep Dive</Badge>
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <p>📈 Advanced health score analysis techniques</p>
                      <p>🎯 NBA recommendation optimization</p>
                      <p>🔄 Multi-step workflow creation</p>
                      <p>📊 ROI measurement and reporting</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-600">⏱️ 18:45 • 👀 2.8k views</span>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          <Play className="w-3 h-3 mr-1" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-blue-800">Microsoft Ecosystem Integration</h6>
                      <Badge variant="outline" className="text-xs">Technical</Badge>
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <p>🔗 Dynamics 365 and Power Platform setup</p>
                      <p>📊 Power BI dashboard configuration</p>
                      <p>💬 Teams notifications and approvals</p>
                      <p>☁️ Azure services integration patterns</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-600">⏱️ 15:20 • 👀 1.9k views</span>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          <Play className="w-3 h-3 mr-1" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
                📝 <strong>Note:</strong> All videos include closed captions, downloadable transcripts, and follow-along worksheets. Progress is tracked and you can bookmark specific sections for later reference.
              </div>
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
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-medium text-sm text-green-800 mb-3">🧮 Health Score Algorithm</h5>
                
                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded border border-green-100">
                    <h6 className="font-medium text-green-800 mb-2">📊 Weighted Factors (100 Point Scale)</h6>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700">Product Usage & Adoption</span>
                        <Badge variant="outline" className="text-xs bg-green-100">30%</Badge>
                      </div>
                      <div className="text-xs text-green-600 pl-2">
                        <p>• Daily/weekly active users vs. licensed seats</p>
                        <p>• Feature adoption depth and breadth</p>
                        <p>• API usage patterns and growth</p>
                        <p>• Time-to-value achievement milestones</p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-green-700">Support & Sentiment</span>
                        <Badge variant="outline" className="text-xs bg-yellow-100">20%</Badge>
                      </div>
                      <div className="text-xs text-green-600 pl-2">
                        <p>• Support ticket volume and severity trends</p>
                        <p>• Resolution time satisfaction scores</p>
                        <p>• CSAT and sentiment analysis from interactions</p>
                        <p>• Self-service resource utilization</p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-green-700">Stakeholder Engagement</span>
                        <Badge variant="outline" className="text-xs bg-blue-100">20%</Badge>
                      </div>
                      <div className="text-xs text-green-600 pl-2">
                        <p>• Executive sponsor participation level</p>
                        <p>• QBR attendance and preparation quality</p>
                        <p>• Champion network strength and advocacy</p>
                        <p>• Training completion and certification rates</p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-green-700">Financial Health</span>
                        <Badge variant="outline" className="text-xs bg-purple-100">15%</Badge>
                      </div>
                      <div className="text-xs text-green-600 pl-2">
                        <p>• Payment history and billing disputes</p>
                        <p>• Budget allocation vs. actual usage</p>
                        <p>• Expansion opportunity indicators</p>
                        <p>• ROI realization and business case validation</p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-green-700">Renewal Indicators</span>
                        <Badge variant="outline" className="text-xs bg-red-100">15%</Badge>
                      </div>
                      <div className="text-xs text-green-600 pl-2">
                        <p>• Contract timeline and renewal discussions</p>
                        <p>• Competitive activity and market factors</p>
                        <p>• Organizational changes affecting decision makers</p>
                        <p>• Strategic alignment with customer initiatives</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-100">
                    <h6 className="font-medium text-green-800 mb-2">🎯 Score Interpretation</h6>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="status-good">85-100</Badge>
                        <span className="text-xs text-green-700">Excellent - High advocacy, expansion ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="status-good">70-84</Badge>
                        <span className="text-xs text-green-700">Good - Stable relationship, monitor trends</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="status-watch">55-69</Badge>
                        <span className="text-xs text-yellow-700">Watch - Attention needed, address gaps</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="status-watch">40-54</Badge>
                        <span className="text-xs text-yellow-700">Caution - Active intervention required</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="status-risk">0-39</Badge>
                        <span className="text-xs text-red-700">Critical - Immediate executive escalation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Full Methodology
                </Button>
                <Button variant="outline" size="sm">
                  <Target className="w-4 h-4 mr-1" />
                  Score Calculator
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
                🔄 <strong>Dynamic Scoring:</strong> Health scores are recalculated every 6 hours using real-time data. Historical trends are weighted to prevent artificial volatility while ensuring rapid response to significant changes.
              </div>
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
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-medium text-sm text-purple-800 mb-3">🎯 AI Optimization Settings</h5>
                
                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <h6 className="font-medium text-purple-800 mb-2">🏭 Industry-Specific Tuning</h6>
                    <div className="space-y-1 text-purple-700">
                      <p>⚡ <strong>Technology:</strong> Fast-growth focused, innovation signals prioritized</p>
                      <p>🏗️ <strong>Manufacturing:</strong> Operational efficiency and safety compliance emphasis</p>
                      <p>🏦 <strong>Financial Services:</strong> Regulatory compliance and risk management priority</p>
                      <p>🏥 <strong>Healthcare:</strong> Patient outcome correlation and privacy protection</p>
                      <p>🛒 <strong>Retail:</strong> Seasonal patterns and customer experience optimization</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <h6 className="font-medium text-purple-800 mb-2">⚖️ Risk Tolerance Thresholds</h6>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-700">Conservative (Enterprise)</span>
                        <Badge variant="outline" className="text-xs bg-blue-100">95% confidence</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-700">Balanced (Mid-market)</span>
                        <Badge variant="outline" className="text-xs bg-green-100">85% confidence</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-700">Aggressive (SMB/Startup)</span>
                        <Badge variant="outline" className="text-xs bg-yellow-100">75% confidence</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-purple-600 mt-2 pl-2">
                      <p>• Higher confidence = fewer but more certain recommendations</p>
                      <p>• Lower confidence = more opportunities, higher false positives</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <h6 className="font-medium text-purple-800 mb-2">📊 Signal Weight Customization</h6>
                    <div className="space-y-1 text-purple-700">
                      <p>🎯 <strong>Expansion Focus:</strong> Usage growth + stakeholder engagement</p>
                      <p>🛡️ <strong>Retention Focus:</strong> Health decline + support sentiment</p>
                      <p>⚡ <strong>Efficiency Focus:</strong> Automation potential + ROI indicators</p>
                      <p>📈 <strong>Growth Focus:</strong> Product adoption + competitive positioning</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <h6 className="font-medium text-purple-800 mb-2">🚀 Action Priority Scoring</h6>
                    <div className="space-y-1 text-purple-700">
                      <p>🔴 <strong>Critical (24hr):</strong> Revenue at risk {'>'}$100k</p>
                      <p>🟡 <strong>High (3 days):</strong> Expansion opportunity {'>'}$50k</p>
                      <p>🔵 <strong>Medium (1 week):</strong> Process optimization potential</p>
                      <p>⚪ <strong>Low (2 weeks):</strong> Relationship strengthening</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Gear className="w-4 h-4 mr-1" />
                  Tune Settings
                </Button>
                <Button variant="outline" size="sm">
                  <Brain className="w-4 h-4 mr-1" />
                  A/B Test
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded border border-yellow-200">
                📊 <strong>Performance Impact:</strong> Tuning changes take 24-48 hours to show impact. We recommend A/B testing different configurations with similar account segments to measure effectiveness before rolling out broadly.
              </div>
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
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h5 className="font-medium text-sm text-gray-800 mb-3">🔧 Developer Resources</h5>
                
                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-gray-800">REST API Reference</h6>
                      <Badge variant="outline" className="text-xs bg-green-100">v2.1 Stable</Badge>
                    </div>
                    <div className="space-y-1 text-gray-700">
                      <p>📚 <strong>200+ endpoints</strong> with OpenAPI 3.0 specification</p>
                      <p>🔐 OAuth 2.0 and API key authentication</p>
                      <p>📊 Real-time webhooks for all major events</p>
                      <p>💾 Bulk operations for accounts, signals, and workflows</p>
                      <p>📈 Rate limiting: 1000 requests/minute standard</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-1">
                      <Button variant="outline" size="sm" className="text-xs h-6">
                        <Code className="w-3 h-3 mr-1" />
                        View Docs
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-6">
                        <Download className="w-3 h-3 mr-1" />
                        OpenAPI
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-gray-800">SDKs & Libraries</h6>
                      <Badge variant="outline" className="text-xs bg-blue-100">Multi-Language</Badge>
                    </div>
                    <div className="space-y-1 text-gray-700">
                      <p>🐍 <strong>Python SDK:</strong> pip install signalcx-client</p>
                      <p>📱 <strong>Node.js SDK:</strong> npm install @signalcx/api</p>
                      <p>☕ <strong>Java SDK:</strong> Maven & Gradle support</p>
                      <p>⚡ <strong>C# SDK:</strong> NuGet package available</p>
                      <p>🌐 <strong>PowerShell Module:</strong> For Microsoft environments</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-1">
                      <Button variant="outline" size="sm" className="text-xs h-6">
                        <Download className="w-3 h-3 mr-1" />
                        Python
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-6">
                        <Download className="w-3 h-3 mr-1" />
                        Node.js
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-gray-800">Code Examples</h6>
                      <Badge variant="outline" className="text-xs bg-purple-100">Interactive</Badge>
                    </div>
                    <div className="space-y-1 text-gray-700">
                      <p>🚀 <strong>Quick Start:</strong> Authentication & first API call</p>
                      <p>📊 <strong>Data Sync:</strong> Account & signal bulk import</p>
                      <p>🤖 <strong>AI Integration:</strong> Triggering NBA generation</p>
                      <p>🔔 <strong>Webhooks:</strong> Real-time event handling</p>
                      <p>📈 <strong>Analytics:</strong> Custom reporting queries</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <Button variant="outline" size="sm" className="w-full text-xs h-6">
                        <Play className="w-3 h-3 mr-1" />
                        Try in Sandbox
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <h6 className="font-medium text-sm text-yellow-800 mb-2">🔒 Enterprise Features</h6>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>• Dedicated API instances with 99.9% SLA</p>
                  <p>• Custom rate limits up to 10,000 requests/minute</p>
                  <p>• Priority support with guaranteed response times</p>
                  <p>• Advanced webhook filtering and transformation</p>
                </div>
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
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-medium text-sm text-blue-800 mb-3">🎓 Learning Paths</h5>
                
                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-blue-800">Beginner Track</h6>
                      <Badge variant="outline" className="text-xs">4 courses</Badge>
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <p>📚 SignalCX Fundamentals (2 hrs) - Platform overview & navigation</p>
                      <p>🎯 Customer Success Basics (1.5 hrs) - Key concepts & metrics</p>
                      <p>📊 Health Score Deep Dive (1 hr) - Understanding account health</p>
                      <p>🔄 Basic Workflows (1.5 hrs) - Creating your first automations</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-100">
                      <p className="text-xs text-blue-600">🏆 Completion Certificate: SignalCX Associate</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-blue-800">Advanced Track</h6>
                      <Badge variant="outline" className="text-xs">5 courses</Badge>
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <p>🤖 AI-Powered Customer Success (4 hrs) - NBA engine & tuning</p>
                      <p>📈 Advanced Analytics & Reporting (3 hrs) - Custom dashboards</p>
                      <p>🔗 Integration Mastery (2.5 hrs) - API configuration & troubleshooting</p>
                      <p>🎨 Signal Configuration (2 hrs) - Custom business value signals</p>
                      <p>⚙️ Platform Administration (3 hrs) - User management & security</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-100">
                      <p className="text-xs text-blue-600">🏆 Completion Certificate: SignalCX Expert</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-blue-800">Specialist Certifications</h6>
                      <Badge variant="outline" className="text-xs">3 tracks</Badge>
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <p>🎯 Customer Success Strategist (6 hrs) - Advanced CS methodologies</p>
                      <p>🔬 Data Analyst Specialist (5 hrs) - Advanced signal analysis</p>
                      <p>🛠️ Technical Administrator (7 hrs) - Advanced platform configuration</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-100">
                      <p className="text-xs text-blue-600">🏆 Microsoft Partner Recognition Eligible</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Browse Catalog
                </Button>
                <Button variant="outline" size="sm">
                  <Target className="w-4 h-4 mr-1" />
                  Skill Assessment
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
                💡 <strong>Learning Tips:</strong> Each course includes hands-on labs, real customer scenarios, and downloadable resources. Progress is saved automatically, and you can learn at your own pace.
              </div>
            </div>
          )
        },
        {
          id: 'community-forums',
          title: 'Community Forums',
          icon: <ChatCircle className="w-4 h-4 text-green-600" />,
          summary: 'Connect with other SignalCX users',
          content: (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-medium text-sm text-green-800 mb-3">💬 Active Community Discussions</h5>
                
                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-green-800">General Discussion</h6>
                      <Badge variant="outline" className="text-xs bg-green-100">2.3k posts</Badge>
                    </div>
                    <div className="space-y-1 text-green-700">
                      <p>🔥 <strong>Trending:</strong> "Best practices for health score thresholds"</p>
                      <p>💡 "How to handle At-Risk accounts in manufacturing"</p>
                      <p>📊 "Quarterly business review templates that work"</p>
                      <p>🎯 "Setting realistic expansion targets for SMB accounts"</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-green-800">Feature Requests</h6>
                      <Badge variant="outline" className="text-xs bg-blue-100">847 ideas</Badge>
                    </div>
                    <div className="space-y-1 text-green-700">
                      <p>⭐ <strong>Top Requested:</strong> Mobile app for iOS/Android</p>
                      <p>🔄 Custom workflow triggers for Slack/Teams</p>
                      <p>📱 WhatsApp integration for customer outreach</p>
                      <p>🎨 Dark mode theme option</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-green-800">Success Stories</h6>
                      <Badge variant="outline" className="text-xs bg-yellow-100">156 stories</Badge>
                    </div>
                    <div className="space-y-1 text-green-700">
                      <p>🎉 "Reduced churn by 40% using predictive signals"</p>
                      <p>💰 "Generated $2M in expansion revenue with NBA recommendations"</p>
                      <p>⚡ "Automated 80% of routine customer touchpoints"</p>
                      <p>📈 "Improved health scores across entire portfolio"</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <ChatCircle className="w-4 h-4 mr-1" />
                  Join Discussion
                </Button>
                <Button variant="outline" size="sm">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Share Idea
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
                🌟 <strong>Community Perks:</strong> Top contributors get early access to new features, exclusive webinars, and recognition badges. Active members often become beta testers for upcoming releases.
              </div>
            </div>
          )
        },
        {
          id: 'office-hours',
          title: 'Weekly Office Hours',
          icon: <Clock className="w-4 h-4 text-purple-600" />,
          summary: 'Live Q&A sessions with product experts',
          content: (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-medium text-sm text-purple-800 mb-3">📅 Upcoming Sessions</h5>
                
                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-purple-800">Tuesday AI Deep Dive</h6>
                      <Badge variant="outline" className="text-xs bg-purple-100">Tomorrow 2PM PST</Badge>
                    </div>
                    <div className="space-y-1 text-purple-700">
                      <p>🤖 <strong>Topic:</strong> "Optimizing NBA recommendations for your industry"</p>
                      <p>👨‍💻 <strong>Host:</strong> Dr. Sarah Chen, AI Product Lead</p>
                      <p>⏱️ <strong>Duration:</strong> 60 minutes + Q&A</p>
                      <p>📋 <strong>Agenda:</strong> Signal tuning, confidence thresholds, industry benchmarks</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-purple-100 flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-6">Register</Button>
                      <Button variant="outline" size="sm" className="text-xs h-6">Add to Calendar</Button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-purple-800">Thursday Technical Workshop</h6>
                      <Badge variant="outline" className="text-xs bg-blue-100">This Week 10AM EST</Badge>
                    </div>
                    <div className="space-y-1 text-purple-700">
                      <p>🔧 <strong>Topic:</strong> "Advanced integration patterns & troubleshooting"</p>
                      <p>👨‍💻 <strong>Host:</strong> Marcus Rodriguez, Solutions Architect</p>
                      <p>⏱️ <strong>Duration:</strong> 90 minutes + hands-on lab</p>
                      <p>📋 <strong>Focus:</strong> API best practices, webhook setup, error handling</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-purple-100 flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-6">Register</Button>
                      <Button variant="outline" size="sm" className="text-xs h-6">Prerequisites</Button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-purple-800">Friday Customer Success Roundtable</h6>
                      <Badge variant="outline" className="text-xs bg-green-100">Weekly 1PM GMT</Badge>
                    </div>
                    <div className="space-y-1 text-purple-700">
                      <p>🎯 <strong>Topic:</strong> "Q4 planning strategies & goal setting"</p>
                      <p>👩‍💼 <strong>Host:</strong> Jennifer Walsh, Customer Success Director</p>
                      <p>⏱️ <strong>Duration:</strong> 45 minutes + peer discussion</p>
                      <p>📋 <strong>Format:</strong> Case study review, group problem-solving</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-purple-100 flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-6">Join EMEA</Button>
                      <Button variant="outline" size="sm" className="text-xs h-6">Submit Topic</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded border">
                <h6 className="font-medium text-sm mb-2">📚 Session Library</h6>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• 47 recorded sessions available on-demand</p>
                  <p>• Searchable by topic, speaker, and date</p>
                  <p>• Automatic transcripts and downloadable slides</p>
                  <p>• Follow-up resources and action items included</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <VideoCamera className="w-4 h-4 mr-1" />
                  Browse Library
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded border border-yellow-200">
                💡 <strong>Pro Tip:</strong> Submit questions in advance for priority answering. Sessions are recorded and available within 24 hours. Attendees receive exclusive follow-up materials and early access to related features.
              </div>
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
            
            <ScrollArea className="flex-1 max-h-full overflow-y-auto">
              <div className="p-6">
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
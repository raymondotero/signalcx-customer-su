import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  Monitor
} from '@phosphor-icons/react';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const HelpGuide: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const guideSections: GuideSection[] = [
    {
      id: 'overview',
      title: 'Platform Overview',
      icon: <Monitor className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Welcome to SignalCX</h3>
            <p className="text-sm text-muted-foreground mb-4">
              SignalCX is an agentic AI platform designed to revolutionize Customer Success management through intelligent automation and data-driven insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <p>• Real-time Next Best Action recommendations</p>
                <p>• Predictive health score forecasting</p>
                <p>• Automated workflow orchestration</p>
                <p>• Business value signal detection</p>
              </CardContent>
            </Card>
            
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ChartLine className="w-4 h-4" />
                  Customer Success Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <p>• Account health monitoring</p>
                <p>• ARR growth tracking</p>
                <p>• Risk identification and mitigation</p>
                <p>• Expansion opportunity detection</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Quick Start Tips</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>1. Start by selecting an account from the main dashboard</li>
              <li>2. Review the AI-generated Next Best Actions</li>
              <li>3. Use the Business Value Dashboard to identify signal patterns</li>
              <li>4. Monitor live signals for real-time insights</li>
              <li>5. Execute workflows through the approval system</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'accounts',
      title: 'Account Management',
      icon: <Users className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Managing Customer Accounts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The account management system provides comprehensive visibility into your customer portfolio.
            </p>
          </div>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Account Status Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="status-good">Good</Badge>
                <span className="text-xs">Health score 70-100, low risk</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="status-watch">Watch</Badge>
                <span className="text-xs">Health score 50-69, moderate attention needed</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="status-risk">At Risk</Badge>
                <span className="text-xs">Health score below 50, immediate action required</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>ARR:</strong> Annual Recurring Revenue for the account</p>
              <p><strong>Health Score:</strong> AI-calculated composite score (0-100)</p>
              <p><strong>QoQ Growth:</strong> Quarter-over-quarter revenue growth percentage</p>
              <p><strong>Contract End:</strong> Renewal date for proactive planning</p>
              <p><strong>CSAM/AE:</strong> Customer Success and Account Executive assignments</p>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-sm mb-2 text-blue-800">Pro Tips</h4>
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Use filters to focus on specific account segments</li>
              <li>• Sort by health score to prioritize attention</li>
              <li>• Click any account to view detailed insights and recommendations</li>
              <li>• Monitor QoQ growth trends for expansion opportunities</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'nba',
      title: 'Next Best Actions',
      icon: <Target className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">AI-Generated Recommendations</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Next Best Actions (NBAs) are AI-powered recommendations that help you take the most impactful actions for each account.
            </p>
          </div>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">NBA Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Expansion</Badge>
                  <span className="text-xs">Growth opportunities and upselling potential</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Retention</Badge>
                  <span className="text-xs">Risk mitigation and relationship strengthening</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Optimization</Badge>
                  <span className="text-xs">Efficiency improvements and value enhancement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>
                  <span className="text-xs">Urgent issues requiring immediate attention</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">How to Use NBAs</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>1. Review:</strong> Examine the AI reasoning and suggested actions</p>
              <p><strong>2. Plan:</strong> Click "Plan & Run" to initiate workflow approval</p>
              <p><strong>3. Approve:</strong> Use the adaptive card to approve or reject actions</p>
              <p><strong>4. Execute:</strong> Approved workflows are automatically executed</p>
              <p><strong>5. Track:</strong> Monitor outcomes in the Agent Memory panel</p>
            </CardContent>
          </Card>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-sm mb-2 text-purple-800">AI Insights</h4>
            <p className="text-xs text-purple-700">
              The AI considers multiple signals including usage patterns, support interactions, 
              contract data, and industry benchmarks to generate contextually relevant recommendations.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'signals',
      title: 'Business Value Signals',
      icon: <TrendUp className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Understanding Business Signals</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Business value signals provide real-time insights into customer health across multiple dimensions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ChartLine className="w-4 h-4" />
                  Signal Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <p><strong>Cost Signals:</strong> Cloud spend, optimization opportunities</p>
                <p><strong>Agility Signals:</strong> Development velocity, deployment metrics</p>
                <p><strong>Data Signals:</strong> Usage patterns, feature adoption</p>
                <p><strong>Risk Signals:</strong> Security, compliance, operational health</p>
                <p><strong>Culture Signals:</strong> Engagement, training, satisfaction</p>
              </CardContent>
            </Card>
            
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Signal Criticality
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Critical: Immediate attention required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Warning: Monitor closely</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Good: Performing well</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Setting Custom Targets</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Configure target values for each signal type</p>
              <p>• Set compliance thresholds and alert levels</p>
              <p>• Customize recommendations based on your business rules</p>
              <p>• Track performance against industry benchmarks</p>
            </CardContent>
          </Card>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-sm mb-2 text-green-800">Best Practices</h4>
            <ul className="text-xs space-y-1 text-green-700">
              <li>• Review signals daily for early warning indicators</li>
              <li>• Use AI recommendations to understand signal correlation</li>
              <li>• Set up automated alerts for critical thresholds</li>
              <li>• Track signal trends over time for pattern recognition</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'workflows',
      title: 'Workflow Automation',
      icon: <Gear className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Automated Workflows</h3>
            <p className="text-sm text-muted-foreground mb-4">
              SignalCX automates complex customer success workflows through AI orchestration and approval systems.
            </p>
          </div>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Workflow Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div>
                  <p className="font-medium text-xs">ROI Calculations</p>
                  <p className="text-xs text-muted-foreground">Automated financial impact analysis and presentation generation</p>
                </div>
                <div>
                  <p className="font-medium text-xs">Meeting Scheduling</p>
                  <p className="text-xs text-muted-foreground">Calendar integration for stakeholder meetings and QBRs</p>
                </div>
                <div>
                  <p className="font-medium text-xs">Executive Reporting</p>
                  <p className="text-xs text-muted-foreground">PowerPoint generation with insights and recommendations</p>
                </div>
                <div>
                  <p className="font-medium text-xs">Risk Mitigation</p>
                  <p className="text-xs text-muted-foreground">Automated escalation and intervention workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Approval Process</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>1. AI Generation:</strong> System generates workflow recommendations</p>
              <p><strong>2. Review Phase:</strong> CSAM/AE reviews proposed actions</p>
              <p><strong>3. Approval Gate:</strong> Microsoft Teams-style adaptive card approval</p>
              <p><strong>4. Execution:</strong> Approved workflows run automatically</p>
              <p><strong>5. Monitoring:</strong> Track progress and outcomes in real-time</p>
            </CardContent>
          </Card>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-medium text-sm mb-2 text-orange-800">Workflow Demo</h4>
            <p className="text-xs text-orange-700">
              Use the Workflows tab to test different automation scenarios. Each workflow 
              demonstrates the end-to-end process from AI recommendation to execution.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'integrations',
      title: 'Data Integrations',
      icon: <Database className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">System Integrations</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect SignalCX with your existing systems for comprehensive data visibility.
            </p>
          </div>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Supported Integrations</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>CRM Systems:</strong> Salesforce, Dynamics 365, HubSpot</p>
              <p><strong>Microsoft Ecosystem:</strong> Azure, Office 365, Power BI, Fabric</p>
              <p><strong>Data Platforms:</strong> Snowflake, Databricks, AWS, GCP</p>
              <p><strong>Support Systems:</strong> ServiceNow, Zendesk, Jira</p>
              <p><strong>Monitoring Tools:</strong> Azure Monitor, Datadog, Splunk</p>
            </CardContent>
          </Card>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Integration Setup</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>1. Access:</strong> Click "Integration Settings" in the main menu</p>
              <p><strong>2. Configure:</strong> Add API endpoints and authentication</p>
              <p><strong>3. Map Data:</strong> Define field mappings and sync schedules</p>
              <p><strong>4. Test:</strong> Validate connections and data quality</p>
              <p><strong>5. Monitor:</strong> Track sync status and data freshness</p>
            </CardContent>
          </Card>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Data Sync Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Set up automated sync schedules (hourly, daily, weekly)</p>
              <p>• Configure real-time streaming for critical signals</p>
              <p>• Monitor sync health and error resolution</p>
              <p>• Set up alerts for failed synchronizations</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <Shield className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Common Issues & Solutions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Quick solutions for frequently encountered issues.
            </p>
          </div>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">AI Processing Issues</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>Issue:</strong> AI recommendations not generating</p>
              <p><strong>Solution:</strong> Check system health status and refresh the page</p>
              <Separator className="my-2" />
              <p><strong>Issue:</strong> Slow AI response times</p>
              <p><strong>Solution:</strong> Monitor AI queue size and processing metrics</p>
              <Separator className="my-2" />
              <p><strong>Issue:</strong> Inaccurate recommendations</p>
              <p><strong>Solution:</strong> Review signal targets and data quality</p>
            </CardContent>
          </Card>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Data Sync Problems</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>Issue:</strong> Missing account data</p>
              <p><strong>Solution:</strong> Use "Restore Data" button or check integration status</p>
              <Separator className="my-2" />
              <p><strong>Issue:</strong> Outdated signals</p>
              <p><strong>Solution:</strong> Verify sync schedules in Data Sync Settings</p>
              <Separator className="my-2" />
              <p><strong>Issue:</strong> Integration authentication errors</p>
              <p><strong>Solution:</strong> Refresh API keys in Integration Settings</p>
            </CardContent>
          </Card>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm">Performance Optimization</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Use filters to reduce data load on large portfolios</p>
              <p>• Clear browser cache if experiencing slow loading</p>
              <p>• Monitor memory usage in Agent Memory panel</p>
              <p>• Use "Reset Demo" to clear accumulated data</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'support',
      title: 'Support & Training',
      icon: <ChatCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Getting Help</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Multiple support channels and training resources are available.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p><strong>Emergency:</strong> +1-800-SIGNALCX</p>
                <p><strong>Microsoft Partner:</strong> partner@microsoft.com</p>
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
                <p>• Platform orientation video series</p>
                <p>• AI workflow training modules</p>
                <p>• Best practices webinars</p>
                <p>• Customer success playbooks</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• API documentation for custom integrations</p>
              <p>• Signal catalog reference guide</p>
              <p>• Workflow automation cookbook</p>
              <p>• Data model and schema documentation</p>
              <p>• Security and compliance guidelines</p>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-sm mb-2 text-blue-800 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Pro Tips for Success
            </h4>
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Schedule regular training sessions with your team</li>
              <li>• Join the SignalCX community for peer learning</li>
              <li>• Attend monthly feature update webinars</li>
              <li>• Leverage Microsoft partner resources and support</li>
              <li>• Use the demo environment for testing new workflows</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border text-xs px-3 py-1 hover:bg-accent hover:text-accent-foreground"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Guide Me
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Question className="w-5 h-5" />
            SignalCX Platform Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[calc(90vh-8rem)]">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r pr-4 flex-shrink-0">
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {guideSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left text-xs"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className="flex items-center gap-2">
                      {section.icon}
                      {section.title}
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 pl-6 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="pr-4">
                {guideSections.find(section => section.id === activeSection)?.content}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Play className="w-3 h-3 mr-1" />
              Interactive Demo Available
            </Badge>
            <span>Use the platform features while referencing this guide</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setOpen(false)}
            >
              Close Guide
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpGuide;
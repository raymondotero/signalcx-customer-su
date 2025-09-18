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
  const [activeSection, setActiveSection] = useState('getting-started');

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
      )
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
      )
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
      )
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
              <div className="max-w-3xl">
                {guideSections.find(s => s.id === activeSection)?.content}
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
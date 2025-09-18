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
  Wrench,
  Calendar
} from '@phosphor-icons/react';

interface ExpandableResource {
  id: string;
  title: string;
  icon: React.ReactNode;
  summary: string;
  content: React.ReactNode;
}

const HelpGuide: React.FC = () => {
  const [activeResource, setActiveResource] = useState<string | null>(null);

  const toggleResource = (id: string) => {
    setActiveResource(activeResource === id ? null : id);
  };

  const quickResources: ExpandableResource[] = [
    {
      id: 'getting-started',
      title: 'Getting Started Guide',
      icon: <Play className="w-4 h-4 text-blue-600" />,
      summary: 'Complete setup and first steps',
      content: (
        <div className="space-y-3">
          <div className="space-y-2 text-sm">
            <h5 className="font-medium">Platform Setup:</h5>
            <div className="pl-2 space-y-1 text-sm">
              <p>1. ✅ <strong>Account Configuration:</strong> Verify Azure integration</p>
              <p>2. 🔄 <strong>Data Sync:</strong> Connect your CRM and systems</p>
              <p>3. 🎯 <strong>Signal Targets:</strong> Configure business value thresholds</p>
              <p>4. 🤖 <strong>AI Engine:</strong> Enable automated recommendations</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 text-blue-600 mr-2" />
              <h6 className="font-medium text-blue-800">Quick Start (15 min)</h6>
            </div>
            <div className="space-y-1 text-blue-700 text-sm">
              <p>• Upload your customer data via CSV</p>
              <p>• Set initial health score targets</p>
              <p>• Generate first AI recommendations</p>
              <p>• Review and approve suggested actions</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Common Issues',
      icon: <Bug className="w-4 h-4 text-red-600" />,
      summary: 'Solutions for frequent problems',
      content: (
        <div className="space-y-3">
          <div className="space-y-2 text-sm">
            <h5 className="font-medium">Frequent Issues:</h5>
            <div className="space-y-2">
              <div className="bg-gray-50 p-2 rounded border">
                <p className="font-medium text-gray-800">📊 Signals not updating</p>
                <p className="text-gray-600 text-sm">Check data integration status and API connections</p>
              </div>
              <div className="bg-gray-50 p-2 rounded border">
                <p className="font-medium text-gray-800">🤖 AI recommendations missing</p>
                <p className="text-gray-600 text-sm">Verify business value targets are configured</p>
              </div>
              <div className="bg-gray-50 p-2 rounded border">
                <p className="font-medium text-gray-800">📈 Dashboard loading slowly</p>
                <p className="text-gray-600 text-sm">Clear browser cache and refresh data sync</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      icon: <VideoCamera className="w-4 h-4 text-purple-600" />,
      summary: 'Step-by-step visual guides',
      content: (
        <div className="space-y-3">
          <div className="space-y-2">
            <h5 className="font-medium">Available Tutorials:</h5>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
                <Play className="w-3 h-3 mr-2" />
                Platform Overview (5 min)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
                <Play className="w-3 h-3 mr-2" />
                Data Integration Setup (8 min)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
                <Play className="w-3 h-3 mr-2" />
                AI Recommendations Deep Dive (12 min)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
                <Play className="w-3 h-3 mr-2" />
                Business Value Tracking (7 min)
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api-reference',
      title: 'API Documentation',
      icon: <Code className="w-4 h-4 text-green-600" />,
      summary: 'Technical integration guides',
      content: (
        <div className="space-y-3">
          <div className="space-y-2">
            <h5 className="font-medium">API Endpoints:</h5>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-gray-800">Core APIs</h6>
                  <Badge variant="outline" className="text-xs bg-green-100">REST</Badge>
                </div>
                <div className="space-y-1 text-gray-700">
                  <p>🔗 <strong>Accounts:</strong> /api/accounts</p>
                  <p>📊 <strong>Signals:</strong> /api/signals</p>
                  <p>🤖 <strong>NBA:</strong> /api/nba</p>
                  <p>⚡ <strong>Workflows:</strong> /api/workflows</p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-gray-800">SDKs & Libraries</h6>
                  <Badge variant="outline" className="text-xs bg-blue-100">Multi-Language</Badge>
                </div>
                <div className="space-y-1 text-gray-700">
                  <p>📱 <strong>Node.js SDK:</strong> npm install @signalcx/api</p>
                  <p>⚡ <strong>C# SDK:</strong> NuGet package available</p>
                  <p>🌐 <strong>PowerShell Module:</strong> For Microsoft environments</p>
                </div>
              </div>
            </div>
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
        <div className="space-y-3">
          <div className="space-y-2 text-sm">
            <h5 className="font-medium">Forum Categories:</h5>
            <div className="pl-2 space-y-1">
              <p>• General Discussion</p>
              <p>• Feature Requests</p>
              <p>• Technical Support</p>
              <p>• Best Practices</p>
              <p>• Integration Tips</p>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <div className="flex items-center mb-2">
              <Users className="w-4 h-4 text-green-600 mr-2" />
              <h6 className="font-medium text-green-800">Community Stats</h6>
            </div>
            <div className="space-y-1 text-green-700 text-sm">
              <p>🌟 2,400+ Active Members</p>
              <p>💬 150+ Daily Discussions</p>
              <p>✅ 95% Question Response Rate</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const signalcxAcademyContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-visible">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
              Learning Paths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
                <Target className="w-3 h-3 mr-2" />
                Customer Success Fundamentals
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
                <Brain className="w-3 h-3 mr-2" />
                AI-Driven Account Management
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
                <ChartLine className="w-3 h-3 mr-2" />
                Signal Analysis Mastery
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
                <TrendUp className="w-3 h-3 mr-2" />
                Revenue Growth Strategies
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-visible">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <VideoCamera className="w-4 h-4 mr-2 text-purple-600" />
              Live Training
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <div className="bg-purple-50 p-2 rounded border border-purple-200">
                <p className="font-medium text-purple-800 text-sm">Upcoming Sessions</p>
                <p className="text-purple-700 text-xs">Weekly Office Hours - Thursdays 2PM PST</p>
              </div>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
                <Calendar className="w-3 h-3 mr-2" />
                Advanced Analytics Workshop
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
                <Users className="w-3 h-3 mr-2" />
                Customer Success Best Practices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-visible">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Shield className="w-4 h-4 mr-2 text-green-600" />
            Certification Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <h6 className="font-medium text-green-800">SignalCX Fundamentals</h6>
              <p className="text-green-700 text-sm">Platform basics & setup</p>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-7">
                <CheckCircle className="w-3 h-3 mr-1" />
                Start Certification
              </Button>
            </div>
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <h6 className="font-medium text-blue-800">AI Strategy Expert</h6>
              <p className="text-blue-700 text-sm">Advanced AI utilization</p>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-7">
                <Brain className="w-3 h-3 mr-1" />
                Begin Course
              </Button>
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <h6 className="font-medium text-yellow-800">Enterprise Architect</h6>
              <p className="text-yellow-700 text-sm">Large-scale implementations</p>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-7">
                <Monitor className="w-3 h-3 mr-1" />
                Prerequisites
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const resourcesContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-visible">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
              <BookOpen className="w-3 h-3 mr-2" />
              User Manual
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
              <Code className="w-3 h-3 mr-2" />
              API Reference
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
              <Gear className="w-3 h-3 mr-2" />
              Admin Guide
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
              <Shield className="w-3 h-3 mr-2" />
              Security Whitepaper
            </Button>
          </CardContent>
        </Card>

        <Card className="border-visible">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Download className="w-4 h-4 mr-2 text-green-600" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
              <FileText className="w-3 h-3 mr-2" />
              Templates & Examples
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
              <Database className="w-3 h-3 mr-2" />
              Sample Data Sets
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
              <Monitor className="w-3 h-3 mr-2" />
              Dashboard Templates
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-sm h-8">
              <Wrench className="w-3 h-3 mr-2" />
              Configuration Tools
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-visible">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Phone className="w-4 h-4 mr-2 text-purple-600" />
            Support Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <h6 className="font-medium text-blue-800">Technical Support</h6>
              <p className="text-blue-700 text-sm">24/7 assistance for platform issues</p>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-7">
                <Phone className="w-3 h-3 mr-1" />
                Contact Support
              </Button>
            </div>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <h6 className="font-medium text-green-800">Customer Success</h6>
              <p className="text-green-700 text-sm">Strategic guidance and best practices</p>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-7">
                <Users className="w-3 h-3 mr-1" />
                Schedule Call
              </Button>
            </div>
            <div className="bg-purple-50 p-3 rounded border border-purple-200">
              <h6 className="font-medium text-purple-800">Sales & Partnerships</h6>
              <p className="text-purple-700 text-sm">Expansion and integration opportunities</p>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-7">
                <Link className="w-3 h-3 mr-1" />
                Get in Touch
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border text-xs px-3 py-1"
        >
          <Question className="w-4 h-4 mr-2" />
          Guide Me
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              SignalCX Help Center
            </h2>
            <p className="text-muted-foreground text-sm">
              Comprehensive resources to help you succeed with SignalCX
            </p>
          </div>

          <Tabs defaultValue="quick-resources" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick-resources">Quick Resources</TabsTrigger>
              <TabsTrigger value="signalcx-academy">SignalCX Academy</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick-resources" className="mt-4">
              <ScrollArea className="h-[60vh]">
                <div className="space-y-3">
                  {quickResources.map((resource) => (
                    <Card key={resource.id} className="border-visible">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            {resource.icon}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{resource.title}</h4>
                              <p className="text-muted-foreground text-xs">{resource.summary}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleResource(resource.id)}
                            className="h-8 w-8 p-0"
                          >
                            {activeResource === resource.id ? (
                              <CaretDown className="w-4 h-4" />
                            ) : (
                              <CaretRight className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        
                        {activeResource === resource.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {resource.content}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="signalcx-academy" className="mt-4">
              <ScrollArea className="h-[60vh]">
                {signalcxAcademyContent}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="resources" className="mt-4">
              <ScrollArea className="h-[60vh]">
                {resourcesContent}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpGuide;
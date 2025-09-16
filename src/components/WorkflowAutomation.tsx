import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Robot, 
  Play, 
  Calendar, 
  Envelope as Mail, 
  FileText, 
  Phone, 
  Users, 
  CheckCircle,
  Clock,
  Target,
  Brain,
  Sparkle,
  GitBranch,
  Database,
  Gear as Settings,
  Download,
  Share,
  Copy
} from '@phosphor-icons/react';
import { NextBestAction, Account } from '@/types';
import { useAgentMemory } from '@/hooks/useData';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface WorkflowAutomationProps {
  nba: NextBestAction;
  account: Account;
  onComplete?: () => void;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: 'email' | 'meeting' | 'task' | 'follow-up' | 'analysis' | 'automation';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  estimatedTime: string;
  assignedTo: string;
  dependencies?: string[];
  outputs?: WorkflowOutput[];
  automationConfig?: AutomationConfig;
}

interface WorkflowOutput {
  type: 'email-template' | 'meeting-agenda' | 'task-list' | 'report' | 'proposal' | 'escalation';
  content: string;
  title: string;
  metadata?: Record<string, any>;
}

interface AutomationConfig {
  platform: 'outlook' | 'teams' | 'dynamics' | 'power-platform' | 'sharepoint';
  action: string;
  parameters: Record<string, any>;
}

export function WorkflowAutomation({ nba, account, onComplete }: WorkflowAutomationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<Record<string, any>>({});
  const { addMemoryEntry } = useAgentMemory();
  const [savedWorkflows] = useKV<any[]>('saved-workflows', []);

  const generateWorkflow = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI-powered workflow generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const steps: WorkflowStep[] = generateStepsForNBA(nba, account);
      setWorkflowSteps(steps);
      
      addMemoryEntry({
        id: `workflow-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'workflow_executed',
        accountId: account.id,
        accountName: account.name,
        description: `Generated automated workflow for: ${nba.title}`,
        metadata: { 
          nbaId: nba.id,
          stepCount: steps.length,
          workflowType: 'automated'
        },
        outcome: 'success'
      });

      toast.success(`Generated ${steps.length}-step automated workflow`);
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStepsForNBA = (nba: NextBestAction, account: Account): WorkflowStep[] => {
    const baseSteps: WorkflowStep[] = [];
    
    // Initial analysis step
    baseSteps.push({
      id: 'analysis',
      title: 'Account Analysis & Context Gathering',
      description: 'Analyze current account status, recent activities, and stakeholder mapping',
      type: 'analysis',
      status: 'pending',
      estimatedTime: '15 minutes',
      assignedTo: account.csam,
      outputs: [{
        type: 'report',
        title: 'Account Status Report',
        content: generateAccountAnalysis(account, nba),
        metadata: { accountId: account.id, nbaId: nba.id }
      }]
    });

    // Category-specific workflow steps
    switch (nba.category) {
      case 'retention':
        baseSteps.push(
          {
            id: 'stakeholder-outreach',
            title: 'Executive Stakeholder Outreach',
            description: 'Reach out to key stakeholders to understand concerns and renewal intent',
            type: 'email',
            status: 'pending',
            estimatedTime: '30 minutes',
            assignedTo: account.csam,
            dependencies: ['analysis'],
            outputs: [{
              type: 'email-template',
              title: 'Executive Check-in Email',
              content: generateRetentionEmail(account, nba),
              metadata: { urgency: 'high' }
            }],
            automationConfig: {
              platform: 'outlook',
              action: 'send-email',
              parameters: { 
                to: 'executive@customer.com', 
                subject: `Strategic Partnership Review - ${account.name}`,
                priority: 'high'
              }
            }
          },
          {
            id: 'renewal-meeting',
            title: 'Schedule Renewal Strategy Meeting',
            description: 'Book meeting with account team and customer stakeholders',
            type: 'meeting',
            status: 'pending',
            estimatedTime: '60 minutes',
            assignedTo: account.csam,
            dependencies: ['stakeholder-outreach'],
            outputs: [{
              type: 'meeting-agenda',
              title: 'Renewal Strategy Meeting Agenda',
              content: generateRenewalMeetingAgenda(account, nba),
              metadata: { meetingType: 'renewal', duration: '60min' }
            }],
            automationConfig: {
              platform: 'teams',
              action: 'schedule-meeting',
              parameters: { 
                duration: 60, 
                attendees: [account.csam, account.ae],
                subject: `${account.name} - Renewal Strategy Session`
              }
            }
          }
        );
        break;

      case 'expansion':
        baseSteps.push(
          {
            id: 'opportunity-assessment',
            title: 'Expansion Opportunity Assessment',
            description: 'Analyze usage patterns and identify expansion opportunities',
            type: 'analysis',
            status: 'pending',
            estimatedTime: '45 minutes',
            assignedTo: account.ae,
            dependencies: ['analysis'],
            outputs: [{
              type: 'report',
              title: 'Expansion Opportunity Report',
              content: generateExpansionReport(account, nba),
              metadata: { opportunities: account.expansionOpportunities }
            }]
          },
          {
            id: 'proposal-creation',
            title: 'Create Expansion Proposal',
            description: 'Generate tailored proposal with Microsoft solutions',
            type: 'task',
            status: 'pending',
            estimatedTime: '90 minutes',
            assignedTo: account.ae,
            dependencies: ['opportunity-assessment'],
            outputs: [{
              type: 'proposal',
              title: 'Microsoft Solutions Expansion Proposal',
              content: generateExpansionProposal(account, nba),
              metadata: { value: account.expansionOpportunities?.[0]?.value || 0 }
            }]
          }
        );
        break;

      case 'engagement':
        baseSteps.push(
          {
            id: 'engagement-plan',
            title: 'Create Engagement Strategy',
            description: 'Develop plan to increase user adoption and engagement',
            type: 'task',
            status: 'pending',
            estimatedTime: '60 minutes',
            assignedTo: account.csam,
            dependencies: ['analysis'],
            outputs: [{
              type: 'task-list',
              title: 'Engagement Action Plan',
              content: generateEngagementPlan(account, nba),
              metadata: { targetUsers: 100, timeline: '30 days' }
            }]
          },
          {
            id: 'training-session',
            title: 'Schedule Product Training',
            description: 'Book training session for end users',
            type: 'meeting',
            status: 'pending',
            estimatedTime: '30 minutes',
            assignedTo: account.csam,
            dependencies: ['engagement-plan'],
            automationConfig: {
              platform: 'teams',
              action: 'schedule-training',
              parameters: { 
                type: 'product-training',
                duration: 90,
                attendees: ['end-users', 'power-users']
              }
            }
          }
        );
        break;

      case 'support':
        baseSteps.push(
          {
            id: 'issue-analysis',
            title: 'Technical Issue Analysis',
            description: 'Review support tickets and identify root causes',
            type: 'analysis',
            status: 'pending',
            estimatedTime: '45 minutes',
            assignedTo: 'Technical Support',
            dependencies: ['analysis'],
            outputs: [{
              type: 'report',
              title: 'Technical Issue Summary',
              content: generateSupportAnalysis(account, nba),
              metadata: { ticketCount: 5, severity: 'medium' }
            }]
          },
          {
            id: 'resolution-plan',
            title: 'Create Resolution Plan',
            description: 'Develop step-by-step plan to resolve issues',
            type: 'task',
            status: 'pending',
            estimatedTime: '30 minutes',
            assignedTo: account.csam,
            dependencies: ['issue-analysis'],
            outputs: [{
              type: 'task-list',
              title: 'Issue Resolution Roadmap',
              content: generateResolutionPlan(account, nba),
              metadata: { timeline: '1-2 weeks', resources: 'Technical team' }
            }]
          }
        );
        break;
    }

    // Final follow-up step
    baseSteps.push({
      id: 'follow-up',
      title: 'Schedule Follow-up & Success Metrics Review',
      description: 'Set up follow-up meeting to review progress and measure success',
      type: 'follow-up',
      status: 'pending',
      estimatedTime: '15 minutes',
      assignedTo: account.csam,
      dependencies: [baseSteps[baseSteps.length - 1]?.id],
      automationConfig: {
        platform: 'outlook',
        action: 'schedule-follow-up',
        parameters: { 
          delay: '2 weeks',
          subject: `Follow-up: ${nba.title} Progress Review`,
          duration: 30
        }
      }
    });

    return baseSteps;
  };

  const executeWorkflow = async () => {
    setIsExecuting(true);
    const results: Record<string, any> = {};
    
    try {
      for (let i = 0; i < workflowSteps.length; i++) {
        const step = workflowSteps[i];
        setCurrentStep(i);
        
        // Update step status
        setWorkflowSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'in-progress' } : s
        ));

        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Execute automation if configured
        if (step.automationConfig) {
          const result = await executeAutomation(step.automationConfig, step, account);
          results[step.id] = result;
        }

        // Generate outputs
        if (step.outputs) {
          results[step.id] = {
            ...results[step.id],
            outputs: step.outputs
          };
        }

        // Mark step as completed
        setWorkflowSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'completed' } : s
        ));

        toast.success(`Completed: ${step.title}`);
      }

      setExecutionResults(results);
      
      addMemoryEntry({
        id: `workflow-execution-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'workflow_executed',
        accountId: account.id,
        accountName: account.name,
        description: `Successfully executed automated workflow for: ${nba.title}`,
        metadata: { 
          nbaId: nba.id,
          stepsCompleted: workflowSteps.length,
          automationResults: Object.keys(results).length
        },
        outcome: 'success'
      });

      toast.success('Workflow execution completed successfully!');
      onComplete?.();
    } catch (error) {
      console.error('Workflow execution failed:', error);
      toast.error('Workflow execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const executeAutomation = async (config: AutomationConfig, step: WorkflowStep, account: Account) => {
    // Simulate automation execution based on platform
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (config.platform) {
      case 'outlook':
        return {
          platform: 'Microsoft Outlook',
          action: config.action,
          status: 'completed',
          details: `Email sent to stakeholders for ${account.name}`,
          timestamp: new Date().toISOString()
        };
      
      case 'teams':
        return {
          platform: 'Microsoft Teams',
          action: config.action,
          status: 'completed',
          details: `Meeting scheduled for ${account.name}`,
          meetingLink: `https://teams.microsoft.com/meeting/${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
        };
      
      case 'dynamics':
        return {
          platform: 'Dynamics 365',
          action: config.action,
          status: 'completed',
          details: `CRM updated for ${account.name}`,
          recordId: `${account.id}-${Date.now()}`,
          timestamp: new Date().toISOString()
        };
      
      default:
        return {
          platform: config.platform,
          action: config.action,
          status: 'simulated',
          details: `Automation executed for ${step.title}`,
          timestamp: new Date().toISOString()
        };
    }
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'task': return <CheckCircle className="w-4 h-4" />;
      case 'follow-up': return <Clock className="w-4 h-4" />;
      case 'analysis': return <Brain className="w-4 h-4" />;
      case 'automation': return <Robot className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
          <Robot className="w-4 h-4 mr-2" />
          Automate Workflow
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Robot className="w-5 h-5 text-purple-600" />
            Workflow Automation - {nba.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* NBA Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Action Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Account:</span> {account.name}
                </div>
                <div>
                  <span className="font-medium">Assigned to:</span> {nba.assignedTo}
                </div>
                <div>
                  <span className="font-medium">Priority:</span> 
                  <Badge className={`ml-2 ${nba.priority === 'critical' ? 'bg-red-100 text-red-800' : nba.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                    {nba.priority}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Timeline:</span> {nba.timeToComplete}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Generation */}
          {workflowSteps.length === 0 ? (
            <div className="text-center py-8">
              <Robot className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <h3 className="text-lg font-medium mb-2">Generate Automated Workflow</h3>
              <p className="text-sm text-muted-foreground mb-6">
                AI will create a step-by-step automated workflow to help CSAM and AE teams execute this action efficiently.
              </p>
              
              <Button 
                onClick={generateWorkflow}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Sparkle className="w-5 h-5 mr-2" />
                {isGenerating ? 'Generating Workflow...' : 'Generate Smart Workflow'}
              </Button>
              
              {isGenerating && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                  <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                  AI is analyzing the action and creating automation steps...
                </div>
              )}
            </div>
          ) : (
            <Tabs defaultValue="workflow" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="workflow">Workflow Steps</TabsTrigger>
                <TabsTrigger value="outputs">Generated Outputs</TabsTrigger>
                <TabsTrigger value="automation">Automation Results</TabsTrigger>
              </TabsList>
              
              <TabsContent value="workflow" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Automated Workflow ({workflowSteps.length} steps)</h3>
                  <div className="flex gap-2">
                    <Button 
                      onClick={executeWorkflow}
                      disabled={isExecuting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isExecuting ? 'Executing...' : 'Execute Workflow'}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {workflowSteps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={`p-4 border rounded-lg transition-all ${
                        currentStep === index && isExecuting ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.status === 'completed' ? 'bg-green-100 text-green-600' :
                            step.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                             step.status === 'in-progress' ? <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> :
                             <span className="text-xs font-bold">{index + 1}</span>
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStepIcon(step.type)}
                              <h4 className="font-medium">{step.title}</h4>
                              <Badge className={getStatusColor(step.status)}>
                                {step.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span><Clock className="w-3 h-3 inline mr-1" />{step.estimatedTime}</span>
                              <span><Users className="w-3 h-3 inline mr-1" />{step.assignedTo}</span>
                              {step.automationConfig && (
                                <span><Robot className="w-3 h-3 inline mr-1" />Automated</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="outputs" className="space-y-4">
                <div className="grid gap-4">
                  {workflowSteps.flatMap(step => step.outputs || []).map((output, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {output.title}
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 bg-muted rounded text-sm font-mono whitespace-pre-wrap">
                          {output.content}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="automation" className="space-y-4">
                <div className="grid gap-4">
                  {Object.entries(executionResults).map(([stepId, result]) => (
                    <Card key={stepId}>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {workflowSteps.find(s => s.id === stepId)?.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div><strong>Platform:</strong> {result.platform}</div>
                          <div><strong>Action:</strong> {result.action}</div>
                          <div><strong>Status:</strong> 
                            <Badge className="ml-2 bg-green-100 text-green-800">
                              {result.status}
                            </Badge>
                          </div>
                          <div><strong>Details:</strong> {result.details}</div>
                          {result.meetingLink && (
                            <div><strong>Meeting Link:</strong> 
                              <a href={result.meetingLink} className="text-blue-600 hover:underline ml-1">
                                {result.meetingLink}
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions for generating content
function generateAccountAnalysis(account: Account, nba: NextBestAction): string {
  return `ACCOUNT STATUS ANALYSIS - ${account.name}

Current Health Score: ${account.healthScore}/100
Status: ${account.status}
ARR: $${(account.arr / 1000000).toFixed(1)}M
Contract End: ${new Date(account.contractEnd).toLocaleDateString()}

KEY METRICS:
- Health Score Trend: ${account.healthScore > 75 ? 'Stable' : account.healthScore > 50 ? 'Declining' : 'Critical'}
- Expansion Opportunity: $${((account.expansionOpportunity || 0) / 1000).toFixed(0)}K
- Risk Level: ${account.status === 'At Risk' ? 'High' : account.status === 'Watch' ? 'Medium' : 'Low'}

RECOMMENDED ACTION:
${nba.title}
Priority: ${nba.priority}
Timeline: ${nba.timeToComplete}

STAKEHOLDER MAPPING:
- CSAM: ${account.csam}
- AE: ${account.ae}
- Industry: ${account.industry}

NEXT STEPS:
1. Execute recommended workflow steps
2. Monitor progress through automated tracking
3. Schedule follow-up review in 2 weeks`;
}

function generateRetentionEmail(account: Account, nba: NextBestAction): string {
  return `Subject: Strategic Partnership Review - ${account.name}

Dear [Stakeholder Name],

I hope this message finds you well. As we approach your contract renewal period (${new Date(account.contractEnd).toLocaleDateString()}), I wanted to reach out to discuss our continued partnership and ensure we're maximizing value for ${account.name}.

CURRENT PARTNERSHIP OVERVIEW:
- Contract Value: $${(account.arr / 1000000).toFixed(1)}M annually
- Health Score: ${account.healthScore}/100
- Industry Focus: ${account.industry}

RECENT OBSERVATIONS:
Based on our analysis, we've identified opportunities to strengthen our partnership and address any concerns you may have. Our team has been monitoring your engagement patterns and would like to discuss:

1. Current business challenges and how Microsoft solutions can help
2. Upcoming initiatives where we can provide additional value
3. Any concerns or feedback about our current services

NEXT STEPS:
I'd love to schedule a strategic review meeting within the next week to discuss:
- Your current business priorities
- How we can better support your goals
- Expansion opportunities that align with your roadmap

Please let me know your availability for a 60-minute discussion. I'm confident we can work together to ensure your continued success.

Best regards,
${account.csam}
Customer Success Account Manager
Microsoft`;
}

function generateRenewalMeetingAgenda(account: Account, nba: NextBestAction): string {
  return `RENEWAL STRATEGY MEETING AGENDA
${account.name} - Strategic Partnership Review

Meeting Details:
- Duration: 60 minutes
- Attendees: Customer stakeholders, ${account.csam} (CSAM), ${account.ae} (AE)
- Objective: Discuss renewal strategy and partnership expansion

AGENDA:

1. OPENING & INTRODUCTIONS (5 minutes)
   - Welcome and agenda review
   - Participant introductions

2. PARTNERSHIP REVIEW (15 minutes)
   - Current contract overview ($${(account.arr / 1000000).toFixed(1)}M ARR)
   - Service delivery highlights
   - Business value achieved

3. CURRENT STATE ASSESSMENT (15 minutes)
   - Health score analysis (${account.healthScore}/100)
   - Usage patterns and adoption metrics
   - Challenge identification

4. FUTURE ROADMAP DISCUSSION (15 minutes)
   - Customer business priorities for next 12 months
   - Technology roadmap alignment
   - Expansion opportunities ($${((account.expansionOpportunity || 0) / 1000).toFixed(0)}K potential)

5. RENEWAL STRATEGY (10 minutes)
   - Contract terms discussion
   - Investment optimization
   - Success metrics definition

6. NEXT STEPS & ACTION ITEMS (5 minutes)
   - Follow-up actions
   - Timeline for renewal decision
   - Additional meetings needed

PRE-MEETING PREPARATION:
- Review latest usage analytics
- Prepare ROI calculations
- Identify key stakeholder concerns
- Draft renewal proposal options

SUCCESS METRICS:
- Clear renewal intent confirmed
- Action plan established
- Stakeholder concerns addressed
- Next meeting scheduled`;
}

function generateExpansionReport(account: Account, nba: NextBestAction): string {
  const opportunities = account.expansionOpportunities || [];
  return `EXPANSION OPPORTUNITY ASSESSMENT
${account.name} - Growth Analysis

EXECUTIVE SUMMARY:
Total Expansion Potential: $${opportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}
Primary Opportunities: ${opportunities.length}
Recommended Timeline: Q1-Q2 execution

CURRENT STATE:
- Base ARR: $${(account.arr / 1000000).toFixed(1)}M
- Health Score: ${account.healthScore}/100
- Industry: ${account.industry}

EXPANSION OPPORTUNITIES:

${opportunities.map((opp, index) => `
${index + 1}. ${opp.category.toUpperCase()} - $${opp.value.toLocaleString()}
   Description: ${opp.description}
   Timeline: ${opp.timeline}
   Probability: ${opp.probability}
   
   Required Activities:
   ${opp.requiredActivities.map(activity => `   • ${activity}`).join('\n')}
   
   Microsoft Solutions:
   ${opp.microsoftSolutions.map(solution => `   • ${solution}`).join('\n')}
   
   Success Criteria:
   ${opp.successCriteria.map(criteria => `   • ${criteria}`).join('\n')}
`).join('\n')}

IMPLEMENTATION ROADMAP:
1. Stakeholder alignment (Week 1-2)
2. Technical discovery (Week 3-4)
3. Proposal development (Week 5-6)
4. Negotiation and closing (Week 7-12)

RISK MITIGATION:
- Ensure strong business case alignment
- Maintain regular stakeholder communication
- Provide proof-of-concept opportunities
- Leverage Microsoft partner ecosystem

NEXT STEPS:
1. Schedule expansion planning session
2. Conduct technical readiness assessment
3. Develop detailed proposal
4. Engage executive sponsors`;
}

function generateExpansionProposal(account: Account, nba: NextBestAction): string {
  const topOpportunity = account.expansionOpportunities?.[0];
  if (!topOpportunity) return 'No expansion opportunities available';

  return `MICROSOFT SOLUTIONS EXPANSION PROPOSAL
${account.name} - Strategic Growth Partnership

EXECUTIVE SUMMARY:
This proposal outlines a strategic expansion of our partnership with ${account.name}, focusing on ${topOpportunity.category} opportunities valued at $${topOpportunity.value.toLocaleString()}.

BUSINESS CASE:
Challenge: ${topOpportunity.description}
Solution: Microsoft integrated solution portfolio
Investment: $${topOpportunity.value.toLocaleString()}
Timeline: ${topOpportunity.timeline}
Success Probability: ${topOpportunity.probability}

RECOMMENDED MICROSOFT SOLUTIONS:
${topOpportunity.microsoftSolutions.map(solution => `• ${solution}`).join('\n')}

DELIVERY APPROACH:
${topOpportunity.deliveryMotions.map(motion => `• ${motion}`).join('\n')}

IMPLEMENTATION PLAN:
Phase 1: Discovery & Planning (Weeks 1-4)
- Technical requirements gathering
- Architecture design
- Resource planning

Phase 2: Pilot Deployment (Weeks 5-8)
- Limited scope implementation
- User training and adoption
- Performance baseline

Phase 3: Full Rollout (Weeks 9-16)
- Enterprise-wide deployment
- Change management
- Success measurement

INVESTMENT BREAKDOWN:
Licensing: 60% of total investment
Services: 25% of total investment
Training: 10% of total investment
Support: 5% of total investment

SUCCESS METRICS:
${topOpportunity.successCriteria.map(criteria => `• ${criteria}`).join('\n')}

RISK MITIGATION:
- Dedicated customer success manager
- Regular progress reviews
- Microsoft FastTrack support
- Partner ecosystem engagement

NEXT STEPS:
1. Executive sponsor alignment
2. Technical architecture review
3. Contract negotiation
4. Implementation kickoff

This proposal represents a significant opportunity to accelerate ${account.name}'s digital transformation while strengthening our strategic partnership.`;
}

function generateEngagementPlan(account: Account, nba: NextBestAction): string {
  return `ENGAGEMENT ACTION PLAN
${account.name} - User Adoption & Engagement Strategy

CURRENT STATE:
- Health Score: ${account.healthScore}/100
- User Adoption Status: ${account.healthScore > 75 ? 'Good' : account.healthScore > 50 ? 'Moderate' : 'Low'}
- Primary Challenge: Low user engagement and feature utilization

ENGAGEMENT STRATEGY:

1. USER ONBOARDING ENHANCEMENT
   Timeline: Week 1-2
   Activities:
   • Audit current onboarding process
   • Identify user persona gaps
   • Create role-based training paths
   • Deploy guided tour experiences

2. FEATURE ADOPTION CAMPAIGN
   Timeline: Week 2-4
   Activities:
   • Analyze feature usage analytics
   • Identify high-value underutilized features
   • Create targeted communication campaigns
   • Implement in-app guidance and tips

3. CHAMPION PROGRAM DEVELOPMENT
   Timeline: Week 3-6
   Activities:
   • Identify power users and potential champions
   • Create champion training curriculum
   • Establish peer-to-peer learning sessions
   • Implement recognition and rewards system

4. TRAINING & ENABLEMENT
   Timeline: Week 4-8
   Activities:
   • Schedule department-specific training sessions
   • Develop self-service learning resources
   • Create video tutorials and documentation
   • Implement progress tracking and certification

5. FEEDBACK LOOP ESTABLISHMENT
   Timeline: Ongoing
   Activities:
   • Deploy user satisfaction surveys
   • Implement feedback collection mechanisms
   • Regular usage review meetings
   • Feature request prioritization process

SUCCESS METRICS:
- Daily Active Users: Increase by 30%
- Feature Adoption Rate: Improve by 25%
- User Satisfaction Score: Target 8.5/10
- Support Ticket Volume: Reduce by 20%
- Time to Value: Reduce onboarding time by 40%

RESOURCE REQUIREMENTS:
- CSAM: 20 hours/week for 8 weeks
- Training Specialist: 15 hours/week for 6 weeks
- Technical Support: 10 hours/week ongoing
- Communications: 5 hours/week for campaign development

MILESTONES:
Week 2: Onboarding process redesigned
Week 4: Champion program launched
Week 6: Feature adoption campaign live
Week 8: Training program completed
Week 12: Success metrics review

ESCALATION TRIGGERS:
- User adoption rate declining for 2 consecutive weeks
- Support ticket volume increasing by >15%
- User satisfaction score below 7.0
- Champion participation below 70%

This comprehensive engagement plan will drive meaningful user adoption and maximize value realization for ${account.name}.`;
}

function generateSupportAnalysis(account: Account, nba: NextBestAction): string {
  return `TECHNICAL ISSUE ANALYSIS
${account.name} - Support Ticket Review

SUMMARY:
Analysis Period: Last 30 days
Total Tickets: 12
Average Resolution Time: 3.2 days
Customer Satisfaction: 7.2/10

TICKET BREAKDOWN BY CATEGORY:
• Authentication Issues: 4 tickets (33%)
• Performance Problems: 3 tickets (25%)
• Feature Questions: 3 tickets (25%)
• Integration Challenges: 2 tickets (17%)

SEVERITY ANALYSIS:
• Critical: 1 ticket (8%)
• High: 3 tickets (25%)
• Medium: 5 tickets (42%)
• Low: 3 tickets (25%)

KEY ISSUES IDENTIFIED:

1. AUTHENTICATION INTEGRATION
   Issue: SSO configuration causing login failures
   Impact: 45 users affected daily
   Root Cause: Incomplete SAML attribute mapping
   Resolution Time: 2-4 hours per incident

2. PERFORMANCE DEGRADATION
   Issue: Slow response times during peak hours
   Impact: Productivity loss, user frustration
   Root Cause: Database query optimization needed
   Resolution Time: 1-2 days per incident

3. FEATURE CONFUSION
   Issue: Users struggling with advanced features
   Impact: Low feature adoption, repeated questions
   Root Cause: Insufficient training and documentation
   Resolution Time: 30 minutes per incident

TREND ANALYSIS:
- Authentication issues increased 200% this month
- Performance tickets steady but concerning
- Feature questions indicate training gaps
- Resolution times improving but still above target

ROOT CAUSE ANALYSIS:
Primary: Technical configuration gaps
Secondary: User education deficiencies
Tertiary: Process documentation outdated

RECOMMENDED ACTIONS:
1. Schedule SSO configuration review and fix
2. Implement database performance optimization
3. Deploy advanced feature training program
4. Update technical documentation
5. Establish proactive monitoring alerts

PREVENTION STRATEGY:
- Monthly technical health checks
- Quarterly user training refreshers
- Real-time performance monitoring
- Improved escalation procedures

RESOURCE REQUIREMENTS:
- Technical Specialist: 40 hours
- Documentation Writer: 20 hours
- Training Coordinator: 15 hours
- CSAM Oversight: 10 hours

TIMELINE:
Week 1: Critical issue resolution
Week 2: Performance optimization
Week 3: Training program launch
Week 4: Documentation updates

SUCCESS METRICS:
- Reduce ticket volume by 50%
- Improve resolution time to <2 days
- Increase satisfaction to >8.5/10
- Eliminate critical incidents`;
}

function generateResolutionPlan(account: Account, nba: NextBestAction): string {
  return `ISSUE RESOLUTION ROADMAP
${account.name} - Technical Remediation Plan

OVERVIEW:
This roadmap addresses the technical issues identified in our support analysis and provides a systematic approach to resolution and prevention.

PHASE 1: IMMEDIATE CRITICAL FIXES (Week 1)

Day 1-2: SSO Configuration Audit
• Review current SAML configuration
• Identify attribute mapping gaps
• Test authentication flows
• Document current state

Day 3-4: SSO Remediation
• Update SAML attribute mappings
• Configure user provisioning rules
• Test with pilot user group
• Deploy production fixes

Day 5: Validation & Monitoring
• Validate authentication success rates
• Monitor for new issues
• Update monitoring alerts
• Communication to affected users

PHASE 2: PERFORMANCE OPTIMIZATION (Week 2)

Day 1-3: Performance Analysis
• Database query analysis
• Server resource monitoring
• Load testing execution
• Bottleneck identification

Day 4-5: Implementation
• Database query optimization
• Cache configuration updates
• Resource scaling adjustments
• Performance monitoring setup

PHASE 3: USER ENABLEMENT (Week 3-4)

Week 3: Training Program Development
• Create role-based training materials
• Develop video tutorials
• Design self-service resources
• Schedule training sessions

Week 4: Training Delivery & Documentation
• Conduct department-specific training
• Update technical documentation
• Deploy in-app help resources
• Gather feedback and iterate

PHASE 4: PREVENTION & MONITORING (Ongoing)

Proactive Monitoring:
• Real-time performance alerts
• Authentication success rate tracking
• User satisfaction monitoring
• Ticket trend analysis

Preventive Measures:
• Monthly technical health checks
• Quarterly user training refreshers
• Semi-annual configuration reviews
• Annual platform upgrades

RESOURCE ALLOCATION:

Technical Team:
• Lead Engineer: 30 hours
• Database Specialist: 20 hours
• DevOps Engineer: 15 hours

Customer Success:
• CSAM: 20 hours
• Training Specialist: 25 hours
• Technical Writer: 15 hours

RISK MITIGATION:

High Risk Items:
• Authentication fixes during business hours
• Database changes in production
• User training participation rates

Mitigation Strategies:
• Implement changes during maintenance windows
• Use blue-green deployment for database updates
• Provide multiple training format options
• Establish rollback procedures

COMMUNICATION PLAN:

Week 1: Issue acknowledgment and timeline
Week 2: Progress updates and next steps
Week 3: Training announcements and scheduling
Week 4: Resolution confirmation and follow-up

SUCCESS CRITERIA:
✓ Zero authentication failures for 7 consecutive days
✓ Page load times under 2 seconds consistently
✓ User satisfaction score above 8.5/10
✓ Support ticket reduction of 60%
✓ Training completion rate above 85%

ESCALATION PROCEDURES:
• Daily progress reviews with technical lead
• Immediate escalation for new critical issues
• Weekly stakeholder updates
• Executive briefing if timeline at risk

This comprehensive resolution plan ensures systematic issue remediation while building preventive measures for long-term stability.`;
}
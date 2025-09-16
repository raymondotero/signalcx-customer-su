import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Robot, CheckCircle, Clock, Users, Envelope as Mail, Calendar } from '@phosphor-icons/react';

interface WorkflowDemoProps {
  className?: string;
}

export function WorkflowDemo({ className = '' }: WorkflowDemoProps) {
  const demoWorkflows = [
    {
      id: 'retention-workflow',
      name: 'Retention Risk Mitigation',
      steps: 6,
      automated: 4,
      timeEstimate: '2-3 hours',
      assignee: 'CSAM',
      priority: 'Critical',
      automations: [
        'Stakeholder email templates',
        'Meeting scheduling',
        'CRM updates',
        'Follow-up reminders'
      ]
    },
    {
      id: 'expansion-workflow',
      name: 'Expansion Opportunity Execution',
      steps: 5,
      automated: 3,
      timeEstimate: '1-2 weeks',
      assignee: 'AE',
      priority: 'High',
      automations: [
        'Proposal generation',
        'Executive briefing',
        'Technical assessment'
      ]
    },
    {
      id: 'engagement-workflow',
      name: 'User Engagement Enhancement',
      steps: 4,
      automated: 3,
      timeEstimate: '30-60 days',
      assignee: 'CSAM',
      priority: 'Medium',
      automations: [
        'Training session scheduling',
        'Usage analytics reports',
        'Champion program setup'
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={`border-visible ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Robot className="w-5 h-5 text-purple-600" />
          Workflow Automation Examples
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Each NBA can be transformed into an automated workflow that helps CSAM and AE teams execute actions more efficiently.
          </div>
          
          {demoWorkflows.map((workflow) => (
            <div key={workflow.id} className="p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{workflow.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {workflow.steps} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <Robot className="w-3 h-3" />
                      {workflow.automated} automated
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {workflow.timeEstimate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {workflow.assignee}
                    </span>
                  </div>
                </div>
                <Badge className={getPriorityColor(workflow.priority)}>
                  {workflow.priority}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <strong>Automated outputs:</strong> {workflow.automations.join(', ')}
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-sm text-green-800 mb-2">💡 Automation Benefits</h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Reduces manual work by 60-80%</li>
              <li>• Ensures consistent execution across all accounts</li>
              <li>• Provides standardized communication templates</li>
              <li>• Automates Microsoft 365 integrations (Outlook, Teams, Dynamics)</li>
              <li>• Tracks progress and generates reports automatically</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
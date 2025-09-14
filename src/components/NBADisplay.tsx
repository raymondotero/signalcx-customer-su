import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Play, Clock, Target } from '@phosphor-icons/react';
import { Account, NextBestAction } from '@/types';
import { useNBAs, useAgentMemory } from '@/hooks/useData';

interface NBADisplayProps {
  account: Account;
  onPlanAndRun: (nba: NextBestAction) => void;
}

export function NBADisplay({ account, onPlanAndRun }: NBADisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentNBA, setCurrentNBA] = useState<NextBestAction | null>(null);
  const { addNBA } = useNBAs();
  const { addMemoryEntry } = useAgentMemory();

  const generateNBA = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nbaRecommendations = {
        'Good': [
          {
            title: 'Expansion Opportunity Assessment',
            description: 'Identify and pursue additional product upsells based on current usage patterns',
            reasoning: 'Account shows high engagement and satisfaction metrics, making them ideal for expansion',
            category: 'expansion' as const,
            estimatedImpact: '+$45K ARR',
            timeToComplete: '2-3 weeks'
          },
          {
            title: 'Success Story Case Study',
            description: 'Develop customer success story for marketing and reference purposes',
            reasoning: 'Strong health score and positive outcomes make this account ideal for case study development',
            category: 'engagement' as const,
            estimatedImpact: 'Brand value +$10K',
            timeToComplete: '1-2 weeks'
          }
        ],
        'Watch': [
          {
            title: 'Proactive Health Check',
            description: 'Schedule comprehensive account review to identify and address potential issues',
            reasoning: 'Declining engagement metrics require immediate attention to prevent churn',
            category: 'retention' as const,
            estimatedImpact: 'Prevent $50K churn',
            timeToComplete: '1 week'
          },
          {
            title: 'Training Enhancement Program',
            description: 'Implement targeted training to improve user adoption and engagement',
            reasoning: 'Low usage patterns suggest training gaps that can be addressed proactively',
            category: 'engagement' as const,
            estimatedImpact: '+15% usage',
            timeToComplete: '2-4 weeks'
          }
        ],
        'At Risk': [
          {
            title: 'Executive Intervention Required',
            description: 'Escalate to executive team for immediate retention strategy implementation',
            reasoning: 'Critical health score and contract renewal approaching - executive intervention needed',
            category: 'retention' as const,
            estimatedImpact: 'Save $320K ARR',
            timeToComplete: 'Immediate'
          },
          {
            title: 'Emergency Support Package',
            description: 'Deploy dedicated support resources to address critical issues and improve satisfaction',
            reasoning: 'Immediate support intervention required to stabilize relationship and prevent churn',
            category: 'support' as const,
            estimatedImpact: 'Stabilize account',
            timeToComplete: '3-5 days'
          }
        ]
      };

      const recommendations = nbaRecommendations[account.status];
      const selectedRecommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
      
      const nba: NextBestAction = {
        id: `nba-${Date.now()}`,
        accountId: account.id,
        title: selectedRecommendation.title,
        description: selectedRecommendation.description,
        reasoning: selectedRecommendation.reasoning,
        priority: account.status === 'At Risk' ? 'critical' : account.status === 'Watch' ? 'high' : 'medium',
        category: selectedRecommendation.category,
        estimatedImpact: selectedRecommendation.estimatedImpact,
        timeToComplete: selectedRecommendation.timeToComplete,
        assignedTo: account.csm,
        createdAt: new Date().toISOString()
      };

      setCurrentNBA(nba);
      addNBA(nba);
      
      // Add to agent memory
      addMemoryEntry({
        id: `memory-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'nba_generated',
        accountId: account.id,
        accountName: account.name,
        description: `Generated NBA: ${nba.title}`,
        metadata: { nbaId: nba.id },
        outcome: 'success'
      });
      
    } catch (error) {
      console.error('Failed to generate NBA:', error);
      addMemoryEntry({
        id: `memory-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'nba_generated',
        accountId: account.id,
        accountName: account.name,
        description: 'Failed to generate NBA due to AI service error',
        outcome: 'failure'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (priority: NextBestAction['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            Next Best Action
          </div>
          <Button 
            onClick={generateNBA}
            disabled={isGenerating}
            size="sm"
            className="bg-accent hover:bg-accent/90"
          >
            {isGenerating ? (
              <div className="animate-pulse-ai flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Analyzing...
              </div>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate NBA
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentNBA && !isGenerating && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Select an account and click "Generate NBA" to get AI-powered recommendations</p>
          </div>
        )}
        
        {isGenerating && (
          <div className="text-center py-8">
            <div className="animate-pulse-ai">
              <Brain className="w-12 h-12 mx-auto mb-4 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">AI is analyzing account data and generating recommendations...</p>
          </div>
        )}

        {currentNBA && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{currentNBA.title}</h3>
              <Badge className={getPriorityColor(currentNBA.priority)}>
                {currentNBA.priority}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">{currentNBA.description}</p>
            
            <Separator />
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">AI Reasoning</h4>
                <p className="text-sm text-muted-foreground">{currentNBA.reasoning}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="font-medium">Estimated Impact</span>
                  </div>
                  <p className="text-muted-foreground">{currentNBA.estimatedImpact}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="font-medium">Time to Complete</span>
                  </div>
                  <p className="text-muted-foreground">{currentNBA.timeToComplete}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <Button 
              onClick={() => onPlanAndRun(currentNBA)}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Plan & Run
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
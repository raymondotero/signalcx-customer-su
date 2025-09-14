import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, CheckCircle, Clock, Warning } from '@phosphor-icons/react';
import { useSignals, useAgentMemory, useAccounts } from '@/hooks/useData';
import { Signal, MemoryEntry } from '@/types';
import { toast } from 'sonner';

interface AIRecommendation {
  id: string;
  signalId: string;
  accountId: string;
  accountName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  reasoning: string;
  autoApproved: boolean;
  timestamp: string;
}

export function AIRecommendationEngine() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { signals } = useSignals();
  const { accounts } = useAccounts();
  const { addMemoryEntry } = useAgentMemory();

  const generateRecommendation = async (signal: Signal): Promise<AIRecommendation> => {
    const account = accounts.find(a => a.id === signal.accountId);
    
    // AI-powered recommendation logic
    let action = '';
    let reasoning = '';
    let priority: AIRecommendation['priority'] = 'medium';
    let autoApproved = false;

    switch (signal.type) {
      case 'churn_risk':
        priority = 'critical';
        action = 'Immediate retention intervention required';
        reasoning = 'Churn indicators detected. Schedule executive call within 24 hours.';
        autoApproved = false; // High-impact actions require approval
        break;
        
      case 'support':
        priority = signal.severity === 'critical' ? 'critical' : 'high';
        action = 'Escalate support case and notify CSM';
        reasoning = 'Support issue requires immediate attention to prevent escalation.';
        autoApproved = signal.severity === 'low';
        break;
        
      case 'financial':
        priority = 'high';
        action = 'Contact billing team and account owner';
        reasoning = 'Payment-related signal detected. Address before it impacts relationship.';
        autoApproved = false;
        break;
        
      case 'usage':
        priority = signal.severity === 'critical' ? 'high' : 'medium';
        action = 'Analyze usage patterns and schedule check-in';
        reasoning = 'Usage behavior change detected. Investigate potential issues.';
        autoApproved = signal.severity === 'low';
        break;
        
      case 'engagement':
        priority = 'medium';
        action = 'Schedule engagement review call';
        reasoning = 'Engagement metrics changed. Proactive outreach recommended.';
        autoApproved = true; // Low-risk actions can be auto-approved
        break;
        
      default:
        action = 'Review signal and determine next steps';
        reasoning = 'Signal requires manual review for appropriate action.';
        autoApproved = false;
    }

    // Enhance priority based on account status
    if (account?.status === 'At Risk') {
      priority = priority === 'medium' ? 'high' : priority === 'high' ? 'critical' : priority;
    }

    return {
      id: `rec-${Date.now()}-${Math.random()}`,
      signalId: signal.id,
      accountId: signal.accountId,
      accountName: signal.accountName,
      priority,
      action,
      reasoning,
      autoApproved,
      timestamp: new Date().toISOString()
    };
  };

  const processSignal = async (signal: Signal) => {
    if (recommendations.some(r => r.signalId === signal.id)) return; // Already processed
    
    setIsProcessing(true);
    
    try {
      const recommendation = await generateRecommendation(signal);
      setRecommendations(prev => [recommendation, ...prev].slice(0, 20)); // Keep last 20

      // Log to memory
      const memoryEntry: MemoryEntry = {
        id: `ai-rec-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: recommendation.autoApproved ? 'workflow_executed' : 'approval_requested',
        accountId: signal.accountId,
        accountName: signal.accountName,
        description: `AI Recommendation: ${recommendation.action}`,
        metadata: {
          recommendationId: recommendation.id,
          signalId: signal.id,
          priority: recommendation.priority,
          autoApproved: recommendation.autoApproved,
          reasoning: recommendation.reasoning
        },
        outcome: recommendation.autoApproved ? 'success' : 'pending'
      };
      
      addMemoryEntry(memoryEntry);
      
      if (recommendation.autoApproved) {
        toast.success(`Auto-approved: ${recommendation.action}`);
      } else {
        toast.info(`New recommendation requires approval: ${recommendation.action}`);
      }
      
    } catch (error) {
      console.error('Error processing signal:', error);
      toast.error('Failed to generate AI recommendation');
    } finally {
      setIsProcessing(false);
    }
  };

  const approveRecommendation = (recommendation: AIRecommendation, approved: boolean) => {
    // Update recommendation status
    setRecommendations(prev => 
      prev.map(r => 
        r.id === recommendation.id 
          ? { ...r, autoApproved: approved }
          : r
      )
    );

    // Log decision to memory
    addMemoryEntry({
      id: `approval-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'approval_decided',
      accountId: recommendation.accountId,
      accountName: recommendation.accountName,
      description: `Recommendation ${approved ? 'approved' : 'rejected'}: ${recommendation.action}`,
      metadata: {
        recommendationId: recommendation.id,
        originalPriority: recommendation.priority,
        decision: approved ? 'approved' : 'rejected'
      },
      outcome: approved ? 'success' : 'rejected'
    });

    toast.success(`Recommendation ${approved ? 'approved' : 'rejected'}`);
  };

  // Process new signals automatically
  useEffect(() => {
    const latestSignal = signals[0];
    if (latestSignal) {
      processSignal(latestSignal);
    }
  }, [signals.length]);

  const getPriorityColor = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'critical': return <Warning className="w-4 h-4 text-red-500" />;
      case 'high': return <Warning className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className={`w-5 h-5 text-accent ${isProcessing ? 'animate-pulse-ai' : ''}`} />
          AI Recommendations
          {isProcessing && (
            <Badge variant="outline" className="animate-pulse">Processing</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No AI recommendations yet. System will analyze incoming signals.</p>
              </div>
            ) : (
              recommendations.map((rec) => (
                <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(rec.priority)}
                      <span className="font-medium text-sm">{rec.accountName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                      {rec.autoApproved ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Auto-approved
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Needs approval
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-sm mb-1">{rec.action}</p>
                    <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                  </div>
                  
                  {!rec.autoApproved && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => approveRecommendation(rec, true)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => approveRecommendation(rec, false)}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    {new Date(rec.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
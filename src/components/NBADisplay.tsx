import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, Clock, Target, Sparkle, TrendUp } from '@phosphor-icons/react';
import { Account, NextBestAction, Signal, MemoryEntry } from '@/types';
import { useNBAs, useAgentMemory, useSignals } from '@/hooks/useData';
import { azureOpenAI, RecommendationContext, SmartRecommendation } from '@/services/azureOpenAI';
import { toast } from 'sonner';

interface NBADisplayProps {
  account: Account;
  onPlanAndRun: (nba: NextBestAction) => void;
}

export function NBADisplay({ account, onPlanAndRun }: NBADisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRecommendations, setCurrentRecommendations] = useState<SmartRecommendation[]>([]);
  const [selectedNBA, setSelectedNBA] = useState<NextBestAction | null>(null);
  const [orchestrationPlan, setOrchestrationPlan] = useState<any>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  const { addNBA, nbas } = useNBAs();
  const { addMemoryEntry, memory } = useAgentMemory();
  const { signals } = useSignals();

  const generateSmartNBAs = async () => {
    setIsGenerating(true);
    setCurrentRecommendations([]);
    setSelectedNBA(null);
    setOrchestrationPlan(null);
    
    try {
      // Build context for AI
      const context: RecommendationContext = {
        account,
        recentSignals: signals.filter(s => s.accountId === account.id).slice(0, 10),
        historicalNBAs: nbas.filter(n => n.accountId === account.id).slice(0, 5),
        agentMemory: memory.filter(m => m.accountId === account.id).slice(0, 10)
      };

      // Generate smart recommendations using Azure OpenAI
      const recommendations = await azureOpenAI.generateSmartRecommendations(context);
      
      setCurrentRecommendations(recommendations);
      
      // Auto-select the highest confidence recommendation
      const topRecommendation = recommendations.reduce((top, current) => 
        current.confidence > top.confidence ? current : top, 
        recommendations[0]
      );
      
      if (topRecommendation) {
        setSelectedNBA(topRecommendation.nba);
        addNBA(topRecommendation.nba);
      }
      
      // Add to agent memory
      addMemoryEntry({
        id: `memory-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'nba_generated',
        accountId: account.id,
        accountName: account.name,
        description: `Generated ${recommendations.length} AI-powered recommendations`,
        metadata: { 
          recommendationsCount: recommendations.length,
          topConfidence: topRecommendation?.confidence,
          topNBAId: topRecommendation?.nba.id
        },
        outcome: 'success'
      });
      
      toast.success(`Generated ${recommendations.length} smart recommendations for ${account.name}`);
      
    } catch (error) {
      console.error('Failed to generate smart NBAs:', error);
      
      // Fallback to basic recommendation
      const fallbackNBA = generateFallbackNBA();
      setSelectedNBA(fallbackNBA);
      addNBA(fallbackNBA);
      
      addMemoryEntry({
        id: `memory-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'nba_generated',
        accountId: account.id,
        accountName: account.name,
        description: 'Used fallback recommendation due to AI service unavailability',
        metadata: { fallback: true },
        outcome: 'success'
      });
      
      toast.warning('AI service unavailable - generated basic recommendation');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackNBA = (): NextBestAction => {
    const nbaTemplates = {
      'Good': {
        title: 'Expansion Opportunity Assessment',
        description: 'Identify and pursue additional product upsells based on current usage patterns',
        reasoning: 'Account shows high engagement and satisfaction metrics, making them ideal for expansion',
        category: 'expansion' as const,
        estimatedImpact: '+$45K ARR',
        timeToComplete: '2-3 weeks'
      },
      'Watch': {
        title: 'Proactive Health Check',
        description: 'Schedule comprehensive account review to identify and address potential issues',
        reasoning: 'Declining engagement metrics require immediate attention to prevent churn',
        category: 'retention' as const,
        estimatedImpact: 'Prevent $50K churn',
        timeToComplete: '1 week'
      },
      'At Risk': {
        title: 'Executive Intervention Required',
        description: 'Escalate to executive team for immediate retention strategy implementation',
        reasoning: 'Critical health score and contract renewal approaching - executive intervention needed',
        category: 'retention' as const,
        estimatedImpact: 'Save $320K ARR',
        timeToComplete: 'Immediate'
      }
    };

    const template = nbaTemplates[account.status];
    
    return {
      id: `nba-fallback-${Date.now()}`,
      accountId: account.id,
      title: template.title,
      description: template.description,
      reasoning: template.reasoning,
      priority: account.status === 'At Risk' ? 'critical' : account.status === 'Watch' ? 'high' : 'medium',
      category: template.category,
      estimatedImpact: template.estimatedImpact,
      effort: 'medium',
      suggestedActions: [template.title, template.description],
      generatedAt: new Date().toISOString(),
      timeToComplete: template.timeToComplete,
      assignedTo: account.csm,
      createdAt: new Date().toISOString()
    };
  };

  const generateOrchestrationPlan = async (nba: NextBestAction) => {
    if (!nba) return;
    
    setIsGeneratingPlan(true);
    
    try {
      const context: RecommendationContext = {
        account,
        recentSignals: signals.filter(s => s.accountId === account.id).slice(0, 10),
        historicalNBAs: nbas.filter(n => n.accountId === account.id).slice(0, 5),
        agentMemory: memory.filter(m => m.accountId === account.id).slice(0, 10)
      };

      const plan = await azureOpenAI.generateOrchestrationPlan(nba, context);
      setOrchestrationPlan(plan);
      
      toast.success('Generated orchestration plan');
    } catch (error) {
      console.error('Failed to generate orchestration plan:', error);
      toast.error('Failed to generate orchestration plan');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const selectRecommendation = (recommendation: SmartRecommendation) => {
    setSelectedNBA(recommendation.nba);
    setOrchestrationPlan(null);
    addNBA(recommendation.nba);
  };

  const handlePlanAndRun = () => {
    if (!selectedNBA) return;
    
    generateOrchestrationPlan(selectedNBA);
    onPlanAndRun(selectedNBA);
  };

  const getPriorityColor = (priority: NextBestAction['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            AI-Powered Recommendations
          </div>
          <Button 
            onClick={generateSmartNBAs}
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
                <Sparkle className="w-4 h-4 mr-2" />
                Generate Smart NBA
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!currentRecommendations.length && !isGenerating && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Click "Generate Smart NBA" to get AI-powered recommendations tailored to this account</p>
          </div>
        )}
        
        {isGenerating && (
          <div className="text-center py-8">
            <div className="animate-pulse-ai">
              <Brain className="w-12 h-12 mx-auto mb-4 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">AI is analyzing account data, signals, and history...</p>
            <div className="mt-4 max-w-xs mx-auto">
              <Progress value={33} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">Processing with Azure OpenAI</p>
            </div>
          </div>
        )}

        {/* Recommendation Selection */}
        {currentRecommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">AI Recommendations ({currentRecommendations.length})</h4>
            <div className="space-y-2">
              {currentRecommendations.map((rec, index) => (
                <div 
                  key={rec.nba.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedNBA?.id === rec.nba.id ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => selectRecommendation(rec)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(rec.nba.priority)}>
                        {rec.nba.priority}
                      </Badge>
                      <span className={`text-xs font-medium ${getConfidenceColor(rec.confidence)}`}>
                        {Math.round(rec.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">
                        {Math.round(rec.successProbability * 100)}% success
                      </span>
                    </div>
                  </div>
                  <h5 className="font-medium text-sm mb-1">{rec.nba.title}</h5>
                  <p className="text-xs text-muted-foreground">{rec.rationale}</p>
                  {rec.riskFactors.length > 0 && (
                    <div className="mt-2 text-xs text-orange-600">
                      <strong>Risks:</strong> {rec.riskFactors.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected NBA Details */}
        {selectedNBA && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{selectedNBA.title}</h3>
              <Badge className={getPriorityColor(selectedNBA.priority)}>
                {selectedNBA.priority}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">{selectedNBA.description}</p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">AI Reasoning</h4>
                <p className="text-sm text-muted-foreground">{selectedNBA.reasoning}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="font-medium">Estimated Impact</span>
                  </div>
                  <p className="text-muted-foreground">{selectedNBA.estimatedImpact}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="font-medium">Time to Complete</span>
                  </div>
                  <p className="text-muted-foreground">{selectedNBA.timeToComplete}</p>
                </div>
              </div>
            </div>
            
            {/* Orchestration Plan Preview */}
            {orchestrationPlan && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <h4 className="font-medium text-sm">Orchestration Plan</h4>
                <p className="text-xs text-muted-foreground">Timeline: {orchestrationPlan.timeline}</p>
                <div className="space-y-1">
                  {orchestrationPlan.steps?.slice(0, 3).map((step: any, index: number) => (
                    <div key={step.id} className="text-xs">
                      <span className="font-medium">{index + 1}.</span> {step.title}
                    </div>
                  ))}
                  {orchestrationPlan.steps?.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{orchestrationPlan.steps.length - 3} more steps
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              onClick={handlePlanAndRun}
              className="w-full"
              size="lg"
              disabled={isGeneratingPlan}
            >
              {isGeneratingPlan ? (
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 animate-pulse-ai" />
                  Generating Plan...
                </div>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Plan & Run
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
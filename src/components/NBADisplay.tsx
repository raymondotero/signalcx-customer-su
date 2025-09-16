import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Play, Clock, Target, Sparkle, TrendUp, CheckCircle } from '@phosphor-icons/react';
import { Account, NextBestAction, Signal, MemoryEntry } from '@/types';
import { useNBAs, useAgentMemory, useSignals } from '@/hooks/useData';
import { useTargetAwareRecommendations } from '@/hooks/useTargetAwareRecommendations';
import { azureOpenAI, RecommendationContext, SmartRecommendation } from '@/services/azureOpenAI';
import { toast } from 'sonner';

interface NBADisplayProps {
  account: Account;
  onPlanAndRun: (nba: NextBestAction) => void;
}

export function NBADisplay({ account, onPlanAndRun }: NBADisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRecommendations, setCurrentRecommendations] = useState<SmartRecommendation[]>([]);
  const [targetRecommendation, setTargetRecommendation] = useState<any>(null);
  const [selectedNBA, setSelectedNBA] = useState<NextBestAction | null>(null);
  const [orchestrationPlan, setOrchestrationPlan] = useState<any>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  const { addNBA, nbas } = useNBAs();
  const { addMemoryEntry, memory } = useAgentMemory();
  const { signals } = useSignals();
  const { generateTargetAwareNBA, isGenerating: isGeneratingTargetNBA, availableTargets } = useTargetAwareRecommendations();

  const generateSmartNBAs = async () => {
    console.log('NBA Generation Started', { account: account.name, accountId: account.id });
    
    setIsGenerating(true);
    setCurrentRecommendations([]);
    setTargetRecommendation(null);
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

      console.log('NBA Context Built', { 
        signalsCount: context.recentSignals.length, 
        nbasCount: context.historicalNBAs.length,
        memoryCount: context.agentMemory.length 
      });

      // Generate both regular and target-aware recommendations
      console.log('Starting AI recommendation generation...');
      const [aiRecommendations, targetRecommendation] = await Promise.all([
        azureOpenAI.generateSmartRecommendations(context),
        generateTargetAwareNBA(account, signals)
      ]);
      
      console.log('AI Recommendations Generated', { 
        aiCount: aiRecommendations.length, 
        hasTargetRec: !!targetRecommendation 
      });
      
      setCurrentRecommendations(aiRecommendations);
      setTargetRecommendation(targetRecommendation);
      
      // Auto-select the target recommendation if available and high confidence, otherwise AI recommendation
      let topRecommendation: NextBestAction | null = null;
      
      if (targetRecommendation && targetRecommendation.confidence > 0.7) {
        topRecommendation = targetRecommendation.nba;
        console.log('Selected target-aware recommendation', { confidence: targetRecommendation.confidence });
      } else if (aiRecommendations.length > 0) {
        const bestAI = aiRecommendations.reduce((top, current) => 
          current.confidence > top.confidence ? current : top, aiRecommendations[0]
        );
        topRecommendation = bestAI.nba;
        console.log('Selected AI recommendation', { confidence: bestAI.confidence });
      }

      if (topRecommendation) {
        setSelectedNBA(topRecommendation);
        addNBA(topRecommendation);
        console.log('NBA Added to Storage', { nbaId: topRecommendation.id, title: topRecommendation.title });
      } else {
        console.warn('No recommendations generated');
      }
      
      // Add to agent memory
      addMemoryEntry({
        id: `memory-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'nba_generated',
        accountId: account.id,
        accountName: account.name,
        description: `Generated ${aiRecommendations.length} AI recommendations${targetRecommendation ? ' + 1 target-aware recommendation' : ''}`,
        metadata: { 
          aiRecommendations: aiRecommendations.length,
          targetRecommendation: !!targetRecommendation,
          confidence: targetRecommendation?.confidence || (aiRecommendations[0]?.confidence || 0)
        },
        outcome: 'success'
      });

      const totalRecs = aiRecommendations.length + (targetRecommendation ? 1 : 0);
      toast.success(`Generated ${totalRecs} smart recommendations for ${account.name}`);
      console.log('NBA Generation Completed Successfully', { totalRecommendations: totalRecs });
    } catch (error) {
      console.error('Error generating NBA:', error);
      
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
      console.log('Used fallback NBA due to error');
    } finally {
      setIsGenerating(false);
      console.log('NBA Generation Process Completed');
    }
  };

  const generateFallbackNBA = (): NextBestAction => {
    const accountSignals = signals.filter(s => s.accountId === account.id);
    const criticalSignals = accountSignals.filter(s => s.severity === 'critical');
    
    let title = 'Review Account Health';
    let description = 'Conduct comprehensive review of account status and engagement';
    let priority: NextBestAction['priority'] = 'medium';
    
    if (account.status === 'At Risk') {
      title = 'Urgent: Address At-Risk Status';
      description = 'Immediate intervention required for at-risk account';
      priority = 'critical';
    } else if (criticalSignals.length > 0) {
      title = 'Resolve Critical Issues';
      description = `Address ${criticalSignals.length} critical signal(s) affecting account health`;
      priority = 'high';
    }

    return {
      id: `fallback-nba-${Date.now()}`,
      accountId: account.id,
      title,
      description,
      priority,
      category: account.status === 'At Risk' ? 'retention' : 'engagement',
      estimatedImpact: `Improve account health score by 10-20 points`,
      effort: 'medium',
      suggestedActions: [
        'Schedule account review meeting',
        'Analyze recent usage patterns',
        'Identify key stakeholder concerns'
      ],
      reasoning: 'Standard account management best practices',
      generatedAt: new Date().toISOString(),
      timeToComplete: '1-2 weeks',
      assignedTo: account.csam
    };
  };

  const generateOrchestrationPlan = async (nba: NextBestAction) => {
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

  const handlePlanAndRun = () => {
    if (selectedNBA) {
      onPlanAndRun(selectedNBA);
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

  const getCategoryColor = (category: NextBestAction['category']) => {
    switch (category) {
      case 'engagement': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'retention': return 'bg-red-50 text-red-700 border-red-200';
      case 'expansion': return 'bg-green-50 text-green-700 border-green-200';
      case 'support': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'onboarding': return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <Card className="border-visible">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className={`w-5 h-5 text-accent ${isGenerating ? 'animate-pulse-ai' : ''}`} />
            Next Best Actions
            {availableTargets.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                {availableTargets.length} targets
              </Badge>
            )}
          </div>
          <Button 
            onClick={generateSmartNBAs}
            disabled={isGenerating || isGeneratingTargetNBA}
            size="sm"
          >
            <Sparkle className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate NBA'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {selectedNBA ? (
          <Tabs defaultValue="selected" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="selected">Selected NBA</TabsTrigger>
              <TabsTrigger value="ai-recommendations">AI Recommendations ({currentRecommendations.length})</TabsTrigger>
              <TabsTrigger value="target-recommendation">
                Target-Based
                {targetRecommendation && <Badge className="ml-1 h-4 text-xs">NEW</Badge>}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="selected">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedNBA.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{selectedNBA.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge className={getPriorityColor(selectedNBA.priority)}>
                        {selectedNBA.priority}
                      </Badge>
                      <Badge className={getCategoryColor(selectedNBA.category)}>
                        {selectedNBA.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium">Estimated Impact:</span>
                      <p className="text-muted-foreground">{selectedNBA.estimatedImpact}</p>
                    </div>
                    <div>
                      <span className="font-medium">Effort Required:</span>
                      <p className="text-muted-foreground capitalize">{selectedNBA.effort}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Suggested Actions:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {selectedNBA.suggestedActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Reasoning:</strong> {selectedNBA.reasoning}</p>
                      <p><strong>Assigned to:</strong> {selectedNBA.assignedTo}</p>
                      <p><strong>Time to complete:</strong> {selectedNBA.timeToComplete}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateOrchestrationPlan(selectedNBA)}
                        disabled={isGeneratingPlan}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        {isGeneratingPlan ? 'Planning...' : 'Plan'}
                      </Button>
                      <Button 
                        onClick={handlePlanAndRun}
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Plan & Run
                      </Button>
                    </div>
                  </div>
                </div>
                
                {orchestrationPlan && (
                  <div className="p-4 rounded-lg border bg-slate-50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Orchestration Plan
                    </h4>
                    <div className="space-y-2 text-sm">
                      {orchestrationPlan.steps?.map((step: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                          <span>{step.description}</span>
                          <Badge variant="outline" className="text-xs">
                            {step.estimatedTime}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="ai-recommendations">
              <div className="space-y-3">
                {currentRecommendations.length > 0 ? (
                  currentRecommendations.map((rec, index) => (
                    <div key={index} className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50" 
                         onClick={() => setSelectedNBA(rec.nba)}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{rec.nba.title}</h4>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {(rec.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                          <Badge className={getPriorityColor(rec.nba.priority)}>
                            {rec.nba.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.nba.description}</p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Success probability:</strong> {(rec.successProbability * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No AI recommendations generated yet.</p>
                    <p className="text-sm">Click "Generate NBA" to get AI-powered suggestions.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="target-recommendation">
              <div className="space-y-3">
                {targetRecommendation ? (
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-green-600" />
                          <h4 className="font-medium">Target-Aware Recommendation</h4>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {(targetRecommendation.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{targetRecommendation.nba.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{targetRecommendation.nba.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-2">Target Impact Analysis:</h5>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="text-center p-2 bg-white rounded border">
                            <div className="font-bold text-green-600">
                              {targetRecommendation.targetImpact.affectedTargets.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Targets Affected</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded border">
                            <div className="font-bold text-blue-600">
                              {Math.round(targetRecommendation.targetImpact.improvementPotential)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Improvement Potential</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded border">
                            <div className="font-bold text-orange-600">
                              {Math.round(targetRecommendation.targetImpact.riskReduction)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Risk Reduction</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">Affected Targets:</h5>
                        <div className="space-y-1">
                          {targetRecommendation.targetImpact.affectedTargets.map((target: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-xs p-2 bg-white rounded border">
                              <span className="font-medium">{target.signalName}</span>
                              <Badge className={`text-xs ${target.priority === 'critical' ? 'bg-red-100 text-red-800' : target.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                {target.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setSelectedNBA(targetRecommendation.nba)}
                        className="w-full"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Use Target-Based Recommendation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No target-based recommendations available.</p>
                    <p className="text-sm">
                      {availableTargets.length === 0 
                        ? 'Configure signal targets to enable target-aware recommendations.'
                        : 'All targets are currently being met for this account.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
            <p className="text-sm mb-6">Generate AI-powered next best actions for this account</p>
            
            <div className="flex flex-col items-center gap-4">
              <Button 
                onClick={generateSmartNBAs} 
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Sparkle className="w-5 h-5 mr-2" />
                {isGenerating ? 'Generating Smart Recommendations...' : 'Generate Smart NBA Recommendations'}
              </Button>
              
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  AI is analyzing account data and business signals...
                </div>
              )}
              
              <div className="text-xs text-muted-foreground max-w-md">
                <p className="mb-2">🤖 <strong>AI-Powered Analysis:</strong></p>
                <p>• Reviews account health, signals, and historical patterns</p>
                <p>• Considers business value targets and priorities</p>
                <p>• Generates contextual, actionable recommendations</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
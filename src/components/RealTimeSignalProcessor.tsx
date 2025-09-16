import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Activity, Pause, Play, Warning, CheckCircle } from '@phosphor-icons/react';
import { useSignals, useAccounts, useAgentMemory } from '@/hooks/useData';
import { useRealTimeAI, useAIInsights } from '@/hooks/useRealTimeAI';
import { azureOpenAI } from '@/services/azureOpenAI';
import { Signal, Account } from '@/types';
import { toast } from 'sonner';

interface ProcessedSignal {
  signal: Signal;
  aiAnalysis?: {
    insights: string[];
    risks: Array<{ accountId: string; risk: string; severity: 'medium' | 'high' | 'critical' }>;
    recommendations: Array<{ accountId: string; action: string; priority: 'low' | 'medium' | 'high'; effort: 'low' | 'medium' | 'high'; estimatedImpact: string }>;
  };
  processedAt: string;
  confidence?: number;
}

export function RealTimeSignalProcessor() {
  const [isAutoProcessingEnabled, setIsAutoProcessingEnabled] = useState(true);
  const [processedSignals, setProcessedSignals] = useState<ProcessedSignal[]>([]);
  const [lastProcessedSignalId, setLastProcessedSignalId] = useState<string | null>(null);
  
  const { signals } = useSignals();
  const { accounts } = useAccounts();
  const { addMemoryEntry } = useAgentMemory();
  const realTimeAI = useRealTimeAI();
  const { insights, addInsight } = useAIInsights();

  // Auto-process new signals
  useEffect(() => {
    if (!isAutoProcessingEnabled || !signals.length) return;
    
    const latestSignal = signals[0];
    if (!latestSignal || latestSignal.id === lastProcessedSignalId) return;
    
    processSignalWithAI(latestSignal);
    setLastProcessedSignalId(latestSignal.id);
  }, [signals, isAutoProcessingEnabled, lastProcessedSignalId]);

  const processSignalWithAI = async (signal: Signal) => {
    try {
      // Add to processing queue via real-time AI hook
      await realTimeAI.processSignalRealTime(signal, accounts);
      
      // Analyze with Azure OpenAI
      const analysis = await azureOpenAI.analyzeSignalsRealTime([signal], accounts);
      
      const processedSignal: ProcessedSignal = {
        signal,
        aiAnalysis: analysis,
        processedAt: new Date().toISOString(),
        confidence: 0.85 // Default confidence
      };
      
      setProcessedSignals(prev => [processedSignal, ...prev].slice(0, 50));
      
      // Generate insights from analysis
      analysis.insights.forEach(insight => {
        addInsight({
          type: 'signal_insight',
          content: insight,
          accountId: signal.accountId,
          accountName: signal.accountName,
          priority: signal.severity === 'critical' ? 'critical' : 'medium',
          confidence: 0.85,
          autoApproved: signal.severity !== 'critical'
        });
      });
      
      // Generate risk alerts
      analysis.risks.forEach(risk => {
        addInsight({
          type: 'risk_alert',
          content: risk.risk,
          accountId: risk.accountId,
          accountName: accounts.find(a => a.id === risk.accountId)?.name,
          priority: risk.severity as 'low' | 'medium' | 'high' | 'critical',
          confidence: 0.90,
          autoApproved: false
        });
      });
      
      // Generate urgent action recommendations
      analysis.recommendations.forEach(rec => {
        addInsight({
          type: 'recommendation',
          content: `URGENT: ${rec.action}`,
          accountId: rec.accountId,
          accountName: accounts.find(a => a.id === rec.accountId)?.name,
          priority: rec.priority as 'low' | 'medium' | 'high' | 'critical',
          confidence: 0.88,
          autoApproved: false
        });
      });
      
      // Log to memory
      addMemoryEntry({
        id: `signal-proc-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'signal_processed',
        accountId: signal.accountId,
        accountName: signal.accountName,
        description: `AI processed ${signal.type} signal - generated ${analysis.insights.length} insights, ${analysis.risks.length} risk alerts, ${analysis.recommendations.length} urgent actions`,
        metadata: {
          signalId: signal.id,
          signalType: signal.type,
          signalSeverity: signal.severity,
          insightsCount: analysis.insights.length,
          riskAlertsCount: analysis.risks.length,
          urgentActionsCount: analysis.recommendations.length
        },
        outcome: 'success'
      });
      
      // Show notification for critical items
      if (analysis.risks.length > 0 || analysis.recommendations.length > 0) {
        toast.warning(`AI detected ${analysis.risks.length} risks and ${analysis.recommendations.length} urgent actions for ${signal.accountName}`);
      }
      
    } catch (error) {
      console.error('Error processing signal with AI:', error);
      
      // Still record the signal as processed, but without AI analysis
      const processedSignal: ProcessedSignal = {
        signal,
        processedAt: new Date().toISOString()
      };
      
      setProcessedSignals(prev => [processedSignal, ...prev].slice(0, 50));
      
      toast.error(`Failed to process signal with AI: ${signal.description}`);
    }
  };

  const manuallyProcessSignal = async (signal: Signal) => {
    await processSignalWithAI(signal);
  };

  const getSeverityColor = (severity: Signal['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: Signal['type']) => {
    switch (type) {
      case 'cost': return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'agility': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'data': return <Activity className="w-4 h-4 text-purple-500" />;
      case 'risk': return <Warning className="w-4 h-4 text-orange-500" />;
      case 'culture': return <Activity className="w-4 h-4 text-pink-500" />;
      case 'churn_risk': return <Warning className="w-4 h-4 text-red-500" />;
      case 'support': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'financial': return <Activity className="w-4 h-4 text-green-500" />;
      case 'usage': return <Activity className="w-4 h-4 text-indigo-500" />;
      case 'engagement': return <Activity className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const unprocessedSignals = signals.filter(signal => 
    !processedSignals.some(processed => processed.signal.id === signal.id)
  );

  return (
    <Card className="h-[600px] flex flex-col border-visible">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className={`w-5 h-5 text-accent ${realTimeAI.isProcessing ? 'animate-pulse-ai' : ''}`} />
            Real-Time AI Signal Processor
            {realTimeAI.isProcessing && (
              <Badge variant="outline" className="animate-pulse">
                Processing {realTimeAI.currentTask}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Switch
                checked={isAutoProcessingEnabled}
                onCheckedChange={setIsAutoProcessingEnabled}
              />
              <span>Auto-process</span>
              {isAutoProcessingEnabled ? (
                <Play className="w-4 h-4 text-green-500" />
              ) : (
                <Pause className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Queue: {realTimeAI.queueSize} tasks</span>
          <span>Processed: {processedSignals.length} signals</span>
          <span>Unprocessed: {unprocessedSignals.length} signals</span>
        </div>
        
        <ScrollArea className="h-full">
          <div className="space-y-4">
            
            {/* Unprocessed Signals */}
            {unprocessedSignals.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-orange-600">
                  Unprocessed Signals ({unprocessedSignals.length})
                </h4>
                {unprocessedSignals.slice(0, 5).map(signal => (
                  <div key={signal.id} className="border border-orange-200 rounded-lg p-3 bg-orange-50/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(signal.type)}
                        <span className="font-medium text-sm">{signal.accountName}</span>
                        {signal.signalName && (
                          <Badge variant="outline" className="text-xs">
                            {signal.signalName}
                          </Badge>
                        )}
                        <Badge className={getSeverityColor(signal.severity)}>
                          {signal.severity}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => manuallyProcessSignal(signal)}
                        disabled={realTimeAI.isProcessing}
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Process
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{signal.description}</p>
                    {signal.value !== undefined && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>
                          Value: <span className="font-medium">
                            {typeof signal.value === 'number' && signal.unit === '%' ? 
                              `${signal.value.toFixed(1)}${signal.unit}` : 
                              `${signal.value}${signal.unit}`
                            }
                          </span>
                        </span>
                        {signal.target !== undefined && (
                          <span>
                            Target: <span className="font-medium">
                              {typeof signal.target === 'number' && signal.unit === '%' ? 
                                `${signal.target.toFixed(1)}${signal.unit}` : 
                                `${signal.target}${signal.unit}`
                              }
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {unprocessedSignals.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{unprocessedSignals.length - 5} more unprocessed signals
                  </p>
                )}
              </div>
            )}
            
            {/* Processed Signals */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-600">
                AI Processed Signals ({processedSignals.length})
              </h4>
              
              {processedSignals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No signals processed yet. Enable auto-processing or manually process signals.</p>
                </div>
              ) : (
                processedSignals.map(processed => (
                  <div key={processed.signal.id} className="border rounded-lg p-3 bg-green-50/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(processed.signal.type)}
                        <span className="font-medium text-sm">{processed.signal.accountName}</span>
                        {processed.signal.signalName && (
                          <Badge variant="outline" className="text-xs">
                            {processed.signal.signalName}
                          </Badge>
                        )}
                        <Badge className={getSeverityColor(processed.signal.severity)}>
                          {processed.signal.severity}
                        </Badge>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {processed.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {(processed.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(processed.processedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">{processed.signal.description}</p>
                    
                    {processed.signal.value !== undefined && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>
                          Value: <span className="font-medium">
                            {typeof processed.signal.value === 'number' && processed.signal.unit === '%' ? 
                              `${processed.signal.value.toFixed(1)}${processed.signal.unit}` : 
                              `${processed.signal.value}${processed.signal.unit}`
                            }
                          </span>
                        </span>
                        {processed.signal.target !== undefined && (
                          <span>
                            Target: <span className="font-medium">
                              {typeof processed.signal.target === 'number' && processed.signal.unit === '%' ? 
                                `${processed.signal.target.toFixed(1)}${processed.signal.unit}` : 
                                `${processed.signal.target}${processed.signal.unit}`
                              }
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                    
                    {processed.aiAnalysis && (
                      <div className="mt-2 space-y-1">
                        {processed.aiAnalysis.insights.length > 0 && (
                          <div className="text-xs">
                            <strong className="text-blue-600">Insights:</strong>
                            <ul className="ml-2 mt-1 space-y-1">
                              {processed.aiAnalysis.insights.map((insight, index) => (
                                <li key={index} className="text-muted-foreground">• {insight}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {processed.aiAnalysis.risks.length > 0 && (
                          <div className="text-xs">
                            <strong className="text-red-600">Risk Alerts:</strong>
                            <ul className="ml-2 mt-1 space-y-1">
                              {processed.aiAnalysis.risks.map((risk, index) => (
                                <li key={index} className="text-muted-foreground">⚠️ {risk.risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {processed.aiAnalysis.recommendations.length > 0 && (
                          <div className="text-xs">
                            <strong className="text-orange-600">Urgent Actions:</strong>
                            <ul className="ml-2 mt-1 space-y-1">
                              {processed.aiAnalysis.recommendations.map((rec, index) => (
                                <li key={index} className="text-muted-foreground">🚨 {rec.action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
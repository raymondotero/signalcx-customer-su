import { useState, useEffect, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { Signal, Account, NextBestAction, MemoryEntry } from '@/types';
import { azureOpenAI, SmartRecommendation, RecommendationContext } from '@/services/azureOpenAI';
import { toast } from 'sonner';

interface AIProcessingState {
  isProcessing: boolean;
  currentTask: string | null;
  queue: Array<{
    id: string;
    type: 'signal_analysis' | 'smart_recommendation' | 'orchestration_plan';
    data: any;
    priority: number;
  }>;
  results: Record<string, any>;
}

const defaultProcessingState: AIProcessingState = {
  isProcessing: false,
  currentTask: null,
  queue: [],
  results: {}
};

interface RealTimeAIHook {
  // State
  isProcessing: boolean;
  currentTask: string | null;
  
  // Processing functions
  processSignalRealTime: (signal: Signal, accounts: Account[]) => Promise<void>;
  generateSmartRecommendations: (account: Account, context: Partial<RecommendationContext>) => Promise<SmartRecommendation[]>;
  generateOrchestrationPlan: (nba: NextBestAction, context: Partial<RecommendationContext>) => Promise<any>;
  
  // Queue management
  queueSize: number;
  clearQueue: () => void;
  
  // Results
  getResults: (id: string) => any;
  clearResults: () => void;
}

export function useRealTimeAI(): RealTimeAIHook {
  const [processingState, setProcessingState] = useKV<AIProcessingState>('ai-processing-state', defaultProcessingState);
  
  const processingRef = useRef(false);
  const queueRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentState = processingState || defaultProcessingState;

  // Process queue continuously
  useEffect(() => {
    const processQueue = async () => {
      if (processingRef.current || currentState.queue.length === 0) return;
      
      processingRef.current = true;
      const nextTask = currentState.queue[0];
      
      setProcessingState(prev => {
        const prevState = prev || defaultProcessingState;
        return {
          ...prevState,
          isProcessing: true,
          currentTask: nextTask.type,
          queue: prevState.queue.slice(1)
        };
      });

      try {
        let result: any = null;
        
        switch (nextTask.type) {
          case 'signal_analysis':
            result = await azureOpenAI.analyzeSignalsRealTime(
              [nextTask.data.signal], 
              nextTask.data.accounts
            );
            break;
            
          case 'smart_recommendation':
            result = await azureOpenAI.generateSmartRecommendations(
              nextTask.data.context
            );
            break;
            
          case 'orchestration_plan':
            result = await azureOpenAI.generateOrchestrationPlan(
              nextTask.data.nba,
              nextTask.data.context
            );
            break;
        }
        
        setProcessingState(prev => {
          const prevState = prev || defaultProcessingState;
          return {
            ...prevState,
            results: {
              ...prevState.results,
              [nextTask.id]: result
            }
          };
        });
        
      } catch (error) {
        console.error(`AI task ${nextTask.type} failed:`, error);
        toast.error(`AI processing failed: ${nextTask.type}`);
      } finally {
        processingRef.current = false;
        
        setProcessingState(prev => {
          const prevState = prev || defaultProcessingState;
          return {
            ...prevState,
            isProcessing: false,
            currentTask: null
          };
        });
      }
    };

    // Process queue every 500ms if there are items
    if (currentState.queue.length > 0 && !processingRef.current) {
      queueRef.current = setTimeout(processQueue, 500);
    }

    return () => {
      if (queueRef.current) {
        clearTimeout(queueRef.current);
      }
    };
  }, [currentState.queue.length, currentState.isProcessing, setProcessingState]);

  const addToQueue = (
    type: AIProcessingState['queue'][0]['type'],
    data: any,
    priority: number = 1
  ): string => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setProcessingState(prev => {
      const prevState = prev || defaultProcessingState;
      return {
        ...prevState,
        queue: [...prevState.queue, { id, type, data, priority }]
          .sort((a, b) => b.priority - a.priority) // Higher priority first
      };
    });
    
    return id;
  };

  const processSignalRealTime = async (signal: Signal, accounts: Account[]): Promise<void> => {
    // Add high priority for critical signals
    const priority = signal.severity === 'critical' ? 3 : signal.severity === 'high' ? 2 : 1;
    
    addToQueue('signal_analysis', { signal, accounts }, priority);
    
    // Show immediate feedback
    toast.info(`AI analyzing ${signal.type} signal for ${signal.accountName}`, {
      description: signal.description
    });
  };

  const generateSmartRecommendations = async (
    account: Account, 
    context: Partial<RecommendationContext>
  ): Promise<SmartRecommendation[]> => {
    const fullContext: RecommendationContext = {
      account,
      recentSignals: context.recentSignals || [],
      historicalNBAs: context.historicalNBAs || [],
      agentMemory: context.agentMemory || []
    };
    
    const taskId = addToQueue('smart_recommendation', { context: fullContext }, 2);
    
    // Wait for result (with timeout)
    return new Promise((resolve, reject) => {
      const checkResult = () => {
        const result = currentState.results[taskId];
        if (result) {
          resolve(result);
        } else {
          setTimeout(checkResult, 1000);
        }
      };
      
      // Start checking after a brief delay
      setTimeout(checkResult, 1000);
      
      // Timeout after 30 seconds
      setTimeout(() => reject(new Error('AI recommendation timeout')), 30000);
    });
  };

  const generateOrchestrationPlan = async (
    nba: NextBestAction,
    context: Partial<RecommendationContext>
  ): Promise<any> => {
    const taskId = addToQueue('orchestration_plan', { nba, context }, 2);
    
    return new Promise((resolve, reject) => {
      const checkResult = () => {
        const result = currentState.results[taskId];
        if (result) {
          resolve(result);
        } else {
          setTimeout(checkResult, 1000);
        }
      };
      
      setTimeout(checkResult, 1000);
      setTimeout(() => reject(new Error('Orchestration plan timeout')), 30000);
    });
  };

  const clearQueue = () => {
    setProcessingState(prev => {
      const prevState = prev || defaultProcessingState;
      return {
        ...prevState,
        queue: []
      };
    });
  };

  const getResults = (id: string) => {
    return currentState.results[id];
  };

  const clearResults = () => {
    setProcessingState(prev => {
      const prevState = prev || defaultProcessingState;
      return {
        ...prevState,
        results: {}
      };
    });
  };

  return {
    isProcessing: currentState.isProcessing,
    currentTask: currentState.currentTask,
    processSignalRealTime,
    generateSmartRecommendations,
    generateOrchestrationPlan,
    queueSize: currentState.queue.length,
    clearQueue,
    getResults,
    clearResults
  };
}

// Hook for real-time AI insights that automatically processes new signals
export function useAIInsights() {
  const [insights, setInsights] = useKV<Array<{
    id: string;
    type: 'signal_insight' | 'recommendation' | 'risk_alert';
    content: string;
    accountId?: string;
    accountName?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    confidence?: number;
    autoApproved: boolean;
  }>>('ai-insights', []);

  const [lastProcessedSignal, setLastProcessedSignal] = useState<string | null>(null);
  const realTimeAI = useRealTimeAI();
  const currentInsights = insights || [];

  const addInsight = (insight: {
    type: 'signal_insight' | 'recommendation' | 'risk_alert';
    content: string;
    accountId?: string;
    accountName?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    confidence?: number;
    autoApproved?: boolean;
  }) => {
    const newInsight = {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      autoApproved: insight.autoApproved ?? (insight.confidence ? insight.confidence > 0.8 : false),
      ...insight
    };
    
    setInsights(prev => {
      const prevInsights = prev || [];
      return [newInsight, ...prevInsights].slice(0, 100); // Keep last 100
    });
    return newInsight;
  };

  const approveInsight = (insightId: string, approved: boolean) => {
    setInsights(prev => {
      const prevInsights = prev || [];
      return prevInsights.map(insight => 
        insight.id === insightId 
          ? { ...insight, autoApproved: approved }
          : insight
      );
    });
  };

  const clearInsights = () => {
    setInsights([]);
  };

  return {
    insights: currentInsights,
    addInsight,
    approveInsight,
    clearInsights,
    isProcessing: realTimeAI.isProcessing,
    currentTask: realTimeAI.currentTask,
    queueSize: realTimeAI.queueSize
  };
}

// Hook for monitoring AI performance metrics
interface AIMetrics {
  totalRecommendations: number;
  approvedRecommendations: number;
  averageConfidence: number;
  processingTimes: number[];
  lastUpdated: string;
}

const defaultMetrics: AIMetrics = {
  totalRecommendations: 0,
  approvedRecommendations: 0,
  averageConfidence: 0,
  processingTimes: [],
  lastUpdated: new Date().toISOString()
};

export function useAIMetrics() {
  const [metrics, setMetrics] = useKV<AIMetrics>('ai-metrics', defaultMetrics);
  const currentMetrics = metrics || defaultMetrics;

  const updateMetrics = (data: {
    recommendation?: boolean;
    approved?: boolean;
    confidence?: number;
    processingTime?: number;
  }) => {
    setMetrics(prev => {
      const prevMetrics = prev || defaultMetrics;
      const newMetrics = { ...prevMetrics };
      
      if (data.recommendation) {
        newMetrics.totalRecommendations += 1;
      }
      
      if (data.approved) {
        newMetrics.approvedRecommendations += 1;
      }
      
      if (data.confidence) {
        // Update rolling average
        const total = newMetrics.averageConfidence * newMetrics.totalRecommendations;
        newMetrics.averageConfidence = (total + data.confidence) / (newMetrics.totalRecommendations + 1);
      }
      
      if (data.processingTime) {
        newMetrics.processingTimes = [...newMetrics.processingTimes, data.processingTime].slice(-50); // Keep last 50
      }
      
      newMetrics.lastUpdated = new Date().toISOString();
      return newMetrics;
    });
  };

  const getApprovalRate = () => {
    if (currentMetrics.totalRecommendations === 0) return 0;
    return (currentMetrics.approvedRecommendations / currentMetrics.totalRecommendations) * 100;
  };

  const getAverageProcessingTime = () => {
    if (currentMetrics.processingTimes.length === 0) return 0;
    return currentMetrics.processingTimes.reduce((sum, time) => sum + time, 0) / currentMetrics.processingTimes.length;
  };

  const resetMetrics = () => {
    setMetrics(defaultMetrics);
  };

  return {
    metrics: currentMetrics,
    updateMetrics,
    getApprovalRate,
    getAverageProcessingTime,
    resetMetrics
  };
}
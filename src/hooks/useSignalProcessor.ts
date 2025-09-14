import { useState, useEffect } from 'react';
import { useSignals, useAgentMemory } from '@/hooks/useData';
import { Signal } from '@/types';

interface SignalAnalysis {
  isActionable: boolean;
  recommendedAction?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

export function useSignalProcessor() {
  const { signals, addSignal } = useSignals();
  const { addMemoryEntry } = useAgentMemory();
  const [isProcessing, setIsProcessing] = useState(false);

  const analyzeSignal = async (signal: Signal): Promise<SignalAnalysis> => {
    // Simulate AI analysis based on signal properties
    const analysis: SignalAnalysis = {
      isActionable: false,
      urgencyLevel: signal.severity,
      reason: ''
    };

    // Simple rule-based analysis (in real app, this would use AI)
    if (signal.severity === 'critical' || signal.severity === 'high') {
      analysis.isActionable = true;
      
      switch (signal.type) {
        case 'churn_risk':
          analysis.recommendedAction = 'Schedule immediate retention call';
          analysis.reason = 'High churn risk detected - immediate intervention required';
          break;
        case 'support':
          analysis.recommendedAction = 'Escalate to senior support specialist';
          analysis.reason = 'Critical support issue requires immediate attention';
          break;
        case 'financial':
          analysis.recommendedAction = 'Contact billing team and account manager';
          analysis.reason = 'Payment issue could impact account health';
          break;
        case 'usage':
          analysis.recommendedAction = 'Reach out to understand usage decline';
          analysis.reason = 'Significant usage drop may indicate issues';
          break;
        case 'engagement':
          analysis.recommendedAction = 'Schedule check-in call with CSM';
          analysis.reason = 'Declining engagement suggests account risk';
          break;
        default:
          analysis.recommendedAction = 'Review account status and schedule follow-up';
          analysis.reason = 'Signal requires manual review';
      }
    } else {
      analysis.reason = 'Signal noted but no immediate action required';
    }

    return analysis;
  };

  const processNewSignals = async () => {
    if (isProcessing || signals.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Process the most recent signal
      const latestSignal = signals[0];
      const analysis = await analyzeSignal(latestSignal);
      
      // Log analysis to memory
      addMemoryEntry({
        id: `analysis-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'signal_processed',
        accountId: latestSignal.accountId,
        accountName: latestSignal.accountName,
        description: `Signal analyzed: ${latestSignal.description}. ${analysis.reason}`,
        metadata: {
          signalId: latestSignal.id,
          signalType: latestSignal.type,
          severity: latestSignal.severity,
          isActionable: analysis.isActionable,
          recommendedAction: analysis.recommendedAction,
          urgencyLevel: analysis.urgencyLevel
        },
        outcome: analysis.isActionable ? 'success' : 'pending'
      });
      
    } catch (error) {
      console.error('Error processing signal:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-process new signals
  useEffect(() => {
    processNewSignals();
  }, [signals.length]);

  return {
    analyzeSignal,
    processNewSignals,
    isProcessing
  };
}
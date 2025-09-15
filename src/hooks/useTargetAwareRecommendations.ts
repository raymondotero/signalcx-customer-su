import React, { useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Account, NextBestAction, Signal } from '@/types';
import { SignalTarget } from '@/components/TargetSettingsDialog';

interface TargetAwareRecommendation {
  nba: NextBestAction;
  targetImpact: {
    affectedTargets: SignalTarget[];
    improvementPotential: number;
    riskReduction: number;
  };
  confidence: number;
}

export function useTargetAwareRecommendations() {
  const [targets] = useKV<SignalTarget[]>('signal-targets', []);
  const [isGenerating, setIsGenerating] = useState(false);

  const checkTargetCompliance = useCallback((signal: Signal, target: SignalTarget): 'on_track' | 'at_risk' | 'missed' => {
    if (signal.value === undefined) return 'on_track';
    
    switch (target.threshold) {
      case 'below':
        if (signal.value <= target.targetValue) return 'on_track';
        return signal.value <= target.targetValue * 1.2 ? 'at_risk' : 'missed';
      case 'above':
        if (signal.value >= target.targetValue) return 'on_track';
        return signal.value >= target.targetValue * 0.8 ? 'at_risk' : 'missed';
      case 'exactly':
        const deviation = Math.abs(signal.value - target.targetValue) / target.targetValue;
        if (deviation <= 0.1) return 'on_track';
        return deviation <= 0.2 ? 'at_risk' : 'missed';
      default:
        return 'on_track';
    }
  }, []);

  const generateTargetAwareNBA = useCallback(async (
    account: Account, 
    signals: Signal[]
  ): Promise<TargetAwareRecommendation | null> => {
    if (!targets || targets.length === 0) return null;
    
    setIsGenerating(true);
    
    try {
      const accountSignals = signals.filter(s => s.accountId === account.id);
      const targetIssues: Array<{
        target: SignalTarget;
        signal: Signal;
        compliance: 'missed' | 'at_risk';
        deviation: number;
      }> = [];

      // Find targets that are missed or at risk
      targets.forEach(target => {
        const matchingSignals = accountSignals.filter(s => 
          s.signalName === target.signalName || 
          s.type === target.signalName.toLowerCase().replace(/\s+/g, '_')
        );

        if (matchingSignals.length > 0) {
          const latestSignal = matchingSignals[0];
          const compliance = checkTargetCompliance(latestSignal, target);
          
          if (compliance === 'missed' || compliance === 'at_risk') {
            let deviation = 0;
            if (latestSignal.value !== undefined) {
              switch (target.threshold) {
                case 'below':
                  deviation = (latestSignal.value - target.targetValue) / target.targetValue;
                  break;
                case 'above':
                  deviation = (target.targetValue - latestSignal.value) / target.targetValue;
                  break;
                case 'exactly':
                  deviation = Math.abs(latestSignal.value - target.targetValue) / target.targetValue;
                  break;
              }
            }
            
            targetIssues.push({
              target,
              signal: latestSignal,
              compliance,
              deviation: Math.abs(deviation)
            });
          }
        }
      });

      if (targetIssues.length === 0) return null;

      // Prioritize by target priority and deviation
      targetIssues.sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.target.priority];
        const bPriority = priorityWeight[b.target.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        return b.deviation - a.deviation;
      });

      const primaryIssue = targetIssues[0];
      const affectedTargets = targetIssues.slice(0, 3).map(issue => issue.target);

      // Generate NBA based on the primary target issue
      const nba: NextBestAction = await generateNBAForTarget(account, primaryIssue);

      // Calculate target impact metrics
      const improvementPotential = Math.min(
        targetIssues.reduce((sum, issue) => sum + issue.deviation * 100, 0),
        100
      );
      
      const riskReduction = targetIssues.filter(issue => 
        issue.target.priority === 'critical' || issue.target.priority === 'high'
      ).length * 25;

      const confidence = Math.max(0.6, 1 - (primaryIssue.deviation * 0.5));

      return {
        nba,
        targetImpact: {
          affectedTargets,
          improvementPotential,
          riskReduction: Math.min(riskReduction, 100)
        },
        confidence
      };
    } finally {
      setIsGenerating(false);
    }
  }, [targets, checkTargetCompliance]);

  const generateNBAForTarget = async (
    account: Account, 
    issue: { target: SignalTarget; signal: Signal; compliance: 'missed' | 'at_risk'; deviation: number }
  ): Promise<NextBestAction> => {
    const { target, signal, compliance, deviation } = issue;
    
    try {
      // Check if spark is available before attempting AI generation
      if (!(window as any).spark || !(window as any).spark.llmPrompt || !(window as any).spark.llm) {
        throw new Error('Spark AI service not available');
      }
      
      // Use the Spark AI to generate contextual recommendations
      const prompt = (window as any).spark.llmPrompt`Generate a specific next best action for account "${account.name}" to address this target issue:

Target: ${target.signalName}
Current Value: ${signal.value}${target.unit}
Target Value: ${target.threshold} ${target.targetValue}${target.unit}
Status: ${compliance}
Priority: ${target.priority}
Description: ${target.description}

Account Details:
- Industry: ${account.industry}
- ARR: $${account.arr.toLocaleString()}
- Health Score: ${account.healthScore}
- Status: ${account.status}

Generate a concise, actionable recommendation that would help achieve the target. Include:
1. A clear title (max 60 chars)
2. Specific description (max 200 chars)
3. Priority level (critical/high/medium/low)
4. Category (engagement/retention/expansion/support/onboarding)
5. Estimated impact description (max 100 chars)
6. Effort level (low/medium/high)
7. 2-3 specific action steps
8. Brief reasoning (max 150 chars)

Respond with JSON only.`;

      const response = await (window as any).spark.llm(prompt, "gpt-4o-mini", true);
      const aiNBA = JSON.parse(response);
      
      return {
        id: `target-nba-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        accountId: account.id,
        title: aiNBA.title || `Improve ${target.signalName}`,
        description: aiNBA.description || `Address ${target.signalName} target miss`,
        priority: aiNBA.priority || target.priority,
        category: aiNBA.category || 'support',
        estimatedImpact: aiNBA.estimatedImpact || `Improve ${target.signalName} by ${Math.round(deviation * 100)}%`,
        effort: aiNBA.effort || 'medium',
        suggestedActions: aiNBA.suggestedActions || [
          `Monitor ${target.signalName} metrics closely`,
          `Implement process improvements`,
          `Review and adjust target if needed`
        ],
        reasoning: aiNBA.reasoning || `Target-driven recommendation for ${target.signalName}`,
        generatedAt: new Date().toISOString(),
        timeToComplete: '1-2 weeks',
        assignedTo: account.csam
      };
    } catch (error) {
      console.error('Error generating AI NBA:', error);
      
      // Fallback to rule-based NBA
      return {
        id: `target-nba-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        accountId: account.id,
        title: `Improve ${target.signalName}`,
        description: `Address ${compliance} target for ${target.signalName}. Current: ${signal.value}${target.unit}, Target: ${target.threshold} ${target.targetValue}${target.unit}`,
        priority: target.priority,
        category: target.category === 'risk' ? 'support' : 'retention',
        estimatedImpact: `Reduce ${target.signalName} deviation by ${Math.round(deviation * 100)}%`,
        effort: deviation > 0.5 ? 'high' : deviation > 0.2 ? 'medium' : 'low',
        suggestedActions: [
          `Monitor ${target.signalName} metrics daily`,
          `Implement targeted improvements for ${target.category} signals`,
          `Schedule follow-up review in 1 week`
        ],
        reasoning: `Target compliance issue detected - ${compliance} status requires immediate attention`,
        generatedAt: new Date().toISOString(),
        timeToComplete: deviation > 0.5 ? '2-4 weeks' : '1-2 weeks',
        assignedTo: account.csam
      };
    }
  };

  return {
    generateTargetAwareNBA,
    isGenerating,
    availableTargets: targets || []
  };
}
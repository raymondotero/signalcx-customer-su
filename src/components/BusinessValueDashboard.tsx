import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CurrencyDollar, Rocket, Database, Shield, Users, TrendUp, TrendDown, Minus, Target, CheckCircle, Warning, Brain, CaretDown, CaretUp, Lightbulb, ArrowRight } from '@phosphor-icons/react';
import { useSignals, useNBAs, useAccounts } from '@/hooks/useData';
import { useKV } from '@github/spark/hooks';
import { Signal, NextBestAction, Account, AIRecommendation, SignalAnalysis } from '@/types';
import { TargetSettingsDialog, SignalTarget } from '@/components/TargetSettingsDialog';
import { AIRecommendationsDialog } from '@/components/AIRecommendationsDialog';
import { toast } from 'sonner';

interface SignalCategoryStats {
  category: string;
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  averageValue?: number;
  unit?: string;
  trending: 'up' | 'down' | 'stable';
  targetsConfigured: number;
  targetsOnTrack: number;
  targetsMissed: number;
  signals: Signal[];
}

interface SignalRecommendationMap {
  signal: Signal;
  recommendations: NextBestAction[];
  accounts: Account[];
}

export function BusinessValueDashboard() {
  const { signals } = useSignals();
  const { nbas } = useNBAs();
  const { accounts } = useAccounts();
  const [targets] = useKV<SignalTarget[]>('signal-targets', []);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<SignalAnalysis | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const safeTargets = targets || [];

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getSignalRecommendations = (signal: Signal): SignalRecommendationMap => {
    // Find NBAs that could be related to this signal based on:
    // 1. Signal category matching NBA context
    // 2. Account health status correlation
    // 3. Signal severity matching NBA priority

    const relatedAccounts = accounts.filter(account => {
      // Match accounts that might be affected by this signal
      if (signal.severity === 'critical' && account.status === 'At Risk') return true;
      if (signal.severity === 'high' && (account.status === 'At Risk' || account.status === 'Watch')) return true;
      if (signal.category === 'cost' && account.healthScore < 0.7) return true;
      if (signal.category === 'risk' && account.status !== 'Good') return true;
      return signal.severity === 'medium' && account.status === 'Watch';
    });

    const relatedNBAs = nbas.filter(nba => {
      // Find NBAs for accounts that might be affected by this signal
      const accountAffected = relatedAccounts.some(acc => acc.id === nba.accountId);
      if (accountAffected) return true;

      // Match based on signal category and NBA type
      const signalKeywords = [signal.category, signal.signalName?.toLowerCase(), signal.type?.toLowerCase()].filter(Boolean);
      const nbaKeywords = [nba.category?.toLowerCase(), nba.title?.toLowerCase(), nba.description?.toLowerCase()].filter(Boolean);
      
      return signalKeywords.some(keyword => 
        nbaKeywords.some(nbaKeyword => nbaKeyword?.includes(keyword || ''))
      );
    });

    return {
      signal,
      recommendations: relatedNBAs,
      accounts: relatedAccounts
    };
  };

  const generateFallbackRecommendations = (signal: Signal, affectedAccounts: Account[]): AIRecommendation[] => {
    const recommendations: AIRecommendation[] = [];
    
    // Generate recommendations based on signal category and severity
    switch (signal.category) {
      case 'cost':
        recommendations.push({
          title: 'Cost Optimization Review',
          description: `Address the ${signal.signalName || signal.type} signal by conducting a comprehensive cost review with affected accounts.`,
          priority: signal.severity as any,
          category: 'optimization',
          targetAccounts: affectedAccounts.slice(0, 3).map(a => a.name),
          estimatedImpact: `Potential 10-15% cost reduction across ${affectedAccounts.length} account${affectedAccounts.length !== 1 ? 's' : ''}`,
          effort: signal.severity === 'critical' ? 'high' : 'medium',
          timeline: signal.severity === 'critical' ? '2-4 weeks' : '4-6 weeks',
          successMetrics: ['Cost per user reduction', 'Resource utilization improvement', 'Budget variance decrease'],
          reasoning: 'Cost signals require immediate attention to prevent budget overruns and optimize resource allocation.'
        });
        break;
        
      case 'risk':
        recommendations.push({
          title: 'Risk Mitigation Plan',
          description: `Implement risk controls to address ${signal.signalName || signal.type} across affected accounts.`,
          priority: signal.severity as any,
          category: 'support',
          targetAccounts: affectedAccounts.slice(0, 3).map(a => a.name),
          estimatedImpact: 'Reduced security exposure and improved compliance posture',
          effort: 'high',
          timeline: '1-3 weeks',
          successMetrics: ['Vulnerability reduction', 'Compliance score improvement', 'Security incident decrease'],
          reasoning: 'Risk signals indicate potential security or compliance issues that need immediate attention.'
        });
        break;
        
      case 'agility':
        recommendations.push({
          title: 'Development Process Optimization',
          description: `Improve development agility by addressing ${signal.signalName || signal.type} bottlenecks.`,
          priority: signal.severity as any,
          category: 'optimization',
          targetAccounts: affectedAccounts.slice(0, 3).map(a => a.name),
          estimatedImpact: '20-30% faster delivery cycles and improved developer productivity',
          effort: 'medium',
          timeline: '3-6 weeks',
          successMetrics: ['Lead time reduction', 'Deployment frequency increase', 'Change failure rate decrease'],
          reasoning: 'Agility signals suggest process inefficiencies that impact delivery speed and quality.'
        });
        break;
        
      case 'data':
        recommendations.push({
          title: 'Data Quality Enhancement',
          description: `Address data quality issues related to ${signal.signalName || signal.type} to improve decision making.`,
          priority: signal.severity as any,
          category: 'optimization',
          targetAccounts: affectedAccounts.slice(0, 3).map(a => a.name),
          estimatedImpact: 'Improved data accuracy and faster insights generation',
          effort: 'medium',
          timeline: '2-4 weeks',
          successMetrics: ['Data accuracy improvement', 'Report generation speed', 'Data freshness metrics'],
          reasoning: 'Data quality issues impact analytics capabilities and business intelligence accuracy.'
        });
        break;
        
      case 'culture':
        recommendations.push({
          title: 'Customer Success Engagement',
          description: `Enhance customer engagement to address ${signal.signalName || signal.type} concerns.`,
          priority: signal.severity as any,
          category: 'engagement',
          targetAccounts: affectedAccounts.slice(0, 3).map(a => a.name),
          estimatedImpact: 'Improved customer satisfaction and reduced churn risk',
          effort: 'medium',
          timeline: '2-6 weeks',
          successMetrics: ['CSAT score increase', 'Engagement rate improvement', 'Training completion increase'],
          reasoning: 'Culture signals indicate customer adoption or satisfaction challenges requiring proactive engagement.'
        });
        break;
        
      default:
        recommendations.push({
          title: 'General Signal Investigation',
          description: `Investigate and address the ${signal.signalName || signal.type} signal to prevent potential issues.`,
          priority: signal.severity as any,
          category: 'support',
          targetAccounts: affectedAccounts.slice(0, 3).map(a => a.name),
          estimatedImpact: 'Reduced risk and improved account health',
          effort: 'medium',
          timeline: '1-3 weeks',
          successMetrics: ['Signal resolution', 'Account health improvement', 'Issue recurrence prevention'],
          reasoning: 'Unclassified signals require investigation to understand root cause and appropriate response.'
        });
    }
    
    return recommendations;
  };

  const generateRecommendationsForSignal = async (signal: Signal) => {
    setSelectedSignal(signal);
    setDialogOpen(true);
    setIsLoadingAI(true);
    setAiRecommendations([]);
    setAiAnalysis(null);
    
    toast.info(`Generating AI recommendations for ${signal.signalName || signal.type}...`, {
      description: 'AI analyzing signal impact and generating tailored recommendations'
    });

    try {
      // Find affected accounts for this signal
      const affectedAccounts = accounts.filter(account => {
        if (signal.accountId && signal.accountId === account.id) return true;
        if (signal.severity === 'critical' && account.status === 'At Risk') return true;
        if (signal.severity === 'high' && (account.status === 'At Risk' || account.status === 'Watch')) return true;
        if (signal.category === 'cost' && account.healthScore < 0.7) return true;
        if (signal.category === 'risk' && account.status !== 'Good') return true;
        return signal.severity === 'medium' && account.status === 'Watch';
      });

      // Generate AI recommendations for each affected account
      if (affectedAccounts.length === 0) {
        toast.warning('No affected accounts found for this signal', {
          description: 'Signal may not impact current account portfolio'
        });
        setIsLoadingAI(false);
        return;
      }

      console.log('Attempting AI generation with:', {
        signal: signal.signalName || signal.type,
        affectedAccountsCount: affectedAccounts.length,
        sparkAvailable: typeof (window as any).spark !== 'undefined'
      });

      // Check if spark AI is available
      if (typeof window === 'undefined') {
        throw new Error('Window context not available');
      }
      
      if (!(window as any).spark) {
        throw new Error('Spark runtime not initialized - please refresh the page');
      }
      
      const spark = (window as any).spark;
      if (!spark.llmPrompt) {
        throw new Error('AI prompt service not available');
      }
      
      if (!spark.llm) {
        throw new Error('AI language model service not available');
      }

      console.log('Spark AI service available, generating prompt...');

      const prompt = spark.llmPrompt`You are a Customer Success AI expert specializing in business value signal analysis. 

Signal Analysis Request:
${JSON.stringify(signal, null, 2)}

Affected Accounts:
${JSON.stringify(affectedAccounts.slice(0, 5), null, 2)}

Additional Context:
- Signal Category: ${signal.category}
- Severity: ${signal.severity} 
- Signal Value: ${signal.value}${signal.unit || ''}
- Description: ${signal.description || 'No description available'}

Generate 2-4 specific, actionable recommendations for addressing this signal across the affected accounts. Consider:
1. The business value impact (cost, agility, data quality, risk, culture)
2. Account health and status 
3. Signal severity and trends
4. Customer Success best practices
5. Measurable outcomes

Return JSON with this structure:
{
  "signalAnalysis": {
    "impact": "Business impact summary",
    "urgency": "low|medium|high|critical",
    "affectedAccountsCount": ${affectedAccounts.length},
    "businessValueAtRisk": "Quantified business value at risk"
  },
  "recommendations": [
    {
      "title": "Specific action title",
      "description": "Detailed action description with context to this signal",
      "priority": "low|medium|high|critical", 
      "category": "engagement|retention|expansion|support|onboarding|optimization",
      "targetAccounts": ["account names or 'all affected accounts'"],
      "estimatedImpact": "Expected business value improvement",
      "effort": "low|medium|high",
      "timeline": "Expected completion time",
      "successMetrics": ["Metric 1", "Metric 2"],
      "reasoning": "Why this addresses the signal specifically"
    }
  ]
}`;

      console.log('Calling spark.llm with model gpt-4o and jsonMode=true...');
      const response = await spark.llm(prompt, 'gpt-4o', true);
      console.log('AI Response received:', response);
      
      const aiResponse = JSON.parse(response);
      console.log('Parsed AI Response:', aiResponse);

      // Store the AI-generated recommendations for display
      setAiRecommendations(aiResponse.recommendations || []);
      setAiAnalysis(aiResponse.signalAnalysis || {});

      toast.success(`Generated ${aiResponse.recommendations?.length || 0} AI recommendations`, {
        description: `For signal: ${signal.signalName || signal.type}`
      });

    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      
      let errorMessage = 'Unknown error occurred';
      let detailedError = '';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide specific guidance based on the error
        if (errorMessage.includes('Spark runtime not initialized')) {
          detailedError = 'The AI runtime needs to be initialized. Try refreshing the page or restarting the application.';
        } else if (errorMessage.includes('prompt service not available')) {
          detailedError = 'The AI prompt service is not configured. This may be a temporary issue.';
        } else if (errorMessage.includes('language model service not available')) {
          detailedError = 'The AI model service is not available. Please check your connection and try again.';
        } else if (errorMessage.includes('Window context not available')) {
          detailedError = 'This feature requires a browser environment. Server-side rendering is not supported.';
        } else {
          detailedError = 'Please try again in a few moments. If the issue persists, contact support.';
        }
      }
      
      console.log('Error details:', {
        message: errorMessage,
        detailedError,
        sparkAvailable: typeof (window as any).spark !== 'undefined',
        llmPromptAvailable: typeof (window as any).spark?.llmPrompt !== 'undefined',
        llmAvailable: typeof (window as any).spark?.llm !== 'undefined'
      });
      
      // Find affected accounts again for error fallback
      const errorFallbackAccounts = accounts.filter(account => {
        if (signal.accountId && signal.accountId === account.id) return true;
        if (signal.severity === 'critical' && account.status === 'At Risk') return true;
        if (signal.severity === 'high' && (account.status === 'At Risk' || account.status === 'Watch')) return true;
        if (signal.category === 'cost' && account.healthScore < 0.7) return true;
        if (signal.category === 'risk' && account.status !== 'Good') return true;
        return signal.severity === 'medium' && account.status === 'Watch';
      });
      
      // Set error state with fallback recommendations
      setAiAnalysis({ 
        impact: 'AI generation failed - using fallback analysis',
        urgency: signal.severity as any,
        affectedAccountsCount: errorFallbackAccounts.length,
        businessValueAtRisk: 'Unable to calculate due to AI error',
        error: `${errorMessage}${detailedError ? ` - ${detailedError}` : ''}`
      });
      
      // Provide fallback recommendations based on signal type and severity
      const fallbackRecommendations: AIRecommendation[] = generateFallbackRecommendations(signal, errorFallbackAccounts);
      setAiRecommendations(fallbackRecommendations);
      
      toast.error(`AI generation failed: ${errorMessage}`, {
        description: detailedError || 'Showing fallback recommendations instead'
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleRetryAI = () => {
    if (selectedSignal) {
      generateRecommendationsForSignal(selectedSignal);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSignal(null);
    setAiRecommendations([]);
    setAiAnalysis(null);
    setIsLoadingAI(false);
  };

  const checkTargetCompliance = (signal: Signal, target: SignalTarget): 'on_track' | 'missed' | 'unknown' => {
    if (signal.value === undefined) return 'unknown';
    
    switch (target.threshold) {
      case 'below':
        return signal.value <= target.targetValue ? 'on_track' : 'missed';
      case 'above':
        return signal.value >= target.targetValue ? 'on_track' : 'missed';
      case 'exactly':
        return Math.abs(signal.value - target.targetValue) < 0.1 ? 'on_track' : 'missed';
      default:
        return 'unknown';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cost': return <CurrencyDollar className="w-5 h-5 text-emerald-600" />;
      case 'agility': return <Rocket className="w-5 h-5 text-blue-600" />;
      case 'data': return <Database className="w-5 h-5 text-purple-600" />;
      case 'risk': return <Shield className="w-5 h-5 text-orange-600" />;
      case 'culture': return <Users className="w-5 h-5 text-pink-600" />;
      default: return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryStats = (): SignalCategoryStats[] => {
    const categories = ['cost', 'agility', 'data', 'risk', 'culture'];
    
    return categories.map(category => {
      const categorySignals = signals.filter(s => s.category === category || s.type === category);
      const categoryTargets = safeTargets.filter(t => t.category === category);
      
      const severityCounts = {
        critical: categorySignals.filter(s => s.severity === 'critical').length,
        high: categorySignals.filter(s => s.severity === 'high').length,
        medium: categorySignals.filter(s => s.severity === 'medium').length,
        low: categorySignals.filter(s => s.severity === 'low').length
      };
      
      // Calculate average value for signals with numeric values
      const signalsWithValues = categorySignals.filter(s => s.value !== undefined);
      const averageValue = signalsWithValues.length > 0 
        ? signalsWithValues.reduce((sum, s) => sum + (s.value || 0), 0) / signalsWithValues.length
        : undefined;
      
      // Determine trending based on recent signals (simplified for demo)
      const recentSignals = categorySignals.slice(0, 5);
      const improvingCount = recentSignals.filter(s => s.trend === 'improving').length;
      const decliningCount = recentSignals.filter(s => s.trend === 'declining').length;
      
      let trending: 'up' | 'down' | 'stable' = 'stable';
      if (improvingCount > decliningCount) trending = 'up';
      else if (decliningCount > improvingCount) trending = 'down';
      
      // Calculate target compliance
      let targetsOnTrack = 0;
      let targetsMissed = 0;
      
      categoryTargets.forEach(target => {
        const matchingSignals = categorySignals.filter(s => 
          s.signalName === target.signalName || s.type === target.signalName.toLowerCase().replace(/\s+/g, '_')
        );
        
        if (matchingSignals.length > 0) {
          const latestSignal = matchingSignals[0]; // Most recent
          const compliance = checkTargetCompliance(latestSignal, target);
          if (compliance === 'on_track') targetsOnTrack++;
          else if (compliance === 'missed') targetsMissed++;
        }
      });

      return {
        category,
        count: categorySignals.length,
        ...severityCounts,
        averageValue,
        unit: signalsWithValues[0]?.unit,
        trending,
        targetsConfigured: categoryTargets.length,
        targetsOnTrack,
        targetsMissed,
        signals: categorySignals
      };
    });
  };

  const categoryStats = getCategoryStats();
  const totalSignals = signals.length;
  const criticalSignals = signals.filter(s => s.severity === 'critical').length;
  const totalTargets = safeTargets.length;
  const totalOnTrack = categoryStats.reduce((sum, cat) => sum + cat.targetsOnTrack, 0);
  const totalMissed = categoryStats.reduce((sum, cat) => sum + cat.targetsMissed, 0);
  const targetCompliance = totalTargets > 0 ? Math.round((totalOnTrack / totalTargets) * 100) : 0;

  return (
    <Card className="flex flex-col border-visible h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Business Value Signal Dashboard
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total Signals: {totalSignals}</span>
            <span>Critical: {criticalSignals}</span>
            <span>Targets: {totalTargets}</span>
            <Badge variant={criticalSignals > 5 ? "destructive" : "secondary"}>
              {criticalSignals > 5 ? "High Alert" : "Normal"}
            </Badge>
            {totalTargets > 0 && (
              <Badge variant={targetCompliance >= 80 ? "default" : targetCompliance >= 60 ? "secondary" : "destructive"}>
                {targetCompliance}% Target Compliance
              </Badge>
            )}
            {totalTargets > 0 && (
              <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <Target className="w-3 h-3 mr-1 text-green-600" />
                AI Target-Enhanced
              </Badge>
            )}
          </div>
          <TargetSettingsDialog />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-4">
          {categoryStats.map(stats => (
            <Card key={stats.category} className="border-l-4 border-l-primary/20 border-visible">
              <CardContent className="p-4">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full p-0 h-auto justify-start"
                      onClick={() => toggleCategory(stats.category)}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(stats.category)}
                          <div className="text-left">
                            <h4 className="font-semibold capitalize">{stats.category}</h4>
                            <p className="text-sm text-muted-foreground">
                              {stats.count} active signal{stats.count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {stats.averageValue !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              Avg: {Math.round(stats.averageValue * 10) / 10}{stats.unit}
                            </Badge>
                          )}
                          {stats.targetsConfigured > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              {stats.targetsOnTrack}/{stats.targetsConfigured}
                            </Badge>
                          )}
                          {getTrendIcon(stats.trending)}
                          {expandedCategories.has(stats.category) ? (
                            <CaretUp className="w-4 h-4" />
                          ) : (
                            <CaretDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  {/* Target Progress Bar */}
                  {stats.targetsConfigured > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Target Compliance</span>
                        <span className="font-medium">
                          {stats.targetsOnTrack}/{stats.targetsConfigured} targets met
                        </span>
                      </div>
                      <Progress 
                        value={(stats.targetsOnTrack / stats.targetsConfigured) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                    <div className="text-center p-2 rounded bg-red-50">
                      <div className="font-bold text-red-700">{stats.critical}</div>
                      <div className="text-red-600">Critical</div>
                    </div>
                    <div className="text-center p-2 rounded bg-orange-50">
                      <div className="font-bold text-orange-700">{stats.high}</div>
                      <div className="text-orange-600">High</div>
                    </div>
                    <div className="text-center p-2 rounded bg-yellow-50">
                      <div className="font-bold text-yellow-700">{stats.medium}</div>
                      <div className="text-yellow-600">Medium</div>
                    </div>
                    <div className="text-center p-2 rounded bg-blue-50">
                      <div className="font-bold text-blue-700">{stats.low}</div>
                      <div className="text-blue-600">Low</div>
                    </div>
                  </div>

                  <CollapsibleContent>
                    {stats.signals.length > 0 && (
                      <div className="space-y-2 mt-4 border-t pt-4">
                        <h5 className="text-sm font-medium flex items-center gap-2">
                          <Brain className="w-4 h-4 text-primary" />
                          Active Signals & AI Recommendations
                        </h5>
                        
                        {stats.signals.slice(0, 5).map((signal, index) => {
                          const signalMap = getSignalRecommendations(signal);
                          
                          return (
                            <div key={index} className="p-3 border rounded-lg bg-muted/20">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={
                                      signal.severity === 'critical' ? 'destructive' :
                                      signal.severity === 'high' ? 'default' :
                                      signal.severity === 'medium' ? 'secondary' : 'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {signal.severity}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    {signal.signalName || signal.type}
                                  </span>
                                  {signal.value !== undefined && (
                                    <span className="text-xs text-muted-foreground">
                                      {signal.value}{signal.unit}
                                    </span>
                                  )}
                                </div>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => generateRecommendationsForSignal(signal)}
                                  className="text-xs h-7"
                                >
                                  <Lightbulb className="w-3 h-3 mr-1" />
                                  View AI Recommendations
                                </Button>
                              </div>
                              
                              {signalMap.recommendations.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1 mb-1">
                                    <ArrowRight className="w-3 h-3" />
                                    {signalMap.recommendations.length} related recommendation{signalMap.recommendations.length !== 1 ? 's' : ''}
                                    {signalMap.accounts.length > 0 && (
                                      <span> affecting {signalMap.accounts.length} account{signalMap.accounts.length !== 1 ? 's' : ''}</span>
                                    )}
                                  </div>
                                  {signalMap.recommendations.slice(0, 2).map((nba, nbaIndex) => (
                                    <div key={nbaIndex} className="ml-4 text-xs text-blue-600">
                                      • {nba.title}
                                    </div>
                                  ))}
                                  {signalMap.recommendations.length > 2 && (
                                    <div className="ml-4 text-xs text-muted-foreground">
                                      +{signalMap.recommendations.length - 2} more...
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {signal.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {signal.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                        
                        {stats.signals.length > 5 && (
                          <div className="text-center text-xs text-muted-foreground py-2">
                            +{stats.signals.length - 5} more signals in this category
                          </div>
                        )}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
                
                {(stats.count > 0 || stats.targetsConfigured > 0) && (
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    {stats.count > 0 && (
                      <div>
                        Most common: {(() => {
                          const signalCounts = signals
                            .filter(s => s.category === stats.category || s.type === stats.category)
                            .reduce((acc, signal) => {
                              const name = signal.signalName || signal.type;
                              acc[name] = (acc[name] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);
                          
                          const topSignal = Object.entries(signalCounts)
                            .sort(([,a], [,b]) => b - a)[0];
                          
                          return topSignal ? topSignal[0] : 'N/A';
                        })()}
                      </div>
                    )}
                    {stats.targetsConfigured > 0 && (
                      <div className="flex items-center gap-1">
                        {stats.targetsOnTrack > 0 && (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            {stats.targetsOnTrack} on track
                          </span>
                        )}
                        {stats.targetsMissed > 0 && (
                          <span className="inline-flex items-center gap-1 text-red-600 ml-2">
                            <Warning className="w-3 h-3" />
                            {stats.targetsMissed} missed
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {categoryStats.every(s => s.count === 0 && s.targetsConfigured === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No business value signals or targets configured yet.</p>
              <p className="text-sm">Start the live signal stream or configure targets to see data.</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* AI Recommendations Dialog */}
      <AIRecommendationsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        signal={selectedSignal}
        recommendations={aiRecommendations}
        analysis={aiAnalysis}
        isLoading={isLoadingAI}
        onRetry={handleRetryAI}
      />
    </Card>
  );
}
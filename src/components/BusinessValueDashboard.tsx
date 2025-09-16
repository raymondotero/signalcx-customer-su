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

  const generateRecommendationsForSignal = async (signal: Signal) => {
    setSelectedSignal(signal);
    
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
        return;
      }

      console.log('Attempting AI generation with:', {
        signal: signal.signalName || signal.type,
        affectedAccountsCount: affectedAccounts.length,
        sparkAvailable: typeof (window as any).spark !== 'undefined'
      });

      // Check if spark AI is available
      if (typeof window === 'undefined' || !(window as any).spark) {
        throw new Error('Spark runtime not available');
      }
      
      const spark = (window as any).spark;
      if (!spark.llmPrompt || !spark.llm) {
        throw new Error('AI service not available - llmPrompt or llm missing');
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
      setSelectedSignal({
        ...signal,
        aiRecommendations: aiResponse.recommendations || [],
        aiAnalysis: aiResponse.signalAnalysis || {}
      });

      toast.success(`Generated ${aiResponse.recommendations?.length || 0} AI recommendations`, {
        description: `For signal: ${signal.signalName || signal.type}`
      });

    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('Error details:', {
        message: errorMessage,
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
      
      // Fall back to existing logic 
      const signalMap = getSignalRecommendations(signal);
      
      if (signalMap.recommendations.length === 0) {
        toast.error(`AI generation failed: ${errorMessage}`, {
          description: 'No related recommendations found. Try the real-time AI engine.'
        });
        
        // Set a placeholder to show the error state
        setSelectedSignal({
          ...signal,
          aiRecommendations: [],
          aiAnalysis: { 
            impact: 'AI generation failed',
            urgency: signal.severity as any,
            affectedAccountsCount: errorFallbackAccounts.length,
            businessValueAtRisk: 'Unable to calculate due to AI error',
            error: errorMessage
          }
        });
      } else {
        toast.warning(`AI generation failed, showing ${signalMap.recommendations.length} related recommendations`, {
          description: `Error: ${errorMessage}`
        });
        
        // Show existing recommendations with error note
        setSelectedSignal({
          ...signal,
          aiRecommendations: [],
          aiAnalysis: { 
            impact: 'Using fallback recommendations due to AI error',
            urgency: signal.severity as any,
            affectedAccountsCount: errorFallbackAccounts.length,
            businessValueAtRisk: 'Calculation unavailable',
            error: errorMessage
          }
        });
      }
    }
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
          
          {/* Selected Signal Recommendations Detail */}
          {selectedSignal && (
            <Card className="border-visible border-2 border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="w-5 h-5" />
                  AI Recommendations for {selectedSignal.signalName || selectedSignal.type}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedSignal(null)}
                    className="ml-auto"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Show AI-generated recommendations if available
                  if (selectedSignal.aiRecommendations && selectedSignal.aiRecommendations.length > 0) {
                    return (
                      <div className="space-y-6">
                        {/* AI Analysis Summary */}
                        {selectedSignal.aiAnalysis && (
                          <div className={`p-4 border rounded-lg ${
                            selectedSignal.aiAnalysis.error 
                              ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' 
                              : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
                          }`}>
                            <h6 className={`font-semibold mb-2 flex items-center gap-2 ${
                              selectedSignal.aiAnalysis.error ? 'text-red-900' : 'text-blue-900'
                            }`}>
                              <Brain className="w-4 h-4" />
                              {selectedSignal.aiAnalysis.error ? 'AI Analysis Error' : 'AI Signal Analysis'}
                            </h6>
                            
                            {selectedSignal.aiAnalysis.error && (
                              <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
                                <strong>Error:</strong> {selectedSignal.aiAnalysis.error}
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className={`font-medium ${selectedSignal.aiAnalysis.error ? 'text-red-700' : 'text-blue-700'}`}>
                                  Business Impact
                                </p>
                                <p className={selectedSignal.aiAnalysis.error ? 'text-red-600' : 'text-blue-600'}>
                                  {selectedSignal.aiAnalysis.impact}
                                </p>
                              </div>
                              <div>
                                <p className={`font-medium ${selectedSignal.aiAnalysis.error ? 'text-red-700' : 'text-blue-700'}`}>
                                  Urgency Level
                                </p>
                                <Badge variant={
                                  selectedSignal.aiAnalysis.urgency === 'critical' ? 'destructive' :
                                  selectedSignal.aiAnalysis.urgency === 'high' ? 'default' : 'secondary'
                                }>
                                  {selectedSignal.aiAnalysis.urgency}
                                </Badge>
                              </div>
                              <div>
                                <p className={`font-medium ${selectedSignal.aiAnalysis.error ? 'text-red-700' : 'text-blue-700'}`}>
                                  Affected Accounts
                                </p>
                                <p className={selectedSignal.aiAnalysis.error ? 'text-red-600' : 'text-blue-600'}>
                                  {selectedSignal.aiAnalysis.affectedAccountsCount}
                                </p>
                              </div>
                              <div>
                                <p className={`font-medium ${selectedSignal.aiAnalysis.error ? 'text-red-700' : 'text-blue-700'}`}>
                                  Value at Risk
                                </p>
                                <p className={selectedSignal.aiAnalysis.error ? 'text-red-600' : 'text-blue-600'}>
                                  {selectedSignal.aiAnalysis.businessValueAtRisk}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Signal Context */}
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline">
                            {selectedSignal.aiRecommendations.length} AI Recommendations
                          </Badge>
                          <Badge variant={selectedSignal.severity === 'critical' ? 'destructive' : 'default'}>
                            {selectedSignal.severity} Priority Signal
                          </Badge>
                          {selectedSignal.value !== undefined && (
                            <Badge variant="outline">
                              Value: {selectedSignal.value}{selectedSignal.unit || ''}
                            </Badge>
                          )}
                        </div>

                        {/* AI Recommendations */}
                        <div className="space-y-4">
                          <h6 className="font-semibold flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            AI-Generated Recommendations
                          </h6>
                          
                          <div className="grid gap-4">
                            {selectedSignal.aiRecommendations.map((recommendation, index) => (
                              <div key={index} className="p-4 border rounded-lg bg-background shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <h6 className="font-medium text-foreground">{recommendation.title}</h6>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={
                                      recommendation.priority === 'critical' ? 'destructive' :
                                      recommendation.priority === 'high' ? 'default' : 'secondary'
                                    } className="text-xs">
                                      {recommendation.priority}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {recommendation.effort} effort
                                    </Badge>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-3">
                                  {recommendation.description}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <p className="font-medium text-foreground">Target Accounts</p>
                                    <p className="text-muted-foreground">
                                      {Array.isArray(recommendation.targetAccounts) 
                                        ? recommendation.targetAccounts.join(', ')
                                        : recommendation.targetAccounts}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <p className="font-medium text-foreground">Timeline</p>
                                    <p className="text-muted-foreground">{recommendation.timeline}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="font-medium text-foreground">Expected Impact</p>
                                    <p className="text-green-600">{recommendation.estimatedImpact}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="font-medium text-foreground">Category</p>
                                    <Badge variant="outline" className="text-xs">
                                      {recommendation.category}
                                    </Badge>
                                  </div>
                                </div>

                                {recommendation.successMetrics && recommendation.successMetrics.length > 0 && (
                                  <div className="mt-3">
                                    <p className="font-medium text-foreground text-xs mb-1">Success Metrics</p>
                                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                                      {recommendation.successMetrics.map((metric, metricIndex) => (
                                        <li key={metricIndex}>{metric}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs text-blue-600 font-medium">AI Reasoning</p>
                                  <p className="text-xs text-muted-foreground italic">
                                    {recommendation.reasoning}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Fall back to existing recommendations if no AI recommendations
                  const signalMap = getSignalRecommendations(selectedSignal);
                  
                  if (signalMap.recommendations.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="font-medium mb-2">No AI recommendations generated yet</p>
                        <p className="text-sm mb-4">
                          Click "View AI Recommendations" on any signal to generate contextual recommendations
                        </p>
                        <Button
                          size="sm"
                          onClick={() => generateRecommendationsForSignal(selectedSignal)}
                          className="mx-auto"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Generate AI Recommendations
                        </Button>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">
                          {signalMap.recommendations.length} Existing Recommendations
                        </Badge>
                        <Badge variant="outline">
                          {signalMap.accounts.length} Affected Accounts
                        </Badge>
                        <Badge variant={selectedSignal.severity === 'critical' ? 'destructive' : 'default'}>
                          {selectedSignal.severity} Priority
                        </Badge>
                      </div>
                      
                      <div className="grid gap-3">
                        {signalMap.recommendations.map((nba, index) => {
                          const account = accounts.find(a => a.id === nba.accountId);
                          return (
                            <div key={index} className="p-3 border rounded-lg bg-background">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="font-medium">{nba.title}</h6>
                                <Badge variant="outline" className="text-xs">
                                  {nba.priority} Priority
                                </Badge>
                              </div>
                              
                              {account && (
                                <div className="text-sm text-muted-foreground mb-2">
                                  Account: {account.name} ({account.status})
                                </div>
                              )}
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {nba.description}
                              </p>
                              
                              {nba.estimatedImpact && (
                                <div className="text-xs text-green-600">
                                  Estimated Impact: {nba.estimatedImpact}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button
                          size="sm"
                          onClick={() => generateRecommendationsForSignal(selectedSignal)}
                          className="w-full"
                          variant="outline"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Generate AI Recommendations for This Signal
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
          
          {categoryStats.every(s => s.count === 0 && s.targetsConfigured === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No business value signals or targets configured yet.</p>
              <p className="text-sm">Start the live signal stream or configure targets to see data.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendUp, TrendDown, Target, Calendar, Brain, 
  Warning, CheckCircle, Clock, Activity, ArrowClockwise 
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Account } from '@/types';
import { HealthTrendVisualizer } from '@/components/HealthTrendVisualizer';
import { toast } from 'sonner';

declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
    };
  }
}

interface HealthForecast {
  accountId: string;
  accountName: string;
  currentScore: number;
  forecastedScores: {
    days30: number;
    days60: number;
    days90: number;
    days180: number;
  };
  confidence: number;
  trend: 'improving' | 'declining' | 'stable';
  riskFactors: string[];
  opportunities: string[];
  predictedStatus: 'Good' | 'Watch' | 'At Risk';
  lastUpdated: string;
  interventionRecommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: number;
    timeframe: string;
  }[];
}

interface ForecastingProps {
  accounts: Account[];
  selectedAccount?: Account;
}

export function HealthScoreForecast({ accounts, selectedAccount }: ForecastingProps) {
  const [forecasts, setForecasts] = useKV<HealthForecast[]>('health-forecasts', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeframe, setTimeframe] = useState<'30' | '60' | '90' | '180'>('90');
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [progressStep, setProgressStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  useEffect(() => {
    // Generate initial forecasts if none exist
    if (accounts.length > 0 && (!forecasts || forecasts.length === 0)) {
      generateForecasts();
    }
    
    // Auto-refresh forecasts when accounts change significantly
    if (accounts.length > 0 && forecasts && forecasts.length > 0) {
      const accountsChanged = accounts.some(account => {
        const existingForecast = forecasts.find(f => f.accountId === account.id);
        return !existingForecast || 
               Math.abs(existingForecast.currentScore - account.healthScore) >= 10;
      });
      
      if (accountsChanged) {
        console.log('Significant account changes detected, refreshing forecasts');
        generateForecasts();
      }
    }
  }, [accounts]);

  const generateForecasts = async () => {
    setIsGenerating(true);
    setProgressStep('Initializing forecast generation...');
    toast.info('Generating updated health forecasts...');
    
    try {
      const newForecasts: HealthForecast[] = [];
      const totalAccounts = accounts.length;
      
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const progress = Math.round(((i + 1) / totalAccounts) * 100);
        setProgressPercent(progress);
        setProgressStep(`Processing ${account.name} (${i + 1}/${totalAccounts})`);
        
        // Add a small delay for demo effect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Calculate trend based on current signals and health score
        const trend = calculateTrend(account);
        const riskFactors = identifyRiskFactors(account);
        const opportunities = identifyOpportunities(account);
        
        // Check if AI is available, otherwise use rule-based forecasting
        let forecast: HealthForecast;
        
        if (window.spark?.llm) {
          try {
            setProgressStep(`Generating AI forecast for ${account.name}...`);
            // Generate AI-powered forecast
            const prompt = window.spark.llmPrompt`
              Analyze this customer account and predict health score trajectory:
              
              Account: ${account.name}
              Current Health Score: ${account.healthScore}
              Current Status: ${account.status}
              Industry: ${account.industry}
              ARR: $${account.arr.toLocaleString()}
              Contract End: ${account.contractEnd}
              
              Risk Factors: ${riskFactors.join(', ')}
              Opportunities: ${opportunities.join(', ')}
              
              Predict health scores for 30, 60, 90, and 180 days with confidence level.
              Consider industry patterns, contract timeline, and current trajectory.
              
              Return JSON format:
              {
                "forecastedScores": {
                  "days30": number,
                  "days60": number, 
                  "days90": number,
                  "days180": number
                },
                "confidence": number (0-100),
                "predictedStatus": "Good" | "Watch" | "At Risk",
                "interventionRecommendations": [
                  {
                    "priority": "high" | "medium" | "low",
                    "action": "specific action description",
                    "expectedImpact": number (0-100),
                    "timeframe": "immediate" | "30 days" | "60 days" | "90 days"
                  }
                ]
              }
            `;

            const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
            const aiResult = JSON.parse(response);
            
            forecast = {
              accountId: account.id,
              accountName: account.name,
              currentScore: account.healthScore,
              forecastedScores: aiResult.forecastedScores,
              confidence: aiResult.confidence,
              trend,
              riskFactors,
              opportunities,
              predictedStatus: aiResult.predictedStatus,
              lastUpdated: new Date().toISOString(),
              interventionRecommendations: aiResult.interventionRecommendations || []
            };
          } catch (aiError) {
            console.warn('AI forecast failed, using rule-based forecast:', aiError);
            setProgressStep(`Generating rule-based forecast for ${account.name}...`);
            // Fallback to enhanced rule-based forecast
            forecast = generateEnhancedRuleBasedForecast(account, trend, riskFactors, opportunities);
          }
        } else {
          setProgressStep(`Generating rule-based forecast for ${account.name}...`);
          // Use enhanced rule-based forecast when AI is not available
          forecast = generateEnhancedRuleBasedForecast(account, trend, riskFactors, opportunities);
        }
        
        newForecasts.push(forecast);
      }
      
      setProgressStep('Finalizing forecasts...');
      setForecasts(newForecasts);
      setLastUpdateTime(new Date().toLocaleTimeString());
      toast.success(`Updated health forecasts for ${newForecasts.length} accounts`);
    } catch (error) {
      console.error('Error generating forecasts:', error);
      toast.error('Failed to generate health forecasts');
    } finally {
      setIsGenerating(false);
      setProgressStep('');
      setProgressPercent(0);
    }
  };

  const generateEnhancedRuleBasedForecast = (
    account: Account, 
    trend: 'improving' | 'declining' | 'stable',
    riskFactors: string[],
    opportunities: string[]
  ): HealthForecast => {
    // Add some randomness for demo variety while keeping it realistic
    const randomVariation = () => (Math.random() - 0.5) * 8; // Reduced variation for more realistic forecasts
    const baseScores = generateRuleBasedForecast(account);
    
    // Apply variations based on risk factors and opportunities
    const riskImpact = riskFactors.length * -3;
    const opportunityImpact = opportunities.length * 4;
    const netImpact = riskImpact + opportunityImpact;
    
    // Industry-specific modifiers for demo purposes
    let industryModifier = 0;
    if (account.industry === 'Technology') industryModifier = 2;
    if (account.industry === 'Financial Services') industryModifier = -1;
    if (account.industry === 'Healthcare') industryModifier = 1;
    
    const enhancedScores = {
      days30: Math.max(10, Math.min(100, Math.round(baseScores.days30 + netImpact + industryModifier + randomVariation()))),
      days60: Math.max(10, Math.min(100, Math.round(baseScores.days60 + netImpact + industryModifier + randomVariation()))),
      days90: Math.max(10, Math.min(100, Math.round(baseScores.days90 + netImpact + industryModifier + randomVariation()))),
      days180: Math.max(10, Math.min(100, Math.round(baseScores.days180 + netImpact + industryModifier + randomVariation())))
    };

    // Calculate confidence based on data quality and account characteristics
    let baseConfidence = 75;
    if (account.arr > 1000000) baseConfidence += 10; // Higher confidence for large accounts
    if (account.healthScore > 80) baseConfidence += 5; // Higher confidence for healthy accounts
    if (riskFactors.length > 3) baseConfidence -= 15; // Lower confidence with many risks
    if (opportunities.length > 2) baseConfidence += 5; // Higher confidence with opportunities
    
    const confidence = Math.max(45, Math.min(95, 
      Math.round(baseConfidence + Math.random() * 10 - 5)
    ));

    // Determine predicted status based on 90-day forecast
    let predictedStatus: 'Good' | 'Watch' | 'At Risk';
    if (enhancedScores.days90 >= 75) predictedStatus = 'Good';
    else if (enhancedScores.days90 >= 60) predictedStatus = 'Watch';
    else predictedStatus = 'At Risk';

    return {
      accountId: account.id,
      accountName: account.name,
      currentScore: account.healthScore,
      forecastedScores: enhancedScores,
      confidence,
      trend,
      riskFactors,
      opportunities,
      predictedStatus,
      lastUpdated: new Date().toISOString(),
      interventionRecommendations: generateEnhancedInterventions(account, riskFactors, opportunities)
    };
  };

  const calculateTrend = (account: Account): 'improving' | 'declining' | 'stable' => {
    // Simple trend calculation based on health score thresholds
    if (account.healthScore >= 80) return 'improving';
    if (account.healthScore <= 60) return 'declining';
    return 'stable';
  };

  const identifyRiskFactors = (account: Account): string[] => {
    const factors: string[] = [];
    
    if (account.healthScore < 70) factors.push('Low health score');
    if (account.status === 'At Risk') factors.push('Current at-risk status');
    if (new Date(account.contractEnd) < new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)) {
      factors.push('Contract renewal approaching');
    }
    if (account.arr < 100000) factors.push('Low ARR account');
    
    return factors;
  };

  const identifyOpportunities = (account: Account): string[] => {
    const opportunities: string[] = [];
    
    if (account.healthScore > 80) opportunities.push('High engagement potential');
    if (account.arr > 500000) opportunities.push('Strategic account expansion');
    if (account.status === 'Good') opportunities.push('Upsell opportunity');
    
    return opportunities;
  };

  const generateRuleBasedForecast = (account: Account) => {
    const current = account.healthScore;
    const trend = calculateTrend(account);
    
    let modifier = 0;
    if (trend === 'improving') modifier = 1;
    if (trend === 'declining') modifier = -1;
    
    return {
      days30: Math.max(0, Math.min(100, current + (modifier * 5))),
      days60: Math.max(0, Math.min(100, current + (modifier * 8))),
      days90: Math.max(0, Math.min(100, current + (modifier * 12))),
      days180: Math.max(0, Math.min(100, current + (modifier * 20)))
    };
  };

  const predictFutureStatus = (account: Account): 'Good' | 'Watch' | 'At Risk' => {
    const forecast = generateRuleBasedForecast(account);
    const futureScore = forecast.days90;
    
    if (futureScore >= 80) return 'Good';
    if (futureScore >= 65) return 'Watch';
    return 'At Risk';
  };

  const generateEnhancedInterventions = (
    account: Account, 
    riskFactors: string[], 
    opportunities: string[]
  ): {
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: number;
    timeframe: string;
  }[] => {
    const interventions: {
      priority: 'high' | 'medium' | 'low';
      action: string;
      expectedImpact: number;
      timeframe: string;
    }[] = [];
    
    // High priority interventions for critical issues
    if (account.healthScore < 60) {
      interventions.push({
        priority: 'high' as const,
        action: 'Immediate executive escalation and recovery plan',
        expectedImpact: 25,
        timeframe: 'immediate'
      });
    }
    
    if (account.healthScore < 70) {
      interventions.push({
        priority: 'high' as const,
        action: 'Schedule immediate health check meeting with stakeholders',
        expectedImpact: 15,
        timeframe: 'immediate'
      });
    }
    
    // Contract renewal approaching
    if (new Date(account.contractEnd) < new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)) {
      interventions.push({
        priority: 'high' as const,
        action: 'Initiate renewal discussions and value demonstration',
        expectedImpact: 20,
        timeframe: '30 days'
      });
    }
    
    // Medium priority interventions
    if (account.status === 'Watch') {
      interventions.push({
        priority: 'medium' as const,
        action: 'Increase touchpoint frequency and engagement tracking',
        expectedImpact: 12,
        timeframe: '30 days'
      });
    }
    
    if (riskFactors.length > 2) {
      interventions.push({
        priority: 'medium' as const,
        action: 'Develop comprehensive risk mitigation strategy',
        expectedImpact: 18,
        timeframe: '60 days'
      });
    }
    
    // Opportunity-based interventions
    if (opportunities.length > 0) {
      if (account.arr > 500000) {
        interventions.push({
          priority: 'medium' as const,
          action: 'Explore strategic partnership and expansion opportunities',
          expectedImpact: 15,
          timeframe: '90 days'
        });
      }
      
      if (account.healthScore > 80) {
        interventions.push({
          priority: 'low' as const,
          action: 'Leverage success for case study and upsell discussions',
          expectedImpact: 8,
          timeframe: '60 days'
        });
      }
    }
    
    // Industry-specific interventions
    if (account.industry === 'Technology') {
      interventions.push({
        priority: 'low' as const,
        action: 'Share latest product roadmap and innovation updates',
        expectedImpact: 10,
        timeframe: '30 days'
      });
    }
    
    if (account.industry === 'Financial Services') {
      interventions.push({
        priority: 'medium' as const,
        action: 'Conduct compliance and security deep-dive session',
        expectedImpact: 14,
        timeframe: '60 days'
      });
    }
    
    return interventions;
  };

  const generateInterventions = (account: Account): {
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: number;
    timeframe: string;
  }[] => {
    const riskFactors = identifyRiskFactors(account);
    const opportunities = identifyOpportunities(account);
    return generateEnhancedInterventions(account, riskFactors, opportunities);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'text-green-600';
      case 'Watch': return 'text-yellow-600';
      case 'At Risk': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredForecasts = forecasts?.filter(forecast => {
    if (selectedAccount && forecast.accountId !== selectedAccount.id) return false;
    if (filterRisk === 'all') return true;
    
    const riskLevel = forecast.confidence > 80 ? 'low' : 
                     forecast.confidence > 60 ? 'medium' : 'high';
    return riskLevel === filterRisk;
  }) || [];

  const getForecastSummary = () => {
    if (!forecasts || forecasts.length === 0) return null;
    
    const improving = forecasts.filter(f => f.trend === 'improving').length;
    const declining = forecasts.filter(f => f.trend === 'declining').length;
    const stable = forecasts.filter(f => f.trend === 'stable').length;
    
    const highRisk = forecasts.filter(f => f.predictedStatus === 'At Risk').length;
    const watch = forecasts.filter(f => f.predictedStatus === 'Watch').length;
    const good = forecasts.filter(f => f.predictedStatus === 'Good').length;
    
    const avgConfidence = Math.round(
      forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
    );
    
    return { improving, declining, stable, highRisk, watch, good, avgConfidence };
  };

  const summary = getForecastSummary();

  const selectedForecast = selectedAccount ? 
    forecasts?.find(f => f.accountId === selectedAccount.id) : null;

  return (
    <Card className="border-visible h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Health Score Forecasting
            </CardTitle>
            {lastUpdateTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdateTime}
              </p>
            )}
          </div>
          <Button 
            onClick={generateForecasts}
            disabled={isGenerating}
            size="sm"
            className="relative"
          >
            {isGenerating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Update Forecasts
              </>
            )}
          </Button>
        </div>
        {isGenerating && progressStep && (
          <div className="mt-2 p-3 bg-muted rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground animate-pulse">
                {progressStep}
              </p>
              <p className="text-xs font-medium">
                {progressPercent.toFixed(1)}%
              </p>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {selectedForecast ? (
          // Single account detailed view
          <div className="space-y-6">
            {/* Health Score Visualization */}
            <HealthTrendVisualizer
              currentScore={selectedForecast.currentScore}
              forecast={selectedForecast.forecastedScores}
              confidence={selectedForecast.confidence}
              trend={selectedForecast.trend}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Score</p>
                <p className="text-2xl font-bold">{selectedForecast.currentScore}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Predicted Status</p>
                <Badge className={getStatusColor(selectedForecast.predictedStatus)}>
                  {selectedForecast.predictedStatus}
                </Badge>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Detailed Forecast Breakdown</p>
                <Badge variant="outline">
                  {selectedForecast.confidence.toFixed(1)}% confidence
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>30 days</span>
                    <span className="font-medium">{selectedForecast.forecastedScores.days30}</span>
                  </div>
                  <Progress value={selectedForecast.forecastedScores.days30} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>60 days</span>
                    <span className="font-medium">{selectedForecast.forecastedScores.days60}</span>
                  </div>
                  <Progress value={selectedForecast.forecastedScores.days60} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>90 days</span>
                    <span className="font-medium">{selectedForecast.forecastedScores.days90}</span>
                  </div>
                  <Progress value={selectedForecast.forecastedScores.days90} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>180 days</span>
                    <span className="font-medium">{selectedForecast.forecastedScores.days180}</span>
                  </div>
                  <Progress value={selectedForecast.forecastedScores.days180} />
                </div>
              </div>
            </div>

            {selectedForecast.interventionRecommendations.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Intervention Recommendations</p>
                <div className="space-y-2">
                  {selectedForecast.interventionRecommendations.map((intervention, idx) => (
                    <div key={idx} className="p-2 border rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <Badge 
                          variant={intervention.priority === 'high' ? 'destructive' : 
                                  intervention.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {intervention.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          +{intervention.expectedImpact.toFixed(1)}% impact
                        </span>
                      </div>
                      <p className="text-sm">{intervention.action}</p>
                      <p className="text-xs text-muted-foreground">
                        Timeframe: {intervention.timeframe}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedForecast.riskFactors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Warning className="w-4 h-4 text-yellow-600" />
                  Risk Factors
                </p>
                <div className="space-y-1">
                  {selectedForecast.riskFactors.map((factor, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground">
                      • {factor}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedForecast.opportunities.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Opportunities
                </p>
                <div className="space-y-1">
                  {selectedForecast.opportunities.map((opportunity, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground">
                      • {opportunity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Multi-account overview
          <div className="space-y-4">
            {summary && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-md">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Forecast Trends</p>
                  <div className="flex justify-center gap-2 mt-1">
                    <Badge variant="outline" className="text-green-600">
                      <TrendUp className="w-3 h-3 mr-1" />
                      {summary.improving}
                    </Badge>
                    <Badge variant="outline" className="text-red-600">
                      <TrendDown className="w-3 h-3 mr-1" />
                      {summary.declining}
                    </Badge>
                    <Badge variant="outline" className="text-gray-600">
                      <Activity className="w-3 h-3 mr-1" />
                      {summary.stable}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Predicted Status (90d)</p>
                  <div className="flex justify-center gap-1 mt-1">
                    <Badge className="status-good text-xs">{summary.good}</Badge>
                    <Badge className="status-watch text-xs">{summary.watch}</Badge>
                    <Badge className="status-risk text-xs">{summary.highRisk}</Badge>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                  <div className="flex justify-center items-center gap-1 mt-1">
                    <Progress value={summary.avgConfidence} className="w-16 h-2" />
                    <span className="text-sm font-medium">{summary.avgConfidence.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
              <Select value={filterRisk} onValueChange={(value: any) => setFilterRisk(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={generateForecasts}
                disabled={isGenerating}
                className="text-xs"
              >
                <ArrowClockwise className="w-3 h-3 mr-1" />
                Refresh All
              </Button>
            </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredForecasts.map((forecast) => (
                <div key={forecast.accountId} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{forecast.accountName}</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(forecast.trend)}
                      <Badge variant="outline" className="text-xs">
                        {forecast.confidence.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-medium">{forecast.currentScore}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{timeframe} days</p>
                      <p className="font-medium">
                        {forecast.forecastedScores[`days${timeframe}` as keyof typeof forecast.forecastedScores]}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Predicted</p>
                      <Badge className={getStatusColor(forecast.predictedStatus)} variant="outline">
                        {forecast.predictedStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
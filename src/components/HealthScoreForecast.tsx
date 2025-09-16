import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendUp, TrendDown, Target, Calendar, Brain, 
  Warning, CheckCircle, Clock, Activity 
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
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    // Generate initial forecasts if none exist
    if (accounts.length > 0 && (!forecasts || forecasts.length === 0)) {
      generateForecasts();
    }
  }, [accounts]);

  const generateForecasts = async () => {
    if (!window.spark?.llm) {
      toast.error('AI services not available');
      return;
    }

    setIsGenerating(true);
    
    try {
      const newForecasts: HealthForecast[] = [];
      
      for (const account of accounts) {
        // Calculate trend based on current signals and health score
        const trend = calculateTrend(account);
        const riskFactors = identifyRiskFactors(account);
        const opportunities = identifyOpportunities(account);
        
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

        try {
          const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
          const aiResult = JSON.parse(response);
          
          const forecast: HealthForecast = {
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
          
          newForecasts.push(forecast);
        } catch (error) {
          // Fallback to rule-based forecast if AI fails
          const forecast: HealthForecast = {
            accountId: account.id,
            accountName: account.name,
            currentScore: account.healthScore,
            forecastedScores: generateRuleBasedForecast(account),
            confidence: 75,
            trend,
            riskFactors,
            opportunities,
            predictedStatus: predictFutureStatus(account),
            lastUpdated: new Date().toISOString(),
            interventionRecommendations: generateInterventions(account)
          };
          
          newForecasts.push(forecast);
        }
      }
      
      setForecasts(newForecasts);
      toast.success(`Generated health forecasts for ${newForecasts.length} accounts`);
    } catch (error) {
      console.error('Error generating forecasts:', error);
      toast.error('Failed to generate health forecasts');
    } finally {
      setIsGenerating(false);
    }
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

  const generateInterventions = (account: Account): {
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
    
    if (account.healthScore < 70) {
      interventions.push({
        priority: 'high' as const,
        action: 'Schedule immediate health check meeting',
        expectedImpact: 15,
        timeframe: 'immediate'
      });
    }
    
    if (account.status === 'Watch') {
      interventions.push({
        priority: 'medium' as const,
        action: 'Increase engagement frequency',
        expectedImpact: 10,
        timeframe: '30 days'
      });
    }
    
    return interventions;
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

  const selectedForecast = selectedAccount ? 
    forecasts?.find(f => f.accountId === selectedAccount.id) : null;

  return (
    <Card className="border-visible h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Health Score Forecasting
          </CardTitle>
          <Button 
            onClick={generateForecasts}
            disabled={isGenerating}
            size="sm"
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
                  {selectedForecast.confidence}% confidence
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
                          +{intervention.expectedImpact}% impact
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
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredForecasts.map((forecast) => (
                <div key={forecast.accountId} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{forecast.accountName}</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(forecast.trend)}
                      <Badge variant="outline" className="text-xs">
                        {forecast.confidence}%
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
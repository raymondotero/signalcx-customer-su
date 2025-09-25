import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendUp, TrendDown, Warning, Target, Activity, Calendar, ChartLine } from '@phosphor-icons/react';
import { useSignals, useAccounts } from '@/hooks/useData';
import { Signal, Account } from '@/types';
import { PredictiveAnalyticsService } from '@/services/predictiveAnalytics';
import { TrendForecastChart } from './TrendForecastChart';
import { toast } from 'sonner';

// Heat map intensity levels
type IntensityLevel = 'low' | 'medium' | 'high' | 'critical';

interface PredictiveDataPoint {
  accountId: string;
  accountName: string;
  signalType: string;
  category: string;
  currentIntensity: number;
  predictedIntensity: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  riskLevel: IntensityLevel;
  confidenceScore: number;
  forecastPeriod: string;
  contributingFactors: string[];
}

interface HeatMapCell {
  accountId: string;
  accountName: string;
  signalType: string;
  category: string;
  intensity: number;
  riskLevel: IntensityLevel;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidenceScore: number;
}

// Signal categories for grouping
const SIGNAL_CATEGORIES = [
  'Cost Optimization',
  'Development Agility', 
  'Data Intelligence',
  'Risk Management',
  'Culture & Engagement'
];

// Key signal types for heat map display
const KEY_SIGNALS = [
  'Cloud Spend Variance',
  'Release Frequency',
  'Data Freshness (Hours)',
  'Open Critical Vulns',
  'Executive Sponsor Present',
  'License Utilization',
  'Change Failure Rate',
  'API Calls 30d',
  'MFA Coverage',
  'Training Hours Last 90d'
];

export const PredictiveHeatMap: React.FC = () => {
  const { signals } = useSignals();
  const { accounts } = useAccounts();
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [heatMapData, setHeatMapData] = useState<HeatMapCell[]>([]);
  const [predictions, setPredictions] = useState<PredictiveDataPoint[]>([]);
  const [correlations, setCorrelations] = useState<Array<{
    signal1: string;
    signal2: string;
    correlation: number;
    strength: 'weak' | 'moderate' | 'strong';
    predictivePower: number;
  }>>([]);

  // Generate predictive analysis using advanced analytics service
  const generatePredictions = async () => {
    setIsGenerating(true);
    try {
      const newPredictions: PredictiveDataPoint[] = [];
      
      // Use the advanced analytics service for better predictions
      for (const signalType of KEY_SIGNALS) {
        const forecastDays = {
          '7days': 7,
          '30days': 30,
          '90days': 90,
          '6months': 180,
          '1year': 365
        }[selectedPeriod] || 30;
        
        const forecast = PredictiveAnalyticsService.generateSignalForecast(
          signalType,
          signals,
          accounts,
          forecastDays
        );
        
        // Generate predictions for each account
        for (const account of accounts) {
          const accountSignals = signals.filter(s => s.accountId === account.id);
          const relevantSignals = accountSignals.filter(s => 
            s.description.includes(signalType) || s.type === signalType.toLowerCase().replace(/\s+/g, '_')
          );
          
          if (relevantSignals.length > 0 || Math.random() > 0.3) { // Include some accounts even without exact signals
            const signal = relevantSignals[0] || accountSignals[0];
            const currentIntensity = signal ? calculateSignalIntensity(signal) : 30 + Math.random() * 40;
            
            // Get account-specific risk forecast
            const accountRisk = PredictiveAnalyticsService.generateAccountRiskForecast(
              account,
              accountSignals,
              forecastDays
            );
            
            // Use forecast data for predictions
            const avgForecastValue = forecast.predictions.length > 0 
              ? forecast.predictions.reduce((sum, p) => sum + p.value, 0) / forecast.predictions.length
              : currentIntensity;
            
            const predictedIntensity = Math.min(100, Math.max(0, 
              avgForecastValue * (1 + accountRisk.overallRisk * 0.3)
            ));
            
            newPredictions.push({
              accountId: account.id,
              accountName: account.name,
              signalType,
              category: getCategoryForSignal(signalType),
              currentIntensity,
              predictedIntensity,
              trend: accountRisk.riskTrend,
              riskLevel: forecast.riskLevel,
              confidenceScore: accountRisk.forecastAccuracy * 100,
              forecastPeriod: selectedPeriod,
              contributingFactors: [
                ...forecast.keyFactors.slice(0, 2),
                ...accountRisk.keyRiskFactors.slice(0, 1).map(f => f.factor)
              ]
            });
          }
        }
      }
      
      setPredictions(newPredictions);
      
      // Generate heat map data
      const heatMap: HeatMapCell[] = newPredictions.map(pred => ({
        accountId: pred.accountId,
        accountName: pred.accountName,
        signalType: pred.signalType,
        category: pred.category,
        intensity: pred.predictedIntensity,
        riskLevel: pred.riskLevel,
        trend: pred.trend,
        confidenceScore: pred.confidenceScore
      }));
      
      setHeatMapData(heatMap);
      
      // Analyze correlations for insights
      const correlations = PredictiveAnalyticsService.analyzeSignalCorrelations(signals, accounts);
      setCorrelations(correlations);
      
      toast.success(
        `Generated ${newPredictions.length} predictions with ${correlations.length} signal correlations identified`
      );
      
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast.error('Failed to generate predictive analysis');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate current signal intensity (0-100)
  const calculateSignalIntensity = (signal: Signal): number => {
    // Base intensity on severity and type
    let intensity = 0;
    
    switch (signal.severity) {
      case 'critical': intensity = 85 + Math.random() * 15; break;
      case 'high': intensity = 65 + Math.random() * 20; break;
      case 'medium': intensity = 35 + Math.random() * 30; break;
      case 'low': intensity = 5 + Math.random() * 30; break;
      default: intensity = 25 + Math.random() * 50;
    }
    
    return Math.min(100, Math.max(0, intensity));
  };

  // Generate future prediction based on trends
  const generateFuturePrediction = (signal: Signal, account: Account, period: string) => {
    const currentIntensity = calculateSignalIntensity(signal);
    let multiplier = 1.0;
    let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const factors: string[] = [];
    
    // Account health influence
    if (account.healthScore < 50) {
      multiplier += 0.3;
      trendDirection = 'increasing';
      factors.push('Low account health score accelerating signal degradation');
    } else if (account.healthScore > 80) {
      multiplier -= 0.2;
      trendDirection = 'decreasing';
      factors.push('High account health score improving signal trends');
    }
    
    // Contract timing influence
    const contractEnd = new Date(account.contractEnd);
    const now = new Date();
    const monthsToRenewal = (contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsToRenewal < 6) {
      multiplier += 0.2;
      factors.push('Contract renewal approaching - increased attention needed');
    }
    
    // ARR size influence (larger accounts get more attention)
    if (account.arr > 50000000) {
      multiplier -= 0.1;
      factors.push('High-value account receiving enhanced support');
    } else if (account.arr < 5000000) {
      multiplier += 0.1;
      factors.push('Lower-tier account may receive less proactive attention');
    }
    
    // Signal-specific trends
    switch (signal.severity) {
      case 'critical':
        multiplier += 0.4;
        trendDirection = 'increasing';
        factors.push('Critical severity signals tend to escalate without intervention');
        break;
      case 'low':
        if (Math.random() > 0.5) {
          multiplier -= 0.3;
          trendDirection = 'decreasing';
          factors.push('Low-severity signals often resolve through normal operations');
        }
        break;
    }
    
    // Period adjustment
    const periodMultipliers: Record<string, number> = {
      '7days': 0.1,
      '30days': 0.3,
      '90days': 0.6,
      '6months': 1.0,
      '1year': 1.5
    };
    
    const periodMult = periodMultipliers[period] || 0.3;
    const change = (multiplier - 1) * periodMult;
    const predictedIntensity = Math.min(100, Math.max(0, currentIntensity + (currentIntensity * change)));
    
    // Determine risk level
    let riskLevel: IntensityLevel = 'low';
    if (predictedIntensity >= 80) riskLevel = 'critical';
    else if (predictedIntensity >= 60) riskLevel = 'high';
    else if (predictedIntensity >= 40) riskLevel = 'medium';
    
    // Calculate confidence based on data quality
    const confidence = Math.min(95, 60 + (account.healthScore * 0.3) + Math.random() * 20);
    
    return {
      intensity: predictedIntensity,
      trend: trendDirection,
      riskLevel,
      confidence,
      factors
    };
  };

  // Get category for signal type
  const getCategoryForSignal = (signalType: string): string => {
    const costSignals = ['Cloud Spend Variance', 'License Utilization'];
    const agilitySignals = ['Release Frequency', 'Change Failure Rate'];
    const dataSignals = ['Data Freshness (Hours)', 'API Calls 30d'];
    const riskSignals = ['Open Critical Vulns', 'MFA Coverage'];
    const cultureSignals = ['Executive Sponsor Present', 'Training Hours Last 90d'];
    
    if (costSignals.some(s => signalType.includes(s))) return 'Cost Optimization';
    if (agilitySignals.some(s => signalType.includes(s))) return 'Development Agility';
    if (dataSignals.some(s => signalType.includes(s))) return 'Data Intelligence';
    if (riskSignals.some(s => signalType.includes(s))) return 'Risk Management';
    if (cultureSignals.some(s => signalType.includes(s))) return 'Culture & Engagement';
    
    return 'Other';
  };

  // Filter data based on selected category
  const filteredData = useMemo(() => {
    if (selectedCategory === 'all') return heatMapData;
    return heatMapData.filter(item => item.category === selectedCategory);
  }, [heatMapData, selectedCategory]);

  // Get heat map cell style based on intensity and trend
  const getCellStyle = (cell: HeatMapCell) => {
    const { intensity, trend, riskLevel } = cell;
    
    // Base color based on risk level
    let baseColor = '';
    switch (riskLevel) {
      case 'critical': baseColor = 'bg-red-500'; break;
      case 'high': baseColor = 'bg-orange-500'; break;
      case 'medium': baseColor = 'bg-yellow-500'; break;
      case 'low': baseColor = 'bg-green-500'; break;
    }
    
    // Opacity based on intensity
    const opacity = Math.max(0.3, intensity / 100);
    
    // Border based on trend
    let borderClass = 'border-2';
    switch (trend) {
      case 'increasing': borderClass += ' border-red-400 animate-pulse'; break;
      case 'decreasing': borderClass += ' border-green-400'; break;
      case 'stable': borderClass += ' border-gray-300'; break;
    }
    
    return {
      className: `${baseColor} ${borderClass} rounded transition-all duration-300 hover:scale-105`,
      style: { opacity }
    };
  };

  // Get trend icon
  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable', size = 16) => {
    switch (trend) {
      case 'increasing': return <TrendUp size={size} className="text-red-600" />;
      case 'decreasing': return <TrendDown size={size} className="text-green-600" />;
      case 'stable': return <Activity size={size} className="text-gray-600" />;
    }
  };

  // Initialize with data generation
  useEffect(() => {
    if (accounts.length > 0 && signals.length > 0) {
      generatePredictions();
    }
  }, [accounts, signals, selectedPeriod]);

  const filteredAccounts = accounts.slice(0, 8); // Show top 8 accounts for heat map

  return (
    <Card className="border-visible">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <ChartLine className="w-5 h-5 text-primary" />
            <CardTitle>Predictive Signal Heat Map</CardTitle>
            {isGenerating && <Badge variant="outline" className="animate-pulse">Generating...</Badge>}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="90days">90 Days</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {SIGNAL_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={generatePredictions}
              disabled={isGenerating}
              size="sm"
              className="bg-primary text-primary-foreground"
            >
              <Target className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="heatmap">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="heatmap">Heat Map View</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="heatmap" className="space-y-4">
            {/* Legend */}
            <div className="heat-map-legend">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Risk Levels:</span>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-xs">Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-xs">Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-xs">High</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs">Critical</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Trends:</span>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <TrendUp size={16} className="text-red-600" />
                    <span className="text-xs">Rising</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendDown size={16} className="text-green-600" />
                    <span className="text-xs">Falling</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity size={16} className="text-gray-600" />
                    <span className="text-xs">Stable</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Heat Map Grid */}
            <div className="heat-map-container overflow-x-auto">
              <div className="min-w-max heat-map-grid">
                {/* Header */}
                <div className="grid grid-cols-11 gap-1 mb-2 bg-background p-2 sticky top-0 z-10">
                  <div className="p-2 text-xs font-medium text-center">Account</div>
                  {KEY_SIGNALS.slice(0, 10).map(signal => (
                    <div key={signal} className="p-2 text-xs font-medium text-center transform -rotate-45 whitespace-nowrap">
                      {signal}
                    </div>
                  ))}
                </div>
                
                {/* Grid Rows */}
                {filteredAccounts.map(account => (
                  <div key={account.id} className="grid grid-cols-11 gap-1 mb-1">
                    <div className="p-2 text-xs font-medium truncate bg-muted/20 rounded">
                      {account.name}
                    </div>
                    
                    {KEY_SIGNALS.slice(0, 10).map(signalType => {
                      const cell = filteredData.find(d => 
                        d.accountId === account.id && d.signalType === signalType
                      );
                      
                      if (!cell) {
                        return (
                          <div key={signalType} className="p-2 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-400">-</span>
                          </div>
                        );
                      }
                      
                      const style = getCellStyle(cell);
                      return (
                        <div 
                          key={signalType}
                          className={`p-2 flex items-center justify-center relative cursor-pointer heat-map-cell ${style.className}`}
                          style={style.style}
                          title={`${cell.accountName} - ${cell.signalType}\nIntensity: ${cell.intensity.toFixed(0)}%\nConfidence: ${cell.confidenceScore.toFixed(0)}%`}
                        >
                          <div className="absolute top-0.5 right-0.5">
                            {getTrendIcon(cell.trend, 12)}
                          </div>
                          <span className="text-xs font-bold text-white drop-shadow">
                            {cell.intensity.toFixed(0)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            {/* Visual Trend Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {KEY_SIGNALS.slice(0, 6).map(signalType => {
                const signalPredictions = predictions.filter(p => p.signalType === signalType);
                if (signalPredictions.length === 0) return null;
                
                const avgCurrent = signalPredictions.reduce((sum, p) => sum + p.currentIntensity, 0) / signalPredictions.length;
                const avgPredicted = signalPredictions.reduce((sum, p) => sum + p.predictedIntensity, 0) / signalPredictions.length;
                const mostCommonTrend = signalPredictions.reduce((acc, p) => {
                  acc[p.trend] = (acc[p.trend] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                const dominantTrend = Object.keys(mostCommonTrend).reduce((a, b) => 
                  mostCommonTrend[a] > mostCommonTrend[b] ? a : b
                ) as 'increasing' | 'decreasing' | 'stable';
                
                const avgRiskLevel = signalPredictions.reduce((acc, p) => {
                  const riskWeights = { low: 1, medium: 2, high: 3, critical: 4 };
                  return acc + riskWeights[p.riskLevel];
                }, 0) / signalPredictions.length;
                
                const riskLevel = avgRiskLevel > 3.5 ? 'critical' : 
                                avgRiskLevel > 2.5 ? 'high' : 
                                avgRiskLevel > 1.5 ? 'medium' : 'low';
                
                // Generate mock trend data for visualization
                const trendData: Array<{
                  day: number;
                  value: number;
                  isHistorical: boolean;
                  confidence: number;
                }> = [];
                const forecastDays = 30;
                
                // Historical data (last 14 days)
                for (let i = -14; i < 0; i++) {
                  const variation = Math.sin(i * 0.2) * 5 + Math.random() * 8 - 4;
                  trendData.push({
                    day: i,
                    value: Math.max(0, Math.min(100, avgCurrent + variation)),
                    isHistorical: true,
                    confidence: 0.9
                  });
                }
                
                // Forecast data (next 30 days)
                for (let i = 0; i < forecastDays; i++) {
                  const trendRate = dominantTrend === 'increasing' ? 0.5 : 
                                  dominantTrend === 'decreasing' ? -0.3 : 0.1;
                  const baseChange = trendRate * i;
                  const variation = Math.sin(i * 0.15) * 3 + Math.random() * 6 - 3;
                  const confidenceDecay = Math.max(0.3, 0.9 - (i / forecastDays) * 0.4);
                  
                  trendData.push({
                    day: i,
                    value: Math.max(0, Math.min(100, avgCurrent + baseChange + variation)),
                    isHistorical: false,
                    confidence: confidenceDecay
                  });
                }
                
                return (
                  <TrendForecastChart
                    key={signalType}
                    title={signalType}
                    data={trendData}
                    currentValue={avgCurrent}
                    predictedValue={avgPredicted}
                    trend={dominantTrend}
                    riskLevel={riskLevel}
                  />
                );
              })}
            </div>
            
            {/* Trend Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['increasing', 'decreasing', 'stable'].map(trendType => {
                const trendData = predictions.filter(p => p.trend === trendType);
                const avgIntensity = trendData.length > 0 
                  ? trendData.reduce((sum, p) => sum + p.predictedIntensity, 0) / trendData.length 
                  : 0;
                
                return (
                  <Card key={trendType} className="border-visible">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trendType as any)}
                        <CardTitle className="text-lg capitalize">{trendType} Signals</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Count:</span>
                          <Badge variant="outline">{trendData.length}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Avg Intensity:</span>
                          <span className="text-sm font-medium">{avgIntensity.toFixed(1)}%</span>
                        </div>
                        
                        {trendData.slice(0, 3).map(item => (
                          <div key={`${item.accountId}-${item.signalType}`} className="p-2 bg-muted/20 rounded text-xs">
                            <div className="font-medium">{item.accountName}</div>
                            <div className="text-muted-foreground">{item.signalType}</div>
                            <div className="flex justify-between mt-1">
                              <span>Risk: {item.riskLevel}</span>
                              <span>{item.confidenceScore.toFixed(0)}% confidence</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="correlations" className="space-y-4">
            <div className="grid gap-4">
              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Signal Correlations Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {correlations.length > 0 ? (
                    <div className="space-y-3">
                      {correlations.slice(0, 8).map((corr, idx) => (
                        <div key={idx} className="p-3 bg-muted/20 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{corr.signal1}</div>
                              <div className="text-xs text-muted-foreground">correlates with</div>
                              <div className="font-medium text-sm">{corr.signal2}</div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant="outline"
                                className={`${
                                  corr.strength === 'strong' ? 'border-green-500 text-green-700' :
                                  corr.strength === 'moderate' ? 'border-yellow-500 text-yellow-700' :
                                  'border-gray-500 text-gray-700'
                                }`}
                              >
                                {corr.strength}
                              </Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                {(corr.correlation * 100).toFixed(0)}% correlation
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-muted-foreground">
                              {(corr.predictivePower * 100).toFixed(0)}% predictive power
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {correlations.length > 8 && (
                        <div className="text-center pt-2">
                          <Badge variant="outline">
                            +{correlations.length - 8} more correlations detected
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No significant correlations detected</p>
                      <p className="text-sm">Generate predictions to analyze signal relationships</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Correlation Insights */}
              {correlations.length > 0 && (
                <Card className="border-visible border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-700">Correlation Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {correlations.filter(c => c.strength === 'strong').length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-900 mb-1">Strong Correlations Detected</div>
                          <div className="text-sm text-blue-700">
                            {correlations.filter(c => c.strength === 'strong').length} strong correlations indicate 
                            predictable signal patterns. Use these for early warning systems.
                          </div>
                        </div>
                      )}
                      
                      {correlations.some(c => c.correlation < -0.5) && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-green-900 mb-1">Inverse Relationships Found</div>
                          <div className="text-sm text-green-700">
                            Some signals show inverse relationships - when one improves, the other declines. 
                            These can indicate trade-offs in resource allocation.
                          </div>
                        </div>
                      )}
                      
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="font-medium text-purple-900 mb-1">Predictive Modeling Opportunities</div>
                        <div className="text-sm text-purple-700">
                          {correlations.filter(c => c.predictivePower > 0.7).length} signal pairs show high 
                          predictive power for machine learning models.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <div className="grid gap-4">
              {/* Critical Predictions */}
              <Card className="border-visible border-red-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Warning className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-red-700">Critical Risk Predictions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions
                      .filter(p => p.riskLevel === 'critical')
                      .slice(0, 5)
                      .map(item => (
                        <div key={`${item.accountId}-${item.signalType}`} className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-red-900">{item.accountName}</div>
                              <div className="text-sm text-red-700">{item.signalType}</div>
                            </div>
                            <Badge variant="destructive">{item.predictedIntensity.toFixed(0)}%</Badge>
                          </div>
                          <div className="text-xs text-red-600">
                            <div className="flex items-center gap-2 mb-1">
                              {getTrendIcon(item.trend, 14)}
                              <span>Forecast: {item.forecastPeriod}</span>
                              <span>•</span>
                              <span>{item.confidenceScore.toFixed(0)}% confidence</span>
                            </div>
                            <div className="mt-2">
                              <strong>Key Factors:</strong>
                              <ul className="list-disc list-inside mt-1 space-y-0.5">
                                {item.contributingFactors.slice(0, 2).map((factor, idx) => (
                                  <li key={idx}>{factor}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Positive Trends */}
              <Card className="border-visible border-green-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendDown className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-green-700">Improving Signal Predictions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions
                      .filter(p => p.trend === 'decreasing' && p.riskLevel !== 'critical')
                      .slice(0, 3)
                      .map(item => (
                        <div key={`${item.accountId}-${item.signalType}`} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-green-900">{item.accountName}</div>
                              <div className="text-sm text-green-700">{item.signalType}</div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">{item.predictedIntensity.toFixed(0)}%</Badge>
                          </div>
                          <div className="text-xs text-green-600">
                            Expected improvement over {item.forecastPeriod} with {item.confidenceScore.toFixed(0)}% confidence
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
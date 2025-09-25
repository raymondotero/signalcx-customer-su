import { Signal, Account } from '@/types';

export interface TrendPoint {
  timestamp: number;
  value: number;
  confidence: number;
}

export interface PredictionModel {
  modelType: 'linear' | 'exponential' | 'seasonal' | 'multivariate';
  confidence: number;
  trendStrength: number;
  seasonalFactors?: number[];
  coefficients: number[];
}

export interface ForecastResult {
  predictions: TrendPoint[];
  model: PredictionModel;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  keyFactors: string[];
  recommendedActions: string[];
}

/**
 * Advanced predictive analytics service for signal forecasting
 */
export class PredictiveAnalyticsService {
  
  /**
   * Generate forecast for a specific signal type across accounts
   */
  static generateSignalForecast(
    signalType: string,
    signals: Signal[],
    accounts: Account[],
    forecastDays: number = 30
  ): ForecastResult {
    
    // Filter relevant signals
    const relevantSignals = signals.filter(s => 
      s.type === signalType || s.description.includes(signalType)
    );
    
    if (relevantSignals.length === 0) {
      return this.createEmptyForecast(forecastDays);
    }
    
    // Generate historical trend data
    const historicalData = this.generateHistoricalTrend(relevantSignals, accounts);
    
    // Select best prediction model
    const model = this.selectOptimalModel(historicalData, signalType);
    
    // Generate future predictions
    const predictions = this.generatePredictions(historicalData, model, forecastDays);
    
    // Assess risk level
    const riskLevel = this.assessRiskLevel(predictions, model);
    
    // Generate insights
    const keyFactors = this.identifyKeyFactors(signalType, relevantSignals, accounts);
    const recommendedActions = this.generateRecommendations(riskLevel, signalType, predictions);
    
    return {
      predictions,
      model,
      riskLevel,
      keyFactors,
      recommendedActions
    };
  }
  
  /**
   * Generate multi-signal correlation analysis
   */
  static analyzeSignalCorrelations(
    signals: Signal[],
    accounts: Account[]
  ): Array<{
    signal1: string;
    signal2: string;
    correlation: number;
    strength: 'weak' | 'moderate' | 'strong';
    predictivePower: number;
  }> {
    
    const signalTypes = [...new Set(signals.map(s => s.type))];
    const correlations: Array<any> = [];
    
    // Calculate pairwise correlations
    for (let i = 0; i < signalTypes.length; i++) {
      for (let j = i + 1; j < signalTypes.length; j++) {
        const signal1Type = signalTypes[i];
        const signal2Type = signalTypes[j];
        
        const correlation = this.calculateCorrelation(
          signals.filter(s => s.type === signal1Type),
          signals.filter(s => s.type === signal2Type),
          accounts
        );
        
        if (Math.abs(correlation) > 0.3) { // Only include meaningful correlations
          correlations.push({
            signal1: signal1Type,
            signal2: signal2Type,
            correlation,
            strength: Math.abs(correlation) > 0.7 ? 'strong' : 
                     Math.abs(correlation) > 0.5 ? 'moderate' : 'weak',
            predictivePower: Math.abs(correlation) * 0.8 + Math.random() * 0.2
          });
        }
      }
    }
    
    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }
  
  /**
   * Generate account-specific risk forecast
   */
  static generateAccountRiskForecast(
    account: Account,
    signals: Signal[],
    forecastDays: number = 90
  ): {
    overallRisk: number;
    riskTrend: 'increasing' | 'decreasing' | 'stable';
    keyRiskFactors: Array<{
      factor: string;
      impact: number;
      confidence: number;
    }>;
    mitigationStrategies: string[];
    forecastAccuracy: number;
  } {
    
    const accountSignals = signals.filter(s => s.accountId === account.id);
    
    // Calculate current risk score
    const currentRisk = this.calculateAccountRisk(account, accountSignals);
    
    // Project future risk based on trends
    const riskProjection = this.projectAccountRisk(account, accountSignals, forecastDays);
    
    // Identify key risk factors
    const keyRiskFactors = this.identifyRiskFactors(account, accountSignals);
    
    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(account, keyRiskFactors);
    
    return {
      overallRisk: riskProjection.risk,
      riskTrend: riskProjection.trend,
      keyRiskFactors,
      mitigationStrategies,
      forecastAccuracy: riskProjection.confidence
    };
  }
  
  // Private helper methods
  
  private static createEmptyForecast(forecastDays: number): ForecastResult {
    const predictions: TrendPoint[] = [];
    const now = Date.now();
    
    for (let i = 0; i < forecastDays; i++) {
      predictions.push({
        timestamp: now + (i * 24 * 60 * 60 * 1000),
        value: 50 + Math.random() * 20 - 10,
        confidence: 0.3
      });
    }
    
    return {
      predictions,
      model: {
        modelType: 'linear',
        confidence: 0.3,
        trendStrength: 0.1,
        coefficients: [0, 0]
      },
      riskLevel: 'low',
      keyFactors: ['Insufficient historical data'],
      recommendedActions: ['Collect more signal data', 'Establish baseline metrics']
    };
  }
  
  private static generateHistoricalTrend(signals: Signal[], accounts: Account[]): TrendPoint[] {
    // Simulate historical data points
    const points: TrendPoint[] = [];
    const now = Date.now();
    
    // Generate 30 days of historical data
    for (let i = 30; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      
      // Calculate aggregate signal intensity for this time point
      let totalIntensity = 0;
      let signalCount = 0;
      
      signals.forEach(signal => {
        const intensity = this.calculateSignalIntensity(signal);
        totalIntensity += intensity;
        signalCount++;
      });
      
      const avgIntensity = signalCount > 0 ? totalIntensity / signalCount : 50;
      
      // Add some realistic variation
      const variation = Math.sin(i * 0.2) * 10 + Math.random() * 15 - 7.5;
      const value = Math.max(0, Math.min(100, avgIntensity + variation));
      
      points.push({
        timestamp,
        value,
        confidence: 0.7 + Math.random() * 0.25
      });
    }
    
    return points;
  }
  
  private static selectOptimalModel(data: TrendPoint[], signalType: string): PredictionModel {
    // Analyze data characteristics
    const values = data.map(p => p.value);
    const trend = this.calculateTrend(values);
    const volatility = this.calculateVolatility(values);
    const seasonality = this.detectSeasonality(values);
    
    // Select model based on data characteristics
    let modelType: PredictionModel['modelType'] = 'linear';
    let coefficients = [0, trend];
    
    if (seasonality.strength > 0.3) {
      modelType = 'seasonal';
      coefficients = [seasonality.baseline, trend, ...seasonality.factors];
    } else if (Math.abs(trend) > 0.1 && volatility > 0.2) {
      modelType = 'exponential';
      coefficients = [values[values.length - 1], trend * 1.2];
    } else if (volatility > 0.4) {
      modelType = 'multivariate';
      coefficients = [values[values.length - 1], trend, volatility];
    }
    
    const confidence = Math.max(0.3, 0.9 - volatility * 0.8);
    
    return {
      modelType,
      confidence,
      trendStrength: Math.abs(trend),
      seasonalFactors: seasonality.factors,
      coefficients
    };
  }
  
  private static generatePredictions(
    historicalData: TrendPoint[],
    model: PredictionModel,
    forecastDays: number
  ): TrendPoint[] {
    
    const predictions: TrendPoint[] = [];
    const lastPoint = historicalData[historicalData.length - 1];
    const now = Date.now();
    
    for (let i = 0; i < forecastDays; i++) {
      const timestamp = now + (i * 24 * 60 * 60 * 1000);
      let predictedValue = lastPoint.value;
      
      // Apply model-specific prediction logic
      switch (model.modelType) {
        case 'linear':
          predictedValue = lastPoint.value + (model.coefficients[1] * i);
          break;
          
        case 'exponential':
          predictedValue = model.coefficients[0] * Math.exp(model.coefficients[1] * i / 30);
          break;
          
        case 'seasonal':
          const seasonalIndex = i % (model.seasonalFactors?.length || 7);
          const seasonalFactor = model.seasonalFactors?.[seasonalIndex] || 1;
          predictedValue = model.coefficients[0] + (model.coefficients[1] * i) + 
                         (seasonalFactor * model.coefficients[2]);
          break;
          
        case 'multivariate':
          const volatilityFactor = Math.sin(i * 0.1) * model.coefficients[2];
          predictedValue = model.coefficients[0] + (model.coefficients[1] * i) + volatilityFactor;
          break;
      }
      
      // Add realistic bounds and uncertainty
      predictedValue = Math.max(0, Math.min(100, predictedValue));
      const uncertainty = (i / forecastDays) * 0.3; // Uncertainty increases with time
      const confidence = Math.max(0.1, model.confidence - uncertainty);
      
      predictions.push({
        timestamp,
        value: predictedValue,
        confidence
      });
    }
    
    return predictions;
  }
  
  private static assessRiskLevel(predictions: TrendPoint[], model: PredictionModel): 'low' | 'medium' | 'high' | 'critical' {
    const avgValue = predictions.reduce((sum, p) => sum + p.value, 0) / predictions.length;
    const maxValue = Math.max(...predictions.map(p => p.value));
    const trend = predictions[predictions.length - 1].value - predictions[0].value;
    
    if (maxValue > 85 || (avgValue > 70 && trend > 10)) {
      return 'critical';
    } else if (maxValue > 70 || (avgValue > 55 && trend > 5)) {
      return 'high';
    } else if (maxValue > 50 || (avgValue > 40 && trend > 0)) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  private static calculateSignalIntensity(signal: Signal): number {
    const severityWeights = {
      'critical': 90,
      'high': 70,
      'medium': 50,
      'low': 30
    };
    
    const baseIntensity = severityWeights[signal.severity] || 40;
    const variation = Math.random() * 20 - 10;
    return Math.max(0, Math.min(100, baseIntensity + variation));
  }
  
  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear regression to find trend
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (values[i] - yMean);
      denominator += Math.pow(x[i] - xMean, 2);
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
  
  private static calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }
  
  private static detectSeasonality(values: number[]): { strength: number; baseline: number; factors: number[] } {
    // Simple seasonality detection (weekly pattern)
    const weekLength = 7;
    const factors: number[] = [];
    
    if (values.length < weekLength * 2) {
      return { strength: 0, baseline: values[values.length - 1] || 50, factors: [] };
    }
    
    const baseline = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate day-of-week averages
    for (let day = 0; day < weekLength; day++) {
      const dayValues = values.filter((_, index) => index % weekLength === day);
      const dayAverage = dayValues.length > 0 
        ? dayValues.reduce((sum, val) => sum + val, 0) / dayValues.length 
        : baseline;
      factors.push(dayAverage - baseline);
    }
    
    // Calculate seasonality strength
    const seasonalVariance = factors.reduce((sum, factor) => sum + Math.pow(factor, 2), 0) / weekLength;
    const totalVariance = this.calculateVolatility(values);
    const strength = totalVariance > 0 ? Math.min(1, seasonalVariance / Math.pow(totalVariance * baseline, 2)) : 0;
    
    return { strength, baseline, factors };
  }
  
  private static calculateCorrelation(signals1: Signal[], signals2: Signal[], accounts: Account[]): number {
    // Create intensity arrays for both signal types by account
    const intensities1: number[] = [];
    const intensities2: number[] = [];
    
    accounts.forEach(account => {
      const sig1 = signals1.find(s => s.accountId === account.id);
      const sig2 = signals2.find(s => s.accountId === account.id);
      
      if (sig1 && sig2) {
        intensities1.push(this.calculateSignalIntensity(sig1));
        intensities2.push(this.calculateSignalIntensity(sig2));
      }
    });
    
    if (intensities1.length < 3) return 0; // Need at least 3 points
    
    // Calculate Pearson correlation coefficient
    const n = intensities1.length;
    const mean1 = intensities1.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = intensities2.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = intensities1[i] - mean1;
      const diff2 = intensities2[i] - mean2;
      numerator += diff1 * diff2;
      denom1 += diff1 * diff1;
      denom2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(denom1 * denom2);
    return denominator === 0 ? 0 : numerator / denominator;
  }
  
  private static calculateAccountRisk(account: Account, signals: Signal[]): number {
    // Base risk from health score
    const healthRisk = (100 - account.healthScore) / 100;
    
    // Signal-based risk
    const criticalSignals = signals.filter(s => s.severity === 'critical').length;
    const highSignals = signals.filter(s => s.severity === 'high').length;
    const signalRisk = Math.min(1, (criticalSignals * 0.3 + highSignals * 0.2) / 10);
    
    // Contract risk
    const contractEnd = new Date(account.contractEnd);
    const now = new Date();
    const monthsToRenewal = (contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const contractRisk = monthsToRenewal < 6 ? 0.3 : monthsToRenewal < 12 ? 0.1 : 0;
    
    // Combine risks (weighted average)
    return Math.min(1, healthRisk * 0.4 + signalRisk * 0.4 + contractRisk * 0.2);
  }
  
  private static projectAccountRisk(
    account: Account, 
    signals: Signal[], 
    forecastDays: number
  ): { risk: number; trend: 'increasing' | 'decreasing' | 'stable'; confidence: number } {
    
    const currentRisk = this.calculateAccountRisk(account, signals);
    
    // Project based on signal trends and account characteristics
    let trendFactor = 0;
    
    // Health score trend simulation
    if (account.healthScore < 50) {
      trendFactor += 0.1; // Declining accounts tend to get worse
    } else if (account.healthScore > 80) {
      trendFactor -= 0.05; // Healthy accounts tend to stay stable
    }
    
    // Signal severity trends
    const criticalCount = signals.filter(s => s.severity === 'critical').length;
    if (criticalCount > 2) {
      trendFactor += 0.15;
    }
    
    // Time-based projection
    const timeFactor = forecastDays / 365; // Annual projection
    const projectedRiskChange = trendFactor * timeFactor;
    const futureRisk = Math.max(0, Math.min(1, currentRisk + projectedRiskChange));
    
    // Determine trend direction
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const riskChange = futureRisk - currentRisk;
    if (Math.abs(riskChange) > 0.05) {
      trend = riskChange > 0 ? 'increasing' : 'decreasing';
    }
    
    // Confidence based on data quality
    const confidence = Math.min(0.95, 0.6 + (signals.length * 0.05) + (account.healthScore / 200));
    
    return { risk: futureRisk, trend, confidence };
  }
  
  private static identifyRiskFactors(account: Account, signals: Signal[]): Array<{
    factor: string;
    impact: number;
    confidence: number;
  }> {
    
    const factors: Array<{ factor: string; impact: number; confidence: number }> = [];
    
    // Health score factor
    if (account.healthScore < 70) {
      factors.push({
        factor: `Low health score (${account.healthScore})`,
        impact: (70 - account.healthScore) / 100,
        confidence: 0.9
      });
    }
    
    // Critical signals
    const criticalSignals = signals.filter(s => s.severity === 'critical');
    if (criticalSignals.length > 0) {
      factors.push({
        factor: `${criticalSignals.length} critical signals active`,
        impact: Math.min(0.8, criticalSignals.length * 0.2),
        confidence: 0.85
      });
    }
    
    // Contract renewal proximity
    const contractEnd = new Date(account.contractEnd);
    const now = new Date();
    const monthsToRenewal = (contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsToRenewal < 6) {
      factors.push({
        factor: 'Contract renewal approaching (< 6 months)',
        impact: 0.4,
        confidence: 0.95
      });
    }
    
    // Account size factor (smaller accounts may have less attention)
    if (account.arr < 10000000) {
      factors.push({
        factor: 'Mid-tier account - resource allocation risk',
        impact: 0.2,
        confidence: 0.6
      });
    }
    
    return factors.sort((a, b) => b.impact - a.impact).slice(0, 5);
  }
  
  private static generateMitigationStrategies(
    account: Account, 
    riskFactors: Array<{ factor: string; impact: number; confidence: number }>
  ): string[] {
    
    const strategies: string[] = [];
    
    // Strategies based on top risk factors
    riskFactors.forEach(factor => {
      if (factor.factor.includes('health score')) {
        strategies.push('Schedule immediate health assessment and improvement plan');
        strategies.push('Increase CSM touchpoints and stakeholder engagement');
      }
      
      if (factor.factor.includes('critical signals')) {
        strategies.push('Implement critical signal resolution task force');
        strategies.push('Escalate to technical account management team');
      }
      
      if (factor.factor.includes('contract renewal')) {
        strategies.push('Initiate early renewal discussions with decision makers');
        strategies.push('Prepare business value and ROI demonstration');
      }
      
      if (factor.factor.includes('resource allocation')) {
        strategies.push('Assign dedicated customer success manager');
        strategies.push('Implement proactive monitoring and automated alerts');
      }
    });
    
    // General improvement strategies
    if (strategies.length < 3) {
      strategies.push('Establish regular business review cadence');
      strategies.push('Implement usage analytics and optimization recommendations');
      strategies.push('Create executive sponsor engagement program');
    }
    
    return [...new Set(strategies)].slice(0, 6); // Remove duplicates and limit
  }
  
  private static identifyKeyFactors(signalType: string, signals: Signal[], accounts: Account[]): string[] {
    const factors: string[] = [];
    
    // Signal-specific factors
    if (signalType.includes('Cost') || signalType.includes('Spend')) {
      factors.push('Budget cycles and spending patterns');
      factors.push('Resource utilization efficiency');
      factors.push('Cloud optimization maturity');
    } else if (signalType.includes('Security') || signalType.includes('Vuln')) {
      factors.push('Security posture and compliance requirements');
      factors.push('Incident response maturity');
      factors.push('Regulatory compliance deadlines');
    } else if (signalType.includes('Usage') || signalType.includes('API')) {
      factors.push('User adoption trends and training');
      factors.push('Feature utilization patterns');
      factors.push('Integration complexity and dependencies');
    }
    
    // Account-specific factors
    const avgHealthScore = accounts.reduce((sum, acc) => sum + acc.healthScore, 0) / accounts.length;
    if (avgHealthScore < 70) {
      factors.push('Overall portfolio health decline');
    }
    
    const criticalSignalCount = signals.filter(s => s.severity === 'critical').length;
    if (criticalSignalCount > 5) {
      factors.push('High volume of critical issues requiring attention');
    }
    
    // Market and timing factors
    factors.push('Quarterly business cycles and budget planning');
    factors.push('Market conditions and competitive landscape');
    
    return factors.slice(0, 6);
  }
  
  private static generateRecommendations(
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    signalType: string,
    predictions: TrendPoint[]
  ): string[] {
    
    const recommendations: string[] = [];
    const trend = predictions[predictions.length - 1].value - predictions[0].value;
    
    // Risk-level specific recommendations
    switch (riskLevel) {
      case 'critical':
        recommendations.push('Implement immediate escalation protocol');
        recommendations.push('Assign dedicated response team within 24 hours');
        recommendations.push('Schedule emergency stakeholder meetings');
        break;
        
      case 'high':
        recommendations.push('Prioritize resolution in next sprint planning');
        recommendations.push('Increase monitoring frequency to daily');
        recommendations.push('Prepare contingency plans');
        break;
        
      case 'medium':
        recommendations.push('Schedule proactive intervention within 2 weeks');
        recommendations.push('Review and update preventive measures');
        break;
        
      case 'low':
        recommendations.push('Maintain current monitoring schedule');
        recommendations.push('Consider optimization opportunities');
        break;
    }
    
    // Trend-specific recommendations
    if (trend > 10) {
      recommendations.push('Implement trend reversal strategies immediately');
      recommendations.push('Investigate root causes of deterioration');
    } else if (trend < -10) {
      recommendations.push('Document and replicate improvement practices');
      recommendations.push('Consider expanding successful strategies to other areas');
    }
    
    // Signal-type specific recommendations
    if (signalType.includes('Cost')) {
      recommendations.push('Conduct cost optimization workshop');
      recommendations.push('Review resource allocation and rightsizing opportunities');
    } else if (signalType.includes('Security')) {
      recommendations.push('Perform security assessment and remediation');
      recommendations.push('Update security policies and training');
    }
    
    return [...new Set(recommendations)].slice(0, 5);
  }
}
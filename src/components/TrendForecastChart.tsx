import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendUp, TrendDown, Activity, ArrowsOut } from '@phosphor-icons/react';
import { ChartExpansionDialog } from '@/components/ChartExpansionDialog';

interface TrendPoint {
  day: number;
  value: number;
  isHistorical: boolean;
  confidence?: number;
}

interface TrendForecastChartProps {
  title: string;
  data: TrendPoint[];
  currentValue: number;
  predictedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

export const TrendForecastChart: React.FC<TrendForecastChartProps> = ({
  title,
  data,
  currentValue,
  predictedValue,
  trend,
  riskLevel,
  className = ''
}) => {
  
  // Calculate chart dimensions
  const chartWidth = 300;
  const chartHeight = 120;
  const padding = 20;
  
  // Find data bounds
  const maxValue = Math.max(...data.map(d => d.value), 100);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const maxDay = Math.max(...data.map(d => d.day));
  const minDay = Math.min(...data.map(d => d.day));
  
  // Scale functions
  const scaleX = (day: number) => 
    padding + ((day - minDay) / (maxDay - minDay)) * (chartWidth - 2 * padding);
  
  const scaleY = (value: number) => 
    chartHeight - padding - ((value - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding);
  
  // Split data into historical and forecast
  const historicalData = data.filter(d => d.isHistorical);
  const forecastData = data.filter(d => !d.isHistorical);
  
  // Create path strings
  const createPath = (points: TrendPoint[]) => {
    if (points.length === 0) return '';
    
    const pathCommands = points.map((point, index) => {
      const x = scaleX(point.day);
      const y = scaleY(point.value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    
    return pathCommands.join(' ');
  };
  
  const historicalPath = createPath(historicalData);
  const forecastPath = createPath(forecastData);
  
  // Confidence area for forecast
  const createConfidenceArea = (points: TrendPoint[]) => {
    if (points.length === 0) return '';
    
    const upperPath = points.map((point, index) => {
      const x = scaleX(point.day);
      const confidence = point.confidence || 0.8;
      const uncertainty = (1 - confidence) * 20;
      const y = scaleY(point.value - uncertainty);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
    
    const lowerPath = points.slice().reverse().map(point => {
      const x = scaleX(point.day);
      const confidence = point.confidence || 0.8;
      const uncertainty = (1 - confidence) * 20;
      const y = scaleY(point.value + uncertainty);
      return `L ${x} ${y}`;
    }).join(' ');
    
    return upperPath + lowerPath + ' Z';
  };
  
  const confidenceArea = createConfidenceArea(forecastData);
  
  // Get colors based on risk level
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'critical': return 'rgb(239, 68, 68)'; // red-500
      case 'high': return 'rgb(245, 158, 11)'; // amber-500
      case 'medium': return 'rgb(234, 179, 8)'; // yellow-500
      case 'low': return 'rgb(34, 197, 94)'; // green-500
      default: return 'rgb(107, 114, 128)'; // gray-500
    }
  };
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing': return <TrendUp className="w-4 h-4 text-red-600" />;
      case 'decreasing': return <TrendDown className="w-4 h-4 text-green-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getTrendColor = () => {
    switch (trend) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      case 'stable': return 'text-gray-600';
    }
  };
  
  return (
    <Card className={`border-visible ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge 
              variant="outline"
              className={`text-xs ${
                riskLevel === 'critical' ? 'border-red-500 text-red-700' :
                riskLevel === 'high' ? 'border-orange-500 text-orange-700' :
                riskLevel === 'medium' ? 'border-yellow-500 text-yellow-700' :
                'border-green-500 text-green-700'
              }`}
            >
              {riskLevel}
            </Badge>
            <ChartExpansionDialog
              title={title}
              data={data}
              currentValue={currentValue}
              predictedValue={predictedValue}
              trend={trend}
              riskLevel={riskLevel}
              metadata={{
                unit: ' pts',
                timeframe: '180 days',
                confidence: data.find(d => !d.isHistorical)?.confidence || 0.8,
                description: `Forecast analysis for ${title} showing ${trend} trend with ${riskLevel} risk level.`,
                insights: [
                  `Current value: ${currentValue} points`,
                  `Predicted value: ${predictedValue} points`,
                  `Trend direction: ${trend}`,
                  `Risk assessment: ${riskLevel} level`
                ]
              }}
            >
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ArrowsOut className="w-3 h-3" />
              </Button>
            </ChartExpansionDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Chart */}
          <div className="relative">
            <svg 
              width={chartWidth} 
              height={chartHeight}
              className="border rounded bg-gray-50"
            >
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Confidence area */}
              {confidenceArea && (
                <path
                  d={confidenceArea}
                  fill={getRiskColor()}
                  opacity="0.1"
                />
              )}
              
              {/* Historical line */}
              {historicalPath && (
                <path
                  d={historicalPath}
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="2"
                />
              )}
              
              {/* Forecast line */}
              {forecastPath && (
                <path
                  d={forecastPath}
                  fill="none"
                  stroke={getRiskColor()}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
              
              {/* Data points */}
              {data.map((point, index) => (
                <circle
                  key={index}
                  cx={scaleX(point.day)}
                  cy={scaleY(point.value)}
                  r="3"
                  fill={point.isHistorical ? '#6b7280' : getRiskColor()}
                  opacity={point.isHistorical ? 0.8 : 0.6}
                />
              ))}
              
              {/* Current/forecast divider */}
              {historicalData.length > 0 && forecastData.length > 0 && (
                <line
                  x1={scaleX(0)}
                  y1={padding}
                  x2={scaleX(0)}
                  y2={chartHeight - padding}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              )}
            </svg>
            
            {/* Chart labels */}
            <div className="absolute top-2 left-2 text-xs text-gray-600">
              <div>Historical</div>
            </div>
            <div className="absolute top-2 right-2 text-xs text-gray-600">
              <div>Forecast</div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Current</div>
              <div className="font-medium">{currentValue.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Predicted</div>
              <div className={`font-medium ${getTrendColor()}`}>
                {predictedValue.toFixed(1)}%
              </div>
            </div>
          </div>
          
          {/* Change indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Change:</span>
            <span className={`font-medium ${getTrendColor()}`}>
              {predictedValue > currentValue ? '+' : ''}
              {(predictedValue - currentValue).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendUp, TrendDown, Activity } from '@phosphor-icons/react';

interface HealthTrendVisualizerProps {
  currentScore: number;
  forecast: {
    days30: number;
    days60: number;
    days90: number;
    days180: number;
  };
  confidence: number;
  trend: 'improving' | 'declining' | 'stable';
  className?: string;
}

export function HealthTrendVisualizer({ 
  currentScore, 
  forecast, 
  confidence, 
  trend,
  className = '' 
}: HealthTrendVisualizerProps) {
  const timepoints = [
    { label: 'Current', value: currentScore, days: 0 },
    { label: '30d', value: forecast.days30, days: 30 },
    { label: '60d', value: forecast.days60, days: 60 },
    { label: '90d', value: forecast.days90, days: 90 },
    { label: '180d', value: forecast.days180, days: 180 }
  ];

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving': return <TrendUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 65) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 65) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={`border-visible ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Health Score Trajectory</CardTitle>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant="outline" className="text-xs">
              {confidence}% confidence
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Timeline visualization */}
        <div className="relative">
          <div className="flex justify-between items-end h-32 border-b border-border pb-2">
            {timepoints.map((point, index) => {
              const height = (point.value / 100) * 100; // Convert to percentage for height
              const isCurrentScore = index === 0;
              
              return (
                <div key={point.label} className="flex flex-col items-center space-y-1">
                  {/* Bar */}
                  <div 
                    className={`w-6 rounded-t transition-all duration-300 ${
                      isCurrentScore 
                        ? 'bg-primary opacity-100 border-2 border-primary-foreground' 
                        : getProgressColor(point.value)
                    }`}
                    style={{ 
                      height: `${height}%`,
                      minHeight: '8px',
                      opacity: isCurrentScore ? 1 : 0.8 
                    }}
                  />
                  
                  {/* Score */}
                  <div className={`text-xs font-medium px-1 py-0.5 rounded border ${
                    isCurrentScore 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : getScoreColor(point.value)
                  }`}>
                    {point.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-xs text-muted-foreground font-medium">
                    {point.label}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Trend line overlay */}
          <svg 
            className="absolute inset-0 pointer-events-none" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke={trend === 'improving' ? '#22c55e' : trend === 'declining' ? '#ef4444' : '#6b7280'}
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0.6"
              points={timepoints.map((point, index) => {
                const x = (index / (timepoints.length - 1)) * 100;
                const y = 100 - point.value;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Change (90d)</p>
            <p className={`text-sm font-medium ${
              forecast.days90 > currentScore ? 'text-green-600' : 
              forecast.days90 < currentScore ? 'text-red-600' : 'text-gray-600'
            }`}>
              {forecast.days90 > currentScore ? '+' : ''}{forecast.days90 - currentScore}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Trend</p>
            <p className="text-sm font-medium capitalize">{trend}</p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-sm font-medium">{confidence}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
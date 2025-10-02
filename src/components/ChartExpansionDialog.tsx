import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendDown, 
  TrendUp,
  Calendar,
  ChartBar,
  Download,
  ArrowsOut
} from '@phosphor-icons/react';

interface TrendPoint {
  day: number;
  value: number;
  isHistorical: boolean;
  confidence?: number;
}

interface ChartMetadata {
  title?: string;
  description?: string;
  data?: TrendPoint[];
  predictedValue?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  unit?: string;
  confidence?: number;
  insights?: string[];
  timeframe?: string;
}

interface ChartExpansionDialogProps {
  data: TrendPoint[];
  metadata?: ChartMetadata;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  currentValue?: number;
  predictedValue?: number;
  trend?: string;
  riskLevel?: string;
}

export const ChartExpansionDialog: React.FC<ChartExpansionDialogProps> = ({
  data,
  metadata,
  children,
  open,
  onOpenChange,
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'all' | 'recent' | 'forecast'>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Enhanced chart dimensions
  const chartWidth = 800;
  const chartHeight = 400;
  const padding = 60;

  // Filter data based on time range
  const getFilteredData = () => {
    switch (timeRange) {
      case 'recent':
        return data.filter(d => d.isHistorical);
      case 'forecast':
        return data.filter(d => !d.isHistorical);
      default:
        return data;
    }
  };

  const filteredData = getFilteredData();

  // Find data bounds
  const maxValue = Math.max(...filteredData.map(d => d.value), 100);
  const minValue = Math.min(...filteredData.map(d => d.value), 0);
  const maxDay = Math.max(...filteredData.map(d => d.day));
  const minDay = Math.min(...filteredData.map(d => d.day));

  // Scale functions for expanded chart
  const scaleX = (day: number) => 
    padding + ((day - minDay) / (maxDay - minDay)) * (chartWidth - 2 * padding);

  const scaleY = (value: number) => 
    chartHeight - padding - ((value - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding);

  // Split data into historical and forecast
  const historicalData = filteredData.filter(d => d.isHistorical);
  const forecastData = filteredData.filter(d => !d.isHistorical);

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

  // Create area path for area chart
  const createAreaPath = (points: TrendPoint[]) => {
    if (points.length === 0) return '';
    
    const linePath = createPath(points);
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    
    const baseY = scaleY(minValue);
    const startX = scaleX(firstPoint.day);
    const endX = scaleX(lastPoint.day);
    
    return `${linePath} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
  };

  const historicalPath = createPath(historicalData);
  const forecastPath = createPath(forecastData);
  const historicalAreaPath = createAreaPath(historicalData);
  const forecastAreaPath = createAreaPath(forecastData);

  // Generate axis labels
  const yAxisLabels = Array.from({ length: 6 }, (_, i) => {
    const value = minValue + (maxValue - minValue) * (i / 5);
    return {
      y: scaleY(value),
      value: Math.round(value)
    };
  }).reverse();

  const xAxisLabels = Array.from({ length: 6 }, (_, i) => {
    const day = minDay + (maxDay - minDay) * (i / 5);
    return {
      x: scaleX(day),
      value: Math.round(day)
    };
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'border-red-500 text-red-600 bg-red-50';
      case 'medium': return 'border-yellow-500 text-yellow-600 bg-yellow-50';
      case 'low': return 'border-green-500 text-green-600 bg-green-50';
      default: return 'border-gray-500 text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = () => {
    const lastValue = filteredData[filteredData.length - 1]?.value || 0;
    const firstValue = filteredData[0]?.value || 0;
    return lastValue > firstValue ? TrendUp : TrendDown;
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
  };

  const renderChart = () => {
    return (
      <div className="relative">
        <svg 
          width={chartWidth} 
          height={chartHeight}
          className="border rounded-lg bg-white"
        >
          <defs>
            <pattern id="expandedGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
            <linearGradient id="historicalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          <rect width={chartWidth} height={chartHeight} fill="url(#expandedGrid)"/>
          
          {/* Axes */}
          <line 
            x1={padding} 
            y1={padding} 
            x2={padding} 
            y2={chartHeight - padding}
            stroke="#64748b"
            strokeWidth="2"
          />
          <line 
            x1={padding} 
            y1={chartHeight - padding} 
            x2={chartWidth - padding} 
            y2={chartHeight - padding}
            stroke="#64748b"
            strokeWidth="2"
          />
          
          {/* Y-axis labels */}
          {yAxisLabels.map((label, index) => (
            <g key={index}>
              <line 
                x1={padding - 5} 
                y1={label.y} 
                x2={padding + 5} 
                y2={label.y}
                stroke="#64748b"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={label.y + 4}
                className="text-xs fill-gray-600"
                textAnchor="end"
              >
                {label.value}{metadata?.unit || ''}
              </text>
              <line 
                x1={padding} 
                y1={label.y} 
                x2={chartWidth - padding} 
                y2={label.y}
                stroke="#f3f4f6"
                strokeWidth="1"
                opacity="0.5"
              />
            </g>
          ))}
          
          {/* X-axis labels */}
          {xAxisLabels.map((label, index) => (
            <g key={index}>
              <line 
                x1={label.x} 
                y1={chartHeight - padding - 5} 
                x2={label.x} 
                y2={chartHeight - padding + 5}
                stroke="#64748b"
                strokeWidth="1"
              />
              <text
                x={label.x}
                y={chartHeight - padding + 20}
                className="text-xs fill-gray-600"
                textAnchor="middle"
              >
                Day {label.value}
              </text>
              <line 
                x1={label.x} 
                y1={padding} 
                x2={label.x} 
                y2={chartHeight - padding}
                stroke="#f3f4f6"
                strokeWidth="1"
                opacity="0.3"
              />
            </g>
          ))}
          
          {/* Chart rendering based on type */}
          {chartType === 'area' && (
            <>
              {historicalAreaPath && (
                <path
                  d={historicalAreaPath}
                  fill="url(#historicalGradient)"
                />
              )}
              {forecastAreaPath && (
                <path
                  d={forecastAreaPath}
                  fill="url(#forecastGradient)"
                />
              )}
            </>
          )}
          
          {chartType === 'bar' && (
            <>
              {/* Historical bars */}
              {historicalData.map((point, index) => {
                const x = scaleX(point.day);
                const y = scaleY(point.value);
                const barWidth = Math.max(8, (chartWidth - 2 * padding) / filteredData.length * 0.8);
                const barHeight = (chartHeight - padding) - y;
                
                return (
                  <rect
                    key={`hist-${index}`}
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="#3b82f6"
                  />
                );
              })}
              
              {/* Forecast bars */}
              {forecastData.map((point, index) => {
                if (timeRange === 'recent') return null;
                const x = scaleX(point.day);
                const y = scaleY(point.value);
                const barWidth = Math.max(8, (chartWidth - 2 * padding) / filteredData.length * 0.8);
                const barHeight = (chartHeight - padding) - y;
                
                return (
                  <rect
                    key={`fore-${index}`}
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="#8b5cf6"
                    opacity="0.7"
                  />
                );
              })}
            </>
          )}
          
          {chartType === 'line' && (
            <>
              {/* Historical line */}
              {historicalPath && (
                <path
                  d={historicalPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />
              )}
              
              {/* Forecast line */}
              {forecastPath && (
                <path
                  d={forecastPath}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
              )}
            </>
          )}
          
          {/* Data points */}
          {filteredData.map((point, index) => {
            if (chartType === 'bar') return null;
            return (
              <circle
                key={index}
                cx={scaleX(point.day)}
                cy={scaleY(point.value)}
                r="4"
                fill={point.isHistorical ? "#3b82f6" : "#8b5cf6"}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer hover:r-6 transition-all"
              >
                <title>
                  Day {point.day}: {point.value}{metadata?.unit || ''}
                </title>
              </circle>
            );
          })}
          
          {/* Divider line between historical and forecast */}
          {timeRange === 'all' && historicalData.length > 0 && forecastData.length > 0 && (
            <line
              x1={scaleX(Math.max(...historicalData.map(d => d.day)))}
              y1={padding}
              x2={scaleX(Math.max(...historicalData.map(d => d.day)))}
              y2={chartHeight - padding}
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
          )}
        </svg>
      </div>
    );
  };

  const TrendIcon = getTrendIcon();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <ArrowsOut className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TrendIcon className="h-5 w-5" />
            <DialogTitle>{metadata?.title || 'Chart Analysis'}</DialogTitle>
            {metadata?.riskLevel && (
              <Badge 
                variant="outline"
                className={getRiskColor(metadata.riskLevel)}
              >
                {metadata.riskLevel.toUpperCase()} RISK
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium">Chart Type</label>
                <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        Line
                      </div>
                    </SelectItem>
                    <SelectItem value="area">
                      <div className="flex items-center gap-2">
                        Area
                      </div>
                    </SelectItem>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <ChartBar className="h-4 w-4" />
                        Bar
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Time Range</label>
                <Select value={timeRange} onValueChange={(value: 'all' | 'recent' | 'forecast') => setTimeRange(value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Data</SelectItem>
                    <SelectItem value="recent">Historical</SelectItem>
                    <SelectItem value="forecast">Forecast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
          
          {/* Main Chart */}
          <Card>
            <CardContent className="p-6">
              {renderChart()}
            </CardContent>
          </Card>
          
          {metadata && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="font-medium">Current Value: </span>
                    <span>{filteredData[filteredData.length - 1]?.value || 0}{metadata.unit || ''}</span>
                  </div>
                  {metadata.predictedValue && (
                    <div>
                      <span className="font-medium">Predicted Value: </span>
                      <span>{metadata.predictedValue}{metadata.unit || ''}</span>
                    </div>
                  )}
                  {metadata.confidence && (
                    <div>
                      <span className="font-medium">Confidence: </span>
                      <span>{Math.round(metadata.confidence * 100)}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Insights */}
              {metadata.insights && metadata.insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {metadata.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {metadata?.description && (
            <Card>
              <CardContent className="p-4">
                <p className="text-gray-600">{metadata.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
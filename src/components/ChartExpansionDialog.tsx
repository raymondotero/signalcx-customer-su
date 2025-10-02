import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportSVGAsImage } from '@/lib/chartExport';
import { 
  TrendUp, 
  TrendDown, 
  Activity, 
  Calendar,
  Target,
  ChartBar,
  ChartLine,
  Download,
  ArrowsOut
} from '@phosphor-icons/react';

interface TrendPoint {
  day: number;
  value: number;
  isHistorical: boolean;
  confidence?: number;
  label?: string;
}

interface ChartExpansionDialogProps {
  title: string;
  data: TrendPoint[];
  currentValue: number;
  predictedValue?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
  children?: React.ReactNode;
  metadata?: {
    unit?: string;
    timeframe?: string;
    confidence?: number;
    description?: string;
    insights?: string[];
  };
}

export const ChartExpansionDialog: React.FC<ChartExpansionDialogProps> = ({
  title,
  data,
  currentValue,
  predictedValue,
  trend,
  riskLevel = 'medium',
  className = '',
  children,
  metadata
}) => {
  const [open, setOpen] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'all' | 'recent' | 'forecast'>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Enhanced chart dimensions for expanded view
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

  // Create enhanced path strings
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

  // Enhanced confidence area
  const createConfidenceArea = (points: TrendPoint[]) => {
    if (points.length === 0) return '';
    
    const upperPath = points.map((point, index) => {
      const x = scaleX(point.day);
      const confidence = point.confidence || 0.8;
      const uncertainty = (1 - confidence) * (maxValue - minValue) * 0.1;
      const y = scaleY(point.value - uncertainty);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
    
    const lowerPath = points.slice().reverse().map(point => {
      const x = scaleX(point.day);
      const confidence = point.confidence || 0.8;
      const uncertainty = (1 - confidence) * (maxValue - minValue) * 0.1;
      const y = scaleY(point.value + uncertainty);
      return `L ${x} ${y}`;
    }).join(' ');
    
    return upperPath + lowerPath + ' Z';
  };

  const confidenceArea = createConfidenceArea(forecastData);

  // Get colors based on risk level
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'critical': return '#ef4444'; // red-500
      case 'high': return '#f59e0b'; // amber-500
      case 'medium': return '#eab308'; // yellow-500
      case 'low': return '#22c55e'; // green-500
      default: return '#6b7280'; // gray-500
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing': return <TrendUp className="w-5 h-5 text-red-600" />;
      case 'decreasing': return <TrendDown className="w-5 h-5 text-green-600" />;
      case 'stable': return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  // Export chart as image
  const exportChartAsImage = async () => {
    setIsExporting(true);
    
    try {
      const svgElement = document.querySelector('.chart-svg') as SVGElement;
      if (!svgElement) {
        throw new Error('Chart not found');
      }

      await exportSVGAsImage(svgElement, {
        title,
        width: chartWidth,
        height: chartHeight,
        filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_chart_${Date.now()}.png`
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  const getChartIcon = () => {
    switch (chartType) {
      case 'line': return <ChartLine className="w-4 h-4" />;
      case 'area': return <Activity className="w-4 h-4" />;
      case 'bar': return <ChartBar className="w-4 h-4" />;
    }
  };
  const yAxisLabels: Array<{ value: number; y: number }> = [];
  const labelCount = 5;
  for (let i = 0; i <= labelCount; i++) {
    const value = minValue + (maxValue - minValue) * (i / labelCount);
    const y = scaleY(value);
    yAxisLabels.push({ value: Math.round(value), y });
  }

  // Create X-axis labels
  const xAxisLabels: Array<{ label: string; x: number; day: number }> = [];
  const xLabelCount = Math.min(10, filteredData.length);
  for (let i = 0; i < xLabelCount; i++) {
    const index = Math.floor((filteredData.length - 1) * (i / (xLabelCount - 1)));
    const point = filteredData[index];
    if (point) {
      const x = scaleX(point.day);
      xAxisLabels.push({ 
        label: point.label || `Day ${point.day}`, 
        x,
        day: point.day 
      });
    }
  }

  const renderChart = () => {
    return (
      <div className="relative">
        <svg 
          width={chartWidth} 
          height={chartHeight}
          className="border rounded bg-gradient-to-br from-gray-50 to-white shadow-sm chart-svg"
        >
          {/* Enhanced grid */}
          <defs>
            <pattern id="expandedGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
            <linearGradient id="historicalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6b7280" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#6b7280" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={getRiskColor()} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={getRiskColor()} stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#expandedGrid)" />
          
          {/* Y-axis */}
          <line 
            x1={padding} 
            y1={padding} 
            x2={padding} 
            y2={chartHeight - padding} 
            stroke="#d1d5db" 
            strokeWidth="2"
          />
          
          {/* X-axis */}
          <line 
            x1={padding} 
            y1={chartHeight - padding} 
            x2={chartWidth - padding} 
            y2={chartHeight - padding} 
            stroke="#d1d5db" 
            strokeWidth="2"
          />
          
          {/* Y-axis labels */}
          {yAxisLabels.map((label, index) => (
            <g key={index}>
              <line 
                x1={padding - 5} 
                y1={label.y} 
                x2={padding} 
                y2={label.y} 
                stroke="#9ca3af" 
                strokeWidth="1"
              />
              <text 
                x={padding - 10} 
                y={label.y + 4} 
                textAnchor="end" 
                className="text-xs fill-gray-600"
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
                y1={chartHeight - padding} 
                x2={label.x} 
                y2={chartHeight - padding + 5} 
                stroke="#9ca3af" 
                strokeWidth="1"
              />
              <text 
                x={label.x} 
                y={chartHeight - padding + 18} 
                textAnchor="middle" 
                className="text-xs fill-gray-600"
              >
                {label.label}
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
          
          {/* Confidence area for forecast */}
          {confidenceArea && timeRange !== 'recent' && (
            <path
              d={confidenceArea}
              fill={getRiskColor()}
              opacity="0.15"
            />
          )}
          
          {/* Chart rendering based on type */}
          {chartType === 'area' && (
            <>
              {/* Historical area */}
              {historicalAreaPath && timeRange !== 'forecast' && (
                <path
                  d={historicalAreaPath}
                  fill="url(#historicalGradient)"
                />
              )}
              
              {/* Forecast area */}
              {forecastAreaPath && timeRange !== 'recent' && (
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
                if (timeRange === 'forecast') return null;
                const x = scaleX(point.day);
                const y = scaleY(point.value);
                const barHeight = chartHeight - padding - y;
                const barWidth = Math.max(8, (chartWidth - 2 * padding) / filteredData.length * 0.8);
                
                return (
                  <rect
                    key={`hist-${index}`}
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="#6b7280"
                    opacity="0.8"
                  />
                );
              })}
              
              {/* Forecast bars */}
              {forecastData.map((point, index) => {
                if (timeRange === 'recent') return null;
                const x = scaleX(point.day);
                const y = scaleY(point.value);
                const barHeight = chartHeight - padding - y;
                const barWidth = Math.max(8, (chartWidth - 2 * padding) / filteredData.length * 0.8);
                
                return (
                  <rect
                    key={`fore-${index}`}
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={getRiskColor()}
                    opacity="0.7"
                  />
                );
              })}
            </>
          )}
          
          {/* Lines for line and area charts */}
          {(chartType === 'line' || chartType === 'area') && (
            <>
              {/* Historical line */}
              {historicalPath && timeRange !== 'forecast' && (
                <path
                  d={historicalPath}
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="3"
                />
              )}
              
              {/* Forecast line */}
              {forecastPath && timeRange !== 'recent' && (
                <path
                  d={forecastPath}
                  fill="none"
                  stroke={getRiskColor()}
                  strokeWidth="3"
                  strokeDasharray="8,4"
                />
              )}
            </>
          )}
          
          {/* Enhanced data points */}
          {filteredData.map((point, index) => {
            if (timeRange === 'forecast' && point.isHistorical) return null;
            if (timeRange === 'recent' && !point.isHistorical) return null;
            
            return (
              <g key={index}>
                <circle
                  cx={scaleX(point.day)}
                  cy={scaleY(point.value)}
                  r="6"
                  fill={point.isHistorical ? '#6b7280' : getRiskColor()}
                  stroke="white"
                  strokeWidth="2"
                  opacity={point.isHistorical ? 0.9 : 0.8}
                  className="hover:r-8 transition-all cursor-pointer"
                />
                {/* Tooltip on hover */}
                <title>
                  {point.label || `Day ${point.day}`}: {point.value}{metadata?.unit || ''}
                  {point.confidence && ` (${Math.round(point.confidence * 100)}% confidence)`}
                </title>
              </g>
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
              strokeDasharray="4,4"
              opacity="0.6"
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowsOut className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getTrendIcon()}
            {title}
            <Badge 
              variant="outline"
              className={`${
                riskLevel === 'critical' ? 'border-red-500 text-red-700' :
                riskLevel === 'high' ? 'border-orange-500 text-orange-700' :
                riskLevel === 'medium' ? 'border-yellow-500 text-yellow-700' :
                'border-green-500 text-green-700'
              }`}
            >
              {riskLevel}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Chart Type:</label>
                <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <ChartLine className="w-4 h-4" />
                        Line
                      </div>
                    </SelectItem>
                    <SelectItem value="area">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Area
                      </div>
                    </SelectItem>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <ChartBar className="w-4 h-4" />
                        Bar
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Time Range:</label>
                <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
                  <SelectTrigger className="w-32">
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
              variant="outline" 
              size="sm" 
              onClick={() => exportChartAsImage().catch(console.error)}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export PNG'}
            </Button>
          </div>
          
          {/* Main Chart */}
          <Card className="border-visible">
            <CardContent className="p-6">
              {renderChart()}
            </CardContent>
          </Card>
          
          {/* Insights and Metadata */}
          {metadata && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key Metrics */}
              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="text-sm">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Value:</span>
                    <span className="font-medium">{currentValue}{metadata.unit}</span>
                  </div>
                  {predictedValue && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Predicted Value:</span>
                      <span className="font-medium">{predictedValue}{metadata.unit}</span>
                    </div>
                  )}
                  {metadata.confidence && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <span className="font-medium">{Math.round(metadata.confidence * 100)}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Trend:</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon()}
                      <span className="font-medium capitalize">{trend}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Insights */}
              {metadata.insights && metadata.insights.length > 0 && (
                <Card className="border-visible">
                  <CardHeader>
                    <CardTitle className="text-sm">Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {metadata.insights.map((insight, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Description */}
          {metadata?.description && (
            <Card className="border-visible">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{metadata.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
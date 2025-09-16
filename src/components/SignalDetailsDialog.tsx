import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Clock, 
  TrendUp, 
  TrendDown, 
  Minus,
  Eye,
  Target,
  Warning,
  CheckCircle,
  Info
} from '@phosphor-icons/react';
import { Signal } from '@/types';

interface SignalDetailsDialogProps {
  signal: Signal;
  trigger?: React.ReactNode;
}

export function SignalDetailsDialog({ signal, trigger }: SignalDetailsDialogProps) {
  const getSeverityColor = (severity: Signal['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: Signal['severity']) => {
    switch (severity) {
      case 'critical': return <Warning className="w-4 h-4 text-red-500" />;
      case 'high': return <Warning className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Info className="w-4 h-4 text-blue-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend?: Signal['trend']) => {
    switch (trend) {
      case 'improving': return <TrendUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const formatValue = (value?: number, unit?: string) => {
    if (value === undefined) return 'N/A';
    if (unit === '%') return `${value.toFixed(1)}${unit}`;
    if (unit) return `${value} ${unit}`;
    return value.toString();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(timestamp)
    };
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const time = formatTimestamp(signal.timestamp);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            Signal Details
            <Badge className={getSeverityColor(signal.severity)}>
              {signal.severity}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Signal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Signal Name</p>
                  <p className="text-lg font-semibold">{signal.signalName || signal.type}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{signal.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account</p>
                    <p className="font-medium">{signal.accountName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <Badge className="capitalize">{signal.type}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Severity</p>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(signal.severity)}
                      <span className="capitalize font-medium">{signal.severity}</span>
                    </div>
                  </div>
                  
                  {signal.category && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <Badge className="capitalize">{signal.category}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamp Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="font-medium">{time.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="font-medium">{time.time}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Relative</p>
                  <p className="font-medium text-muted-foreground">{time.relative}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Value and Trend Information */}
          {(signal.value !== undefined || signal.trend || signal.target !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {signal.value !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                      <p className="text-2xl font-bold">{formatValue(signal.value, signal.unit)}</p>
                    </div>
                  )}
                  
                  {signal.target !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Target Value</p>
                      <p className="text-2xl font-bold text-green-600">{formatValue(signal.target, signal.unit)}</p>
                    </div>
                  )}
                  
                  {signal.trend && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Trend</p>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(signal.trend)}
                        <span className="font-medium capitalize">{signal.trend}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress indicator if both value and target exist */}
                {signal.value !== undefined && signal.target !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress to Target</span>
                      <span className="text-sm text-muted-foreground">
                        {((signal.value / signal.target) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          signal.value >= signal.target ? 'bg-green-500' :
                          signal.value >= signal.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((signal.value / signal.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          {signal.aiAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Impact Assessment</p>
                    <p className="text-sm">{signal.aiAnalysis.impact}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Urgency</p>
                      <Badge className={getSeverityColor(signal.aiAnalysis.urgency)}>
                        {signal.aiAnalysis.urgency}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Affected Accounts</p>
                      <p className="font-bold text-lg">{signal.aiAnalysis.affectedAccountsCount}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Business Value at Risk</p>
                    <p className="text-lg font-bold text-red-600">{signal.aiAnalysis.businessValueAtRisk}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          {signal.aiRecommendations && signal.aiRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signal.aiRecommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge className={getSeverityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <br />
                          <Badge className="text-xs">{rec.category}</Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Effort:</span>
                          <br />
                          <span className="font-medium">{rec.effort}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Timeline:</span>
                          <br />
                          <span className="font-medium">{rec.timeline}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Impact:</span>
                          <br />
                          <span className="font-medium">{rec.estimatedImpact}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Reasoning:</p>
                        <p className="text-xs">{rec.reasoning}</p>
                      </div>
                      
                      {rec.successMetrics && rec.successMetrics.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Success Metrics:</p>
                          <ul className="text-xs space-y-1">
                            {rec.successMetrics.map((metric, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {metric}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {signal.metadata && Object.keys(signal.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(signal.metadata, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
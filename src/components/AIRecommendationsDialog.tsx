import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Lightbulb, Target, Clock, Users, TrendUp, X, Warning } from '@phosphor-icons/react';
import { Signal, AIRecommendation, SignalAnalysis } from '@/types';

interface AIRecommendationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signal: Signal | null;
  recommendations: AIRecommendation[];
  analysis: SignalAnalysis | null;
  isLoading?: boolean;
  onRetry?: () => void;
}

export function AIRecommendationsDialog({
  open,
  onOpenChange,
  signal,
  recommendations,
  analysis,
  isLoading,
  onRetry
}: AIRecommendationsDialogProps) {
  if (!signal) return null;

  const hasError = analysis?.error;
  const hasRecommendations = recommendations && recommendations.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-primary" />
            AI Recommendations for {signal.signalName || signal.type}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="ml-auto h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            AI-powered analysis and recommendations for this business value signal
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-6 pr-4">
            {/* Signal Overview */}
            <Card className="border-visible">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Signal Overview</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      signal.severity === 'critical' ? 'destructive' :
                      signal.severity === 'high' ? 'default' :
                      signal.severity === 'medium' ? 'secondary' : 'outline'
                    }>
                      {signal.severity} Priority
                    </Badge>
                    {signal.value !== undefined && (
                      <Badge variant="outline">
                        {signal.value}{signal.unit || ''}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Signal Name</p>
                    <p className="text-muted-foreground">{signal.signalName || signal.type}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Category</p>
                    <p className="text-muted-foreground capitalize">{signal.category}</p>
                  </div>
                  {signal.description && (
                    <div className="md:col-span-2">
                      <p className="font-medium text-foreground">Description</p>
                      <p className="text-muted-foreground">{signal.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <Card className="border-visible">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-3">
                    <Brain className="w-6 h-6 text-primary animate-pulse-ai" />
                    <div className="text-center">
                      <p className="font-medium">Generating AI Recommendations...</p>
                      <p className="text-sm text-muted-foreground">Analyzing signal impact and generating tailored recommendations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {hasError && !isLoading && (
              <Card className={`border-visible ${analysis?.error?.includes('knowledge base') || analysis?.error?.includes('not available') 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-destructive/50 bg-destructive/5'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Warning className={`w-5 h-5 mt-0.5 flex-shrink-0 ${analysis?.error?.includes('knowledge base') || analysis?.error?.includes('not available') 
                      ? 'text-blue-600' 
                      : 'text-destructive'}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold mb-2 ${analysis?.error?.includes('knowledge base') || analysis?.error?.includes('not available') 
                        ? 'text-blue-900' 
                        : 'text-destructive'}`}>Knowledge-Based Recommendations Available</h4>
                      <div className="text-sm text-muted-foreground mb-3 space-y-2">
                        <p className="font-medium">
                          {analysis?.error?.includes('not available') || analysis?.error?.includes('knowledge base') 
                            ? 'AI services are currently unavailable, but we\'ve generated expert recommendations based on our knowledge base.'
                            : analysis?.error?.split(' - ')[0] || 'Unable to generate AI recommendations at this time'
                          }
                        </p>
                        {analysis?.error?.includes(' - ') && !analysis?.error?.includes('knowledge base') && (
                          <p className="text-xs bg-muted/50 p-2 rounded border">
                            {analysis.error.split(' - ')[1]}
                          </p>
                        )}
                        {(analysis?.error?.includes('not available') || analysis?.error?.includes('knowledge base')) ? (
                          <div className="text-xs bg-blue-50 border border-blue-200 p-2 rounded">
                            <p className="font-medium text-blue-900 mb-1">About These Recommendations:</p>
                            <ul className="text-blue-700 space-y-1">
                              <li>• Generated using Customer Success best practices</li>
                              <li>• Based on signal category and severity analysis</li>
                              <li>• Tailored to your account portfolio health</li>
                              <li>• Try "Test AI" button in header to enable full AI features</li>
                            </ul>
                          </div>
                        ) : (
                          <div className="text-xs bg-blue-50 border border-blue-200 p-2 rounded">
                            <p className="font-medium text-blue-900 mb-1">Troubleshooting Tips:</p>
                            <ul className="text-blue-700 space-y-1">
                              <li>• Try using the "Test AI" button in the header to verify AI connectivity</li>
                              <li>• Refresh the page if the Spark runtime needs reinitialization</li>
                              <li>• Check that your browser supports modern JavaScript features</li>
                              <li>• Use the "Retry AI Generation" button below to try again</li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {onRetry && (
                          <Button size="sm" variant="outline" onClick={onRetry}>
                            <Brain className="w-4 h-4 mr-2" />
                            Retry AI Generation
                          </Button>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Signal: {signal.signalName || signal.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Severity: {signal.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis Summary */}
            {analysis && !hasError && !isLoading && (
              <Card className="border-visible bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-900">
                    <Target className="w-5 h-5" />
                    AI Signal Analysis
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-blue-700">Business Impact</p>
                      <p className="text-blue-600">{analysis.impact}</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-700">Urgency Level</p>
                      <Badge variant={
                        analysis.urgency === 'critical' ? 'destructive' :
                        analysis.urgency === 'high' ? 'default' : 'secondary'
                      }>
                        {analysis.urgency}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-blue-700">Affected Accounts</p>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600">{analysis.affectedAccountsCount}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-blue-700">Value at Risk</p>
                      <div className="flex items-center gap-1">
                        <TrendUp className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600">{analysis.businessValueAtRisk}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Recommendations */}
            {hasRecommendations && !isLoading && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-semibold">
                    {hasError ? 'Fallback Recommendations' : 'AI-Generated Recommendations'}
                  </h4>
                  <Badge variant="outline" className="ml-auto">
                    {recommendations.length} Recommendation{recommendations.length !== 1 ? 's' : ''}
                  </Badge>
                  {hasError && (
                    <Badge variant="secondary" className="text-xs">
                      AI Unavailable
                    </Badge>
                  )}
                </div>
                
                {hasError && (
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded border border-dashed">
                    <p className="font-medium">ℹ️ These are pre-configured recommendations based on signal patterns.</p>
                    <p>AI-generated recommendations will provide more tailored insights once the AI service is available.</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <Card key={index} className="border-visible">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-medium text-foreground flex-1">{recommendation.title}</h5>
                          <div className="flex items-center gap-2 ml-4">
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
                        
                        <p className="text-sm text-muted-foreground mb-4">
                          {recommendation.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="font-medium text-foreground mb-1">Target Accounts</p>
                            <p className="text-muted-foreground">
                              {Array.isArray(recommendation.targetAccounts) 
                                ? recommendation.targetAccounts.join(', ')
                                : recommendation.targetAccounts}
                            </p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-foreground mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Timeline
                            </p>
                            <p className="text-muted-foreground">{recommendation.timeline}</p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-foreground mb-1">Category</p>
                            <Badge variant="outline" className="text-xs">
                              {recommendation.category}
                            </Badge>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-3">
                          <div>
                            <p className="font-medium text-foreground text-sm mb-1 flex items-center gap-1">
                              <TrendUp className="w-4 h-4 text-green-600" />
                              Expected Impact
                            </p>
                            <p className="text-green-600 text-sm">{recommendation.estimatedImpact}</p>
                          </div>

                          {recommendation.successMetrics && recommendation.successMetrics.length > 0 && (
                            <div>
                              <p className="font-medium text-foreground text-sm mb-2">Success Metrics</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {recommendation.successMetrics.map((metric, metricIndex) => (
                                  <li key={metricIndex} className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">•</span>
                                    <span>{metric}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="pt-3 border-t border-dashed">
                            <p className="text-sm text-blue-600 font-medium mb-1">AI Reasoning</p>
                            <p className="text-sm text-muted-foreground italic">
                              {recommendation.reasoning}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Recommendations State */}
            {!hasRecommendations && !isLoading && !hasError && (
              <Card className="border-visible">
                <CardContent className="p-8">
                  <div className="text-center text-muted-foreground">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium mb-2">No recommendations generated yet</p>
                    <p className="text-sm mb-4">
                      AI analysis didn't produce specific recommendations for this signal
                    </p>
                    {onRetry && (
                      <Button
                        size="sm"
                        onClick={onRetry}
                        variant="outline"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Retry AI Generation
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
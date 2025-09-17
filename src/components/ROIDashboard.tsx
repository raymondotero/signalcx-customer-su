import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calculator, 
  TrendUp, 
  CurrencyDollar, 
  ChartBar, 
  Target,
  Brain,
  Shield,
  Database,
  Users,
  Lightning
} from '@phosphor-icons/react';
import { ROICalculator } from './ROICalculator';
import { PowerPointGenerator } from './PowerPointGenerator';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface ROIResult {
  solution: string;
  metrics: any;
  timestamp: string;
}

export function ROIDashboard() {
  const [roiResults, setROIResults] = useKV<ROIResult[]>('roi-calculations', []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const safeROIResults = roiResults || [];

  const categories = [
    { id: 'all', name: 'All Solutions', icon: ChartBar, color: 'bg-gray-100 text-gray-800' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleROICalculation = (solution: string, metrics: any) => {
    const newResult: ROIResult = {
      solution,
      metrics,
      timestamp: new Date().toISOString()
    };
    
    setROIResults(currentResults => {
      const safeResults = currentResults || [];
      return [newResult, ...safeResults.slice(0, 9)]; // Keep latest 10
    });
    toast.success(`ROI calculated for ${solution}`);
  };

  const getTotalPortfolioValue = () => {
    const safeResults = roiResults || [];
    if (safeResults.length === 0) return { investment: 0, npv: 0, roi: 0 };
    
    const totalInvestment = safeResults.reduce((sum, result) => sum + (result.metrics.investment || 0), 0);
    const totalNPV = safeResults.reduce((sum, result) => sum + (result.metrics.npv || 0), 0);
    const portfolioROI = totalInvestment > 0 ? ((totalNPV) / totalInvestment) * 100 : 0;
    
    return { investment: totalInvestment, npv: totalNPV, roi: portfolioROI };
  };

  const portfolio = getTotalPortfolioValue();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="w-4 h-4" />
          ROI Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Calculator className="w-6 h-6" />
            Microsoft Solutions ROI Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Portfolio Summary */}
          {safeROIResults.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendUp className="w-5 h-5" />
                    Portfolio Summary
                  </div>
                  <PowerPointGenerator />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CurrencyDollar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-medium text-blue-800">Total Investment</span>
                    </div>
                    <p className="text-lg font-bold text-blue-800">
                      {formatCurrency(portfolio.investment)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-xs font-medium text-green-800">Portfolio NPV</span>
                    </div>
                    <p className="text-lg font-bold text-green-800">
                      {formatCurrency(portfolio.npv)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <ChartBar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-xs font-medium text-purple-800">Portfolio ROI</span>
                    </div>
                    <p className="text-lg font-bold text-purple-800">
                      {formatPercentage(portfolio.roi)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Solution Categories */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Solution Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow min-w-0 max-w-xs">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className={`p-3 rounded-lg ${category.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-medium leading-tight">{category.name}</span>
                          <ROICalculator onCalculationComplete={handleROICalculation} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Calculations */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg mb-2">Recent ROI Calculations</CardTitle>
              </CardHeader>
              <CardContent>
                {safeROIResults.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {safeROIResults.slice(0, 5).map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm leading-tight">{result.solution}</h4>
                          <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                            {new Date(result.timestamp).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ROI:</span>
                            <span className="font-semibold">{formatPercentage(result.metrics.roi)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payback:</span>
                            <span className="font-semibold">{result.metrics.payback.toFixed(1)}mo</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">NPV:</span>
                            <span className="font-semibold">{formatCurrency(result.metrics.npv)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {safeROIResults.length > 5 && (
                      <div className="text-center pt-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          View All ({safeROIResults.length}) Calculations
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calculator className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      No ROI calculations yet. Use the calculator to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick ROI Templates - Most Common Use Cases */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick ROI Templates - Most Common Use Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg min-w-0 space-y-3">
                  <h4 className="font-medium text-sm">Microsoft 365 Copilot</h4>
                  <p className="text-xs text-muted-foreground">
                    AI-powered productivity enhancement for knowledge workers
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 font-medium">Typical ROI: 150-300%</span>
                    <ROICalculator onCalculationComplete={handleROICalculation} />
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg min-w-0 space-y-3">
                  <h4 className="font-medium text-sm">Azure Cloud Migration</h4>
                  <p className="text-xs text-muted-foreground">
                    Infrastructure modernization and cost optimization
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 font-medium">Typical ROI: 200-400%</span>
                    <ROICalculator onCalculationComplete={handleROICalculation} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">ROI Calculation Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">📊 Measurement Guidelines</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Include implementation and training costs</li>
                      <li>• Factor in productivity ramp-up time</li>
                      <li>• Account for ongoing support and maintenance</li>
                      <li>• Consider compliance and security benefits</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">🎯 Success Factors</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Align ROI metrics with business KPIs</li>
                      <li>• Engage stakeholders early in the process</li>
                      <li>• Document assumptions and methodology</li>
                      <li>• Plan for regular ROI validation and updates</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">⚠️ Common Pitfalls</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Overestimating productivity gains</li>
                      <li>• Underestimating change management costs</li>
                      <li>• Ignoring licensing complexity</li>
                      <li>• Not accounting for user adoption curves</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">💡 Presentation Tips</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Lead with business outcomes, not technology features</li>
                      <li>• Use industry benchmarks and peer comparisons</li>
                      <li>• Show multiple scenarios (conservative, likely, optimistic)</li>
                      <li>• Include qualitative benefits alongside quantitative ROI</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
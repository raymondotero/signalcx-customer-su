import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
import { PowerPointExporter } from './PowerPointExporter';
import { AdvancedPowerPointGenerator } from './AdvancedPowerPointGenerator';
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
    { id: 'all', name: 'All Solutions', icon: ChartBar, color: 'bg-gray-100 text-gray-800' },
    { id: 'ai', name: 'AI/ML', icon: Brain, color: 'bg-purple-100 text-purple-800' },
    { id: 'productivity', name: 'Productivity', icon: Lightning, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'security', name: 'Security', icon: Shield, color: 'bg-red-100 text-red-800' },
    { id: 'infrastructure', name: 'Infrastructure', icon: Database, color: 'bg-blue-100 text-blue-800' },
    { id: 'crm', name: 'CRM', icon: Users, color: 'bg-green-100 text-green-800' }
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Microsoft Solutions ROI Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Portfolio Summary */}
          {safeROIResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendUp className="w-5 h-5" />
                    Portfolio Summary
                  </div>
                  <div className="flex gap-2">
                    <PowerPointExporter />
                    <AdvancedPowerPointGenerator />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CurrencyDollar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Total Investment</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatCurrency(portfolio.investment)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Portfolio NPV</span>
                    </div>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(portfolio.npv)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ChartBar className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Portfolio ROI</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-800">
                      {formatPercentage(portfolio.roi)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Solution Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Solution Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium">{category.name}</span>
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
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent ROI Calculations</span>
                  {safeROIResults.length > 0 && (
                    <PowerPointExporter />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safeROIResults.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {safeROIResults.slice(0, 5).map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{result.solution}</h4>
                          <Badge variant="outline" className="text-xs">
                            {new Date(result.timestamp).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">ROI:</span>
                            <p className="font-semibold">{formatPercentage(result.metrics.roi)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Payback:</span>
                            <p className="font-semibold">{result.metrics.payback.toFixed(1)}mo</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">NPV:</span>
                            <p className="font-semibold">{formatCurrency(result.metrics.npv)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {safeROIResults.length > 5 && (
                      <div className="text-center">
                        <Button variant="outline" size="sm">
                          View All ({safeROIResults.length}) Calculations
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No ROI calculations yet. Use the calculators above to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick ROI Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick ROI Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="common" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="common">Common Use Cases</TabsTrigger>
                  <TabsTrigger value="industry">Industry Specific</TabsTrigger>
                  <TabsTrigger value="competitive">Competitive Response</TabsTrigger>
                  <TabsTrigger value="migration">Migration/Modernization</TabsTrigger>
                </TabsList>
                
                <TabsContent value="common" className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Productivity Enhancement</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Microsoft 365 Copilot for knowledge workers
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-600">Typical ROI: 150-300%</span>
                        <ROICalculator onCalculationComplete={handleROICalculation} />
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Cloud Cost Optimization</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Azure infrastructure rightsizing and automation
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-600">Typical ROI: 200-400%</span>
                        <ROICalculator onCalculationComplete={handleROICalculation} />
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Security Modernization</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Zero Trust security implementation
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-600">Typical ROI: 100-250%</span>
                        <ROICalculator onCalculationComplete={handleROICalculation} />
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Process Automation</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Power Platform low-code development
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-600">Typical ROI: 250-500%</span>
                        <ROICalculator onCalculationComplete={handleROICalculation} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="industry" className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Financial Services</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Compliance automation and risk management
                      </p>
                      <ROICalculator onCalculationComplete={handleROICalculation} />
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Healthcare</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Patient data analytics and care coordination
                      </p>
                      <ROICalculator onCalculationComplete={handleROICalculation} />
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Manufacturing</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        IoT and predictive maintenance solutions
                      </p>
                      <ROICalculator onCalculationComplete={handleROICalculation} />
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Retail</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Customer analytics and personalization
                      </p>
                      <ROICalculator onCalculationComplete={handleROICalculation} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="competitive" className="space-y-3">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium mb-2 text-orange-800">Competitive Displacement</h4>
                    <p className="text-sm text-orange-700 mb-3">
                      ROI calculations for replacing competitor solutions with Microsoft technologies.
                      Focus on migration costs, feature parity, and total cost of ownership improvements.
                    </p>
                    <ROICalculator onCalculationComplete={handleROICalculation} />
                  </div>
                </TabsContent>
                
                <TabsContent value="migration" className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Legacy System Migration</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Modernizing on-premises applications to Azure
                      </p>
                      <ROICalculator onCalculationComplete={handleROICalculation} />
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Data Platform Modernization</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Moving to Azure Synapse and modern analytics
                      </p>
                      <ROICalculator onCalculationComplete={handleROICalculation} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Tips and Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>ROI Calculation Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">📊 Measurement Guidelines</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Use conservative estimates for savings calculations</li>
                    <li>• Include implementation and training costs</li>
                    <li>• Factor in productivity ramp-up time</li>
                    <li>• Consider opportunity costs of not modernizing</li>
                    <li>• Include risk mitigation value</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">💡 Presentation Tips</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Lead with business outcomes, not technology features</li>
                    <li>• Use industry benchmarks and peer comparisons</li>
                    <li>• Show multiple scenarios (conservative, likely, optimistic)</li>
                    <li>• Include qualitative benefits alongside quantitative ROI</li>
                    <li>• Provide clear implementation timeline and milestones</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
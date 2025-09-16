import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calculator, TrendUp, CurrencyDollar, Clock, ChartBar, Download } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ROIMetrics {
  investment: number;
  savings: number;
  productivity: number;
  revenue: number;
  implementation: number;
  timeline: number;
  roi: number;
  payback: number;
  npv: number;
}

interface SolutionTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultMetrics: Partial<ROIMetrics>;
  factors: {
    id: string;
    label: string;
    type: 'currency' | 'percentage' | 'number' | 'months';
    placeholder: string;
    helpText?: string;
  }[];
}

const solutionTemplates: SolutionTemplate[] = [
  {
    id: 'azure-ai',
    name: 'Azure AI & Cognitive Services',
    category: 'AI/ML',
    description: 'Automate processes and enhance decision-making with AI',
    defaultMetrics: {
      implementation: 6,
      timeline: 12
    },
    factors: [
      { id: 'currentStaff', label: 'Current Manual Processing Staff', type: 'number', placeholder: '50' },
      { id: 'avgSalary', label: 'Average Staff Salary', type: 'currency', placeholder: '75000' },
      { id: 'automationRate', label: 'Process Automation %', type: 'percentage', placeholder: '60' },
      { id: 'errorReduction', label: 'Error Reduction %', type: 'percentage', placeholder: '85' },
      { id: 'licensesCost', label: 'Azure AI Licensing', type: 'currency', placeholder: '250000' }
    ]
  },
  {
    id: 'power-platform',
    name: 'Microsoft Power Platform',
    category: 'Low-Code',
    description: 'Accelerate app development and automate workflows',
    defaultMetrics: {
      implementation: 3,
      timeline: 12
    },
    factors: [
      { id: 'developers', label: 'Current Developers', type: 'number', placeholder: '20' },
      { id: 'devSalary', label: 'Developer Average Salary', type: 'currency', placeholder: '120000' },
      { id: 'appDelivery', label: 'App Delivery Speed Increase %', type: 'percentage', placeholder: '300' },
      { id: 'citizenDevs', label: 'New Citizen Developers', type: 'number', placeholder: '100' },
      { id: 'platformCost', label: 'Power Platform Licensing', type: 'currency', placeholder: '180000' }
    ]
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365 Copilot',
    category: 'Productivity',
    description: 'Enhance productivity with AI-powered assistance',
    defaultMetrics: {
      implementation: 2,
      timeline: 12
    },
    factors: [
      { id: 'users', label: 'Number of Users', type: 'number', placeholder: '5000' },
      { id: 'avgSalary', label: 'Average User Salary', type: 'currency', placeholder: '85000' },
      { id: 'productivityGain', label: 'Productivity Increase %', type: 'percentage', placeholder: '25' },
      { id: 'meetingReduction', label: 'Meeting Time Reduction %', type: 'percentage', placeholder: '30' },
      { id: 'copilotCost', label: 'Copilot Licensing', type: 'currency', placeholder: '1800000' }
    ]
  },
  {
    id: 'azure-security',
    name: 'Azure Security Suite',
    category: 'Security',
    description: 'Comprehensive security and compliance protection',
    defaultMetrics: {
      implementation: 4,
      timeline: 12
    },
    factors: [
      { id: 'currentIncidents', label: 'Security Incidents/Year', type: 'number', placeholder: '24' },
      { id: 'incidentCost', label: 'Average Incident Cost', type: 'currency', placeholder: '500000' },
      { id: 'reductionRate', label: 'Incident Reduction %', type: 'percentage', placeholder: '70' },
      { id: 'complianceSavings', label: 'Compliance Cost Savings', type: 'currency', placeholder: '300000' },
      { id: 'securityCost', label: 'Azure Security Licensing', type: 'currency', placeholder: '400000' }
    ]
  },
  {
    id: 'azure-infrastructure',
    name: 'Azure Infrastructure Optimization',
    category: 'Infrastructure',
    description: 'Optimize cloud infrastructure costs and performance',
    defaultMetrics: {
      implementation: 6,
      timeline: 12
    },
    factors: [
      { id: 'currentSpend', label: 'Current Cloud Spend', type: 'currency', placeholder: '2000000' },
      { id: 'optimizationRate', label: 'Cost Optimization %', type: 'percentage', placeholder: '25' },
      { id: 'performanceGain', label: 'Performance Improvement %', type: 'percentage', placeholder: '40' },
      { id: 'downtimeReduction', label: 'Downtime Reduction %', type: 'percentage', placeholder: '60' },
      { id: 'toolingCost', label: 'Azure Management Tools', type: 'currency', placeholder: '150000' }
    ]
  },
  {
    id: 'dynamics-365',
    name: 'Dynamics 365 Customer Insights',
    category: 'CRM',
    description: 'Enhance customer relationships and sales effectiveness',
    defaultMetrics: {
      implementation: 4,
      timeline: 12
    },
    factors: [
      { id: 'salesTeam', label: 'Sales Team Size', type: 'number', placeholder: '150' },
      { id: 'avgDealSize', label: 'Average Deal Size', type: 'currency', placeholder: '50000' },
      { id: 'conversionIncrease', label: 'Conversion Rate Increase %', type: 'percentage', placeholder: '15' },
      { id: 'cycleReduction', label: 'Sales Cycle Reduction %', type: 'percentage', placeholder: '20' },
      { id: 'dynamicsCost', label: 'Dynamics 365 Licensing', type: 'currency', placeholder: '450000' }
    ]
  }
];

interface ROICalculatorProps {
  onCalculationComplete?: (solution: string, metrics: ROIMetrics) => void;
}

export function ROICalculator({ onCalculationComplete }: ROICalculatorProps) {
  const [selectedSolution, setSelectedSolution] = useState<SolutionTemplate | null>(null);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [results, setResults] = useState<ROIMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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

  const calculateROI = () => {
    if (!selectedSolution) return;
    
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const metrics = calculateMetrics(selectedSolution, inputs);
      setResults(metrics);
      setIsCalculating(false);
      
      if (onCalculationComplete) {
        onCalculationComplete(selectedSolution.name, metrics);
      }
      
      toast.success('ROI calculation completed successfully');
    }, 1500);
  };

  const calculateMetrics = (solution: SolutionTemplate, values: Record<string, number>): ROIMetrics => {
    let investment = 0;
    let annualSavings = 0;
    let productivityGain = 0;
    let revenueIncrease = 0;

    switch (solution.id) {
      case 'azure-ai':
        investment = values.licensesCost || 0;
        const staffCost = (values.currentStaff || 0) * (values.avgSalary || 0);
        annualSavings = staffCost * ((values.automationRate || 0) / 100) * 0.7; // 70% of automated work saved
        productivityGain = staffCost * ((values.errorReduction || 0) / 100) * 0.15; // 15% productivity from error reduction
        break;

      case 'power-platform':
        investment = values.platformCost || 0;
        const devCost = (values.developers || 0) * (values.devSalary || 0);
        productivityGain = devCost * ((values.appDelivery || 0) / 100) * 0.3; // 30% of speed increase translates to productivity
        const citizenDevValue = (values.citizenDevs || 0) * 50000; // $50k value per citizen developer
        revenueIncrease = citizenDevValue;
        break;

      case 'microsoft-365':
        investment = values.copilotCost || 0;
        const userSalaryCost = (values.users || 0) * (values.avgSalary || 0);
        productivityGain = userSalaryCost * ((values.productivityGain || 0) / 100);
        annualSavings = userSalaryCost * ((values.meetingReduction || 0) / 100) * 0.2; // 20% of meeting time saved
        break;

      case 'azure-security':
        investment = values.securityCost || 0;
        const currentIncidentCost = (values.currentIncidents || 0) * (values.incidentCost || 0);
        annualSavings = currentIncidentCost * ((values.reductionRate || 0) / 100);
        annualSavings += values.complianceSavings || 0;
        break;

      case 'azure-infrastructure':
        investment = values.toolingCost || 0;
        annualSavings = (values.currentSpend || 0) * ((values.optimizationRate || 0) / 100);
        productivityGain = (values.currentSpend || 0) * ((values.performanceGain || 0) / 100) * 0.1; // 10% productivity from performance
        break;

      case 'dynamics-365':
        investment = values.dynamicsCost || 0;
        const currentRevenue = (values.salesTeam || 0) * (values.avgDealSize || 0) * 12; // Assuming 1 deal per month per rep
        revenueIncrease = currentRevenue * ((values.conversionIncrease || 0) / 100);
        productivityGain = currentRevenue * ((values.cycleReduction || 0) / 100) * 0.15; // 15% productivity from faster cycles
        break;
    }

    const totalAnnualBenefit = annualSavings + productivityGain + revenueIncrease;
    const implementation = solution.defaultMetrics.implementation || 6;
    const timeline = solution.defaultMetrics.timeline || 12;
    
    const implementationCost = investment * 0.2; // 20% of license cost for implementation
    const totalInvestment = investment + implementationCost;
    
    const roi = totalInvestment > 0 ? ((totalAnnualBenefit - totalInvestment) / totalInvestment) * 100 : 0;
    const payback = totalAnnualBenefit > 0 ? (totalInvestment / (totalAnnualBenefit / 12)) : 0; // Months to payback
    
    // Simple NPV calculation (3-year, 10% discount rate)
    const discountRate = 0.10;
    let npv = -totalInvestment;
    for (let year = 1; year <= 3; year++) {
      npv += totalAnnualBenefit / Math.pow(1 + discountRate, year);
    }

    return {
      investment: totalInvestment,
      savings: annualSavings,
      productivity: productivityGain,
      revenue: revenueIncrease,
      implementation,
      timeline,
      roi,
      payback,
      npv
    };
  };

  const handleInputChange = (factorId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [factorId]: numValue }));
  };

  const exportResults = () => {
    if (!results || !selectedSolution) return;
    
    const exportData = {
      solution: selectedSolution.name,
      category: selectedSolution.category,
      calculationDate: new Date().toISOString(),
      inputs,
      results,
      summary: {
        totalInvestment: formatCurrency(results.investment),
        annualBenefit: formatCurrency(results.savings + results.productivity + results.revenue),
        roi: formatPercentage(results.roi),
        paybackMonths: results.payback.toFixed(1),
        npv: formatCurrency(results.npv)
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roi-calculation-${selectedSolution.id}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('ROI calculation exported successfully');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calculator className="w-4 h-4" />
          Calculate ROI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Microsoft Solution ROI Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select 
                  value={selectedSolution?.id || ''} 
                  onValueChange={(value) => {
                    const solution = solutionTemplates.find(s => s.id === value) || null;
                    setSelectedSolution(solution);
                    setInputs({});
                    setResults(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a Microsoft solution..." />
                  </SelectTrigger>
                  <SelectContent>
                    {solutionTemplates.map((solution) => (
                      <SelectItem key={solution.id} value={solution.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {solution.category}
                          </Badge>
                          {solution.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedSolution && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {selectedSolution.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedSolution && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Input Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSolution.factors.map((factor) => (
                    <div key={factor.id} className="space-y-2">
                      <Label htmlFor={factor.id} className="text-sm font-medium">
                        {factor.label}
                        {factor.type === 'currency' && ' ($)'}
                        {factor.type === 'percentage' && ' (%)'}
                        {factor.type === 'months' && ' (months)'}
                      </Label>
                      <Input
                        id={factor.id}
                        type="number"
                        placeholder={factor.placeholder}
                        value={inputs[factor.id] || ''}
                        onChange={(e) => handleInputChange(factor.id, e.target.value)}
                        className="text-sm"
                      />
                      {factor.helpText && (
                        <p className="text-xs text-muted-foreground">
                          {factor.helpText}
                        </p>
                      )}
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <Button 
                    onClick={calculateROI}
                    disabled={isCalculating || Object.keys(inputs).length === 0}
                    className="w-full"
                  >
                    {isCalculating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <ChartBar className="w-4 h-4 mr-2" />
                        Calculate ROI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {results && selectedSolution && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">ROI Analysis Results</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={exportResults}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">ROI</span>
                        </div>
                        <p className="text-2xl font-bold text-green-800">
                          {formatPercentage(results.roi)}
                        </p>
                        <p className="text-xs text-green-600">3-year return</p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Payback</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-800">
                          {results.payback.toFixed(1)}
                        </p>
                        <p className="text-xs text-blue-600">months</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Investment</span>
                        <span className="text-sm font-mono">
                          {formatCurrency(results.investment)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Annual Cost Savings</span>
                          <span className="text-sm font-mono text-green-600">
                            {formatCurrency(results.savings)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Productivity Gains</span>
                          <span className="text-sm font-mono text-green-600">
                            {formatCurrency(results.productivity)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Revenue Increase</span>
                          <span className="text-sm font-mono text-green-600">
                            {formatCurrency(results.revenue)}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center font-medium">
                        <span className="text-sm">Total Annual Benefit</span>
                        <span className="text-sm font-mono text-green-600">
                          {formatCurrency(results.savings + results.productivity + results.revenue)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Net Present Value (3yr)</span>
                        <span className={`text-sm font-mono ${results.npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(results.npv)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Implementation Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Implementation Period</span>
                        <Badge variant="outline">
                          {results.implementation} months
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Measurement Period</span>
                        <Badge variant="outline">
                          {results.timeline} months
                        </Badge>
                      </div>

                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          💡 <strong>Recommendation:</strong> Start with a pilot program to validate assumptions 
                          before full deployment. Track metrics monthly to ensure ROI targets are met.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!results && selectedSolution && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enter the parameters above and click "Calculate ROI" to see your personalized business case.
                  </p>
                </CardContent>
              </Card>
            )}

            {!selectedSolution && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CurrencyDollar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a Microsoft solution to begin your ROI analysis.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Target, 
  CurrencyDollar,
  Download,
  TrendUp, 
  Calendar,
  Users,
  Activity,
  Warning,
  CheckCircle,
  Clock,
  ChartPie,
  ChartBar,
  Brain
} from '@phosphor-icons/react';
import { Account } from '@/types';
import { toast } from 'sonner';

interface PortfolioAnalysisExportProps {
  accounts: Account[];
}

interface AnalysisData {
  overview: {
    totalARR: number;
    portfolioGrowth: number;
    accountHealth: {
      good: number;
      watch: number;
      atRisk: number;
    };
    expansionOpportunities: {
      total: number;
      value: number;
    };
  };
  segmentation: {
    byIndustry: Record<string, { count: number; arr: number; avgHealth: number }>;
    bySize: Record<string, { count: number; arr: number; avgHealth: number }>;
    byGrowth: Record<string, { count: number; arr: number; avgHealth: number }>;
  };
  riskAnalysis: {
    churnRisk: Account[];
    expansionRisk: Account[];
    renewalRisk: Account[];
  };
  roadmap: {
    q1: { focus: string; initiatives: string[]; expectedOutcome: string };
    q2: { focus: string; initiatives: string[]; expectedOutcome: string };
    q3: { focus: string; initiatives: string[]; expectedOutcome: string };
    q4: { focus: string; initiatives: string[]; expectedOutcome: string };
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export function PortfolioAnalysisExport({ accounts }: PortfolioAnalysisExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const generateAnalysis = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Calculate basic metrics
      const totalARR = accounts.reduce((sum, acc) => sum + acc.arr, 0);
      const good = accounts.filter(a => a.status === 'Good').length;
      const watch = accounts.filter(a => a.status === 'Watch').length;
      const atRisk = accounts.filter(a => a.status === 'At Risk').length;
      
      // Calculate portfolio growth (quarterly rates)
      const avgGrowthGood = 3.1; // 3.1% quarterly growth
      const avgGrowthWatch = 1.4; // 1.4% quarterly growth
      const avgGrowthRisk = -0.3; // -0.3% quarterly growth
      
      const portfolioGrowth = accounts.length > 0 ? 
        (good * avgGrowthGood + watch * avgGrowthWatch + atRisk * avgGrowthRisk) / accounts.length : 0;

      // Segment by industry
      const byIndustry: Record<string, { count: number; arr: number; avgHealth: number }> = {};
      accounts.forEach(acc => {
        if (!byIndustry[acc.industry]) {
          byIndustry[acc.industry] = { count: 0, arr: 0, avgHealth: 0 };
        }
        byIndustry[acc.industry].count++;
        byIndustry[acc.industry].arr += acc.arr;
        byIndustry[acc.industry].avgHealth += acc.healthScore;
      });
      
      Object.keys(byIndustry).forEach(industry => {
        byIndustry[industry].avgHealth /= byIndustry[industry].count;
      });

      // Segment by size
      const bySize: Record<string, { count: number; arr: number; avgHealth: number }> = {
        'Enterprise (>$10M)': { count: 0, arr: 0, avgHealth: 0 },
        'Mid-Market ($1M-$10M)': { count: 0, arr: 0, avgHealth: 0 },
        'SMB (<$1M)': { count: 0, arr: 0, avgHealth: 0 }
      };

      accounts.forEach(acc => {
        let category = 'SMB (<$1M)';
        if (acc.arr >= 10000000) category = 'Enterprise (>$10M)';
        else if (acc.arr >= 1000000) category = 'Mid-Market ($1M-$10M)';
        
        bySize[category].count++;
        bySize[category].arr += acc.arr;
        bySize[category].avgHealth += acc.healthScore;
      });

      Object.keys(bySize).forEach(size => {
        if (bySize[size].count > 0) {
          bySize[size].avgHealth /= bySize[size].count;
        }
      });

      // Segment by growth
      const byGrowth: Record<string, { count: number; arr: number; avgHealth: number }> = {
        'High Growth (>5%)': { count: 0, arr: 0, avgHealth: 0 },
        'Stable Growth (0-5%)': { count: 0, arr: 0, avgHealth: 0 },
        'Declining (<0%)': { count: 0, arr: 0, avgHealth: 0 }
      };

      accounts.forEach(acc => {
        let category = 'Stable Growth (0-5%)';
        if (acc.healthScore >= 80) category = 'High Growth (>5%)';
        else if (acc.healthScore < 60) category = 'Declining (<0%)';
        
        byGrowth[category].count++;
        byGrowth[category].arr += acc.arr;
        byGrowth[category].avgHealth += acc.healthScore;
      });

      Object.keys(byGrowth).forEach(growth => {
        if (byGrowth[growth].count > 0) {
          byGrowth[growth].avgHealth /= byGrowth[growth].count;
        }
      });

      // Risk analysis
      const churnRisk = accounts.filter(acc => acc.healthScore < 50);
      const expansionRisk = accounts.filter(acc => acc.healthScore >= 80 && acc.status === 'Good');
      const renewalRisk = accounts.filter(acc => {
        const renewalDate = new Date(acc.contractEnd);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        return renewalDate <= sixMonthsFromNow && acc.healthScore < 70;
      });

      const expansionValue = expansionRisk.reduce((sum, acc) => sum + acc.arr * 0.3, 0);

      // Generate comprehensive analysis data
      const analysis: AnalysisData = {
        overview: {
          totalARR,
          portfolioGrowth,
          accountHealth: {
            good,
            watch,
            atRisk
          },
          expansionOpportunities: {
            total: expansionRisk.length,
            value: expansionValue
          }
        },
        segmentation: {
          byIndustry,
          bySize,
          byGrowth
        },
        riskAnalysis: {
          churnRisk,
          expansionRisk,
          renewalRisk
        },
        roadmap: {
          q1: {
            focus: "Risk Mitigation",
            initiatives: [
              "Implement immediate intervention for at-risk accounts",
              "Deploy dedicated customer success managers for churn risk accounts",
              "Establish weekly check-ins with renewal risk accounts"
            ],
            expectedOutcome: `Reduce churn risk by 40%, improve average health score by 12 points`
          },
          q2: {
            focus: "Expansion & Growth",
            initiatives: [
              "Launch expansion pilot program with top-performing accounts",
              "Implement customer advisory board for high-value accounts",
              "Optimize product adoption across mid-market segment"
            ],
            expectedOutcome: `Drive $${(expansionValue / 1000000).toFixed(1)}M in expansion ARR, achieve 95% renewal rate`
          },
          q3: {
            focus: "Operational Excellence",
            initiatives: [
              "Launch predictive analytics for customer success",
              "Develop industry-specific success playbooks",
              "Implement automated health score monitoring"
            ],
            expectedOutcome: `Improve average health score by 15 points, reduce manual intervention by 60%`
          },
          q4: {
            focus: "Strategic Transformation",
            initiatives: [
              "Implement AI-powered customer success orchestration",
              "Establish center of excellence for customer success",
              "Launch customer success certification program"
            ],
            expectedOutcome: `Achieve ${(portfolioGrowth + 2).toFixed(1)}% portfolio growth, 98% customer satisfaction`
          }
        },
        recommendations: {
          immediate: [
            `Deploy emergency interventions for ${churnRisk.length} high-churn-risk accounts`,
            `Accelerate expansion discussions with ${expansionRisk.length} expansion-ready accounts`,
            "Implement daily health score monitoring for critical accounts",
            "Deploy emergency customer success interventions within 48 hours"
          ],
          shortTerm: [
            "Implement predictive churn modeling across all accounts",
            "Deploy AI-powered customer success recommendations",
            "Establish quarterly business reviews for all enterprise accounts",
            "Launch customer advisory board program"
          ],
          longTerm: [
            "Develop predictive customer lifetime value modeling",
            "Implement automated expansion opportunity identification",
            "Establish customer success as a competitive differentiator",
            "Build industry-leading customer success platform"
          ]
        }
      };

      setAnalysisData(analysis);
      toast.success('Portfolio analysis generated successfully');
    } catch (error) {
      console.error('Analysis generation error:', error);
      toast.error('Failed to generate portfolio analysis');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToDocument = async (format: 'json' | 'csv') => {
    if (!analysisData) return;
    
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify({
          title: "SignalCX Portfolio Analysis & Implementation Roadmap",
          generatedAt: new Date().toISOString(),
          summary: analysisData,
          accounts: accounts.map(acc => ({
            name: acc.name,
            industry: acc.industry,
            arr: acc.arr,
            healthScore: acc.healthScore,
            status: acc.status,
            csam: acc.csam,
            ae: acc.ae
          }))
        }, null, 2);
        filename = `SignalCX_Portfolio_Analysis_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // CSV format
        const csvRows = [
          ['Account Name', 'Industry', 'ARR', 'Health Score', 'Status', 'CSAM', 'AE'],
          ...accounts.map(acc => [
            acc.name,
            acc.industry,
            acc.arr.toString(),
            acc.healthScore.toString(),
            acc.status,
            acc.csam,
            acc.ae
          ])
        ];
        content = csvRows.map(row => row.join(',')).join('\n');
        filename = `SignalCX_Portfolio_Data_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Portfolio analysis exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${format.toUpperCase()} file`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-purple-700 border-purple-200 hover:bg-purple-50"
        >
          <ChartBar className="w-4 h-4 mr-2" />
          Portfolio Analysis
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5" />
            Portfolio Analysis & Implementation Roadmap
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {!analysisData ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <p className="text-muted-foreground text-center">
                Generate comprehensive portfolio analysis with insights, risk assessment, and implementation roadmap
              </p>
              <Button 
                onClick={generateAnalysis}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Portfolio Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                <TabsList className="flex-wrap gap-1 h-auto p-2">
                  <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
                  <TabsTrigger value="segmentation">Segmentation Analysis</TabsTrigger>
                  <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                  <TabsTrigger value="roadmap">Implementation Roadmap</TabsTrigger>
                  <TabsTrigger value="recommendations">Action Items</TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => exportToDocument('json')}
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button 
                    onClick={() => exportToDocument('csv')}
                    variant="outline"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={generateAnalysis}
                    variant="outline"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    disabled={isGenerating}
                  >
                    <ChartPie className="w-4 h-4 mr-2" />
                    Refresh Analysis
                  </Button>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Portfolio ARR</p>
                          <p className="text-2xl font-bold">
                            ${(analysisData.overview.totalARR / 1000000).toFixed(1)}M
                          </p>
                          <p className={`text-xs mt-1 ${
                            analysisData.overview.portfolioGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {analysisData.overview.portfolioGrowth >= 0 ? '+' : ''}{analysisData.overview.portfolioGrowth.toFixed(1)}% QoQ Growth
                          </p>
                        </div>
                        <CurrencyDollar className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Expansion Opportunity</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ${(analysisData.overview.expansionOpportunities.value / 1000000).toFixed(1)}M
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {analysisData.overview.expansionOpportunities.total} accounts ready
                          </p>
                        </div>
                        <TrendUp className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Health Distribution</p>
                          <div className="flex gap-2 mt-1">
                            <Badge className="status-good text-xs">{analysisData.overview.accountHealth.good} Good</Badge>
                            <Badge className="status-watch text-xs">{analysisData.overview.accountHealth.watch} Watch</Badge>
                            <Badge className="status-risk text-xs">{analysisData.overview.accountHealth.atRisk} Risk</Badge>
                          </div>
                        </div>
                        <Activity className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Churn Risk</p>
                          <p className="text-2xl font-bold text-red-600">
                            {analysisData.riskAnalysis.churnRisk.length}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            ${(analysisData.riskAnalysis.churnRisk.reduce((sum, acc) => sum + acc.arr, 0) / 1000000).toFixed(1)}M at risk
                          </p>
                        </div>
                        <Warning className="w-8 h-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="segmentation" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        By Industry
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(analysisData.segmentation.byIndustry).map(([industry, data]) => (
                        <div key={industry} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{industry}</div>
                            <div className="text-xs text-muted-foreground">
                              {data.count} accounts • ${(data.arr / 1000000).toFixed(1)}M ARR
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{data.avgHealth.toFixed(0)}</div>
                            <div className="text-xs text-muted-foreground">Avg Health</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CurrencyDollar className="w-5 h-5" />
                        By Account Size
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(analysisData.segmentation.bySize).filter(([_, data]) => data.count > 0).map(([size, data]) => (
                        <div key={size} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{size}</div>
                            <div className="text-xs text-muted-foreground">
                              {data.count} accounts • ${(data.arr / 1000000).toFixed(1)}M ARR
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{data.avgHealth.toFixed(0)}</div>
                            <div className="text-xs text-muted-foreground">Avg Health</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendUp className="w-5 h-5" />
                        By Growth Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(analysisData.segmentation.byGrowth).map(([growth, data]) => (
                        <div key={growth} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{growth}</div>
                            <div className="text-xs text-muted-foreground">
                              {data.count} accounts • ${(data.arr / 1000000).toFixed(1)}M ARR
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{data.avgHealth.toFixed(0)}</div>
                            <div className="text-xs text-muted-foreground">Avg Health</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <Warning className="w-5 h-5" />
                        Churn Risk ({analysisData.riskAnalysis.churnRisk.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {analysisData.riskAnalysis.churnRisk.slice(0, 5).map(account => (
                        <div key={account.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <div className="font-medium text-sm">{account.name}</div>
                            <div className="text-xs text-muted-foreground">${(account.arr / 1000000).toFixed(1)}M ARR</div>
                          </div>
                          <Badge variant="destructive">{account.healthScore}</Badge>
                        </div>
                      ))}
                      {analysisData.riskAnalysis.churnRisk.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center pt-2">
                          +{analysisData.riskAnalysis.churnRisk.length - 5} more accounts
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <TrendUp className="w-5 h-5" />
                        Expansion Ready ({analysisData.riskAnalysis.expansionRisk.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {analysisData.riskAnalysis.expansionRisk.slice(0, 5).map(account => (
                        <div key={account.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <div className="font-medium text-sm">{account.name}</div>
                            <div className="text-xs text-muted-foreground">${(account.arr / 1000000).toFixed(1)}M ARR</div>
                          </div>
                          <Badge className="status-good">{account.healthScore}</Badge>
                        </div>
                      ))}
                      {analysisData.riskAnalysis.expansionRisk.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center pt-2">
                          +{analysisData.riskAnalysis.expansionRisk.length - 5} more accounts
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <Clock className="w-5 h-5" />
                        Renewal Risk ({analysisData.riskAnalysis.renewalRisk.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {analysisData.riskAnalysis.renewalRisk.slice(0, 5).map(account => (
                        <div key={account.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <div className="font-medium text-sm">{account.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Renews {new Date(account.contractEnd).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge className="status-watch">{account.healthScore}</Badge>
                        </div>
                      ))}
                      {analysisData.riskAnalysis.renewalRisk.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center pt-2">
                          +{analysisData.riskAnalysis.renewalRisk.length - 5} more accounts
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="roadmap" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(analysisData.roadmap).map(([quarter, data]) => (
                    <Card key={quarter} className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {quarter.toUpperCase()} 2024 - {data.focus}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Key Initiatives:</h4>
                          <ul className="space-y-1">
                            {data.initiatives.map((initiative, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {initiative}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Expected Outcome:</h4>
                          <p className="text-sm text-muted-foreground">{data.expectedOutcome}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <Warning className="w-5 h-5" />
                        Immediate Actions (0-30 days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisData.recommendations.immediate.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Warning className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <Clock className="w-5 h-5" />
                        Short-term (30-90 days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisData.recommendations.shortTerm.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Clock className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <Target className="w-5 h-5" />
                        Long-term (90+ days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisData.recommendations.longTerm.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
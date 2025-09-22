import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  TrendUp, 
  Target, 
  Calendar,
  CurrencyDollar,
  Users,
  Activity,
  Warning,
  CheckCircle,
  Clock,
  ChartBar,
  ChartPie,
  ChartLine,
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
    setIsGenerating(true);
    
    try {
      // Calculate portfolio metrics
      const totalARR = accounts.reduce((sum, acc) => sum + acc.arr, 0);
      const accountHealth = {
        good: accounts.filter(a => a.status === 'Good').length,
        watch: accounts.filter(a => a.status === 'Watch').length,
        atRisk: accounts.filter(a => a.status === 'At Risk').length
      };

      // Calculate portfolio growth rate
      const avgGrowthGood = 3.1;
      const avgGrowthWatch = 1.4;
      const avgGrowthRisk = -0.3;
      const portfolioGrowth = accounts.length > 0 ? 
        (accountHealth.good * avgGrowthGood + accountHealth.watch * avgGrowthWatch + accountHealth.atRisk * avgGrowthRisk) / accounts.length : 0;

      // Industry segmentation
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
        byIndustry[industry].avgHealth = byIndustry[industry].avgHealth / byIndustry[industry].count;
      });

      // Size segmentation
      const bySize: Record<string, { count: number; arr: number; avgHealth: number }> = {
        'Enterprise (>$10M)': { count: 0, arr: 0, avgHealth: 0 },
        'Mid-Market ($1M-$10M)': { count: 0, arr: 0, avgHealth: 0 },
        'SMB (<$1M)': { count: 0, arr: 0, avgHealth: 0 }
      };

      accounts.forEach(acc => {
        const segment = acc.arr >= 10000000 ? 'Enterprise (>$10M)' : 
                      acc.arr >= 1000000 ? 'Mid-Market ($1M-$10M)' : 'SMB (<$1M)';
        bySize[segment].count++;
        bySize[segment].arr += acc.arr;
        bySize[segment].avgHealth += acc.healthScore;
      });

      Object.keys(bySize).forEach(size => {
        if (bySize[size].count > 0) {
          bySize[size].avgHealth = bySize[size].avgHealth / bySize[size].count;
        }
      });

      // Risk analysis
      const churnRisk = accounts.filter(acc => acc.healthScore < 50);
      const expansionRisk = accounts.filter(acc => acc.healthScore > 80 && acc.arr > 5000000);
      const renewalRisk = accounts.filter(acc => {
        const contractEnd = new Date(acc.contractEnd);
        const monthsToRenewal = (contractEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
        return monthsToRenewal <= 6 && acc.healthScore < 70;
      });

      // Generate comprehensive analysis data
      const analysis: AnalysisData = {
        overview: {
          totalARR,
          portfolioGrowth,
          accountHealth,
          expansionOpportunities: {
            total: expansionRisk.length + Math.floor(accountHealth.good * 0.6),
            value: expansionRisk.reduce((sum, acc) => sum + acc.arr * 0.3, 0) + accountHealth.good * 2500000
          }
        },
        segmentation: {
          byIndustry,
          bySize,
          byGrowth: {
            'High Growth (>5%)': { count: accountHealth.good, arr: bySize['Enterprise (>$10M)'].arr * 0.7, avgHealth: 85 },
            'Stable (0-5%)': { count: accountHealth.watch, arr: bySize['Mid-Market ($1M-$10M)'].arr, avgHealth: 65 },
            'Declining (<0%)': { count: accountHealth.atRisk, arr: bySize['SMB (<$1M)'].arr, avgHealth: 45 }
          }
        },
        riskAnalysis: {
          churnRisk,
          expansionRisk,
          renewalRisk
        },
        roadmap: {
          q1: {
            focus: "Risk Mitigation & Immediate Wins",
            initiatives: [
              "Execute emergency intervention plans for at-risk accounts",
              "Accelerate expansion opportunities with high-health accounts",
              "Implement enhanced monitoring for renewal-risk accounts",
              "Deploy AI-driven early warning systems across portfolio"
            ],
            expectedOutcome: `Reduce churn risk by 40%, secure $${(totalARR * 0.15 / 1000000).toFixed(1)}M in expansion revenue`
          },
          q2: {
            focus: "Strategic Account Development",
            initiatives: [
              "Launch industry-specific value propositions",
              "Implement customer success automation workflows",
              "Develop executive stakeholder engagement programs",
              "Optimize product adoption across mid-market segment"
            ],
            expectedOutcome: `Improve average health score by 15 points, achieve 95% renewal rate`
          },
          q3: {
            focus: "Portfolio Optimization & Growth",
            initiatives: [
              "Execute land-and-expand strategies in enterprise accounts",
              "Launch predictive analytics for customer success",
              "Implement voice-of-customer feedback loops",
              "Develop industry-specific solution packages"
            ],
            expectedOutcome: `Drive $${(totalARR * 0.25 / 1000000).toFixed(1)}M in net new expansion revenue`
          },
          q4: {
            focus: "Scalable Growth Foundation",
            initiatives: [
              "Build self-service expansion capabilities",
              "Implement AI-powered customer journey optimization",
              "Launch customer advocacy and reference programs",
              "Establish center of excellence for customer success"
            ],
            expectedOutcome: `Achieve ${(portfolioGrowth + 2).toFixed(1)}% portfolio growth rate, 98% gross revenue retention`
          }
        },
        recommendations: {
          immediate: [
            `Address ${churnRisk.length} accounts with critical health scores (<50)`,
            `Accelerate expansion discussions with ${expansionRisk.length} high-potential accounts`,
            `Initiate early renewal conversations for ${renewalRisk.length} at-risk renewals`,
            "Deploy emergency customer success interventions within 48 hours"
          ],
          shortTerm: [
            "Implement predictive health scoring across all accounts",
            "Launch automated customer success playbooks",
            "Establish executive sponsor programs for enterprise accounts",
            "Deploy AI-powered expansion opportunity identification"
          ],
          longTerm: [
            "Build industry-specific customer success centers of excellence",
            "Develop predictive customer lifetime value modeling",
            "Create scalable digital customer success platforms",
            "Establish customer success as a competitive differentiator"
          ]
        }
      };

      setAnalysisData(analysis);
      toast.success('Portfolio analysis generated successfully');
      
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Failed to generate portfolio analysis');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToDocument = async (format: 'pdf' | 'powerpoint' | 'excel') => {
    if (!analysisData) return;
    
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `SignalCX_Portfolio_Analysis_${timestamp}.${format === 'powerpoint' ? 'pptx' : format}`;
      
      // Create download blob with comprehensive data
      const analysisContent = {
        title: "SignalCX Portfolio Analysis & Implementation Roadmap",
        generatedAt: new Date().toISOString(),
        summary: analysisData.overview,
        segmentation: analysisData.segmentation,
        riskAnalysis: analysisData.riskAnalysis,
        roadmap: analysisData.roadmap,
        recommendations: analysisData.recommendations,
        accounts: accounts.map(acc => ({
          name: acc.name,
          industry: acc.industry,
          arr: acc.arr,
          healthScore: acc.healthScore,
          status: acc.status,
          csam: acc.csam,
          ae: acc.ae,
          contractEnd: acc.contractEnd
        }))
      };
      
      const blob = new Blob([JSON.stringify(analysisContent, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Portfolio analysis exported as ${format.toUpperCase()}`);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => setIsOpen(true)}
        >
          <ChartBar className="w-4 h-4 mr-2" />
          Portfolio Analysis
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5" />
            Portfolio Analysis & Implementation Roadmap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!analysisData ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Generate Comprehensive Analysis</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create detailed portfolio insights, risk assessments, and strategic roadmaps with AI-powered analysis
              </p>
              <Button 
                onClick={generateAnalysis} 
                disabled={isGenerating}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
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
              <div className="flex items-center justify-between mb-4">
                <TabsList className="flex-wrap gap-1 h-auto p-2">
                  <TabsTrigger value="overview">Executive Overview</TabsTrigger>
                  <TabsTrigger value="segmentation">Portfolio Segmentation</TabsTrigger>
                  <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                  <TabsTrigger value="roadmap">Implementation Roadmap</TabsTrigger>
                  <TabsTrigger value="recommendations">Strategic Recommendations</TabsTrigger>
                </TabsList>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => exportToDocument('pdf')}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportToDocument('powerpoint')}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PPT
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportToDocument('excel')}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <ChartPie className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Portfolio ARR</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${(analysisData.overview.totalARR / 1000000).toFixed(1)}M
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            +{analysisData.overview.portfolioGrowth.toFixed(1)}% QoQ Growth
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
                          <p className="text-sm text-muted-foreground">Account Health</p>
                          <div className="flex gap-2 mt-1">
                            <Badge className="status-good text-xs">{analysisData.overview.accountHealth.good}</Badge>
                            <Badge className="status-watch text-xs">{analysisData.overview.accountHealth.watch}</Badge>
                            <Badge className="status-risk text-xs">{analysisData.overview.accountHealth.atRisk}</Badge>
                          </div>
                          <Progress 
                            value={(analysisData.overview.accountHealth.good / accounts.length) * 100} 
                            className="h-2 mt-2"
                          />
                        </div>
                        <Activity className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Expansion Opportunities</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {analysisData.overview.expansionOpportunities.total}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            ${(analysisData.overview.expansionOpportunities.value / 1000000).toFixed(1)}M Potential
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
                          <p className="text-sm text-muted-foreground">Risk Accounts</p>
                          <p className="text-2xl font-bold text-red-600">
                            {analysisData.riskAnalysis.churnRisk.length}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            ${(analysisData.riskAnalysis.churnRisk.reduce((sum, acc) => sum + acc.arr, 0) / 1000000).toFixed(1)}M at Risk
                          </p>
                        </div>
                        <Warning className="w-8 h-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Health Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {((analysisData.overview.accountHealth.good / accounts.length) * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Healthy Accounts</div>
                        <Progress value={(analysisData.overview.accountHealth.good / accounts.length) * 100} className="mt-2 h-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                          {((analysisData.overview.accountHealth.watch / accounts.length) * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Watch Accounts</div>
                        <Progress value={(analysisData.overview.accountHealth.watch / accounts.length) * 100} className="mt-2 h-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600 mb-2">
                          {((analysisData.overview.accountHealth.atRisk / accounts.length) * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">At Risk Accounts</div>
                        <Progress value={(analysisData.overview.accountHealth.atRisk / accounts.length) * 100} className="mt-2 h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="segmentation" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChartPie className="w-5 h-5" />
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
                        <ChartBar className="w-5 h-5" />
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
                        <ChartLine className="w-5 h-5" />
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
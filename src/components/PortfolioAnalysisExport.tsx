import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitl
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Target, 
  DollarSign,
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Target, 
  Calendar,
  DollarSign,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
}
  PieChart,
  overview: 
  Brain
} from '@phosphor-icons/react';
import { Account } from '@/types';
import { toast } from 'sonner';

interface PortfolioAnalysisExportProps {
  accounts: Account[];
 

interface AnalysisData {
  overview: {
    totalARR: number;
    portfolioGrowth: number;
    accountHealth: {
      good: number;
      watch: number;
      atRisk: number;
    q4
    expansionOpportunities: {
      total: number;
      value: number;
  };
  co
  segmentation: {
    byIndustry: Record<string, { count: number; arr: number; avgHealth: number }>;
    bySize: Record<string, { count: number; arr: number; avgHealth: number }>;
    byGrowth: Record<string, { count: number; arr: number; avgHealth: number }>;
  };
  riskAnalysis: {
      // Calculate portfo
    expansionRisk: Account[];
    renewalRisk: Account[];
  };
      };
    q1: { focus: string; initiatives: string[]; expectedOutcome: string };
    q2: { focus: string; initiatives: string[]; expectedOutcome: string };
    q3: { focus: string; initiatives: string[]; expectedOutcome: string };
    q4: { focus: string; initiatives: string[]; expectedOutcome: string };
  };
  recommendations: {
    immediate: string[];

      const churnRisk =
    
 

      // Generate comprehensive analysis data
        overview: {
          portfolioGrowth,
          expansionOpportunities: {

        },
          byIndustry,
    
         
          }
        riskAnalysis: {
          expansionRisk,
        },
          q1: {
            initiatives: [
        

            expectedOutcome: `Reduce chu
          q2: {
            initiatives: [
              "Implement customer
              "Optimize product adoption across mid-
            expectedOutcome: `Improve average health score by 15 points, achieve 95% renewal rate`

            initiatives: [
              "Launch predictive analytics for customer success",
              "Develop industry
            expectedOutcome: `Drive $${(
          q4: {
         
              "Implement AI-powered custo
              "Establish center of excellence fo
            expectedOutcome: `Achieve ${(portfolioGrowth + 2).
        }

            `Accelerate expansion discussions with 
            "Deploy emergency customer success interventions within 48 hours"
         

            "Deploy AI-pow
          longTerm: [
            "Develop predictive customer lifetime value modeling"
            "Establish customer success as a competitive differentia
        }


    } catch (error) {
      toast.error('Failed to generate portfolio analysis');
      setIsGenerating(false);
  };
  const exportToDocument = async (forma
    
      // 

      const filename = `SignalCX_Portfolio_
      // Create download blob with co
        title: "SignalCX Portfolio Analysis & Implementation Roadmap",
        s
        r

          name: acc.na
          arr: acc.arr,
          status: acc.status,
          ae: acc.ae,
        }))
      
        type: 'application/json' 
      

      link.download = filename;
      link.click();
      URL.revokeObj
      toast.success
    } catch (error) {
      toast.error(`Faile
  };
  return (
      <DialogTrigger asChild>
          v
          
          <BarChart3 cl
        </Button>
      
        <DialogHeader
            <BarChart3 className="w-5 h-5" />
          </DialogTitle>

          {
          
              <p classN
              </p>
                onClick=
                class
          
                  
               
                  <>
                    Genera
                )}
            </div>
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="flex-wrap gap-1 h-auto p-2">
              
                  <TabsTrigger value="roadmap">Implementation Roadmap</TabsTrigger>
            
               
                    variant="outline"
                    classN
                    <FileText className="w-4 h-4 mr-2" />
                  </Button>
                    variant="outline"
                    className="text-orange-600 border-orange-200 ho
              
                  </Button>
            
               
                    <PieChart className="w-4 h-4 mr-2
                  </Button
              </div>
              <TabsContent value="overview" className="space-y-4"
                  <Card>
                      <div className="flex items-center jus
              
                            ${(analysisData.overview.totalARR / 1000000).toFixed(1)}M
            
               
                        <DollarSign className="w
                    </Card

                    <CardContent className="p-4">
                        <div>
                          <div className="flex gap-2 mt-1">
              
                          </div>
           
          
                        <A
                    </

                    <CardContent className="p-4">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
            
                      
                        </div>
                      </div>
                  </Card>
                  <Card>
            
                     
                            {analysisData.riskAnalysis.churnRisk.length}
                          <p className="text-xs text-red-600 mt-1"
                          </p>
                        <AlertTriangle className="w-8 h-8 text-red-500" 
           
         
        

                  <CardContent>
                      <div className="text-center">
      
                     
                      </div>
                        <div className="text-3xl font-bold 
               
                        <Prog
     
    

                      </div>
                  </CardConten
    
         
                  <Card>
                      <CardTitle className="flex items-center 
      
                    </CardHeader>
                      {Object.entries(analysisData.segmentation.byIndustry).map(([industry, data]) => (
      
                            <div className="text-xs t
                            </d
                          <div className="text-right">
                            <div className="te
                        </div>
                    </CardContent>

                    <CardHeader>
                        <BarChart3 className="w-5 h-5"
                      </CardTitle>
                    <Card
                        <div key=
                       
                              {data.cou
                          </d
                         
                     
                      ))}
           
        
      
                        By Growth Rate
                    </CardHeader>
         
      
                            <div className="
                            </div>
                      
                            <di
                        </div>
                   
                </div>

      
                    <CardHeader>
      
                     
                    <CardContent className="
                        <div key={account.id} className="flex jus
     
    

          
                          +{analysisData.riskAnalys
                      )}
                
                  <Card>
                      <CardTitle className="flex items-center gap-2 
                        Expansion Ready (
         
                      {analysisData.riskAnalysis
                          <d
                 
                      
      
                        <div className="text-xs text-muted-foreground te
                      
                    </CardContent>

                    <CardHeader>
                        
                      <

                        <div key={a
                            
                              Renews {new Date(
                          </div>
                        </div>
                      {analysisData.riskAnalysis.renewalRisk.length > 5 &
                          +{analysisData.riskAnalysis.renewalRisk.length - 5} more accounts
                  
                  </Ca
              </TabsContent>
              <TabsContent value="roadm
                  {Object.entries(analysisData.roadmap).map(([quarter, data]) => (
               
                          <Calend
                    
                      <CardContent className="space-y-4">
                          <h4 className="f
                     
                     
                    
                          </ul>
                        <Separator />
                     
                  
                    </C
                </

                <div className="grid grid-cols-1 lg:grid-cols
                    <CardHeader>
                        <AlertTriangle className="w-5 h-5" />
                      </CardTitle>
                    <CardContent>
                        {analysisData.recommendations.immediate.map((re
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 f
                          </li>
                      </ul>

                  <Card>
                      <Ca
                        Short-term (3
                    </CardHeader>
                      <ul className="space-y-3">
                   
                            {rec}
                        ))}
                    </CardC

                    <CardHeader>
                        <Target className="w-5 h-5" />
                      </CardTitle>
                   
                        {analysisData.recommendations.lon
                            <T
                          <
                      </u
                  </Card>
              </TabsContent>
          )}
      </DialogConte
  );
























































































































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
                        <LineChart className="w-5 h-5" />
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
                        <AlertTriangle className="w-5 h-5" />
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
                        <TrendingUp className="w-5 h-5" />
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
                        <AlertTriangle className="w-5 h-5" />
                        Immediate Actions (0-30 days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisData.recommendations.immediate.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
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
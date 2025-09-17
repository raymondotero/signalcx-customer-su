import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowClockwise, Database, Shield, Activity, Brain, Target } from '@phosphor-icons/react';
import { AccountsTable } from '@/components/AccountsTable';
import { NBADisplay } from '@/components/NBADisplay';
import { LiveSignals } from '@/components/LiveSignals';
import { AgentMemory } from '@/components/AgentMemory';
import { AdaptiveCardPreview } from '@/components/AdaptiveCardPreview';
import { CSVUpload } from '@/components/CSVUpload';
import { AIRecommendationEngine } from '@/components/AIRecommendationEngine';
import { RealTimeSignalProcessor } from '@/components/RealTimeSignalProcessor';
import { BusinessValueDashboard } from '@/components/BusinessValueDashboard';
import { HealthScoreForecast } from '@/components/HealthScoreForecast';
import { ARRGrowthTracker } from '@/components/ARRGrowthTracker';
import { WorkflowDemo } from '@/components/WorkflowDemo';
import { ROIDashboard } from '@/components/ROIDashboard';

import { AccountDetailsDialog } from '@/components/AccountDetailsDialog';
import { SystemHealthDialog } from '@/components/SystemHealthDialog';
import { AIErrorBoundary } from '@/components/AIErrorBoundary';
import { useAccounts, useNBAs, useAgentMemory, useSignals, sampleAccounts } from '@/hooks/useData';
import { useSignalProcessor } from '@/hooks/useSignalProcessor';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useRealTimeAI, useAIMetrics } from '@/hooks/useRealTimeAI';
import { useKV } from '@github/spark/hooks';
import { SignalTarget } from '@/components/TargetSettingsDialog';
import { Account, NextBestAction, MemoryEntry } from '@/types';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedNBA, setSelectedNBA] = useState<NextBestAction | null>(null);
  const { accounts, resetAccounts } = useAccounts();
  const { setNBAs } = useNBAs();
  const { clearMemory, addMemoryEntry, setMemory } = useAgentMemory();
  const { setSignals } = useSignals();
  const { isProcessing } = useSignalProcessor();
  const realTimeAI = useRealTimeAI();
  const aiMetrics = useAIMetrics();
  const [targets] = useKV<SignalTarget[]>('signal-targets', []);
  const safeTargets = targets || [];
  
  // Enable real-time notifications
  useRealtimeNotifications();

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setSelectedNBA(null);
  };

  const handlePlanAndRun = (nba: NextBestAction) => {
    setSelectedNBA(nba);
    
    // Add approval request to memory
    addMemoryEntry({
      id: `memory-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'approval_requested',
      accountId: nba.accountId,
      accountName: selectedAccount?.name || 'Unknown',
      description: `Approval requested for: ${nba.title}`,
      metadata: { nbaId: nba.id },
      outcome: 'pending'
    });
    
    toast.info('Approval request created - review in the adaptive card');
  };

  const handleApprovalDecision = (approved: boolean) => {
    if (!selectedNBA) return;
    
    if (approved) {
      // Simulate workflow execution
      addMemoryEntry({
        id: `memory-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'workflow_executed',
        accountId: selectedNBA.accountId,
        accountName: selectedAccount?.name || 'Unknown',
        description: `Workflow executed successfully: ${selectedNBA.title}`,
        metadata: { 
          nbaId: selectedNBA.id,
          estimatedImpact: selectedNBA.estimatedImpact
        },
        outcome: 'success'
      });
      
      // Update AI metrics
      aiMetrics.updateMetrics({ approved: true, recommendation: true });
      
      toast.success('Workflow approved and executed successfully');
    } else {
      aiMetrics.updateMetrics({ approved: false, recommendation: true });
      toast.info('Workflow rejected - no action will be taken');
    }
    
    setSelectedNBA(null);
  };

  const handleResetDemo = () => {
    // Reset to sample data with enhanced signals
    resetAccounts();
    setNBAs([]);
    clearMemory();
    setSelectedAccount(null);
    setSelectedNBA(null);
    realTimeAI.clearQueue();
    realTimeAI.clearResults();
    aiMetrics.resetMetrics();
    
    toast.success('Demo data reset successfully - enhanced signals will regenerate');
  };

  const handleRestoreFullData = async () => {
    try {
      // Import the enhanced signal generation functions
      const { generateBusinessValueSignal, generateIndustrySpecificSignal } = await import('@/services/signalCatalog');
      
      // Reset accounts first
      resetAccounts();
      
      // Generate enhanced signals for all accounts
      const enhancedSignals: any[] = [];
      sampleAccounts.forEach(account => {
        // Generate 8-12 business value signals per account
        const signalCount = Math.floor(Math.random() * 5) + 8;
        
        for (let i = 0; i < signalCount; i++) {
          const signal = generateBusinessValueSignal(account.id, account.name);
          enhancedSignals.push(signal);
        }
        
        // Add 2-3 industry-specific signals
        for (let i = 0; i < 3; i++) {
          const industrySignal = generateIndustrySpecificSignal(account.id, account.name, account.industry);
          enhancedSignals.push(industrySignal);
        }
      });
      
      // Set the signals using the hook
      setSignals(enhancedSignals);
      
      // Generate sample NBA recommendations with correct type
      const enhancedNBAs: NextBestAction[] = [
        {
          id: 'nba-1',
          accountId: 'acc-1',
          title: 'Azure AI Services Scale-Up Opportunity',
          description: 'TechCorp has shown 300% increase in AI API usage. Recommend upgrading to Enterprise tier for cost optimization and advanced features.',
          reasoning: 'Based on signal analysis showing 300% increase in AI API usage, current tier limitations, and development team growth of 40%. Strong technical champion support and budget alignment opportunity.',
          priority: 'high',
          estimatedImpact: '$2.8M ARR expansion',
          effort: 'medium',
          category: 'expansion',
          generatedAt: new Date().toISOString(),
          suggestedActions: [
            'Schedule technical deep-dive with CTO and development leads',
            'Present Enterprise tier ROI analysis and cost comparison',
            'Propose pilot program for advanced AI features in Q1',
            'Align with current Azure credits and commitment discussions'
          ]
        },
        {
          id: 'nba-2',
          accountId: 'acc-2',
          title: 'Manufacturing IoT Analytics Expansion',
          description: 'Global Manufacturing shows strong IoT signal patterns indicating readiness for predictive maintenance platform expansion.',
          reasoning: 'IoT sensor data quality scores improved 45%, maintenance costs increased 15% YoY, and COO champion actively supports digital transformation initiatives.',
          priority: 'high',
          estimatedImpact: '$4.2M ARR expansion',
          effort: 'high',
          category: 'expansion',
          generatedAt: new Date().toISOString(),
          suggestedActions: [
            'Present predictive maintenance ROI study from similar manufacturers',
            'Schedule plant visits with operations teams',
            'Demonstrate Azure Digital Twins for manufacturing optimization',
            'Align with their sustainability and efficiency initiatives'
          ]
        },
        {
          id: 'nba-3',
          accountId: 'acc-3',
          title: 'Critical: FinanceFirst Relationship Recovery',
          description: 'FinanceFirst Bank requires immediate attention due to declining health score and upcoming renewal risk.',
          reasoning: 'Health score declined 25 points to 45, support tickets increased 180%, limited stakeholder engagement, and contract renewal in 5 months. Executive intervention required.',
          priority: 'critical',
          estimatedImpact: '$89M ARR at risk',
          effort: 'high',
          category: 'retention',
          generatedAt: new Date().toISOString(),
          suggestedActions: [
            'Executive escalation - Microsoft CVP engagement within 48 hours',
            'Comprehensive service review and improvement plan presentation',
            'Dedicated technical account manager assignment',
            'Quarterly business review reset with new success metrics'
          ]
        }
      ];
      
      setNBAs(enhancedNBAs);
      
      // Generate sample memory entries and add them
      const enhancedMemory: MemoryEntry[] = [
        {
          id: 'memory-1',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'workflow_executed',
          accountId: 'acc-1',
          accountName: 'TechCorp Solutions',
          description: 'Successfully executed developer onboarding automation workflow',
          metadata: { workflowType: 'onboarding', usersAffected: 450 },
          outcome: 'success'
        },
        {
          id: 'memory-2',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'nba_generated',
          accountId: 'acc-2',
          accountName: 'Global Manufacturing Inc',
          description: 'AI detected significant increase in IoT sensor data quality scores',
          metadata: { signalType: 'data_quality', confidence: 92 },
          outcome: 'success'
        },
        {
          id: 'memory-3',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          type: 'approval_requested',
          accountId: 'acc-3',
          accountName: 'FinanceFirst Bank',
          description: 'Executive escalation approved for critical account intervention',
          metadata: { escalationLevel: 'CVP', priority: 'critical' },
          outcome: 'success'
        }
      ];
      
      // Set memory using the hook
      setMemory(enhancedMemory);
      
      // Clear AI processing states and regenerate
      realTimeAI.clearQueue();
      realTimeAI.clearResults();
      aiMetrics.resetMetrics();
      
      // Update AI metrics to reflect restored state
      aiMetrics.updateMetrics({ 
        approved: true, 
        recommendation: true
      });
      
      toast.success('Full data restored successfully - all enhanced signals, NBAs, and memory entries are back!');
      
    } catch (error) {
      console.error('Error restoring data:', error);
      toast.error('Failed to restore data. Please try again.');
    }
  };

  const getAccountSummary = () => {
    const good = accounts.filter(a => a.status === 'Good').length;
    const watch = accounts.filter(a => a.status === 'Watch').length;
    const risk = accounts.filter(a => a.status === 'At Risk').length;
    const totalARR = accounts.reduce((sum, a) => sum + a.arr, 0);
    
    // Calculate stable portfolio QoQ growth based on account composition
    const avgGrowthGood = 12.3; // Good accounts average ~12% growth
    const avgGrowthWatch = 5.7; // Watch accounts average ~6% growth  
    const avgGrowthRisk = -1.2; // At Risk accounts average ~-1% growth
    
    const weightedGrowth = accounts.length > 0 ? 
      (good * avgGrowthGood + watch * avgGrowthWatch + risk * avgGrowthRisk) / accounts.length : 0;
    
    return { good, watch, risk, totalARR, total: accounts.length, portfolioGrowth: weightedGrowth };
  };

  const summary = getAccountSummary();

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  SignalCX
                  {(isProcessing || realTimeAI.isProcessing) && (
                    <Brain className="w-5 h-5 text-accent animate-pulse-ai" />
                  )}
                  {realTimeAI.queueSize > 0 && (
                    <Badge variant="outline" className="animate-pulse">
                      AI Queue: {realTimeAI.queueSize}
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">Agentic AI Platform for Customer Success</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="text-right text-xs text-muted-foreground">
                  <div>AI Approval: {aiMetrics.getApprovalRate().toFixed(1)}%</div>
                  <div>Avg Processing: {Math.round(aiMetrics.getAverageProcessingTime())}ms</div>
                </div>
                
                {safeTargets.length > 0 && (
                  <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 text-green-700">
                    <Target className="w-3 h-3 mr-1" />
                    {safeTargets.length} Targets Active
                  </Badge>
                )}
              </div>
              
              <ROIDashboard />
              <CSVUpload />
              <SystemHealthDialog />
              <Button 
                className="border text-xs px-3 py-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleRestoreFullData}
              >
                <Database className="w-4 h-4 mr-2" />
                Restore Data
              </Button>
              <Button 
                className="border text-xs px-3 py-1"
                onClick={handleResetDemo}
              >
                <ArrowClockwise className="w-4 h-4 mr-2" />
                Reset Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="container mx-auto px-4 py-6 max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card className="border-visible h-fit">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Accounts</p>
                  <p className="text-2xl font-bold">{summary.total}</p>
                </div>
                <Database className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-visible h-fit">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total ARR</p>
                  <p className="text-2xl font-bold">
                    ${(summary.totalARR / 1000000).toFixed(1)}M
                  </p>
                  <p className={`text-xs mt-1 ${
                    summary.portfolioGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {summary.portfolioGrowth >= 0 ? '+' : ''}{summary.portfolioGrowth.toFixed(1)}% QoQ Growth
                  </p>
                </div>
                <Badge className="status-good">Growing</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-visible h-fit">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Healthy</p>
                  <p className="text-2xl font-bold text-green-600">{summary.good}</p>
                </div>
                <Badge className="status-good">Good</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-visible h-fit">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Watch</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.watch}</p>
                </div>
                <Badge className="status-watch">Watch</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-visible h-fit">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">{summary.risk}</p>
                </div>
                <Badge className="status-risk">At Risk</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Accounts & NBA */}
          <div className="xl:col-span-2 space-y-6 min-h-0">
            <div className="h-fit">
              <AccountsTable 
                accounts={accounts}
                onSelectAccount={handleSelectAccount}
                selectedAccount={selectedAccount || undefined}
              />
            </div>
            
            {selectedAccount && (
              <div className="space-y-4">
                <Card className="border-visible h-fit">
                  <CardHeader>
                    <CardTitle>Selected Account</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">{selectedAccount.name}</p>
                        <p className="text-muted-foreground">{selectedAccount.industry}</p>
                      </div>
                      <div>
                        <p className="font-medium">CSAM: {selectedAccount.csam}</p>
                        <p className="font-medium">AE: {selectedAccount.ae}</p>
                        <p className="text-muted-foreground">
                          Contract ends: {new Date(selectedAccount.contractEnd).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="h-fit">
                  <NBADisplay 
                    account={selectedAccount}
                    onPlanAndRun={handlePlanAndRun}
                  />
                </div>
                
                {selectedNBA && (
                  <div className="h-fit">
                    <AdaptiveCardPreview
                      nba={selectedNBA}
                      accountName={selectedAccount.name}
                      onApprovalDecision={handleApprovalDecision}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - AI Systems */}
          <div className="space-y-6 min-h-0 h-fit">
            <Tabs defaultValue="arr-growth" className="w-full h-fit">
              <TabsList className="grid w-full grid-cols-8 h-fit">
                <TabsTrigger value="business-value" className="text-xs px-2">Business</TabsTrigger>
                <TabsTrigger value="arr-growth" className="text-xs px-2">ARR Growth</TabsTrigger>
                <TabsTrigger value="forecast" className="text-xs px-2">Forecast</TabsTrigger>
                <TabsTrigger value="workflows" className="text-xs px-2">Workflows</TabsTrigger>
                <TabsTrigger value="ai-processor" className="text-xs px-2">AI Proc</TabsTrigger>
                <TabsTrigger value="signals" className="text-xs px-2">Signals</TabsTrigger>
                <TabsTrigger value="ai-engine" className="text-xs px-2">AI Engine</TabsTrigger>
                <TabsTrigger value="memory" className="text-xs px-2">Memory</TabsTrigger>
              </TabsList>
              
              <TabsContent value="business-value" className="mt-4 h-fit">
                <AIErrorBoundary>
                  <div className="h-fit">
                    <BusinessValueDashboard />
                  </div>
                </AIErrorBoundary>
              </TabsContent>
              
              <TabsContent value="arr-growth" className="mt-4 h-fit">
                <AIErrorBoundary>
                  <div className="h-fit">
                    <ARRGrowthTracker 
                      accounts={accounts}
                      selectedAccount={selectedAccount || undefined}
                    />
                  </div>
                </AIErrorBoundary>
              </TabsContent>
              
              <TabsContent value="forecast" className="mt-4 h-fit">
                <AIErrorBoundary>
                  <div className="h-fit">
                    <HealthScoreForecast 
                      accounts={accounts}
                      selectedAccount={selectedAccount || undefined}
                    />
                  </div>
                </AIErrorBoundary>
              </TabsContent>
              
              <TabsContent value="workflows" className="mt-4 h-fit">
                <div className="h-fit">
                  <WorkflowDemo />
                </div>
              </TabsContent>
              
              <TabsContent value="ai-processor" className="mt-4 h-fit">
                <AIErrorBoundary>
                  <div className="h-fit">
                    <RealTimeSignalProcessor />
                  </div>
                </AIErrorBoundary>
              </TabsContent>
              
              <TabsContent value="signals" className="mt-4 h-fit">
                <div className="h-fit">
                  <LiveSignals />
                </div>
              </TabsContent>
              
              <TabsContent value="ai-engine" className="mt-4 h-fit">
                <AIErrorBoundary>
                  <div className="h-fit">
                    <AIRecommendationEngine />
                  </div>
                </AIErrorBoundary>
              </TabsContent>
              
              <TabsContent value="memory" className="mt-4 h-fit">
                <div className="h-fit">
                  <AgentMemory />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
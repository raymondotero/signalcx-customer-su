import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowClockwise, Database, Shield, Activity, Brain, Target, ChartBar } from '@phosphor-icons/react';
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
import { DataSyncScheduler } from '@/components/DataSyncScheduler';
import { IntegrationWizard } from '@/components/IntegrationWizard';
import { CriticalSignalMonitor } from '@/components/CriticalSignalMonitor';
import { PortfolioAnalysisExport } from '@/components/PortfolioAnalysisExport';
import HelpGuide from '@/components/HelpGuide';
import { SignalVisualizationDialog } from '@/components/SignalVisualizationDialog';
import { PredictiveHeatMapDialog } from '@/components/PredictiveHeatMapDialog';
import { Dynamics365ConfigDialog } from '@/components/Dynamics365ConfigDialog';
import OpportunityTrackingDashboard from '@/components/OpportunityTrackingDashboard';
import { notificationService } from '@/services/notificationService';

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
  const [signalVisualizationOpen, setSignalVisualizationOpen] = useState(false);
  const { accounts, resetAccounts, setAccounts } = useAccounts();
  const { setNBAs } = useNBAs();
  const { clearMemory, addMemoryEntry, setMemory } = useAgentMemory();
  const { setSignals, addSignal, signals, resetSignals } = useSignals();
  const { isProcessing } = useSignalProcessor();
  const realTimeAI = useRealTimeAI();
  const aiMetrics = useAIMetrics();
  const [targets] = useKV<SignalTarget[]>('signal-targets', []);
  const [integrations] = useKV<any[]>('integrations', []);
  const safeTargets = Array.isArray(targets) ? targets : [];
  const safeIntegrations = Array.isArray(integrations) ? integrations : [];
  
  // Auto-generate enhanced signals on first load and when accounts change
  React.useEffect(() => {
    const initializeEnhancedData = async () => {
      if (accounts.length > 0) {
        try {
          const { generateEnhancedSignals } = await import('@/hooks/useData');
          const enhancedSignals = generateEnhancedSignals(accounts);
          
          // Only set signals if we don't have any or if accounts changed significantly
          // Avoid interference with data restoration by checking if this is initial load
          if (!signals || signals.length === 0 || (signals.length < accounts.length * 2 && accounts.length <= 10)) {
            resetSignals(enhancedSignals);
          }
        } catch (error) {
          console.error('Error generating enhanced signals:', error);
        }
      }
    };
    
    // Add a small delay to prevent interference with data restoration
    const timeoutId = setTimeout(initializeEnhancedData, 100);
    return () => clearTimeout(timeoutId);
  }, [accounts.length]);
  
  // Initialize notification service with integrations
  React.useEffect(() => {
    notificationService.setContext({
      integrations: safeIntegrations,
      currentUser: {
        email: 'user@company.com',
        name: 'Current User'
      }
    });
  }, [safeIntegrations]);
  
  // Enable real-time notifications
  useRealtimeNotifications();

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setSelectedNBA(null);
    
    // Scroll to NBA section and highlight it
    setTimeout(() => {
      const nbaSection = document.querySelector('[data-section="nba-display"]');
      if (nbaSection) {
        nbaSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        
        // Add highlight effect
        nbaSection.classList.add('scroll-highlight');
        setTimeout(() => {
          nbaSection.classList.remove('scroll-highlight');
        }, 2000);
      }
    }, 100);
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

  const handleResetDemo = async () => {
    // Reset to sample data with enhanced signals
    resetAccounts();
    setNBAs([]);
    clearMemory();
    setSelectedAccount(null);
    setSelectedNBA(null);
    realTimeAI.clearQueue();
    realTimeAI.clearResults();
    aiMetrics.resetMetrics();
    
    // Generate fresh enhanced signals for the reset accounts
    try {
      const { generateEnhancedSignals } = await import('@/hooks/useData');
      const enhancedSignals = generateEnhancedSignals(sampleAccounts);
      resetSignals(enhancedSignals);
      toast.success(`Demo reset: ${sampleAccounts.length} accounts restored with ${enhancedSignals.length} fresh signals`);
    } catch (error) {
      console.error('Error generating enhanced signals on reset:', error);
      toast.success('Demo data reset successfully');
    }
  };

  const handleRestoreFullData = async () => {
    try {
      // Import the enhanced signal generation functions and sample data
      const { generateEnhancedSignals, sampleAccounts: fullSampleAccounts } = await import('@/hooks/useData');
      
      // Clear existing data first to ensure clean state
      setAccounts([]);
      resetSignals([]);
      setNBAs([]);
      setMemory([]);
      
      // Small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Reset accounts to the full expanded dataset (30 accounts)
      setAccounts([...fullSampleAccounts]); // Create new array to ensure reactivity
      
      // Generate enhanced signals for all accounts with proper category distribution
      const enhancedSignals = generateEnhancedSignals(fullSampleAccounts);
      
      // Set the signals using the hook with reset function for better reactivity
      resetSignals(enhancedSignals);
      
      // Generate sample NBA recommendations with correct type for expanded account base
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
          accountId: 'acc-12',
          title: 'Insurance AI Fraud Detection Expansion',
          description: 'InsureTech Solutions showing strong fraud detection signals indicating readiness for comprehensive AI platform expansion.',
          reasoning: 'Fraud detection accuracy improved 28%, claims processing showing automation potential, and risk assessment needs indicate perfect timing for AI expansion.',
          priority: 'high',
          estimatedImpact: '$8.2M ARR expansion',
          effort: 'high',
          category: 'expansion',
          generatedAt: new Date().toISOString(),
          suggestedActions: [
            'Present AI fraud detection ROI analysis with industry benchmarks',
            'Schedule demo of advanced machine learning capabilities',
            'Coordinate with risk management and actuarial teams',
            'Align with regulatory compliance and audit requirements'
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
        },
        {
          id: 'nba-4',
          accountId: 'acc-14',
          title: 'BioPharm AI Drug Discovery Acceleration',
          description: 'BioPharm Research showing optimal readiness indicators for advanced AI-powered drug discovery platform implementation.',
          reasoning: 'Research productivity metrics improved, clinical trial success patterns emerging, and R&D team expressing strong AI adoption signals.',
          priority: 'high',
          estimatedImpact: '$9.2M ARR expansion',
          effort: 'high',
          category: 'expansion',
          generatedAt: new Date().toISOString(),
          suggestedActions: [
            'Schedule AI drug discovery demonstration with Chief Scientific Officer',
            'Present pharmaceutical industry AI success stories and ROI analysis',
            'Coordinate technical architecture review with bioinformatics team',
            'Align with current research pipeline and regulatory requirements'
          ]
        },
        {
          id: 'nba-5',
          accountId: 'acc-18',
          title: 'CyberGuard Advanced Threat Detection Enhancement',
          description: 'CyberGuard Security demonstrating exceptional readiness for next-generation AI-powered threat detection platform.',
          reasoning: 'Security operations efficiency increased 42%, threat detection accuracy at 96%, and SOC team actively seeking advanced analytics capabilities.',
          priority: 'high',
          estimatedImpact: '$7.3M ARR expansion',
          effort: 'medium',
          category: 'expansion',
          generatedAt: new Date().toISOString(),
          suggestedActions: [
            'Demonstrate advanced AI threat hunting capabilities to CISO',
            'Present security operations optimization ROI with industry benchmarks',
            'Schedule technical deep-dive with security analytics team',
            'Align with current security posture improvement initiatives'
          ]
        }
      ];
      
      setNBAs(enhancedNBAs);
      
      // Generate comprehensive memory entries for expanded account base
      const enhancedMemory: MemoryEntry[] = [
        {
          id: 'memory-1',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'workflow_executed',
          accountId: 'acc-1',
          accountName: 'TechCorp Solutions',
          description: 'Successfully executed developer onboarding automation workflow',
          metadata: { workflowType: 'onboarding', usersAffected: 450 },
          outcome: 'success'
        },
        {
          id: 'memory-2',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'nba_generated',
          accountId: 'acc-12',
          accountName: 'InsureTech Solutions',
          description: 'AI detected significant fraud detection accuracy improvements and expansion readiness',
          metadata: { signalType: 'fraud_detection', confidence: 94, expansionValue: 8200000 },
          outcome: 'success'
        },
        {
          id: 'memory-3',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'approval_requested',
          accountId: 'acc-3',
          accountName: 'FinanceFirst Bank',
          description: 'Executive escalation approved for critical account intervention',
          metadata: { escalationLevel: 'CVP', priority: 'critical', arrAtRisk: 89000000 },
          outcome: 'success'
        },
        {
          id: 'memory-4',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          type: 'workflow_executed',
          accountId: 'acc-14',
          accountName: 'BioPharm Research',
          description: 'Drug discovery analytics platform assessment completed successfully',
          metadata: { workflowType: 'assessment', researchEfficiencyGain: 30 },
          outcome: 'success'
        },
        {
          id: 'memory-5',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          type: 'nba_generated',
          accountId: 'acc-18',
          accountName: 'CyberGuard Security',
          description: 'Advanced threat detection expansion opportunity identified with high confidence',
          metadata: { signalType: 'security_enhancement', confidence: 91, expansionValue: 7300000 },
          outcome: 'success'
        },
        {
          id: 'memory-6',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          type: 'signal_processed',
          accountId: 'acc-11',
          accountName: 'MediaStreams Inc',
          description: 'Content creation workflow optimization signals processed and analyzed',
          metadata: { signalCount: 8, prioritySignals: 3, automationOpportunity: true },
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
      
      toast.success(`Full data restored: ${fullSampleAccounts.length} diverse accounts, ${enhancedSignals.length} signals, and ${enhancedNBAs.length} NBA recommendations loaded!`);
      
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
    
    // Calculate stable portfolio QoQ growth based on account composition (quarterly rates)
    // More realistic calculations for larger, diverse portfolio
    const avgGrowthGood = 2.8; // Good accounts average ~2.8% quarterly growth (11.7% annual)
    const avgGrowthWatch = 1.2; // Watch accounts average ~1.2% quarterly growth (4.9% annual)
    const avgGrowthRisk = -0.4; // At Risk accounts average ~-0.4% quarterly growth (-1.6% annual)
    
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
                      AI Queue: {String(realTimeAI.queueSize)}
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">Agentic AI Platform for Customer Success</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="text-right text-xs text-muted-foreground">
                  <div>AI Approval: {String(aiMetrics.getApprovalRate().toFixed(1))}%</div>
                  <div>Avg Processing: {String(Math.round(aiMetrics.getAverageProcessingTime()))}ms</div>
                </div>
                
                {Array.isArray(safeTargets) && safeTargets.length > 0 && (
                  <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 text-green-700">
                    <Target className="w-3 h-3 mr-1" />
                    {String(safeTargets.length)} Targets Active
                  </Badge>
                )}
                
                {(safeIntegrations.filter(i => i.id === 'microsoft-teams' && i.status === 'connected').length > 0 ||
                  safeIntegrations.filter(i => i.id === 'microsoft-outlook' && i.status === 'connected').length > 0) && (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const testAccount = accounts[0];
                      if (testAccount) {
                        await notificationService.notifyHealthScoreChange(
                          testAccount,
                          testAccount.healthScore + 15,
                          testAccount.healthScore - 8
                        );
                        toast.success('Test notification sent to connected integrations');
                      }
                    }}
                    className="text-blue-700 border-blue-200 hover:bg-blue-50"
                  >
                    🔔 Test Integrations
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    // Generate dramatically enhanced signals with comprehensive category distribution
                    const { generateEnhancedSignals } = await import('@/hooks/useData');
                    const enhancedSignals = generateEnhancedSignals(accounts);
                    resetSignals(enhancedSignals);
                    toast.success(`🔥 MASSIVE DATA REFRESH: Generated ${enhancedSignals.length} EXTREMELY DIVERSE signals with dramatic variations across ${accounts.length} accounts! 

🚀 Features: 8-12 signals per account, extreme industry variations, dramatic trend patterns, comprehensive severity distributions, advanced metadata enrichment, temporal diversity, and quantum-enhanced analytics ready for ultimate heat map visualization and predictive modeling!`);
                  }}
                  className="text-purple-700 border-purple-200 hover:bg-purple-50"
                >
                  🔥 Generate VAST Signal Data
                </Button>
                
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Scroll to tabs section and select opportunity tracking
                    const tabsSection = document.querySelector('[data-section="right-column"]');
                    if (tabsSection) {
                      tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    // Delay to ensure scroll completes before tab selection
                    setTimeout(() => {
                      const opportunityTab = document.querySelector('[value="opportunity-tracking"]') as HTMLElement;
                      if (opportunityTab) {
                        opportunityTab.click();
                      }
                    }, 500);
                  }}
                  className="text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  📊 D365 Opportunities
                </Button>
                
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    // Import signal generation functions
                    const { generateBusinessValueSignal } = await import('@/services/signalCatalog');
                    const testAccount = accounts[0];
                    if (testAccount) {
                      // Generate a critical signal
                      const criticalSignal = {
                        ...generateBusinessValueSignal(testAccount.id, testAccount.name),
                        severity: 'critical' as const,
                        type: 'churn_risk' as const,
                        description: `Critical: ${testAccount.name} showing severe churn risk indicators - immediate intervention required`,
                      };
                      
                      // Add the signal using the hook method
                      addSignal(criticalSignal);
                      toast.warning('Critical signal generated - check Critical Monitor tab');
                    }
                  }}
                  className="text-red-700 border-red-200 hover:bg-red-50"
                >
                  🚨 Test Critical Signal
                </Button>
              </div>
              
              <ROIDashboard />
              <PortfolioAnalysisExport accounts={accounts} />
              <DataSyncScheduler />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSignalVisualizationOpen(true)}
                className="flex items-center gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
              >
                <ChartBar className="w-4 h-4" />
                Signal Analytics
              </Button>
              <PredictiveHeatMapDialog />
              <Dynamics365ConfigDialog />
              <IntegrationWizard />
              <HelpGuide />
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
                  <p className="text-2xl font-bold">{String(summary.total)}</p>
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
                    ${String((summary.totalARR / 1000000).toFixed(1))}M
                  </p>
                  <p className={`text-xs mt-1 ${
                    summary.portfolioGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {summary.portfolioGrowth >= 0 ? '+' : ''}{String(summary.portfolioGrowth.toFixed(1))}% QoQ Growth
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
                  <p className="text-2xl font-bold text-green-600">{String(summary.good)}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{String(summary.watch)}</p>
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
                  <p className="text-2xl font-bold text-red-600">{String(summary.risk)}</p>
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
              <div className="space-y-4" data-section="selected-account">
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
                
                <div className="h-fit" data-section="nba-display">
                  <NBADisplay 
                    account={selectedAccount}
                    onPlanAndRun={handlePlanAndRun}
                    defaultTab="ai-recommendations"
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
          <div className="space-y-6 min-h-0 h-fit" data-section="right-column">
            <Tabs defaultValue="critical-monitor" className="w-full h-fit">
              <TabsList className="flex flex-wrap gap-1 w-full h-auto p-2">
                <TabsTrigger value="critical-monitor" className="text-sm px-3 py-2 min-w-fit">Critical Monitor</TabsTrigger>
                <TabsTrigger value="opportunity-tracking" className="text-sm px-3 py-2 min-w-fit">D365 Opportunities</TabsTrigger>
                <TabsTrigger value="business-value" className="text-sm px-3 py-2 min-w-fit">Business Value</TabsTrigger>
                <TabsTrigger value="arr-growth" className="text-sm px-3 py-2 min-w-fit">ARR Growth</TabsTrigger>
                <TabsTrigger value="forecast" className="text-sm px-3 py-2 min-w-fit">Forecast</TabsTrigger>
                <TabsTrigger value="workflows" className="text-sm px-3 py-2 min-w-fit">Workflows</TabsTrigger>
                <TabsTrigger value="ai-processor" className="text-sm px-3 py-2 min-w-fit">AI Processor</TabsTrigger>
                <TabsTrigger value="signals" className="text-sm px-3 py-2 min-w-fit">Live Signals</TabsTrigger>
                <TabsTrigger value="ai-engine" className="text-sm px-3 py-2 min-w-fit">AI Engine</TabsTrigger>
                <TabsTrigger value="memory" className="text-sm px-3 py-2 min-w-fit">Agent Memory</TabsTrigger>
              </TabsList>
              
              <TabsContent value="critical-monitor" className="mt-4 h-fit">
                <div className="h-fit">
                  <CriticalSignalMonitor />
                </div>
              </TabsContent>
              
              <TabsContent value="opportunity-tracking" className="mt-4 h-fit">
                <div className="h-fit">
                  <OpportunityTrackingDashboard />
                </div>
              </TabsContent>
              
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

      {/* Signal Visualization Dialog */}
      <SignalVisualizationDialog
        open={signalVisualizationOpen}
        onOpenChange={setSignalVisualizationOpen}
        selectedAccount={selectedAccount || undefined}
      />
    </div>
  );
}

export default App;
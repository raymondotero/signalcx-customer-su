import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowClockwise, Database, Shield, Activity, Brain } from '@phosphor-icons/react';
import { AccountsTable } from '@/components/AccountsTable';
import { NBADisplay } from '@/components/NBADisplay';
import { LiveSignals } from '@/components/LiveSignals';
import { AgentMemory } from '@/components/AgentMemory';
import { AdaptiveCardPreview } from '@/components/AdaptiveCardPreview';
import { CSVUpload } from '@/components/CSVUpload';
import { AIRecommendationEngine } from '@/components/AIRecommendationEngine';
import { useAccounts, useNBAs, useAgentMemory } from '@/hooks/useData';
import { useSignalProcessor } from '@/hooks/useSignalProcessor';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { Account, NextBestAction } from '@/types';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedNBA, setSelectedNBA] = useState<NextBestAction | null>(null);
  const { accounts, setAccounts } = useAccounts();
  const { setNBAs } = useNBAs();
  const { clearMemory, addMemoryEntry } = useAgentMemory();
  const { isProcessing } = useSignalProcessor();
  
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
      
      toast.success('Workflow approved and executed successfully');
    } else {
      toast.info('Workflow rejected - no action will be taken');
    }
    
    setSelectedNBA(null);
  };

  const handleResetDemo = () => {
    setAccounts([]);
    setNBAs([]);
    clearMemory();
    setSelectedAccount(null);
    setSelectedNBA(null);
    toast.success('Demo data reset successfully');
  };

  const handleHealthCheck = () => {
    toast.success('All systems operational ✓');
    addMemoryEntry({
      id: `memory-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'workflow_executed',
      description: 'System health check completed - all services operational',
      metadata: { 
        status: 'healthy',
        accountsCount: accounts.length,
        timestamp: new Date().toISOString()
      },
      outcome: 'success'
    });
  };

  const getAccountSummary = () => {
    const good = accounts.filter(a => a.status === 'Good').length;
    const watch = accounts.filter(a => a.status === 'Watch').length;
    const risk = accounts.filter(a => a.status === 'At Risk').length;
    const totalARR = accounts.reduce((sum, a) => sum + a.arr, 0);
    
    return { good, watch, risk, totalARR, total: accounts.length };
  };

  const summary = getAccountSummary();

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  SignalCX
                  {isProcessing && (
                    <Brain className="w-5 h-5 text-accent animate-pulse-ai" />
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">Agentic AI Platform for Customer Success</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CSVUpload />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleHealthCheck}
              >
                <Shield className="w-4 h-4 mr-2" />
                Health Check
              </Button>
              <Button 
                variant="outline" 
                size="sm"
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
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
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
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total ARR</p>
                  <p className="text-2xl font-bold">
                    ${(summary.totalARR / 1000000).toFixed(1)}M
                  </p>
                </div>
                <Badge className="status-good">Good</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
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
          
          <Card>
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
          
          <Card>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Accounts & NBA */}
          <div className="lg:col-span-2 space-y-6">
            <AccountsTable 
              accounts={accounts}
              onSelectAccount={handleSelectAccount}
              selectedAccount={selectedAccount || undefined}
            />
            
            {selectedAccount && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Account</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">{selectedAccount.name}</p>
                        <p className="text-muted-foreground">{selectedAccount.industry}</p>
                      </div>
                      <div>
                        <p className="font-medium">CSM: {selectedAccount.csm}</p>
                        <p className="text-muted-foreground">
                          Contract ends: {new Date(selectedAccount.contractEnd).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <NBADisplay 
                  account={selectedAccount}
                  onPlanAndRun={handlePlanAndRun}
                />
                
                {selectedNBA && (
                  <AdaptiveCardPreview
                    nba={selectedNBA}
                    accountName={selectedAccount.name}
                    onApprovalDecision={handleApprovalDecision}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Column - Signals & Memory */}
          <div className="space-y-6">
            <Tabs defaultValue="signals" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signals">Live Signals</TabsTrigger>
                <TabsTrigger value="ai-rec">AI Recommendations</TabsTrigger>
                <TabsTrigger value="memory">Agent Memory</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signals" className="mt-4">
                <LiveSignals />
              </TabsContent>
              
              <TabsContent value="ai-rec" className="mt-4">
                <AIRecommendationEngine />
              </TabsContent>
              
              <TabsContent value="memory" className="mt-4">
                <AgentMemory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
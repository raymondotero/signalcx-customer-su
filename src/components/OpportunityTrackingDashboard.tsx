import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendUp, 
  Target, 
  CurrencyDollar, 
  Clock, 
  CheckCircle, 
  Warning,
  ChartBar,
  Users,
  Calendar,
  Funnel,
  ArrowUpRight,
  ArrowDownRight,
  TrendDown,
  ArrowClockwise,
  ArrowSquareOut,
  Buildings
} from '@phosphor-icons/react';
import { FieldMappingManager } from '@/components/FieldMappingManager';
import { useKV } from '@github/spark/hooks';
import { useAccounts } from '@/hooks/useData';
import { toast } from 'sonner';

interface Opportunity {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  closeDate: string;
  owner: string;
  source: 'signal_expansion' | 'account_growth' | 'retention_save' | 'new_business' | 'referral';
  d365RecordId?: string;
  created: string;
  lastModified: string;
  notes: string[];
  signals: string[];
  nextAction: string;
  competitorInfo?: string;
  budgetConfirmed: boolean;
  decisionMaker: string;
  timeline: string;
}

interface ConversionMetrics {
  totalOpportunities: number;
  totalValue: number;
  conversionRate: number;
  avgDealSize: number;
  avgSalesCycle: number;
  pipelineVelocity: number;
  d365SyncRate: number;
  signalToOpportunityRate: number;
}

const OpportunityTrackingDashboard: React.FC = () => {
  const { accounts } = useAccounts();
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('d365-opportunities', []);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('current_quarter');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get selected account from the accounts list (if any account is selected)
  const selectedAccount = accounts.find(acc => acc.id === 'acc-1') || accounts[0]; // Default to first account or selected one

  // Initialize sample opportunity data
  useEffect(() => {
    if (!opportunities || opportunities.length === 0) {
      initializeSampleOpportunities();
    }
  }, []);

  const initializeSampleOpportunities = () => {
    const sampleOpportunities: Opportunity[] = [
      {
        id: 'opp-1',
        accountId: 'acc-1',
        accountName: 'TechCorp Solutions',
        title: 'Azure AI Services Enterprise Upgrade',
        value: 2800000,
        stage: 'proposal',
        probability: 75,
        closeDate: '2024-03-15',
        owner: 'Sarah Chen',
        source: 'signal_expansion',
        d365RecordId: 'D365-OPP-001',
        created: '2024-01-15T10:00:00Z',
        lastModified: '2024-02-20T15:30:00Z',
        notes: [
          'Strong technical champion support',
          'Budget approved by CTO',
          'Competitive evaluation underway'
        ],
        signals: [
          'API usage increased 300%',
          'Development team expanded 40%',
          'Executive engagement high'
        ],
        nextAction: 'Present final ROI analysis to executive committee',
        budgetConfirmed: true,
        decisionMaker: 'James Rodriguez (CTO)',
        timeline: '45 days'
      },
      {
        id: 'opp-2',
        accountId: 'acc-12',
        accountName: 'InsureTech Solutions',
        title: 'AI Fraud Detection Platform',
        value: 8200000,
        stage: 'negotiation',
        probability: 85,
        closeDate: '2024-02-28',
        owner: 'Michael Thompson',
        source: 'signal_expansion',
        d365RecordId: 'D365-OPP-002',
        created: '2023-12-01T09:00:00Z',
        lastModified: '2024-02-18T14:20:00Z',
        notes: [
          'Final contract terms under review',
          'Legal approval pending',
          'Implementation timeline agreed'
        ],
        signals: [
          'Fraud detection accuracy improved 28%',
          'Claims processing automation interest',
          'Risk assessment needs identified'
        ],
        nextAction: 'Finalize contract terms and implementation schedule',
        competitorInfo: 'Competing against SAS and IBM',
        budgetConfirmed: true,
        decisionMaker: 'Maria Santos (Chief Risk Officer)',
        timeline: '15 days'
      },
      {
        id: 'opp-3',
        accountId: 'acc-3',
        accountName: 'FinanceFirst Bank',
        title: 'Critical Relationship Recovery Program',
        value: 89000000,
        stage: 'qualification',
        probability: 45,
        closeDate: '2024-06-30',
        owner: 'David Kim',
        source: 'retention_save',
        d365RecordId: 'D365-OPP-003',
        created: '2024-02-10T11:00:00Z',
        lastModified: '2024-02-22T16:45:00Z',
        notes: [
          'Executive escalation initiated',
          'Service improvement plan presented',
          'Dedicated account team assigned'
        ],
        signals: [
          'Health score declined 25 points',
          'Support tickets increased 180%',
          'Contract renewal risk identified'
        ],
        nextAction: 'Executive business review with Microsoft CVP',
        budgetConfirmed: false,
        decisionMaker: 'Robert Chen (CEO)',
        timeline: '120 days'
      },
      {
        id: 'opp-4',
        accountId: 'acc-14',
        accountName: 'BioPharm Research',
        title: 'AI Drug Discovery Acceleration',
        value: 9200000,
        stage: 'prospecting',
        probability: 25,
        closeDate: '2024-05-15',
        owner: 'Lisa Wang',
        source: 'signal_expansion',
        d365RecordId: 'D365-OPP-004',
        created: '2024-02-01T08:30:00Z',
        lastModified: '2024-02-19T13:15:00Z',
        notes: [
          'Initial discovery meeting completed',
          'Technical architecture review scheduled',
          'ROI analysis in progress'
        ],
        signals: [
          'Research productivity metrics improved',
          'Clinical trial success patterns',
          'R&D team AI adoption signals'
        ],
        nextAction: 'Schedule demonstration with Chief Scientific Officer',
        budgetConfirmed: false,
        decisionMaker: 'Dr. Jennifer Park (CSO)',
        timeline: '90 days'
      },
      {
        id: 'opp-5',
        accountId: 'acc-18',
        accountName: 'CyberGuard Security',
        title: 'Advanced Threat Detection Platform',
        value: 7300000,
        stage: 'closed_won',
        probability: 100,
        closeDate: '2024-01-31',
        owner: 'Alex Rodriguez',
        source: 'signal_expansion',
        d365RecordId: 'D365-OPP-005',
        created: '2023-11-15T10:00:00Z',
        lastModified: '2024-01-31T17:00:00Z',
        notes: [
          'Contract signed and executed',
          'Implementation kickoff scheduled',
          'Customer success team assigned'
        ],
        signals: [
          'Security operations efficiency +42%',
          'Threat detection accuracy 96%',
          'SOC team seeking advanced analytics'
        ],
        nextAction: 'Begin implementation and onboarding',
        budgetConfirmed: true,
        decisionMaker: 'Tom Wilson (CISO)',
        timeline: 'Completed'
      },
      {
        id: 'opp-6',
        accountId: 'acc-7',
        accountName: 'GreenTech Manufacturing',
        title: 'IoT Production Optimization',
        value: 4500000,
        stage: 'qualification',
        probability: 60,
        closeDate: '2024-04-30',
        owner: 'Emma Johnson',
        source: 'new_business',
        d365RecordId: 'D365-OPP-006',
        created: '2024-01-20T09:15:00Z',
        lastModified: '2024-02-21T11:30:00Z',
        notes: [
          'Production efficiency audit completed',
          'Pilot program proposal drafted',
          'Budget discussions ongoing'
        ],
        signals: [
          'Production downtime concerns',
          'Energy efficiency initiatives',
          'Sustainability reporting needs'
        ],
        nextAction: 'Present pilot program proposal and ROI projections',
        budgetConfirmed: false,
        decisionMaker: 'Carlos Mendez (COO)',
        timeline: '75 days'
      }
    ];

    setOpportunities(sampleOpportunities);
    toast.success('Opportunity tracking data initialized');
  };

  const calculateMetrics = (): ConversionMetrics => {
    if (!opportunities || opportunities.length === 0) {
      return {
        totalOpportunities: 0,
        totalValue: 0,
        conversionRate: 0,
        avgDealSize: 0,
        avgSalesCycle: 0,
        pipelineVelocity: 0,
        d365SyncRate: 0,
        signalToOpportunityRate: 0
      };
    }

    const totalOpportunities = opportunities.length;
    const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
    const closedWon = opportunities.filter(opp => opp.stage === 'closed_won').length;
    const closedTotal = opportunities.filter(opp => opp.stage === 'closed_won' || opp.stage === 'closed_lost').length;
    const conversionRate = closedTotal > 0 ? (closedWon / closedTotal) * 100 : 0;
    const avgDealSize = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
    
    // Calculate average sales cycle for closed won deals
    const closedWonOpps = opportunities.filter(opp => opp.stage === 'closed_won');
    const avgSalesCycle = closedWonOpps.length > 0 
      ? closedWonOpps.reduce((sum, opp) => {
          const created = new Date(opp.created);
          const closed = new Date(opp.closeDate);
          return sum + ((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / closedWonOpps.length
      : 0;

    const pipelineVelocity = avgSalesCycle > 0 ? avgDealSize / avgSalesCycle : 0;
    const d365SyncRate = opportunities.filter(opp => opp.d365RecordId).length / totalOpportunities * 100;
    const signalDrivenOpps = opportunities.filter(opp => 
      opp.source === 'signal_expansion' || (opp.signals && opp.signals.length > 0)
    ).length;
    const signalToOpportunityRate = totalOpportunities > 0 ? (signalDrivenOpps / totalOpportunities) * 100 : 0;

    return {
      totalOpportunities,
      totalValue,
      conversionRate,
      avgDealSize,
      avgSalesCycle,
      pipelineVelocity,
      d365SyncRate,
      signalToOpportunityRate
    };
  };

  const getFilteredOpportunities = () => {
    if (!opportunities) return [];
    
    return opportunities.filter(opp => {
      if (selectedStage !== 'all' && opp.stage !== selectedStage) return false;
      if (selectedSource !== 'all' && opp.source !== selectedSource) return false;
      return true;
    });
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospecting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'qualification': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'proposal': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'negotiation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed_won': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed_lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'signal_expansion': return <TrendUp className="w-4 h-4" />;
      case 'account_growth': return <ArrowUpRight className="w-4 h-4" />;
      case 'retention_save': return <Warning className="w-4 h-4" />;
      case 'new_business': return <Buildings className="w-4 h-4" />;
      case 'referral': return <Users className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const handleSyncWithD365 = async (opportunityId: string) => {
    setIsRefreshing(true);
    
    // Simulate D365 sync
    setTimeout(() => {
      const opportunity = opportunities?.find(opp => opp.id === opportunityId);
      if (opportunity && opportunities) {
        const updatedOpportunities = opportunities.map(opp => 
          opp.id === opportunityId 
            ? { 
                ...opp, 
                lastModified: new Date().toISOString(),
                d365RecordId: opp.d365RecordId || `D365-OPP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
              }
            : opp
        );
        setOpportunities(updatedOpportunities);
        toast.success(`Synchronized ${opportunity.title} with Dynamics 365`);
      }
      setIsRefreshing(false);
    }, 1500);
  };

  const handleCreateInD365 = async (opportunity: Opportunity) => {
    if (!opportunity.d365RecordId) {
      const newD365Id = `D365-OPP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      const updatedOpportunities = opportunities?.map(opp => 
        opp.id === opportunity.id 
          ? { ...opp, d365RecordId: newD365Id, lastModified: new Date().toISOString() }
          : opp
      ) || [];
      
      setOpportunities(updatedOpportunities);
      
      // Simulate realistic D365 creation process
      toast.success(
        `✅ Created opportunity "${opportunity.title}" in Dynamics 365 CRM\n` +
        `🔗 D365 Record ID: ${newD365Id}\n` +
        `💰 Value: $${(opportunity.value / 1000000).toFixed(1)}M\n` +
        `📊 Stage: ${opportunity.stage.replace('_', ' ')}\n` +
        `👤 Owner: ${opportunity.owner}`
      );
    }
  };

  const metrics = calculateMetrics();
  const filteredOpportunities = getFilteredOpportunities();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Opportunity Tracking Dashboard</h2>
          <p className="text-muted-foreground">Monitor D365 CRM conversions and opportunity pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsRefreshing(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <ArrowClockwise className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-visible">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pipeline</p>
                <p className="text-2xl font-bold">${(metrics.totalValue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.totalOpportunities} opportunities
                </p>
              </div>
              <CurrencyDollar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-visible">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
                <div className="mt-2">
                  <Progress value={metrics.conversionRate} className="h-2" />
                </div>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-visible">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">${(metrics.avgDealSize / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +12% vs last quarter
                </p>
              </div>
              <ChartBar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-visible">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">D365 Sync Rate</p>
                <p className="text-2xl font-bold">{metrics.d365SyncRate.toFixed(0)}%</p>
                <div className="mt-2">
                  <Progress value={metrics.d365SyncRate} className="h-2" />
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Funnel className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="prospecting">Prospecting</SelectItem>
              <SelectItem value="qualification">Qualification</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="signal_expansion">Signal Expansion</SelectItem>
            <SelectItem value="account_growth">Account Growth</SelectItem>
            <SelectItem value="retention_save">Retention Save</SelectItem>
            <SelectItem value="new_business">New Business</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="outline" className="ml-auto">
          {filteredOpportunities.length} of {metrics.totalOpportunities} opportunities
        </Badge>
      </div>

      {/* Opportunity Pipeline */}
      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="field-mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="d365-sync">D365 Sync Status</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid gap-4">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="border-visible">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                        <Badge className={getStageColor(opportunity.stage)}>
                          {opportunity.stage.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getSourceIcon(opportunity.source)}
                          {opportunity.source.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{opportunity.accountName}</p>
                      <p className="text-sm text-muted-foreground">Owner: {opportunity.owner}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${(opportunity.value / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-muted-foreground">{opportunity.probability}% probability</p>
                      <p className="text-sm text-muted-foreground">
                        Close: {new Date(opportunity.closeDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recent Signals</h4>
                      <div className="space-y-1">
                        {opportunity.signals.slice(0, 3).map((signal, index) => (
                          <div key={index} className="text-xs bg-muted p-2 rounded flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            {signal}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Details</h4>
                      <div className="space-y-1 text-xs">
                        <div><strong>Decision Maker:</strong> {opportunity.decisionMaker}</div>
                        <div><strong>Timeline:</strong> {opportunity.timeline}</div>
                        <div className="flex items-center gap-2">
                          <strong>Budget Confirmed:</strong>
                          {opportunity.budgetConfirmed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {opportunity.d365RecordId ? (
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          D365: {opportunity.d365RecordId}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-700 border-orange-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Not synced to D365
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!opportunity.d365RecordId && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCreateInD365(opportunity)}
                        >
                          Create in D365
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSyncWithD365(opportunity.id)}
                        disabled={isRefreshing}
                      >
                        <ArrowClockwise className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Sync
                      </Button>
                      {opportunity.d365RecordId && (
                        <Button size="sm" variant="outline">
                          <ArrowSquareOut className="w-3 h-3 mr-1" />
                          View in D365
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-visible">
              <CardHeader>
                <CardTitle>Pipeline by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['prospecting', 'qualification', 'proposal', 'negotiation'].map((stage) => {
                    const stageOpps = filteredOpportunities.filter(opp => opp.stage === stage);
                    const stageValue = stageOpps.reduce((sum, opp) => sum + opp.value, 0);
                    const percentage = metrics.totalValue > 0 ? (stageValue / metrics.totalValue) * 100 : 0;
                    
                    return (
                      <div key={stage} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {stage.replace('_', ' ')} ({stageOpps.length})
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ${(stageValue / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-visible">
              <CardHeader>
                <CardTitle>Signal-Driven Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">
                      {metrics.signalToOpportunityRate.toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Opportunities driven by signals
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Signal Expansion</span>
                      <span className="text-sm font-medium">
                        {filteredOpportunities.filter(opp => opp.source === 'signal_expansion').length} opps
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Retention Saves</span>
                      <span className="text-sm font-medium">
                        {filteredOpportunities.filter(opp => opp.source === 'retention_save').length} opps
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Account Growth</span>
                      <span className="text-sm font-medium">
                        {filteredOpportunities.filter(opp => opp.source === 'account_growth').length} opps
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="field-mapping" className="space-y-4">
          <FieldMappingManager selectedAccount={selectedAccount} />
        </TabsContent>

        <TabsContent value="d365-sync" className="space-y-4">
          <Card className="border-visible">
            <CardHeader>
              <CardTitle>Dynamics 365 Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {opportunities?.filter(opp => opp.d365RecordId).length || 0}
                  </div>
                  <p className="text-sm text-green-600">Synced to D365</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">
                    {opportunities?.filter(opp => !opp.d365RecordId).length || 0}
                  </div>
                  <p className="text-sm text-orange-600">Pending Sync</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {metrics.d365SyncRate.toFixed(0)}%
                  </div>
                  <p className="text-sm text-blue-600">Sync Rate</p>
                </div>
              </div>

              <div className="space-y-2">
                {opportunities?.map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        opportunity.d365RecordId ? 'bg-green-500' : 'bg-orange-500'
                      }`} />
                      <div>
                        <p className="font-medium">{opportunity.title}</p>
                        <p className="text-sm text-muted-foreground">{opportunity.accountName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {opportunity.d365RecordId ? (
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          {opportunity.d365RecordId}
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCreateInD365(opportunity)}
                        >
                          Create in D365
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OpportunityTrackingDashboard;
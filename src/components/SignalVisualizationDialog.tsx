import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  TrendUp, 
  TrendDown, 
  Warning, 
  CheckCircle, 
  Target, 
  ChartBar, 
  Lightning, 
  Users, 
  CurrencyDollar, 
  Database,
  Shield,
  Rocket,
  Brain,
  ArrowRight,
  Calendar,
  User,
  Building,
  Clock,
  Lightbulb,
  Eye,
  CaretDown,
  CaretUp,
  Minus,
  Funnel,
  Fire,
  Timer,
  Pulse,
  Graph,
  Crosshair,
  MapPin,
  Activity,
  Gear,
  MagnifyingGlass,
  Star
} from '@phosphor-icons/react';
import { useSignals, useAccounts, useNBAs } from '@/hooks/useData';
import { Signal, Account, NextBestAction } from '@/types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Treemap,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  FunnelChart,
  Funnel as FunnelShape,
  LabelList
} from 'recharts';
import { SignalHeatMap } from '@/components/SignalHeatMap';
import { toast } from 'sonner';

interface SignalVisualizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAccount?: Account;
}

interface SignalMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  impact: number;
  frequency: number;
}

interface InteractiveArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signal: Signal;
  type: 'expansion' | 'risk' | 'opportunity';
  account?: Account;
}

interface HeatMapData {
  account: string;
  category: string;
  severity: number;
  count: number;
  value: number;
}

interface ExpansionOpportunity {
  id: string;
  title: string;
  description: string;
  potentialValue: string;
  timeline: string;
  probability: 'high' | 'medium' | 'low';
  microsoftSolutions: string[];
  requiredActions: string[];
  signals: Signal[];
  account: Account;
  roi: number;
  effort: 'low' | 'medium' | 'high';
}

const SIGNAL_CATEGORIES = [
  { key: 'cost', label: 'Cost Management', icon: CurrencyDollar, color: '#10B981' },
  { key: 'agility', label: 'Business Agility', icon: Rocket, color: '#3B82F6' },
  { key: 'data', label: 'Data & Analytics', icon: Database, color: '#8B5CF6' },
  { key: 'risk', label: 'Risk & Compliance', icon: Shield, color: '#EF4444' },
  { key: 'culture', label: 'Culture & Adoption', icon: Users, color: '#F59E0B' }
];

const SIGNAL_SEVERITY_COLORS = {
  critical: '#EF4444',
  high: '#F59E0B', 
  medium: '#3B82F6',
  low: '#10B981'
};

const SEVERITY_WEIGHTS = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

export function SignalVisualizationDialog({ open, onOpenChange, selectedAccount }: SignalVisualizationDialogProps) {
  const { signals } = useSignals();
  const { accounts } = useAccounts();
  const { addNBA } = useNBAs();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [hoveredArea, setHoveredArea] = useState<InteractiveArea | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string[]>(['critical', 'high', 'medium', 'low']);
  const [impactThreshold, setImpactThreshold] = useState<number[]>([0]);
  const [viewMode, setViewMode] = useState<'grid' | 'heatmap' | 'network'>('grid');
  const [selectedExpansion, setSelectedExpansion] = useState<ExpansionOpportunity | null>(null);

  // Filter signals based on all criteria
  const filteredSignals = useMemo(() => {
    let filtered = signals;
    
    if (selectedAccount) {
      filtered = filtered.filter(s => s.accountId === selectedAccount.id);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter.length < 4) {
      filtered = filtered.filter(s => severityFilter.includes(s.severity));
    }
    
    return filtered;
  }, [signals, selectedAccount, selectedCategory, searchTerm, severityFilter]);

  // Generate signal metrics for visualization
  const signalMetrics: SignalMetric[] = useMemo(() => {
    return filteredSignals.map(signal => ({
      name: signal.type,
      value: parseFloat(signal.value?.toString() || '0'),
      change: Math.random() * 20 - 10, // Mock change data
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.25 ? 'down' : 'stable',
      severity: signal.severity,
      category: signal.category || 'data',
      impact: SEVERITY_WEIGHTS[signal.severity] * (Math.random() * 30 + 10),
      frequency: Math.floor(Math.random() * 10) + 1
    }));
  }, [filteredSignals]);

  // Generate expansion opportunities
  const expansionOpportunities: ExpansionOpportunity[] = useMemo(() => {
    const opportunities: ExpansionOpportunity[] = [];
    
    accounts.forEach(account => {
      const accountSignals = signals.filter(s => s.accountId === account.id);
      const criticalSignals = accountSignals.filter(s => s.severity === 'critical' || s.severity === 'high');
      
      if (criticalSignals.length >= 2) {
        const costSignals = criticalSignals.filter(s => s.category === 'cost');
        
        if (costSignals.length > 0) {
          opportunities.push({
            id: `exp-${account.id}-cost`,
            title: `Azure Cost Optimization - ${account.name}`,
            description: `Comprehensive cost management addressing ${costSignals.length} critical signals`,
            potentialValue: `$${(account.arr * 0.15).toLocaleString()}`,
            timeline: '90-120 days',
            probability: 'high',
            microsoftSolutions: ['Azure Cost Management', 'Azure Advisor', 'Power BI Premium'],
            requiredActions: ['Cost workshop', 'Assessment', 'Implementation'],
            signals: costSignals,
            account,
            roi: 250 + Math.random() * 150,
            effort: 'medium'
          });
        }
      }
    });
    
    return opportunities.sort((a, b) => b.roi - a.roi);
  }, [signals, accounts]);

  // Generate time series data for trends
  const trendData = useMemo(() => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const data: Record<string, any>[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayData: Record<string, any> = {
        date: date.toISOString().split('T')[0],
        timestamp: date.getTime()
      };
      
      SIGNAL_CATEGORIES.forEach(cat => {
        const categorySignals = filteredSignals.filter(s => s.category === cat.key);
        const avgValue = categorySignals.length > 0 
          ? categorySignals.reduce((sum, s) => sum + (parseFloat(s.value?.toString() || '0')), 0) / categorySignals.length
          : 0;
        
        const variation = (Math.random() - 0.5) * 0.1 * avgValue;
        dayData[cat.key] = Math.max(0, avgValue + variation);
      });
      
      data.push(dayData);
    }
    
    return data;
  }, [filteredSignals, selectedTimeRange]);

  // Generate interactive areas for the visualization
  const interactiveAreas: InteractiveArea[] = useMemo(() => {
    const areas: InteractiveArea[] = [];
    
    filteredSignals.forEach((signal, index) => {
      if (signal.severity === 'critical' || signal.severity === 'high') {
        const account = accounts.find(a => a.id === signal.accountId);
        const x = (index % 4) * 25 + 10;
        const y = Math.floor(index / 4) * 30 + 15;
        
        areas.push({
          id: signal.id,
          x,
          y,
          width: 20,
          height: 25,
          signal,
          account,
          type: signal.severity === 'critical' ? 'risk' : (signal.category || 'data').includes('cost') ? 'expansion' : 'opportunity'
        });
      }
    });
    
    return areas;
  }, [filteredSignals, accounts]);

  // Handle area clicks
  const handleAreaClick = (area: InteractiveArea) => {
    setSelectedSignal(area.signal);
    
    if (area.type === 'expansion') {
      toast.success(`Expansion opportunity: ${area.signal.type}`);
    } else if (area.type === 'risk') {
      toast.warning(`Risk analysis: ${area.signal.description}`);
    } else {
      toast.info(`Opportunity: ${area.signal.description}`);
    }
  };

  // Generate AI recommendations
  const handleGenerateRecommendations = async () => {
    if (!selectedSignal) return;

    try {
      const account = accounts.find(a => a.id === selectedSignal.accountId);
      const nba: NextBestAction = {
        id: `nba-${Date.now()}`,
        accountId: selectedSignal.accountId,
        title: `Address ${selectedSignal.type} Signal`,
        description: `Action plan for ${selectedSignal.description}`,
        reasoning: `Based on ${selectedSignal.severity} priority signal requiring immediate attention`,
        priority: selectedSignal.severity === 'critical' ? 'critical' : 'high',
        estimatedImpact: `$${(Math.random() * 1000000 + 100000).toLocaleString()}`,
        effort: selectedSignal.severity === 'critical' ? 'high' : 'medium',
        category: (selectedSignal.category || 'data').includes('cost') ? 'expansion' : 'retention',
        generatedAt: new Date().toISOString(),
        suggestedActions: [
          `Analyze ${selectedSignal.type} signal`,
          `Engage with ${account?.csam || 'team'}`,
          'Implement monitoring',
          'Schedule follow-up'
        ]
      };

      addNBA(nba);
      toast.success('AI recommendations generated');
      
    } catch (error) {
      toast.error('Failed to generate recommendations');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5" />
            Interactive Signal Analytics Dashboard
            {selectedAccount && (
              <Badge variant="outline" className="ml-2">
                {selectedAccount.name}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Comprehensive visualization of business value signals with heat maps, trends, and expansion opportunities
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <MagnifyingGlass className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search signals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px]"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {SIGNAL_CATEGORIES.map(cat => (
                <SelectItem key={cat.key} value={cat.key}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightning className="w-4 h-4" />
            {filteredSignals.length} signals found
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4" />
            {expansionOpportunities.length} opportunities
          </div>
        </div>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 overflow-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SIGNAL_CATEGORIES.map(category => {
                const categorySignals = filteredSignals.filter(s => s.category === category.key);
                const criticalCount = categorySignals.filter(s => s.severity === 'critical').length;
                const highCount = categorySignals.filter(s => s.severity === 'high').length;
                
                return (
                  <Card key={category.key} className="border-visible">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <category.icon className="w-4 h-4" style={{ color: category.color }} />
                        {category.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{categorySignals.length}</span>
                          <div className="flex gap-1">
                            {criticalCount > 0 && (
                              <Badge variant="destructive" className="text-xs px-1">
                                {criticalCount} Critical
                              </Badge>
                            )}
                            {highCount > 0 && (
                              <Badge variant="secondary" className="text-xs px-1">
                                {highCount} High
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {categorySignals.length > 0 && (
                          <div className="space-y-1">
                            {categorySignals.slice(0, 3).map(signal => (
                              <div key={signal.id} className="flex items-center justify-between text-xs">
                                <span className="truncate">{signal.type}</span>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs px-1"
                                  style={{ 
                                    borderColor: SIGNAL_SEVERITY_COLORS[signal.severity],
                                    color: SIGNAL_SEVERITY_COLORS[signal.severity]
                                  }}
                                >
                                  {signal.severity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4 overflow-auto max-h-[60vh]">
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp className="w-4 h-4" />
                  Signal Trends Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      {SIGNAL_CATEGORIES.map(cat => (
                        <Line
                          key={cat.key}
                          type="monotone"
                          dataKey={cat.key}
                          stroke={cat.color}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4 overflow-auto max-h-[60vh]">
            <SignalHeatMap selectedAccount={selectedAccount} />
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4 overflow-auto max-h-[60vh]">
            <div className="grid gap-4">
              {expansionOpportunities.map(opportunity => (
                <Card key={opportunity.id} className="border-visible">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{opportunity.account.name}</Badge>
                          <Badge variant={opportunity.probability === 'high' ? 'default' : 'outline'}>
                            {opportunity.probability} probability
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {opportunity.potentialValue}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ROI: {opportunity.roi.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {opportunity.description}
                    </p>
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          const nba: NextBestAction = {
                            id: `nba-${Date.now()}`,
                            accountId: opportunity.account.id,
                            title: opportunity.title,
                            description: opportunity.description,
                            reasoning: `Expansion opportunity with ${opportunity.roi.toFixed(0)}% ROI`,
                            priority: 'high',
                            estimatedImpact: opportunity.potentialValue,
                            effort: opportunity.effort,
                            category: 'expansion',
                            generatedAt: new Date().toISOString(),
                            suggestedActions: opportunity.requiredActions
                          };
                          addNBA(nba);
                          toast.success('Opportunity added to Next Best Actions');
                        }}
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Create NBA
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interactive" className="space-y-4 overflow-auto max-h-[60vh]">
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Interactive Signal Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 min-h-[400px]">
                  <svg width="100%" height="400" viewBox="0 0 100 100" className="absolute inset-0">
                    <defs>
                      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                    
                    {interactiveAreas.map(area => (
                      <g key={area.id}>
                        <rect
                          x={area.x}
                          y={area.y}
                          width={area.width}
                          height={area.height}
                          fill={
                            area.type === 'expansion' ? '#10B981' :
                            area.type === 'risk' ? '#EF4444' : '#3B82F6'
                          }
                          fillOpacity={hoveredArea?.id === area.id ? 0.8 : 0.6}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredArea(area)}
                          onMouseLeave={() => setHoveredArea(null)}
                          onClick={() => handleAreaClick(area)}
                        />
                        <text
                          x={area.x + area.width / 2}
                          y={area.y + area.height / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="6"
                          fill="white"
                        >
                          {area.type === 'expansion' ? '💰' : 
                           area.type === 'risk' ? '⚠️' : '💡'}
                        </text>
                      </g>
                    ))}
                  </svg>
                  
                  {hoveredArea && (
                    <div className="absolute bg-white rounded-lg p-3 shadow-lg border z-10 max-w-xs">
                      <div className="font-medium text-sm">{hoveredArea.signal.type}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {hoveredArea.signal.description}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 overflow-auto max-h-[60vh]">
            <div className="space-y-4">
              {selectedSignal && (
                <Card className="border-visible bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Selected Signal: {selectedSignal.type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Description</div>
                        <div className="text-sm text-muted-foreground">{selectedSignal.description}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Severity</div>
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: SIGNAL_SEVERITY_COLORS[selectedSignal.severity],
                            color: SIGNAL_SEVERITY_COLORS[selectedSignal.severity]
                          }}
                        >
                          {selectedSignal.severity}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleGenerateRecommendations} className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Generate AI Recommendations
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedSignal(null)}>
                        Clear Selection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid gap-4">
                {filteredSignals.map(signal => {
                  const account = accounts.find(a => a.id === signal.accountId);
                  
                  return (
                    <Card 
                      key={signal.id} 
                      className={`border-visible cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedSignal?.id === signal.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedSignal(signal)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="font-medium">{signal.type}</div>
                              <Badge 
                                variant="outline"
                                style={{ 
                                  borderColor: SIGNAL_SEVERITY_COLORS[signal.severity],
                                  color: SIGNAL_SEVERITY_COLORS[signal.severity]
                                }}
                              >
                                {signal.severity}
                              </Badge>
                              {account && (
                                <Badge variant="secondary">
                                  {account.name}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {signal.description}
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSignal(signal);
                              handleGenerateRecommendations();
                            }}
                            className="text-xs"
                          >
                            <Lightbulb className="w-3 h-3 mr-1" />
                            Analyze
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
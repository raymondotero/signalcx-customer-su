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
  Minus
} from '@phosphor-icons/react';
import { useSignals, useAccounts, useNBAs } from '@/hooks/useData';
import { Signal, Account, NextBestAction } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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
}

interface InteractiveArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signal: Signal;
  type: 'expansion' | 'risk' | 'opportunity';
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

export function SignalVisualizationDialog({ open, onOpenChange, selectedAccount }: SignalVisualizationDialogProps) {
  const { signals } = useSignals();
  const { accounts } = useAccounts();
  const { addNBA } = useNBAs();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [hoveredArea, setHoveredArea] = useState<InteractiveArea | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  // Filter signals based on selected account and category
  const filteredSignals = useMemo(() => {
    let filtered = signals;
    
    if (selectedAccount) {
      filtered = filtered.filter(s => s.accountId === selectedAccount.id);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    return filtered;
  }, [signals, selectedAccount, selectedCategory]);

  // Generate signal metrics for visualization
  const signalMetrics: SignalMetric[] = useMemo(() => {
    return filteredSignals.map(signal => ({
      name: signal.type,
      value: parseFloat(signal.value?.toString() || '0'),
      change: Math.random() * 20 - 10, // Mock change data
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.25 ? 'down' : 'stable',
      severity: signal.severity,
      category: signal.category || 'data'
    }));
  }, [filteredSignals]);

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
        
        // Add some realistic variation over time
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
        // Position areas based on signal properties
        const x = (index % 4) * 25 + 10;
        const y = Math.floor(index / 4) * 30 + 15;
        
        areas.push({
          id: signal.id,
          x,
          y,
          width: 20,
          height: 25,
          signal,
          type: signal.severity === 'critical' ? 'risk' : (signal.category || 'data').includes('cost') ? 'expansion' : 'opportunity'
        });
      }
    });
    
    return areas;
  }, [filteredSignals]);

  // Generate expansion opportunities from signals
  const generateExpansionOpportunity = (signal: Signal) => {
    const account = accounts.find(a => a.id === signal.accountId);
    if (!account) return;

    const opportunities = [
      {
        title: `${signal.type} Optimization Initiative`,
        description: `Based on ${signal.description}, implement comprehensive optimization strategy`,
        potentialValue: `$${(Math.random() * 2000000 + 500000).toLocaleString()}`,
        timeline: '60-90 days',
        probability: signal.severity === 'critical' ? 'high' : 'medium',
        microsoftSolutions: [
          'Azure Cost Management',
          'Microsoft Power BI',
          'Azure Advisor',
          'Microsoft Purview'
        ],
        requiredActions: [
          'Executive stakeholder alignment',
          'Technical assessment and planning',
          'Pilot program implementation',
          'ROI measurement and validation'
        ]
      }
    ];

    return opportunities[0];
  };

  // Handle interactive area clicks
  const handleAreaClick = (area: InteractiveArea) => {
    setSelectedSignal(area.signal);
    
    if (area.type === 'expansion') {
      const opportunity = generateExpansionOpportunity(area.signal);
      if (opportunity) {
        toast.success(`Expansion opportunity identified: ${opportunity.title}`);
      }
    } else if (area.type === 'risk') {
      toast.warning(`Risk analysis: ${area.signal.description}`);
    } else {
      toast.info(`Opportunity details: ${area.signal.description}`);
    }
  };

  // Generate AI recommendations for selected signal
  const handleGenerateRecommendations = async () => {
    if (!selectedSignal) return;

    try {
      const account = accounts.find(a => a.id === selectedSignal.accountId);
      const nba: NextBestAction = {
        id: `nba-${Date.now()}`,
        accountId: selectedSignal.accountId,
        title: `Address ${selectedSignal.type} Signal`,
        description: `Comprehensive action plan to resolve ${selectedSignal.description}`,
        reasoning: `Based on signal analysis showing ${selectedSignal.severity} priority indicator with current value of ${selectedSignal.value}. Immediate attention required to prevent potential impact.`,
        priority: selectedSignal.severity === 'critical' ? 'critical' : 'high',
        estimatedImpact: `$${(Math.random() * 1000000 + 100000).toLocaleString()} potential value`,
        effort: selectedSignal.severity === 'critical' ? 'high' : 'medium',
        category: (selectedSignal.category || 'data').includes('cost') ? 'expansion' : 'retention',
        generatedAt: new Date().toISOString(),
        suggestedActions: [
          `Analyze root cause of ${selectedSignal.type} signal`,
          `Engage with ${account?.csam || 'customer success team'} for immediate response`,
          `Implement monitoring and alerting for similar signals`,
          `Schedule follow-up review in 30 days`
        ]
      };

      addNBA(nba);
      toast.success('AI recommendations generated and added to Next Best Actions');
      
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
            Signal Visualization Dashboard
            {selectedAccount && (
              <Badge variant="outline" className="ml-2">
                {selectedAccount.name}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Interactive visualization of business value signals with expansion opportunities and risk analysis
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mb-4 flex-wrap">
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
        </div>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="interactive">Interactive Map</TabsTrigger>
            <TabsTrigger value="details">Signal Details</TabsTrigger>
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
                            {categorySignals.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{categorySignals.length - 3} more...
                              </div>
                            )}
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
                        formatter={(value: any, name: string) => [
                          typeof value === 'number' ? value.toFixed(1) : value, 
                          SIGNAL_CATEGORIES.find(c => c.key === name)?.label || name
                        ]}
                      />
                      {SIGNAL_CATEGORIES.map(cat => (
                        <Line
                          key={cat.key}
                          type="monotone"
                          dataKey={cat.key}
                          stroke={cat.color}
                          strokeWidth={2}
                          dot={{ fill: cat.color, strokeWidth: 2 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="text-sm">Signal Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={SIGNAL_CATEGORIES.map(cat => ({
                            name: cat.label,
                            value: filteredSignals.filter(s => s.category === cat.key).length,
                            fill: cat.color
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          label={({ name, percent }) => 
                            percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                          }
                        >
                          {SIGNAL_CATEGORIES.map((cat, index) => (
                            <Cell key={`cell-${index}`} fill={cat.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="text-sm">Severity Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(SIGNAL_SEVERITY_COLORS).map(([severity, color]) => ({
                          severity,
                          count: filteredSignals.filter(s => s.severity === severity).length,
                          fill: color
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="severity" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interactive" className="space-y-4 overflow-auto max-h-[60vh]">
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Interactive Signal Map
                  <Badge variant="outline" className="ml-2">
                    Click areas to explore
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 min-h-[400px]">
                  <svg width="100%" height="400" viewBox="0 0 100 100" className="absolute inset-0">
                    {/* Background grid */}
                    <defs>
                      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                    
                    {/* Interactive areas */}
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
                          stroke={
                            area.type === 'expansion' ? '#059669' :
                            area.type === 'risk' ? '#DC2626' : '#2563EB'
                          }
                          strokeWidth="1"
                          rx="2"
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredArea(area)}
                          onMouseLeave={() => setHoveredArea(null)}
                          onClick={() => handleAreaClick(area)}
                        />
                        
                        {/* Icon overlay */}
                        <text
                          x={area.x + area.width / 2}
                          y={area.y + area.height / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="6"
                          fill="white"
                          className="pointer-events-none"
                        >
                          {area.type === 'expansion' ? '💰' : 
                           area.type === 'risk' ? '⚠️' : '💡'}
                        </text>
                      </g>
                    ))}
                  </svg>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-sm border">
                    <div className="text-xs font-medium mb-2">Signal Types</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Expansion Opportunities</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Risk Areas</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>Optimization Opportunities</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover tooltip */}
                  {hoveredArea && (
                    <div className="absolute bg-white rounded-lg p-3 shadow-lg border z-10 max-w-xs">
                      <div className="font-medium text-sm">{hoveredArea.signal.type}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {hoveredArea.signal.description}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: SIGNAL_SEVERITY_COLORS[hoveredArea.signal.severity],
                            color: SIGNAL_SEVERITY_COLORS[hoveredArea.signal.severity]
                          }}
                        >
                          {hoveredArea.signal.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Click to explore
                        </span>
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
                            <div className="text-sm text-muted-foreground mb-2">
                              {signal.description}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(signal.timestamp).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Database className="w-3 h-3" />
                                {signal.category}
                              </div>
                              {signal.value && (
                                <div className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  Value: {signal.value}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {signal.severity === 'critical' && (
                              <Badge variant="destructive" className="text-xs">
                                Action Required
                              </Badge>
                            )}
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
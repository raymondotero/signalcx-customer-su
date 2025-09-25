import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThermometerSimple, TrendUp, TrendDown, Target, Warning, Info } from '@phosphor-icons/react';
import { useAccounts, useSignals } from '@/hooks/useData';
import { Account, Signal } from '@/types';
import { signalCategories } from '@/services/signalCatalog';

interface HeatMapCell {
  accountId: string;
  accountName: string;
  category: string;
  intensity: number;
  count: number;
  avgValue: number;
  trend: 'up' | 'down' | 'stable';
  signals: Signal[];
  criticalCount: number;
  warningCount: number;
}

interface SignalHeatMapProps {
  selectedAccount?: Account;
  className?: string;
}

export function SignalHeatMap({ selectedAccount, className = '' }: SignalHeatMapProps) {
  const { accounts } = useAccounts();
  const { signals } = useSignals();
  const [viewMode, setViewMode] = useState<'intensity' | 'count' | 'trend'>('intensity');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCell, setSelectedCell] = useState<HeatMapCell | null>(null);

  // Generate heat map data
  const heatMapData = useMemo(() => {
    const data: HeatMapCell[] = [];
    const categories = Object.keys(signalCategories);
    
    const filteredAccounts = selectedAccount ? [selectedAccount] : accounts;
    const filteredCategories = selectedCategory === 'all' ? categories : [selectedCategory];
    
    filteredAccounts.forEach(account => {
      filteredCategories.forEach(category => {
        const categorySignals = signals.filter(signal => 
          signal.accountId === account.id && 
          signal.category === category
        );
        
        if (categorySignals.length > 0) {
          const values = categorySignals.map(s => s.value ?? 0);
          const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
          
          // Calculate intensity based on deviation from target/threshold
          const intensity = Math.min(100, Math.max(0, avgValue * 1.2));
          
          // Calculate trend based on recent signals
          const recentSignals = categorySignals
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
          
          const trend = recentSignals.length >= 2 ? 
            ((recentSignals[0].value ?? 0) > (recentSignals[recentSignals.length - 1].value ?? 0) ? 'up' : 
             (recentSignals[0].value ?? 0) < (recentSignals[recentSignals.length - 1].value ?? 0) ? 'down' : 'stable') : 'stable';
          
          const criticalCount = categorySignals.filter(s => s.severity === 'critical').length;
          const warningCount = categorySignals.filter(s => s.severity === 'high' || s.severity === 'medium').length;
          
          data.push({
            accountId: account.id,
            accountName: account.name,
            category,
            intensity,
            count: categorySignals.length,
            avgValue,
            trend,
            signals: categorySignals,
            criticalCount,
            warningCount
          });
        }
      });
    });
    
    return data;
  }, [accounts, signals, selectedAccount, selectedCategory]);

  // Get intensity color
  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    if (intensity >= 20) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Get count color
  const getCountColor = (count: number) => {
    const maxCount = Math.max(...heatMapData.map(d => d.count));
    const normalized = (count / maxCount) * 100;
    
    if (normalized >= 80) return 'bg-purple-500';
    if (normalized >= 60) return 'bg-indigo-500';
    if (normalized >= 40) return 'bg-blue-500';
    if (normalized >= 20) return 'bg-cyan-500';
    return 'bg-gray-300';
  };

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'bg-red-500';
      case 'down': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  // Get cell color based on view mode
  const getCellColor = (cell: HeatMapCell) => {
    switch (viewMode) {
      case 'intensity': return getIntensityColor(cell.intensity);
      case 'count': return getCountColor(cell.count);
      case 'trend': return getTrendColor(cell.trend);
      default: return 'bg-gray-300';
    }
  };

  // Get cell opacity based on value
  const getCellOpacity = (cell: HeatMapCell) => {
    switch (viewMode) {
      case 'intensity': return Math.max(0.3, cell.intensity / 100);
      case 'count': 
        const maxCount = Math.max(...heatMapData.map(d => d.count));
        return Math.max(0.3, cell.count / maxCount);
      case 'trend': return cell.trend === 'stable' ? 0.3 : 0.8;
      default: return 0.5;
    }
  };

  // Get unique accounts and categories for grid layout
  const uniqueAccounts = Array.from(new Set(heatMapData.map(d => d.accountName)));
  const uniqueCategories = Array.from(new Set(heatMapData.map(d => d.category)));

  // Create grid data
  const gridData = uniqueAccounts.map(accountName => 
    uniqueCategories.map(category => 
      heatMapData.find(d => d.accountName === accountName && d.category === category)
    )
  );

  return (
    <TooltipProvider>
      <Card className={`border-visible ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <ThermometerSimple className="w-5 h-5 text-primary" />
              <CardTitle>Signal Heat Map</CardTitle>
              {selectedAccount && (
                <Badge variant="outline">{selectedAccount.name}</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intensity">Intensity</SelectItem>
                  <SelectItem value="count">Signal Count</SelectItem>
                  <SelectItem value="trend">Trend Direction</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(signalCategories).map(category => (
                    <SelectItem key={category} value={category}>
                      {signalCategories[category].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Heat Map Grid</TabsTrigger>
              <TabsTrigger value="details">Signal Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="mt-6">
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Legend:</span>
                    {viewMode === 'intensity' && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span className="text-xs">Low</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span className="text-xs">Medium</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span className="text-xs">High</span>
                        </div>
                      </div>
                    )}
                    {viewMode === 'trend' && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <TrendUp className="w-3 h-3 text-red-500" />
                          <span className="text-xs">Increasing</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendDown className="w-3 h-3 text-green-500" />
                          <span className="text-xs">Decreasing</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-400 rounded"></div>
                          <span className="text-xs">Stable</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {heatMapData.length} data points • {uniqueAccounts.length} accounts • {uniqueCategories.length} categories
                  </div>
                </div>

                {/* Heat Map Grid */}
                <div className="overflow-auto">
                  <div className="min-w-fit">
                    {/* Header row */}
                    <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `180px repeat(${uniqueCategories.length}, 100px)` }}>
                      <div className="h-8"></div>
                      {uniqueCategories.map(category => (
                        <div key={category} className="text-xs font-medium text-center truncate px-1 py-1">
                          {signalCategories[category]?.name || category}
                        </div>
                      ))}
                    </div>
                    
                    {/* Data rows */}
                    {gridData.map((row, accountIndex) => (
                      <div key={uniqueAccounts[accountIndex]} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `180px repeat(${uniqueCategories.length}, 100px)` }}>
                        <div className="text-sm font-medium truncate px-2 py-2 bg-muted/20 rounded">
                          {uniqueAccounts[accountIndex]}
                        </div>
                        {row.map((cell, categoryIndex) => (
                          <Tooltip key={`${accountIndex}-${categoryIndex}`}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                className={`h-12 w-full p-1 rounded ${cell ? getCellColor(cell) : 'bg-gray-100 border-dashed border-2'} hover:scale-105 transition-all`}
                                style={{ 
                                  opacity: cell ? getCellOpacity(cell) : 0.1,
                                  border: selectedCell === cell ? '2px solid var(--primary)' : 'none'
                                }}
                                onClick={() => setSelectedCell(cell || null)}
                              >
                                {cell && (
                                  <div className="text-center w-full">
                                    <div className="text-xs font-bold text-white drop-shadow">
                                      {viewMode === 'intensity' && `${cell.intensity.toFixed(0)}%`}
                                      {viewMode === 'count' && cell.count}
                                      {viewMode === 'trend' && (
                                        cell.trend === 'up' ? '↗' : cell.trend === 'down' ? '↘' : '→'
                                      )}
                                    </div>
                                    {cell.criticalCount > 0 && (
                                      <div className="text-xs text-red-200">
                                        {cell.criticalCount}🚨
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {cell ? (
                                <div className="text-sm space-y-1">
                                  <div className="font-semibold">{cell.accountName}</div>
                                  <div className="text-muted-foreground">
                                    {signalCategories[cell.category]?.name || cell.category}
                                  </div>
                                  <div className="space-y-1 border-t pt-1">
                                    <div>Signals: {cell.count}</div>
                                    <div>Intensity: {cell.intensity.toFixed(1)}%</div>
                                    <div>Avg Value: {cell.avgValue.toFixed(1)}</div>
                                    <div className="flex items-center gap-1">
                                      Trend: {cell.trend === 'up' ? <TrendUp className="w-3 h-3 text-red-500" /> : 
                                              cell.trend === 'down' ? <TrendDown className="w-3 h-3 text-green-500" /> : '→'}
                                    </div>
                                    {cell.criticalCount > 0 && (
                                      <div className="text-red-600 flex items-center gap-1">
                                        <Warning className="w-3 h-3" />
                                        {cell.criticalCount} critical
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  No signals for this category
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="mt-6">
              {selectedCell ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">{selectedCell.accountName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {signalCategories[selectedCell.category]?.name || selectedCell.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-primary">{selectedCell.count}</div>
                        <div className="text-sm text-muted-foreground">Total Signals</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">{selectedCell.intensity.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Intensity</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">{selectedCell.criticalCount}</div>
                        <div className="text-sm text-muted-foreground">Critical</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">{selectedCell.warningCount}</div>
                        <div className="text-sm text-muted-foreground">Warning</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Signals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCell.signals
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .slice(0, 5)
                          .map((signal, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded">
                              <div className="flex items-center gap-3">
                                {signal.severity === 'critical' ? (
                                  <Warning className="w-4 h-4 text-red-500" />
                                ) : (
                                  <Info className="w-4 h-4 text-blue-500" />
                                )}
                                <div>
                                  <div className="font-medium">{signal.type}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(signal.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">{signal.value?.toFixed(1)}</div>
                                <Badge variant={signal.severity === 'critical' ? 'destructive' : 'secondary'}>
                                  {signal.severity}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ThermometerSimple className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Heat Map Cell</h3>
                  <p className="text-muted-foreground">
                    Click on any cell in the heat map to view detailed signal information
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
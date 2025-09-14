import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CurrencyDollar, Rocket, Database, Shield, Users, TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import { useSignals } from '@/hooks/useData';
import { Signal } from '@/types';

interface SignalCategoryStats {
  category: string;
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  averageValue?: number;
  unit?: string;
  trending: 'up' | 'down' | 'stable';
}

export function BusinessValueDashboard() {
  const { signals } = useSignals();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cost': return <CurrencyDollar className="w-5 h-5 text-emerald-600" />;
      case 'agility': return <Rocket className="w-5 h-5 text-blue-600" />;
      case 'data': return <Database className="w-5 h-5 text-purple-600" />;
      case 'risk': return <Shield className="w-5 h-5 text-orange-600" />;
      case 'culture': return <Users className="w-5 h-5 text-pink-600" />;
      default: return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryStats = (): SignalCategoryStats[] => {
    const categories = ['cost', 'agility', 'data', 'risk', 'culture'];
    
    return categories.map(category => {
      const categorySignals = signals.filter(s => s.category === category || s.type === category);
      const severityCounts = {
        critical: categorySignals.filter(s => s.severity === 'critical').length,
        high: categorySignals.filter(s => s.severity === 'high').length,
        medium: categorySignals.filter(s => s.severity === 'medium').length,
        low: categorySignals.filter(s => s.severity === 'low').length
      };
      
      // Calculate average value for signals with numeric values
      const signalsWithValues = categorySignals.filter(s => s.value !== undefined);
      const averageValue = signalsWithValues.length > 0 
        ? signalsWithValues.reduce((sum, s) => sum + (s.value || 0), 0) / signalsWithValues.length
        : undefined;
      
      // Determine trending based on recent signals (simplified for demo)
      const recentSignals = categorySignals.slice(0, 5);
      const improvingCount = recentSignals.filter(s => s.trend === 'improving').length;
      const decliningCount = recentSignals.filter(s => s.trend === 'declining').length;
      
      let trending: 'up' | 'down' | 'stable' = 'stable';
      if (improvingCount > decliningCount) trending = 'up';
      else if (decliningCount > improvingCount) trending = 'down';
      
      return {
        category,
        count: categorySignals.length,
        ...severityCounts,
        averageValue,
        unit: signalsWithValues[0]?.unit,
        trending
      };
    });
  };

  const categoryStats = getCategoryStats();
  const totalSignals = signals.length;
  const criticalSignals = signals.filter(s => s.severity === 'critical').length;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Business Value Signal Dashboard
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total Signals: {totalSignals}</span>
          <span>Critical: {criticalSignals}</span>
          <Badge variant={criticalSignals > 5 ? "destructive" : "secondary"}>
            {criticalSignals > 5 ? "High Alert" : "Normal"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {categoryStats.map(stats => (
            <Card key={stats.category} className="border-l-4 border-l-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(stats.category)}
                    <div>
                      <h4 className="font-semibold capitalize">{stats.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        {stats.count} active signal{stats.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {stats.averageValue !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        Avg: {Math.round(stats.averageValue * 10) / 10}{stats.unit}
                      </Badge>
                    )}
                    {getTrendIcon(stats.trending)}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 rounded bg-red-50">
                    <div className="font-bold text-red-700">{stats.critical}</div>
                    <div className="text-red-600">Critical</div>
                  </div>
                  <div className="text-center p-2 rounded bg-orange-50">
                    <div className="font-bold text-orange-700">{stats.high}</div>
                    <div className="text-orange-600">High</div>
                  </div>
                  <div className="text-center p-2 rounded bg-yellow-50">
                    <div className="font-bold text-yellow-700">{stats.medium}</div>
                    <div className="text-yellow-600">Medium</div>
                  </div>
                  <div className="text-center p-2 rounded bg-blue-50">
                    <div className="font-bold text-blue-700">{stats.low}</div>
                    <div className="text-blue-600">Low</div>
                  </div>
                </div>
                
                {stats.count > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Most common: {(() => {
                      const signalCounts = signals
                        .filter(s => s.category === stats.category || s.type === stats.category)
                        .reduce((acc, signal) => {
                          const name = signal.signalName || signal.type;
                          acc[name] = (acc[name] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                      
                      const topSignal = Object.entries(signalCounts)
                        .sort(([,a], [,b]) => b - a)[0];
                      
                      return topSignal ? topSignal[0] : 'N/A';
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {categoryStats.every(s => s.count === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No business value signals detected yet.</p>
              <p className="text-sm">Start the live signal stream to see real-time data.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
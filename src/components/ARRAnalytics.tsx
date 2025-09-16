import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendUp, TrendDown, Activity, ChartBar } from '@phosphor-icons/react';
import { Account } from '@/types';

interface ARRAnalyticsProps {
  accounts: Account[];
}

export function ARRAnalytics({ accounts }: ARRAnalyticsProps) {
  const totalARR = accounts.reduce((sum, account) => sum + account.arr, 0);
  const totalExpansion = accounts.reduce((sum, account) => sum + account.expansionOpportunity, 0);
  
  // Generate quarterly growth metrics for demo
  const quarterlyGrowth = 12.3; // Demo value
  const yearOverYearGrowth = 28.5; // Demo value
  const expansionRate = (totalExpansion / totalARR) * 100;
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const getGrowthTrend = (growth: number) => {
    if (growth > 15) return { icon: TrendUp, color: 'text-green-600', trend: 'Accelerating' };
    if (growth > 5) return { icon: Activity, color: 'text-blue-600', trend: 'Steady' };
    return { icon: TrendDown, color: 'text-red-600', trend: 'Declining' };
  };

  const growthTrend = getGrowthTrend(quarterlyGrowth);
  const Icon = growthTrend.icon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-visible">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">Current ARR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalARR)}</p>
              <p className="text-xs text-muted-foreground">Portfolio Total</p>
            </div>
            <ChartBar className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-visible">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">Quarterly Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">+{quarterlyGrowth}%</p>
              <Badge className={`${growthTrend.color.replace('text-', 'bg-').replace('-600', '-100')} ${growthTrend.color} border-${growthTrend.color.split('-')[1]}-200`}>
                {growthTrend.trend}
              </Badge>
            </div>
            <Icon className={`w-8 h-8 ${growthTrend.color}`} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-visible">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">YoY Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">+{yearOverYearGrowth}%</p>
              <p className="text-xs text-green-600">Above Target</p>
            </div>
            <TrendUp className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-visible">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">Expansion Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalExpansion)}</p>
              <p className="text-xs text-blue-600">{expansionRate.toFixed(1)}% of ARR</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendUp, 
  TrendDown, 
  Activity, 
  ChartBar, 
  Calendar,
  Target,
  CurrencyDollar,
  ArrowRight
} from '@phosphor-icons/react';
import { Account, QuarterlyARR, ARRTrend } from '@/types';
import { ExpansionOpportunitiesDialog } from './ExpansionOpportunitiesDialog';

interface ARRGrowthTrackerProps {
  accounts: Account[];
  selectedAccount?: Account;
}

type ViewMode = 'portfolio' | 'account';
type TimeRange = '1y' | '2y' | '3y';

export function ARRGrowthTracker({ accounts, selectedAccount }: ARRGrowthTrackerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('portfolio');
  const [timeRange, setTimeRange] = useState<TimeRange>('2y');

  // Generate sample ARR history for accounts that don't have it
  const generateARRHistory = (account: Account): QuarterlyARR[] => {
    const quarters: QuarterlyARR[] = [];
    // Use realistic quarterly growth rates directly
    const baseQuarterlyGrowth = account.status === 'Good' ? 0.02 : account.status === 'Watch' ? 0.0075 : -0.005;
    const currentDate = new Date();
    
    // Start from 8 quarters ago and work forward
    const quarterHistory: { arr: number; date: Date; quarter: string }[] = [];
    
    for (let i = 7; i >= 0; i--) {
      const quarterDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (i * 3), 1);
      const quarterStr = `Q${Math.floor(quarterDate.getMonth() / 3) + 1} ${quarterDate.getFullYear()}`;
      quarterHistory.push({ arr: 0, date: quarterDate, quarter: quarterStr });
    }
    
    // Set the most recent quarter to the current ARR and work backwards
    quarterHistory[quarterHistory.length - 1].arr = account.arr;
    
    // Calculate backwards to establish baseline
    for (let i = quarterHistory.length - 2; i >= 0; i--) {
      // Add some realistic variance (±0.5% quarterly variance)
      const variance = (Math.random() - 0.5) * 0.01;
      const quarterlyRate = baseQuarterlyGrowth + variance;
      quarterHistory[i].arr = quarterHistory[i + 1].arr / (1 + quarterlyRate);
    }
    
    // Now calculate forward with proper growth rates
    for (let i = 0; i < quarterHistory.length; i++) {
      let growth = 0;
      if (i > 0) {
        const previousARR = quarterHistory[i - 1].arr;
        const currentARR = quarterHistory[i].arr;
        growth = ((currentARR - previousARR) / previousARR) * 100;
      }
      
      quarters.push({
        quarter: quarterHistory[i].quarter,
        arr: Math.round(quarterHistory[i].arr),
        growth: Math.round(growth * 10) / 10, // Round to nearest tenth
        date: quarterHistory[i].date.toISOString()
      });
    }
    
    return quarters;
  };

  const getAccountWithHistory = (account: Account): Account => {
    if (!account.arrHistory) {
      const history = generateARRHistory(account);
      const totalGrowth = history.length > 1 
        ? ((history[history.length - 1].arr - history[0].arr) / history[0].arr) * 100 
        : 0;
      
      // Calculate average quarterly growth excluding the first quarter (which has 0% growth)
      const growthQuarters = history.slice(1);
      const averageGrowth = growthQuarters.length > 0 
        ? growthQuarters.reduce((sum, q) => sum + q.growth, 0) / growthQuarters.length 
        : 0;
      
      // Realistic quarterly growth thresholds
      const trend: ARRTrend['trend'] = averageGrowth > 2.0 ? 'accelerating' : averageGrowth > 0.5 ? 'steady' : 'declining';
      
      return {
        ...account,
        arrHistory: history,
        arrTrend: {
          quarters: history,
          totalGrowth: Math.round(totalGrowth * 10) / 10,
          averageQuarterlyGrowth: Math.round(averageGrowth * 10) / 10,
          trend
        }
      };
    }
    return account;
  };

  // Calculate portfolio-level ARR trends
  const portfolioTrends = useMemo(() => {
    const quarterMap = new Map<string, number>();
    
    // Determine how many quarters to include based on time range
    const quartersToInclude = timeRange === '1y' ? 4 : timeRange === '2y' ? 8 : 12;
    
    accounts.forEach(account => {
      const accountWithHistory = getAccountWithHistory(account);
      if (accountWithHistory.arrHistory) {
        // Take only the most recent quarters based on time range
        const recentHistory = accountWithHistory.arrHistory.slice(-quartersToInclude);
        recentHistory.forEach(quarter => {
          const existing = quarterMap.get(quarter.quarter) || 0;
          quarterMap.set(quarter.quarter, existing + quarter.arr);
        });
      }
    });

    // Sort quarters chronologically
    const quarters = Array.from(quarterMap.entries())
      .map(([quarter, arr]) => ({ quarter, arr }))
      .sort((a, b) => {
        // Parse quarter string (e.g., "Q1 2024") for proper sorting
        const [quarterA, yearA] = a.quarter.split(' ');
        const [quarterB, yearB] = b.quarter.split(' ');
        const qNumA = parseInt(quarterA.replace('Q', ''));
        const qNumB = parseInt(quarterB.replace('Q', ''));
        
        if (yearA !== yearB) {
          return parseInt(yearA) - parseInt(yearB);
        }
        return qNumA - qNumB;
      });

    const quarterlyData: QuarterlyARR[] = quarters.map((q, index) => {
      const growth = index > 0 ? ((q.arr - quarters[index - 1].arr) / quarters[index - 1].arr) * 100 : 0;
      return {
        quarter: q.quarter,
        arr: q.arr,
        growth: Math.round(growth * 10) / 10, // Round to nearest tenth
        date: new Date().toISOString()
      };
    });

    const totalGrowth = quarters.length > 1 
      ? ((quarters[quarters.length - 1].arr - quarters[0].arr) / quarters[0].arr) * 100 
      : 0;

    // Calculate average quarterly growth excluding the first quarter (which has 0% growth)
    const growthQuarters = quarterlyData.slice(1);
    const averageGrowth = growthQuarters.length > 0 
      ? growthQuarters.reduce((sum, q) => sum + q.growth, 0) / growthQuarters.length 
      : 0;

    // Realistic quarterly growth thresholds
    const trend: ARRTrend['trend'] = averageGrowth > 2.0 ? 'accelerating' : averageGrowth > 0.5 ? 'steady' : 'declining';

    return {
      quarters: quarterlyData,
      totalGrowth: Math.round(totalGrowth * 10) / 10,
      averageQuarterlyGrowth: Math.round(averageGrowth * 10) / 10,
      trend
    };
  }, [accounts, timeRange]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const formatGrowth = (growth: number) => {
    const sign = growth > 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'accelerating':
        return <TrendUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'accelerating':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const selectedAccountWithHistory = useMemo(() => {
    if (!selectedAccount) return null;
    
    const accountWithHistory = getAccountWithHistory(selectedAccount);
    
    // Calculate metrics for the selected time range
    const quartersToInclude = timeRange === '1y' ? 4 : timeRange === '2y' ? 8 : 12;
    const recentHistory = accountWithHistory.arrHistory?.slice(-quartersToInclude) || [];
    
    const timeRangeTotalGrowth = recentHistory.length > 1 
      ? ((recentHistory[recentHistory.length - 1].arr - recentHistory[0].arr) / recentHistory[0].arr) * 100 
      : 0;
    
    // Calculate average quarterly growth excluding the first quarter (which would have 0% growth)
    const growthQuarters = recentHistory.slice(1);
    const timeRangeAvgGrowth = growthQuarters.length > 0 
      ? growthQuarters.reduce((sum, q) => sum + q.growth, 0) / growthQuarters.length 
      : 0;
    
    return {
      ...accountWithHistory,
      timeRangeHistory: recentHistory,
      timeRangeTotalGrowth: Math.round(timeRangeTotalGrowth * 10) / 10,
      timeRangeAvgGrowth: Math.round(timeRangeAvgGrowth * 10) / 10,
    };
  }, [selectedAccount, timeRange]);

  return (
    <Card className="border-visible h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5" />
            ARR Growth Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="account">Account</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1y">1Y</SelectItem>
                <SelectItem value="2y">2Y</SelectItem>
                <SelectItem value="3y">3Y</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="portfolio">Portfolio View</TabsTrigger>
            <TabsTrigger value="account">Account View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolio" className="mt-4 space-y-4">
            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total ARR</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(accounts.reduce((sum, a) => sum + a.arr, 0))}
                      </p>
                    </div>
                    <CurrencyDollar className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Quarterly Growth</p>
                      <p className="text-2xl font-bold">
                        {formatGrowth(portfolioTrends.averageQuarterlyGrowth)}
                      </p>
                    </div>
                    {getTrendIcon(portfolioTrends.trend)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Growth</p>
                      <p className="text-2xl font-bold">
                        {formatGrowth(portfolioTrends.totalGrowth)}
                      </p>
                    </div>
                    <Badge className={getTrendColor(portfolioTrends.trend)}>
                      {portfolioTrends.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quarterly Breakdown */}
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="text-lg">Quarterly Performance ({timeRange.toUpperCase()})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolioTrends.quarters.map((quarter, index) => (
                    <div key={quarter.quarter} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{quarter.quarter}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold">{formatCurrency(quarter.arr)}</span>
                        <Badge 
                          variant={quarter.growth > 0 ? "default" : "destructive"}
                          className={quarter.growth > 0 ? "bg-green-100 text-green-800" : ""}
                        >
                          {formatGrowth(quarter.growth)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="text-lg">Top Growth Accounts ({timeRange.toUpperCase()})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {accounts
                    .map(account => {
                      const accountWithHistory = getAccountWithHistory(account);
                      // Calculate growth for the selected time range
                      const quartersToInclude = timeRange === '1y' ? 4 : timeRange === '2y' ? 8 : 12;
                      const recentHistory = accountWithHistory.arrHistory?.slice(-quartersToInclude) || [];
                      
                      const timeRangeGrowth = recentHistory.length > 1 
                        ? ((recentHistory[recentHistory.length - 1].arr - recentHistory[0].arr) / recentHistory[0].arr) * 100 
                        : 0;
                      
                      const avgGrowth = recentHistory.length > 0 
                        ? recentHistory.reduce((sum, q) => sum + q.growth, 0) / recentHistory.length 
                        : 0;
                      
                      return {
                        ...accountWithHistory,
                        timeRangeGrowth,
                        avgGrowthForPeriod: avgGrowth
                      };
                    })
                    .sort((a, b) => b.avgGrowthForPeriod - a.avgGrowthForPeriod)
                    .slice(0, 5)
                    .map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded">
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(account.arr)} ARR</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTrendColor(account.arrTrend?.trend || 'steady')}>
                            {formatGrowth(account.avgGrowthForPeriod || 0)}
                          </Badge>
                          {getTrendIcon(account.arrTrend?.trend || 'steady')}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="mt-4 space-y-4">
            {selectedAccountWithHistory ? (
              <>
                {/* Account Overview */}
                <Card className="border-visible">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedAccountWithHistory.name}</span>
                      <Badge className={getTrendColor(selectedAccountWithHistory.arrTrend?.trend || 'steady')}>
                        {selectedAccountWithHistory.arrTrend?.trend || 'steady'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Current ARR</p>
                        <p className="text-2xl font-bold">{formatCurrency(selectedAccountWithHistory.arr)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Avg Quarterly Growth ({timeRange.toUpperCase()})</p>
                        <p className="text-2xl font-bold">
                          {formatGrowth(selectedAccountWithHistory.timeRangeAvgGrowth || 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Growth ({timeRange.toUpperCase()})</p>
                        <p className="text-2xl font-bold">
                          {formatGrowth(selectedAccountWithHistory.timeRangeTotalGrowth || 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quarterly History */}
                <Card className="border-visible">
                  <CardHeader>
                    <CardTitle className="text-lg">Quarterly History ({timeRange.toUpperCase()})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedAccountWithHistory.timeRangeHistory?.map((quarter, index) => (
                        <div key={quarter.quarter} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{quarter.quarter}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-semibold">{formatCurrency(quarter.arr)}</span>
                            <Badge 
                              variant={quarter.growth > 0 ? "default" : "destructive"}
                              className={quarter.growth > 0 ? "bg-green-100 text-green-800" : ""}
                            >
                              {formatGrowth(quarter.growth)}
                            </Badge>
                          </div>
                        </div>
                      )) || (
                        <p className="text-center text-muted-foreground py-4">No historical data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Insights */}
                <Card className="border-visible">
                  <CardHeader>
                    <CardTitle className="text-lg">Growth Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedAccountWithHistory.expansionOpportunity > 0 ? (
                        <ExpansionOpportunitiesDialog account={selectedAccountWithHistory}>
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 hover:border-blue-300">
                            <div className="flex items-center gap-3">
                              <Target className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">Expansion Opportunity</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-blue-600">
                                {formatCurrency(selectedAccountWithHistory.expansionOpportunity)}
                              </span>
                              <ArrowRight className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                        </ExpansionOpportunitiesDialog>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-600">No Current Expansion Opportunities</span>
                          </div>
                          <span className="text-lg font-semibold text-gray-400">
                            {formatCurrency(0)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Health Score</span>
                        </div>
                        <Badge className={`status-${selectedAccountWithHistory.status.toLowerCase().replace(' ', '')}`}>
                          {selectedAccountWithHistory.healthScore}/100
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-visible">
                <CardContent className="p-8 text-center">
                  <>
                    <ChartBar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select an Account</h3>
                    <p className="text-muted-foreground">
                      Choose an account from the main table to view its ARR growth trends and history.
                    </p>
                  </>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
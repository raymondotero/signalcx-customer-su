import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  User, 
  Calendar, 
  CurrencyDollar, 
  TrendUp, 
  Activity,
  Clock,
  Warning,
  CheckCircle,
  Eye
} from '@phosphor-icons/react';
import { Account } from '@/types';
import { useNBAs, useAgentMemory } from '@/hooks/useData';

interface AccountDetailsDialogProps {
  account: Account;
  trigger?: React.ReactNode;
}

export function AccountDetailsDialog({ account, trigger }: AccountDetailsDialogProps) {
  const { nbas } = useNBAs();
  const { memory } = useAgentMemory();
  
  // Get NBAs for this account
  const accountNBAs = nbas.filter(nba => nba.accountId === account.id);
  
  // Get memory entries for this account
  const accountMemory = memory.filter(entry => entry.accountId === account.id);
  
  const getStatusColor = (status: Account['status']) => {
    switch (status) {
      case 'Good': return 'status-good';
      case 'Watch': return 'status-watch';
      case 'At Risk': return 'status-risk';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskFactors = () => {
    const factors: string[] = [];
    if (account.healthScore < 50) factors.push('Low health score');
    if (account.status === 'At Risk') factors.push('Account marked as at risk');
    if (new Date(account.contractEnd) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) {
      factors.push('Contract renewal due soon');
    }
    return factors;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const riskFactors = getRiskFactors();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="text-xs px-2 py-1 hover:bg-gray-50 min-w-fit">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building className="w-6 h-6 text-primary" />
            {account.name}
            <Badge className={getStatusColor(account.status)}>
              {account.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health & Risk</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Industry</p>
                    <p className="text-lg font-medium">{account.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Annual Recurring Revenue</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(account.arr)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            account.healthScore >= 80 ? 'bg-green-500' : 
                            account.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${account.healthScore}%` }}
                        />
                      </div>
                      <span className={`text-lg font-bold ${getHealthScoreColor(account.healthScore)}`}>
                        {account.healthScore}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Success Manager</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{account.csam || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Executive</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{account.ae || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contract End Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{new Date(account.contractEnd).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expansion Opportunity */}
            {account.expansionOpportunity && account.expansionOpportunity > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendUp className="w-5 h-5" />
                    Expansion Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(account.expansionOpportunity)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Potential additional ARR identified
                      </p>
                    </div>
                    <CurrencyDollar className="w-12 h-12 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            {/* Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Health Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Health Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            account.healthScore >= 80 ? 'bg-green-500' : 
                            account.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${account.healthScore}%` }}
                        />
                      </div>
                      <span className={`font-bold ${getHealthScoreColor(account.healthScore)}`}>
                        {account.healthScore}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Warning className="w-5 h-5" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riskFactors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <Warning className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-red-800">{factor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Last Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Last Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  {new Date(account.lastActivity).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.floor((Date.now() - new Date(account.lastActivity).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Recent NBAs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Next Best Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {accountNBAs.length > 0 ? (
                  <div className="space-y-4">
                    {accountNBAs.slice(0, 5).map((nba) => (
                      <div key={nba.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{nba.title}</h4>
                          <Badge className={
                            nba.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            nba.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            nba.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {nba.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{nba.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Impact: {nba.estimatedImpact}</span>
                          <span>Time: {nba.timeToComplete || 'TBD'}</span>
                          <span>Created: {new Date(nba.createdAt || nba.generatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No recent next best actions for this account
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Agent Memory */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                {accountMemory.length > 0 ? (
                  <div className="space-y-3">
                    {accountMemory.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{entry.type.replace('_', ' ').toUpperCase()}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                        {entry.outcome && (
                          <div className="flex items-center gap-1 mt-2">
                            {entry.outcome === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                            {entry.outcome === 'failure' && <Warning className="w-3 h-3 text-red-500" />}
                            <span className="text-xs">{entry.outcome}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No agent activity recorded for this account
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            {/* Expansion Opportunity Details */}
            {account.expansionOpportunity && account.expansionOpportunity > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendUp className="w-5 h-5" />
                    Revenue Expansion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Identified Opportunity</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(account.expansionOpportunity)}
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        Additional ARR potential based on current usage patterns and growth indicators
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current ARR</p>
                        <p className="text-lg font-bold">{formatCurrency(account.arr)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Potential Total ARR</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(account.arr + account.expansionOpportunity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Expansion Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    No current expansion opportunities identified for this account
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Contract Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Contract Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <span className="font-medium">Contract Renewal</span>
                      <p className="text-sm text-muted-foreground">Current contract ends</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{new Date(account.contractEnd).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.ceil((new Date(account.contractEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
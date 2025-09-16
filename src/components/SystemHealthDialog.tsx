import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield,
  Activity,
  Clock,
  CheckCircle,
  Warning,
  Database,
  Brain,
  Target,
  Pulse
} from '@phosphor-icons/react';
import { useAccounts, useNBAs, useSignals, useAgentMemory } from '@/hooks/useData';
import { useRealTimeAI, useAIMetrics } from '@/hooks/useRealTimeAI';
import { useKV } from '@github/spark/hooks';
import { SignalTarget } from '@/components/TargetSettingsDialog';

interface SystemHealthDialogProps {
  trigger?: React.ReactNode;
}

export function SystemHealthDialog({ trigger }: SystemHealthDialogProps) {
  const { accounts } = useAccounts();
  const { nbas } = useNBAs();
  const { signals } = useSignals();
  const { memory } = useAgentMemory();
  const realTimeAI = useRealTimeAI();
  const aiMetrics = useAIMetrics();
  const [targets] = useKV<SignalTarget[]>('signal-targets', []);

  const getSystemStats = () => {
    const totalAccounts = accounts.length;
    const healthyAccounts = accounts.filter(a => a.status === 'Good').length;
    const watchAccounts = accounts.filter(a => a.status === 'Watch').length;
    const riskAccounts = accounts.filter(a => a.status === 'At Risk').length;
    
    const totalSignals = signals.length;
    const criticalSignals = signals.filter(s => s.severity === 'critical').length;
    const highSignals = signals.filter(s => s.severity === 'high').length;
    
    const totalNBAs = nbas.length;
    const totalMemoryEntries = memory.length;
    const successfulMemoryEntries = memory.filter(m => m.outcome === 'success').length;
    
    const approvalRate = aiMetrics.getApprovalRate();
    const avgProcessingTime = aiMetrics.getAverageProcessingTime();
    
    return {
      accounts: {
        total: totalAccounts,
        healthy: healthyAccounts,
        watch: watchAccounts,
        risk: riskAccounts,
        healthPercentage: totalAccounts > 0 ? Math.round((healthyAccounts / totalAccounts) * 100) : 0
      },
      signals: {
        total: totalSignals,
        critical: criticalSignals,
        high: highSignals,
        activeTargets: targets?.length || 0
      },
      ai: {
        queueSize: realTimeAI.queueSize,
        isProcessing: realTimeAI.isProcessing,
        approvalRate: Math.round(approvalRate),
        avgProcessingTime: Math.round(avgProcessingTime),
        totalNBAs,
        totalMemoryEntries,
        successRate: totalMemoryEntries > 0 ? Math.round((successfulMemoryEntries / totalMemoryEntries) * 100) : 0
      }
    };
  };

  const getOverallHealth = () => {
    const stats = getSystemStats();
    const issues: string[] = [];
    
    if (stats.accounts.healthPercentage < 70) {
      issues.push('Account health below threshold');
    }
    if (stats.signals.critical > 5) {
      issues.push('High number of critical signals');
    }
    if (stats.ai.approvalRate < 50) {
      issues.push('Low AI approval rate');
    }
    if (stats.ai.avgProcessingTime > 2000) {
      issues.push('High AI processing time');
    }
    
    return {
      status: issues.length === 0 ? 'healthy' : issues.length <= 2 ? 'warning' : 'critical',
      issues
    };
  };

  const formatUptime = () => {
    // Simulate uptime since app load
    const uptimeHours = Math.floor(Math.random() * 24) + 1;
    const uptimeMinutes = Math.floor(Math.random() * 60);
    return `${uptimeHours}h ${uptimeMinutes}m`;
  };

  const stats = getSystemStats();
  const health = getOverallHealth();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="border text-xs px-3 py-1">
            <Shield className="w-4 h-4 mr-2" />
            Health Check
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            System Health Dashboard
            <Badge className={
              health.status === 'healthy' ? 'bg-green-100 text-green-800 border-green-200' :
              health.status === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
              'bg-red-100 text-red-800 border-red-200'
            }>
              {health.status.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* System Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatUptime()}</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {health.status === 'healthy' ? '100%' : health.status === 'warning' ? '85%' : '65%'}
                  </div>
                  <div className="text-sm text-muted-foreground">Health Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.ai.totalMemoryEntries}</div>
                  <div className="text-sm text-muted-foreground">Total Operations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.ai.successRate}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Issues */}
          {health.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Warning className="w-5 h-5" />
                  System Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {health.issues.map((issue, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                      <Warning className="w-4 h-4 text-red-500" />
                      <span className="text-red-800 text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Account Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Account Health</span>
                  <span className="font-bold">{stats.accounts.healthPercentage}%</span>
                </div>
                <Progress value={stats.accounts.healthPercentage} className="w-full" />
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.accounts.healthy}</div>
                    <div className="text-sm text-muted-foreground">Healthy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{stats.accounts.watch}</div>
                    <div className="text-sm text-muted-foreground">Watch</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{stats.accounts.risk}</div>
                    <div className="text-sm text-muted-foreground">At Risk</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signal Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pulse className="w-5 h-5" />
                Signal Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.signals.total}</div>
                  <div className="text-sm text-muted-foreground">Total Signals</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{stats.signals.critical}</div>
                  <div className="text-sm text-muted-foreground">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{stats.signals.high}</div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{stats.signals.activeTargets}</div>
                  <div className="text-sm text-muted-foreground">Active Targets</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI System Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI System Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {stats.ai.isProcessing ? (
                      <Pulse className="w-4 h-4 text-blue-500 animate-pulse" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-lg font-bold">
                      {stats.ai.isProcessing ? 'Active' : 'Idle'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">AI Status</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.ai.queueSize}</div>
                  <div className="text-sm text-muted-foreground">Queue Size</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{stats.ai.approvalRate}%</div>
                  <div className="text-sm text-muted-foreground">Approval Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.ai.avgProcessingTime}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Processing</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{stats.ai.totalNBAs}</div>
                    <div className="text-sm text-muted-foreground">Total NBAs Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{stats.ai.successRate}%</div>
                    <div className="text-sm text-muted-foreground">Operation Success Rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {memory.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      {entry.outcome === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {entry.outcome === 'failure' && <Warning className="w-4 h-4 text-red-500" />}
                      {entry.outcome === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                      <span className="text-sm font-medium">{entry.type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{entry.accountName}</span>
                      <Badge className={
                        entry.outcome === 'success' ? 'bg-green-100 text-green-800' :
                        entry.outcome === 'failure' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {entry.outcome}
                      </Badge>
                    </div>
                  </div>
                ))}
                {memory.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
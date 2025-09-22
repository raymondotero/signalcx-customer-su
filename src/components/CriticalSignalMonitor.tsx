import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Warning, 
  Clock, 
  CheckCircle, 
  Gear, 
  Activity,
  Envelope,
  ChatCircle,
  Users,
  TrendUp,
  WarningCircle
} from '@phosphor-icons/react';
import { criticalSignalNotificationService, CriticalSignalEvent, NotificationRule } from '@/services/criticalSignalNotificationService';
import { useKV } from '@github/spark/hooks';
import { formatDistanceToNow } from 'date-fns';

export function CriticalSignalMonitor() {
  const [recentEvents, setRecentEvents] = useState<CriticalSignalEvent[]>([]);
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isExpanded, setIsExpanded] = useKV('critical-signal-monitor-expanded', 'false');

  useEffect(() => {
    // Load initial data
    refreshData();
    
    // Set up periodic refresh
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setRecentEvents(criticalSignalNotificationService.getRecentEvents(50));
    setNotificationRules(criticalSignalNotificationService.getNotificationRules());
    setStats(criticalSignalNotificationService.getStats());
  };

  const handleAcknowledge = (eventId: string) => {
    const success = criticalSignalNotificationService.acknowledgeEvent(eventId, 'current-user');
    if (success) {
      refreshData();
    }
  };

  const handleRuleToggle = (ruleId: string, enabled: boolean) => {
    const success = criticalSignalNotificationService.updateNotificationRule(ruleId, { enabled });
    if (success) {
      refreshData();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <WarningCircle className="w-4 h-4" />;
      case 'high': return <Warning className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const unacknowledgedCount = recentEvents.filter(e => !e.acknowledged).length;
  const criticalCount = recentEvents.filter(e => e.signal.severity === 'critical' && !e.acknowledged).length;

  if (isExpanded !== 'true') {
    return (
      <Card className="border-visible">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Critical Signal Monitor</CardTitle>
              {unacknowledgedCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {unacknowledgedCount} Active
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsExpanded('true')}
            >
              Expand
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
              <div className="text-muted-foreground">Critical Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.last24Hours || 0}</div>
              <div className="text-muted-foreground">Last 24h</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-visible">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle>Critical Signal Monitor</CardTitle>
            {unacknowledgedCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unacknowledgedCount} Active Alerts
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
            >
              <Activity className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsExpanded('false')}
            >
              Collapse
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">
              Active Alerts
              {unacknowledgedCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unacknowledgedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Event History</TabsTrigger>
            <TabsTrigger value="rules">Notification Rules</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-3">
              {recentEvents.filter(e => !e.acknowledged).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No active critical alerts</p>
                </div>
              ) : (
                recentEvents
                  .filter(e => !e.acknowledged)
                  .map(event => (
                    <div key={event.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(event.signal.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{event.account.name}</h4>
                              <Badge className={getSeverityColor(event.signal.severity)}>
                                {event.signal.severity}
                              </Badge>
                              <Badge variant="outline">
                                {event.signal.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.signal.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                              </span>
                              <span>ARR: ${(event.account.arr / 1000000).toFixed(1)}M</span>
                              <span>Health: {event.account.healthScore}/100</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs">
                            {event.notificationsSent.teams && (
                              <ChatCircle className="w-3 h-3 text-blue-500" />
                            )}
                            {event.notificationsSent.email && (
                              <Envelope className="w-3 h-3 text-green-500" />
                            )}
                            {event.escalated && (
                              <Users className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleAcknowledge(event.id)}
                          >
                            Acknowledge
                          </Button>
                        </div>
                      </div>
                      
                      {event.triggeredRules.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Triggered Rules:</p>
                          <div className="flex flex-wrap gap-1">
                            {event.triggeredRules.map(rule => (
                              <Badge key={rule.id} variant="outline" className="text-xs">
                                {rule.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-2">
              {recentEvents.map(event => (
                <div key={event.id} className={`border rounded-lg p-3 ${event.acknowledged ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(event.signal.severity)}
                      <span className="font-medium">{event.account.name}</span>
                      <Badge className={getSeverityColor(event.signal.severity)}>
                        {event.signal.severity}
                      </Badge>
                      {event.acknowledged && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.signal.description}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="space-y-4">
              {notificationRules.map(rule => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <Switch 
                      checked={rule.enabled}
                      onCheckedChange={(enabled) => handleRuleToggle(rule.id, enabled)}
                    />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Signal Types: </span>
                      {rule.conditions.signalTypes.join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Severity Levels: </span>
                      {rule.conditions.severityLevels.join(', ')}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rule.actions.sendTeamsNotification && (
                        <Badge variant="outline">
                          <ChatCircle className="w-3 h-3 mr-1" />
                          Teams
                        </Badge>
                      )}
                      {rule.actions.sendEmailNotification && (
                        <Badge variant="outline">
                          <Envelope className="w-3 h-3 mr-1" />
                          Email
                        </Badge>
                      )}
                      {rule.actions.escalateToManagement && (
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          Escalate
                        </Badge>
                      )}
                    </div>
                    {rule.cooldownPeriod && (
                      <div className="text-xs text-muted-foreground">
                        Cooldown: {rule.cooldownPeriod} minutes
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalEvents || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.last24Hours || 0}</div>
                  <div className="text-sm text-muted-foreground">Last 24 Hours</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.acknowledged || 0}</div>
                  <div className="text-sm text-muted-foreground">Acknowledged</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.criticalSignals || 0}</div>
                  <div className="text-sm text-muted-foreground">Critical Signals</div>
                </CardContent>
              </Card>
            </div>

            {stats.topSignalTypes && stats.topSignalTypes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Signal Types (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.topSignalTypes.map((item: any, index: number) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span>{item.type.replace('_', ' ')}</span>
                        </span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.topAccounts && stats.topAccounts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Active Accounts (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.topAccounts.map((item: any, index: number) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span>{item.name}</span>
                        </span>
                        <Badge variant="outline">{item.count} signals</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
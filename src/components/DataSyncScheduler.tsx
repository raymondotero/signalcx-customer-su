import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  Database, 
  Play, 
  Pause, 
  Gear,
  CheckCircle,
  Warning,
  XCircle,
  ArrowRight,
  ChartBar,
  Lightning,
  CloudArrowDown
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface SyncSchedule {
  id: string;
  name: string;
  source: string;
  sourceType: 'api' | 'database' | 'file' | 'crm' | 'powerbi' | 'fabric';
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'success' | 'running' | 'failed' | 'pending';
  recordsProcessed?: number;
  duration?: number;
  dataTypes: string[];
  schedule?: {
    time?: string;
    days?: string[];
    timezone?: string;
  };
}

const sampleSchedules: SyncSchedule[] = [
  {
    id: 'sync-1',
    name: 'Dynamics 365 CRM Sync',
    source: 'Dynamics 365 Sales',
    sourceType: 'crm',
    frequency: 'hourly',
    enabled: true,
    lastRun: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    status: 'success',
    recordsProcessed: 1247,
    duration: 28,
    dataTypes: ['accounts', 'contacts', 'opportunities', 'activities'],
    schedule: { timezone: 'UTC' }
  },
  {
    id: 'sync-2', 
    name: 'Azure Usage Analytics',
    source: 'Azure Cost Management',
    sourceType: 'api',
    frequency: 'daily',
    enabled: true,
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    recordsProcessed: 892,
    duration: 45,
    dataTypes: ['usage', 'billing', 'resources'],
    schedule: { time: '02:00', timezone: 'UTC' }
  },
  {
    id: 'sync-3',
    name: 'Power BI Workspace Data',
    source: 'Power BI Service',
    sourceType: 'powerbi',
    frequency: 'daily',
    enabled: true,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    status: 'running',
    recordsProcessed: 445,
    duration: 0,
    dataTypes: ['dashboards', 'reports', 'datasets'],
    schedule: { time: '01:30', timezone: 'UTC' }
  },
  {
    id: 'sync-4',
    name: 'Microsoft Fabric Analytics',
    source: 'Fabric Lakehouse',
    sourceType: 'fabric',
    frequency: 'weekly',
    enabled: false,
    lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
    recordsProcessed: 0,
    duration: 0,
    dataTypes: ['analytics', 'signals', 'metrics'],
    schedule: { time: '03:00', days: ['Monday'], timezone: 'UTC' }
  }
];

export function DataSyncScheduler() {
  const [schedules, setSchedules] = useKV<SyncSchedule[]>('sync-schedules', sampleSchedules);
  const [newScheduleOpen, setNewScheduleOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<SyncSchedule | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Ensure schedules is always an array
  const safeSchedules = schedules || [];

  const [newSchedule, setNewSchedule] = useState<Partial<SyncSchedule>>({
    name: '',
    source: '',
    sourceType: 'api',
    frequency: 'daily',
    enabled: true,
    status: 'pending',
    dataTypes: [],
    schedule: { timezone: 'UTC' }
  });

  const sourceTypeIcons = {
    api: Database,
    database: Database,
    file: CloudArrowDown,
    crm: ChartBar,
    powerbi: ChartBar,
    fabric: Lightning
  };

  const statusColors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    running: 'bg-blue-100 text-blue-800 border-blue-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const statusIcons = {
    success: CheckCircle,
    running: Play,
    failed: XCircle,
    pending: Clock
  };

  const handleCreateSchedule = () => {
    if (!newSchedule.name || !newSchedule.source) {
      toast.error('Please fill in all required fields');
      return;
    }

    const schedule: SyncSchedule = {
      id: `sync-${Date.now()}`,
      name: newSchedule.name,
      source: newSchedule.source,
      sourceType: newSchedule.sourceType || 'api',
      frequency: newSchedule.frequency || 'daily',
      enabled: newSchedule.enabled ?? true,
      status: 'pending',
      dataTypes: newSchedule.dataTypes || [],
      schedule: newSchedule.schedule || { timezone: 'UTC' },
      nextRun: calculateNextRun(newSchedule.frequency || 'daily', newSchedule.schedule)
    };

    setSchedules([...safeSchedules, schedule]);
    setNewSchedule({
      name: '',
      source: '',
      sourceType: 'api',
      frequency: 'daily',
      enabled: true,
      status: 'pending',
      dataTypes: [],
      schedule: { timezone: 'UTC' }
    });
    setNewScheduleOpen(false);
    toast.success('Sync schedule created successfully');
  };

  const calculateNextRun = (frequency: string, schedule?: any): string => {
    const now = new Date();
    switch (frequency) {
      case 'realtime':
        return new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 minutes
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (schedule?.time) {
          const [hours, minutes] = schedule.time.split(':');
          tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          tomorrow.setHours(2, 0, 0, 0); // Default 2 AM
        }
        return tomorrow.toISOString();
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString();
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth.toISOString();
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const toggleSchedule = (id: string) => {
    setSchedules(safeSchedules.map(schedule => 
      schedule.id === id 
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    ));
    toast.success('Schedule updated');
  };

  const runSyncNow = (id: string) => {
    setSchedules(safeSchedules.map(schedule => 
      schedule.id === id 
        ? { 
            ...schedule, 
            status: 'running' as const,
            lastRun: new Date().toISOString()
          }
        : schedule
    ));
    
    toast.info('Sync started...');
    
    // Simulate sync completion
    setTimeout(() => {
      setSchedules(prev => (prev || []).map(schedule => 
        schedule.id === id 
          ? { 
              ...schedule, 
              status: 'success' as const,
              recordsProcessed: Math.floor(Math.random() * 1000) + 100,
              duration: Math.floor(Math.random() * 60) + 15,
              nextRun: calculateNextRun(schedule.frequency, schedule.schedule)
            }
          : schedule
      ));
      toast.success('Sync completed successfully');
    }, 3000);
  };

  const getActiveSchedules = () => safeSchedules.filter(s => s.enabled).length;
  const getSuccessRate = () => {
    const successfulSyncs = safeSchedules.filter(s => s.status === 'success').length;
    return safeSchedules.length > 0 ? Math.round((successfulSyncs / safeSchedules.length) * 100) : 0;
  };

  const getTotalRecordsToday = () => {
    const today = new Date().toDateString();
    return safeSchedules
      .filter(s => s.lastRun && new Date(s.lastRun).toDateString() === today)
      .reduce((sum, s) => sum + (s.recordsProcessed || 0), 0);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="border text-xs px-3 py-1">
          <Calendar className="w-4 h-4 mr-2" />
          Data Sync
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Automated Data Sync Schedules
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Schedules</p>
                      <p className="text-2xl font-bold">{getActiveSchedules()}</p>
                    </div>
                    <Play className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">{getSuccessRate()}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Records Today</p>
                      <p className="text-2xl font-bold">{getTotalRecordsToday().toLocaleString()}</p>
                    </div>
                    <Database className="w-8 h-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Syncs</p>
                      <p className="text-2xl font-bold">{safeSchedules.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-visible">
              <CardHeader>
                <CardTitle>Recent Sync Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safeSchedules
                    .filter(s => s.lastRun)
                    .sort((a, b) => new Date(b.lastRun!).getTime() - new Date(a.lastRun!).getTime())
                    .slice(0, 5)
                    .map((schedule) => {
                      const StatusIcon = statusIcons[schedule.status];
                      const SourceIcon = sourceTypeIcons[schedule.sourceType];
                      
                      return (
                        <div key={schedule.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <SourceIcon className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{schedule.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {schedule.recordsProcessed?.toLocaleString()} records in {schedule.duration}s
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[schedule.status]}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {schedule.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(schedule.lastRun!).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Sync Schedules</h3>
              <Dialog open={newScheduleOpen} onOpenChange={setNewScheduleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Sync Schedule</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="schedule-name">Schedule Name</Label>
                        <Input
                          id="schedule-name"
                          placeholder="e.g., CRM Daily Sync"
                          value={newSchedule.name}
                          onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data-source">Data Source</Label>
                        <Input
                          id="data-source"
                          placeholder="e.g., Dynamics 365 Sales"
                          value={newSchedule.source}
                          onChange={(e) => setNewSchedule({...newSchedule, source: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Source Type</Label>
                        <Select 
                          value={newSchedule.sourceType} 
                          onValueChange={(value: any) => setNewSchedule({...newSchedule, sourceType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                            <SelectItem value="file">File Import</SelectItem>
                            <SelectItem value="crm">CRM System</SelectItem>
                            <SelectItem value="powerbi">Power BI</SelectItem>
                            <SelectItem value="fabric">Microsoft Fabric</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select 
                          value={newSchedule.frequency} 
                          onValueChange={(value: any) => setNewSchedule({...newSchedule, frequency: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newSchedule.frequency === 'daily' && (
                      <div className="space-y-2">
                        <Label htmlFor="sync-time">Sync Time (UTC)</Label>
                        <Input
                          id="sync-time"
                          type="time"
                          value={newSchedule.schedule?.time || '02:00'}
                          onChange={(e) => setNewSchedule({
                            ...newSchedule, 
                            schedule: { ...newSchedule.schedule, time: e.target.value }
                          })}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Data Types (comma-separated)</Label>
                      <Input
                        placeholder="e.g., accounts, contacts, opportunities"
                        value={newSchedule.dataTypes?.join(', ') || ''}
                        onChange={(e) => setNewSchedule({
                          ...newSchedule, 
                          dataTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newSchedule.enabled}
                        onCheckedChange={(checked) => setNewSchedule({...newSchedule, enabled: checked})}
                      />
                      <Label>Enable schedule immediately</Label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setNewScheduleOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateSchedule}>
                        Create Schedule
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {safeSchedules.map((schedule) => {
                const StatusIcon = statusIcons[schedule.status];
                const SourceIcon = sourceTypeIcons[schedule.sourceType];
                
                return (
                  <Card key={schedule.id} className="border-visible">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <SourceIcon className="w-6 h-6 text-muted-foreground" />
                          <div>
                            <h4 className="font-semibold">{schedule.name}</h4>
                            <p className="text-sm text-muted-foreground">{schedule.source}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {schedule.frequency}
                              </Badge>
                              <Badge className={statusColors[schedule.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {schedule.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Switch
                              checked={schedule.enabled}
                              onCheckedChange={() => toggleSchedule(schedule.id)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => runSyncNow(schedule.id)}
                              disabled={schedule.status === 'running'}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Run Now
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.lastRun && (
                              <p>Last: {new Date(schedule.lastRun).toLocaleString()}</p>
                            )}
                            {schedule.nextRun && (
                              <p>Next: {new Date(schedule.nextRun).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {schedule.lastRun && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Records Processed</p>
                              <p className="font-medium">{schedule.recordsProcessed?.toLocaleString() || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">{schedule.duration || 0}s</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Data Types</p>
                              <p className="font-medium">{schedule.dataTypes.join(', ')}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sync Performance */}
              <Card className="border-visible">
                <CardHeader>
                  <CardTitle>Sync Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Success Rate</span>
                      <span className="font-medium">{getSuccessRate()}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${getSuccessRate()}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Duration</span>
                      <span className="font-medium">
                        {Math.round(safeSchedules.reduce((sum, s) => sum + (s.duration || 0), 0) / safeSchedules.length)}s
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Records/Day</span>
                      <span className="font-medium">{getTotalRecordsToday().toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Source Distribution */}
              <Card className="border-visible">
                <CardHeader>
                  <CardTitle>Data Source Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      safeSchedules.reduce((acc, schedule) => {
                        acc[schedule.sourceType] = (acc[schedule.sourceType] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => {
                      const Icon = sourceTypeIcons[type as keyof typeof sourceTypeIcons];
                      const percentage = Math.round((count / safeSchedules.length) * 100);
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm capitalize">{type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Syncs */}
            <Card className="border-visible">
              <CardHeader>
                <CardTitle>Upcoming Syncs (Next 24 Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safeSchedules
                    .filter(s => s.enabled && s.nextRun)
                    .filter(s => {
                      const nextRun = new Date(s.nextRun!);
                      const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
                      return nextRun <= in24Hours;
                    })
                    .sort((a, b) => new Date(a.nextRun!).getTime() - new Date(b.nextRun!).getTime())
                    .map((schedule) => {
                      const SourceIcon = sourceTypeIcons[schedule.sourceType];
                      const timeUntil = new Date(schedule.nextRun!).getTime() - Date.now();
                      const hoursUntil = Math.max(0, Math.floor(timeUntil / (1000 * 60 * 60)));
                      const minutesUntil = Math.max(0, Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60)));
                      
                      return (
                        <div key={schedule.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <SourceIcon className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{schedule.name}</p>
                              <p className="text-sm text-muted-foreground">{schedule.source}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {hoursUntil > 0 ? `${hoursUntil}h ` : ''}{minutesUntil}m
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(schedule.nextRun!).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  
                  {safeSchedules.filter(s => s.enabled && s.nextRun).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming syncs scheduled for the next 24 hours
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
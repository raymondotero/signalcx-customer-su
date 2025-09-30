import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Database, Target, ArrowRight, CheckCircle, Warning, Activity, TrendUp } from '@phosphor-icons/react';
import { fieldMappingService, D365FieldMapping, D365SyncResult } from '@/services/fieldMappingService';
import { useAccounts } from '@/hooks/useData';
import { useKV } from '@github/spark/hooks';
import { Account } from '@/types';
import { toast } from 'sonner';

interface FieldMappingManagerProps {
  selectedAccount?: Account;
}

export function FieldMappingManager({ selectedAccount }: FieldMappingManagerProps) {
  const { accounts } = useAccounts();
  const [fieldMappings] = useKV<D365FieldMapping[]>('d365-field-mappings', []);
  const [syncResults, setSyncResults] = useKV<D365SyncResult[]>('d365-sync-results', []);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<'account' | 'opportunity' | 'contact'>('account');

  const safeMappings = fieldMappings || [];
  const safeSyncResults = syncResults || [];

  const handleSyncAccount = async (account: Account) => {
    if (safeMappings.length === 0) {
      toast.warning('No field mappings configured. Please set up mappings in the Dynamics 365 configuration.');
      return;
    }

    setIsSyncing(true);
    toast.loading(`Syncing ${account.name} to Dynamics 365...`);

    try {
      const result = await fieldMappingService.syncToD365(account, safeMappings, selectedEntity);
      
      // Store sync result
      setSyncResults(prev => [result, ...(prev || []).slice(0, 9)]); // Keep last 10 results
      
      if (result.success) {
        toast.success(`✅ Successfully synced ${account.name} - ${result.mappingsApplied} fields updated`);
      } else {
        toast.error(`❌ Sync failed for ${account.name}: ${result.errors?.join(', ')}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync operation failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkSync = async () => {
    if (safeMappings.length === 0) {
      toast.warning('No field mappings configured. Please set up mappings first.');
      return;
    }

    setIsSyncing(true);
    toast.loading('Starting bulk sync operation...');

    try {
      const results: D365SyncResult[] = [];
      
      for (const account of accounts.slice(0, 5)) { // Limit to first 5 accounts for demo
        const result = await fieldMappingService.syncToD365(account, safeMappings, selectedEntity);
        results.push(result);
        
        // Add delay between syncs to simulate real-world throttling
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Store all results
      setSyncResults(prev => [...results, ...(prev || []).slice(0, 5)]);
      
      const successCount = results.filter(r => r.success).length;
      const totalMappings = results.reduce((sum, r) => sum + r.mappingsApplied, 0);
      
      toast.success(`🚀 Bulk sync completed: ${successCount}/${results.length} accounts synced, ${totalMappings} total field updates`);
      
    } catch (error) {
      console.error('Bulk sync error:', error);
      toast.error('Bulk sync operation failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const getMappingStats = () => {
    return fieldMappingService.getMappingStats(safeMappings);
  };

  const getRecentSyncStats = () => {
    const recentSyncs = safeSyncResults.slice(0, 10);
    const successRate = recentSyncs.length > 0 
      ? (recentSyncs.filter(r => r.success).length / recentSyncs.length) * 100 
      : 0;
    const totalMappings = recentSyncs.reduce((sum, r) => sum + r.mappingsApplied, 0);
    
    return {
      successRate,
      totalSyncs: recentSyncs.length,
      totalMappings,
      lastSync: recentSyncs[0]?.timestamp
    };
  };

  const stats = getMappingStats();
  const syncStats = getRecentSyncStats();

  return (
    <div className="space-y-6">
      {/* Field Mapping Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Field Mapping Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Mappings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active Mappings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(syncStats.successRate)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{syncStats.totalMappings}</div>
              <div className="text-sm text-muted-foreground">Fields Synced</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={stats.active > 0 ? "default" : "secondary"}>
                {stats.active > 0 ? "Mappings Configured" : "Setup Required"}
              </Badge>
              <Badge variant="outline">
                Demo Mode
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleBulkSync}
                disabled={isSyncing || stats.active === 0}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Activity className="w-4 h-4 mr-2" />
                Bulk Sync (5 accounts)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sync-operations" className="w-full">
        <TabsList>
          <TabsTrigger value="sync-operations">Sync Operations</TabsTrigger>
          <TabsTrigger value="sync-history">Sync History</TabsTrigger>
          <TabsTrigger value="field-preview">Field Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="sync-operations" className="space-y-4">
          {/* Individual Account Sync */}
          {selectedAccount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Sync Selected Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{selectedAccount.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedAccount.industry}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Dynamics 365 {selectedEntity.charAt(0).toUpperCase() + selectedEntity.slice(1)}</div>
                      <div className="text-sm text-muted-foreground">{stats.active} field mappings</div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleSyncAccount(selectedAccount)}
                    disabled={isSyncing || stats.active === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </div>
                
                {stats.active === 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Warning className="w-4 h-4" />
                      <span className="text-sm font-medium">No active field mappings configured</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Go to Dynamics 365 configuration and set up field mappings to enable sync.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sample Data Preview */}
          {selectedAccount && stats.active > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp className="w-5 h-5" />
                  Customer Success Data Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    const sampleData = fieldMappingService.extractCustomerSuccessData(selectedAccount);
                    return Object.entries(sampleData)
                      .filter(([key]) => safeMappings.some(m => m.sourceField === key && m.isActive))
                      .slice(0, 6)
                      .map(([key, value]) => {
                        const mapping = safeMappings.find(m => m.sourceField === key);
                        return (
                          <div key={key} className="p-3 bg-gray-50 rounded-lg border">
                            <div className="text-sm font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                            <div className="text-lg font-bold">{typeof value === 'number' ? value.toLocaleString() : String(value)}</div>
                            {mapping && (
                              <div className="text-xs text-muted-foreground mt-1">
                                → {mapping.targetField}
                              </div>
                            )}
                          </div>
                        );
                      });
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sync-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Sync Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeSyncResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No sync operations yet</p>
                  <p className="text-sm">Run a sync operation to see results here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {safeSyncResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Warning className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {result.entityType.charAt(0).toUpperCase() + result.entityType.slice(1)} Sync
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.mappingsApplied} fields • {new Date(result.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "Success" : "Failed"}
                        </Badge>
                        {result.entityId && (
                          <Badge variant="outline" className="text-xs">
                            {result.entityId.slice(0, 20)}...
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field-preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Active Field Mappings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.active === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active field mappings</p>
                  <p className="text-sm">Configure mappings in Dynamics 365 settings to see them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {safeMappings.filter(m => m.isActive).map((mapping) => (
                    <div key={mapping.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {mapping.dataType}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {mapping.sourceField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {mapping.description || 'No description'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="text-right">
                          <div className="font-medium">{mapping.targetField}</div>
                          <div className="text-sm text-muted-foreground">D365 Field</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
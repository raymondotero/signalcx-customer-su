import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Buildings, Link, Shield, CheckCircle, Warning, Gear, Plus, Trash, ArrowRight, Database, Target } from '@phosphor-icons/react';
import { dynamics365Service, Dynamics365Config } from '@/services/dynamics365Integration';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

// Custom field mapping types
interface D365FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  dataType: 'text' | 'number' | 'boolean' | 'date' | 'picklist';
  transformation?: string;
  isActive: boolean;
  description: string;
}

interface CustomerSuccessMetric {
  key: string;
  label: string;
  dataType: 'text' | 'number' | 'boolean' | 'date' | 'picklist';
  description: string;
  category: 'health' | 'usage' | 'engagement' | 'financial' | 'risk';
}

// Pre-defined customer success metrics available for mapping
const CUSTOMER_SUCCESS_METRICS: CustomerSuccessMetric[] = [
  // Health Metrics
  { key: 'health_score', label: 'Health Score', dataType: 'number', description: 'Overall account health score (0-100)', category: 'health' },
  { key: 'health_trend', label: 'Health Trend', dataType: 'text', description: 'Health score trend direction', category: 'health' },
  { key: 'nps_score', label: 'NPS Score', dataType: 'number', description: 'Net Promoter Score', category: 'health' },
  { key: 'satisfaction_rating', label: 'Satisfaction Rating', dataType: 'number', description: 'Customer satisfaction rating (1-5)', category: 'health' },
  
  // Usage Metrics
  { key: 'monthly_active_users', label: 'Monthly Active Users', dataType: 'number', description: 'Number of monthly active users', category: 'usage' },
  { key: 'feature_adoption_rate', label: 'Feature Adoption Rate', dataType: 'number', description: 'Percentage of features adopted', category: 'usage' },
  { key: 'api_usage_growth', label: 'API Usage Growth', dataType: 'number', description: 'Month-over-month API usage growth percentage', category: 'usage' },
  { key: 'license_utilization', label: 'License Utilization', dataType: 'number', description: 'Percentage of licenses being used', category: 'usage' },
  
  // Engagement Metrics
  { key: 'last_login_date', label: 'Last Login Date', dataType: 'date', description: 'Date of last user login', category: 'engagement' },
  { key: 'support_ticket_count', label: 'Support Tickets (30d)', dataType: 'number', description: 'Number of support tickets in last 30 days', category: 'engagement' },
  { key: 'training_completion_rate', label: 'Training Completion', dataType: 'number', description: 'Percentage of training modules completed', category: 'engagement' },
  { key: 'executive_engagement', label: 'Executive Engagement', dataType: 'text', description: 'Level of executive engagement', category: 'engagement' },
  
  // Financial Metrics
  { key: 'arr_value', label: 'ARR Value', dataType: 'number', description: 'Annual Recurring Revenue', category: 'financial' },
  { key: 'expansion_opportunity', label: 'Expansion Opportunity', dataType: 'number', description: 'Estimated expansion revenue potential', category: 'financial' },
  { key: 'payment_history', label: 'Payment History', dataType: 'text', description: 'Payment reliability status', category: 'financial' },
  
  // Risk Metrics
  { key: 'churn_risk_score', label: 'Churn Risk Score', dataType: 'number', description: 'Probability of churn (0-100)', category: 'risk' },
  { key: 'contract_end_date', label: 'Contract End Date', dataType: 'date', description: 'Contract expiration date', category: 'risk' },
  { key: 'competitive_threat', label: 'Competitive Threat', dataType: 'text', description: 'Level of competitive threat', category: 'risk' },
  { key: 'escalation_count', label: 'Escalations (90d)', dataType: 'number', description: 'Number of escalations in last 90 days', category: 'risk' }
];

// Common D365 entity fields for mapping targets
const D365_ENTITY_FIELDS = {
  account: [
    { value: 'new_healthscore', label: 'Health Score (Custom)' },
    { value: 'new_nps', label: 'NPS Score (Custom)' },
    { value: 'new_activeusers', label: 'Active Users (Custom)' },
    { value: 'new_arrvalue', label: 'ARR Value (Custom)' },
    { value: 'new_churnrisk', label: 'Churn Risk (Custom)' },
    { value: 'new_lastlogindate', label: 'Last Login (Custom)' },
    { value: 'new_supporttickets', label: 'Support Tickets (Custom)' },
    { value: 'new_expansionopportunity', label: 'Expansion Opportunity (Custom)' },
    { value: 'description', label: 'Description (Standard)' },
    { value: 'revenue', label: 'Annual Revenue (Standard)' },
    { value: 'numberofemployees', label: 'Number of Employees (Standard)' }
  ],
  opportunity: [
    { value: 'new_healthscore', label: 'Account Health Score (Custom)' },
    { value: 'new_churnrisk', label: 'Churn Risk Factor (Custom)' },
    { value: 'new_expansiontype', label: 'Expansion Type (Custom)' },
    { value: 'description', label: 'Description (Standard)' },
    { value: 'estimatedvalue', label: 'Estimated Revenue (Standard)' },
    { value: 'closeprobability', label: 'Close Probability (Standard)' }
  ],
  contact: [
    { value: 'new_lastengagementdate', label: 'Last Engagement (Custom)' },
    { value: 'new_engagementlevel', label: 'Engagement Level (Custom)' },
    { value: 'description', label: 'Description (Standard)' }
  ]
};

export function Dynamics365ConfigDialog() {
  const [config, setConfig] = useState<Dynamics365Config>(dynamics365Service.getConfig());
  const [isOpen, setIsOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(dynamics365Service.isConnected());
  
  // Field mapping state
  const [fieldMappings, setFieldMappings] = useKV<D365FieldMapping[]>('d365-field-mappings', []);
  const [selectedEntity, setSelectedEntity] = useState<'account' | 'opportunity' | 'contact'>('account');
  const [syncFrequency, setSyncFrequency] = useKV<string>('d365-sync-frequency', 'hourly');

  const handleConfigChange = (field: keyof Dynamics365Config, value: string | boolean) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    dynamics365Service.setConfig(updatedConfig);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const success = await dynamics365Service.testConnection();
      setIsConnected(success);
      if (success) {
        handleConfigChange('isConnected', true);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSimulateConnection = () => {
    // For demo purposes, simulate a successful connection
    handleConfigChange('isConnected', true);
    setIsConnected(true);
    toast.success('✅ Dynamics 365 connection simulated successfully');
  };

  // Field mapping functions
  const addFieldMapping = () => {
    const newMapping: D365FieldMapping = {
      id: `mapping-${Date.now()}`,
      sourceField: '',
      targetField: '',
      dataType: 'text',
      isActive: true,
      description: ''
    };
    setFieldMappings(prev => [...(prev || []), newMapping]);
  };

  const updateFieldMapping = (id: string, updates: Partial<D365FieldMapping>) => {
    setFieldMappings(prev => (prev || []).map(mapping => 
      mapping.id === id ? { ...mapping, ...updates } : mapping
    ));
  };

  const removeFieldMapping = (id: string) => {
    setFieldMappings(prev => (prev || []).filter(mapping => mapping.id !== id));
  };

  const createDefaultMappings = () => {
    const defaultMappings: D365FieldMapping[] = [
      {
        id: 'default-health-score',
        sourceField: 'health_score',
        targetField: 'new_healthscore',
        dataType: 'number',
        isActive: true,
        description: 'Sync account health score to custom D365 field'
      },
      {
        id: 'default-arr-value',
        sourceField: 'arr_value',
        targetField: 'new_arrvalue',
        dataType: 'number',
        isActive: true,
        description: 'Sync ARR value to custom D365 field'
      },
      {
        id: 'default-churn-risk',
        sourceField: 'churn_risk_score',
        targetField: 'new_churnrisk',
        dataType: 'number',
        isActive: true,
        description: 'Sync churn risk score to custom D365 field'
      },
      {
        id: 'default-active-users',
        sourceField: 'monthly_active_users',
        targetField: 'new_activeusers',
        dataType: 'number',
        isActive: true,
        description: 'Sync monthly active users count'
      }
    ];
    setFieldMappings(defaultMappings);
    toast.success('Default customer success mappings created');
  };

  const testFieldMapping = async () => {
    const activeMappings = (fieldMappings || []).filter(m => m.isActive);
    if (activeMappings.length === 0) {
      toast.warning('No active field mappings to test');
      return;
    }
    
    // Simulate field mapping test
    toast.loading('Testing field mappings...');
    
    setTimeout(() => {
      toast.success(`Successfully tested ${activeMappings.length} field mappings`);
      console.log('Field Mapping Test Results:', {
        entity: selectedEntity,
        mappings: activeMappings,
        sampleData: {
          health_score: 78,
          arr_value: 125000,
          churn_risk_score: 15,
          monthly_active_users: 245
        }
      });
    }, 2000);
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return (
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Connected</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-red-700">
        <Warning className="w-4 h-4" />
        <span className="text-sm font-medium">Not Connected</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Buildings className="w-4 h-4" />
          Dynamics 365
          {isConnected ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              Setup Required
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Buildings className="w-5 h-5 text-blue-600" />
            Dynamics 365 CRM Integration
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="field-mapping">Field Mapping</TabsTrigger>
            <TabsTrigger value="testing">Testing & Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Integration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Connection Status:</span>
                    {getConnectionStatus()}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Environment:</span>
                      <p className="text-muted-foreground">{config.environment}</p>
                    </div>
                    <div>
                      <span className="font-medium">Base URL:</span>
                      <p className="text-muted-foreground text-xs break-all">{config.baseUrl}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">🚀 What This Integration Enables:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• <strong>Automatic Opportunity Creation:</strong> Convert NBA recommendations directly into D365 opportunities</li>
                      <li>• <strong>Custom Field Mapping:</strong> Sync customer success metrics to custom D365 fields</li>
                      <li>• <strong>Real-time Data Sync:</strong> Keep D365 updated with health scores, usage metrics, and risk indicators</li>
                      <li>• <strong>Rich Context Transfer:</strong> Include AI reasoning, Microsoft solutions, and estimated values</li>
                      <li>• <strong>Smart Probability Calculation:</strong> Auto-calculate close probability based on priority and confidence</li>
                      <li>• <strong>Flexible Entity Support:</strong> Map to Account, Opportunity, and Contact entities</li>
                      <li>• <strong>Comprehensive Metrics:</strong> Sync health, usage, engagement, financial, and risk metrics</li>
                      <li>• <strong>Configurable Sync Frequency:</strong> Real-time, hourly, daily, or weekly synchronization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gear className="w-5 h-5" />
                  Connection Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseUrl">Dynamics 365 Base URL</Label>
                    <Input
                      id="baseUrl"
                      value={config.baseUrl}
                      onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
                      placeholder="https://yourorg.crm.dynamics.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Input
                      id="environment"
                      value={config.environment}
                      onChange={(e) => handleConfigChange('environment', e.target.value)}
                      placeholder="prod, dev, test"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={config.clientId}
                      onChange={(e) => handleConfigChange('clientId', e.target.value)}
                      placeholder="Application (client) ID"
                      type="password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenantId">Tenant ID</Label>
                    <Input
                      id="tenantId"
                      value={config.tenantId}
                      onChange={(e) => handleConfigChange('tenantId', e.target.value)}
                      placeholder="Directory (tenant) ID"
                      type="password"
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">⚙️ Setup Requirements:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Register an Azure AD application with Dynamics 365 permissions</li>
                    <li>• Grant <code>user_impersonation</code> permissions for Dynamics 365</li>
                    <li>• Configure redirect URLs for authentication</li>
                    <li>• Ensure the application has <code>prvCreateOpportunity</code> privilege</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="field-mapping" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Field Mapping Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Customer Success Field Mappings
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div>
                      <Label htmlFor="entity-select">Target Entity</Label>
                      <Select value={selectedEntity} onValueChange={(value: 'account' | 'opportunity' | 'contact') => setSelectedEntity(value)}>
                        <SelectTrigger id="entity-select" className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account">Account</SelectItem>
                          <SelectItem value="opportunity">Opportunity</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sync-frequency">Sync Frequency</Label>
                      <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                        <SelectTrigger id="sync-frequency" className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button onClick={addFieldMapping} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Mapping
                    </Button>
                    <Button onClick={createDefaultMappings} size="sm" variant="outline">
                      <Target className="w-4 h-4 mr-2" />
                      Create Defaults
                    </Button>
                    <Button onClick={testFieldMapping} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Test Mappings
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3 max-h-96 overflow-auto">
                    {(fieldMappings || []).map((mapping) => (
                      <Card key={mapping.id} className="p-4 border-2">
                        <div className="grid grid-cols-12 gap-3 items-start">
                          <div className="col-span-11 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Source Metric</Label>
                                <Select 
                                  value={mapping.sourceField} 
                                  onValueChange={(value) => updateFieldMapping(mapping.id, { sourceField: value })}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select metric" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CUSTOMER_SUCCESS_METRICS.map((metric) => (
                                      <SelectItem key={metric.key} value={metric.key}>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {metric.category}
                                          </Badge>
                                          {metric.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">D365 Field</Label>
                                <Select 
                                  value={mapping.targetField} 
                                  onValueChange={(value) => updateFieldMapping(mapping.id, { targetField: value })}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select D365 field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {D365_ENTITY_FIELDS[selectedEntity]?.map((field) => (
                                      <SelectItem key={field.value} value={field.value}>
                                        {field.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">Data Type</Label>
                                <Select 
                                  value={mapping.dataType} 
                                  onValueChange={(value: 'text' | 'number' | 'boolean' | 'date' | 'picklist') => 
                                    updateFieldMapping(mapping.id, { dataType: value })
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="boolean">Boolean</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="picklist">Picklist</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center space-x-2 pt-4">
                                <Switch
                                  checked={mapping.isActive}
                                  onCheckedChange={(checked) => updateFieldMapping(mapping.id, { isActive: checked })}
                                />
                                <Label className="text-xs">Active</Label>
                              </div>
                              <div className="pt-4">
                                <Badge variant={mapping.isActive ? "default" : "secondary"}>
                                  {mapping.isActive ? "Syncing" : "Disabled"}
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Description</Label>
                              <Textarea
                                value={mapping.description}
                                onChange={(e) => updateFieldMapping(mapping.id, { description: e.target.value })}
                                placeholder="Describe this field mapping..."
                                className="h-16 text-xs"
                              />
                            </div>
                          </div>
                          
                          <div className="col-span-1 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFieldMapping(mapping.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {(!fieldMappings || fieldMappings.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No field mappings configured</p>
                        <p className="text-sm">Click "Add Mapping" or "Create Defaults" to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Available Metrics Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Available Customer Success Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      CUSTOMER_SUCCESS_METRICS.reduce((acc, metric) => {
                        if (!acc[metric.category]) acc[metric.category] = [];
                        acc[metric.category].push(metric);
                        return acc;
                      }, {} as Record<string, CustomerSuccessMetric[]>)
                    ).map(([category, metrics]) => (
                      <div key={category}>
                        <h4 className="font-medium text-sm mb-2 capitalize flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {category}
                          </Badge>
                          {metrics.length} metrics
                        </h4>
                        <div className="space-y-2">
                          {metrics.map((metric) => (
                            <div key={metric.key} className="p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{metric.label}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {metric.dataType}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{metric.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Field Mapping Preview */}
            {fieldMappings && fieldMappings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Field Mapping Preview - {selectedEntity.charAt(0).toUpperCase() + selectedEntity.slice(1)} Entity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">SignalCX Data (Source)</h4>
                      <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        {fieldMappings.filter(m => m.isActive && m.sourceField).map((mapping) => {
                          const metric = CUSTOMER_SUCCESS_METRICS.find(m => m.key === mapping.sourceField);
                          return (
                            <div key={mapping.id} className="flex items-center justify-between py-1">
                              <span className="text-sm font-medium">{metric?.label || mapping.sourceField}</span>
                              <Badge variant="outline" className="text-xs">
                                {mapping.dataType}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Dynamics 365 Fields (Target)</h4>
                      <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                        {fieldMappings.filter(m => m.isActive && m.targetField).map((mapping) => {
                          const field = D365_ENTITY_FIELDS[selectedEntity]?.find(f => f.value === mapping.targetField);
                          return (
                            <div key={mapping.id} className="flex items-center justify-between py-1">
                              <span className="text-sm font-medium">{field?.label || mapping.targetField}</span>
                              <Badge variant="outline" className="text-xs">
                                {mapping.dataType}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Sync Configuration</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Target Entity:</span>
                        <p className="font-medium capitalize">{selectedEntity}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Active Mappings:</span>
                        <p className="font-medium">{fieldMappings.filter(m => m.isActive).length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sync Frequency:</span>
                        <p className="font-medium capitalize">{syncFrequency}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Connection Testing & Demo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    variant="outline"
                  >
                    {isTesting ? 'Testing...' : 'Test Real Connection'}
                  </Button>
                  
                  <Button 
                    onClick={handleSimulateConnection}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Enable Demo Mode
                  </Button>
                  
                  {getConnectionStatus()}
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">🔧 Demo Mode Features:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• <strong>Simulated API Calls:</strong> All D365 operations are simulated for demonstration</li>
                    <li>• <strong>Opportunity Creation:</strong> Creates mock opportunities with realistic IDs and data</li>
                    <li>• <strong>Field Mapping Testing:</strong> Test custom field mappings with sample customer success data</li>
                    <li>• <strong>Sync Simulation:</strong> Simulate data synchronization across all configured mappings</li>
                    <li>• <strong>Full Functionality:</strong> Experience the complete workflow without actual D365 connection</li>
                    <li>• <strong>Console Logging:</strong> View all API payloads and responses in browser console</li>
                    <li>• <strong>Toast Notifications:</strong> See realistic success/error messages for all operations</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">📋 How to Test Field Mapping:</h4>
                  <ol className="text-sm text-gray-700 space-y-2">
                    <li><strong>1.</strong> Go to the Field Mapping tab and create or configure mappings</li>
                    <li><strong>2.</strong> Select your target D365 entity (Account, Opportunity, or Contact)</li>
                    <li><strong>3.</strong> Map customer success metrics to D365 custom fields</li>
                    <li><strong>4.</strong> Click "Test Mappings" to simulate data synchronization</li>
                    <li><strong>5.</strong> Review the Field Mapping Preview to verify configuration</li>
                    <li><strong>6.</strong> Check browser console for detailed mapping results and sample data</li>
                  </ol>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">📋 How to Test Opportunity Creation:</h4>
                  <ol className="text-sm text-gray-700 space-y-2">
                    <li><strong>1.</strong> Enable Demo Mode or configure real connection</li>
                    <li><strong>2.</strong> Go to the NBA Display section and select an account</li>
                    <li><strong>3.</strong> Generate AI recommendations for the selected account</li>
                    <li><strong>4.</strong> Click the "Create in D365" button on any recommendation</li>
                    <li><strong>5.</strong> Observe the opportunity creation success notification</li>
                    <li><strong>6.</strong> Check browser console for detailed API payload and response</li>
                  </ol>
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-gray-100 rounded">
                  <strong>Note:</strong> In production, this would authenticate with Azure AD, validate permissions, 
                  and make actual REST API calls to create opportunities in your Dynamics 365 environment.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button onClick={() => setIsOpen(false)} disabled={!isConnected}>
            Save & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
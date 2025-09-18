import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Gear, 
  Database, 
  Cloud, 
  Globe, 
  Shield, 
  CheckCircle, 
  Warning, 
  Clock,
  ArrowRight,
  Plug,
  Activity,
  ChartBar,
  Users,
  Building,
  Key,
  Sparkle
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  status: 'connected' | 'pending' | 'error' | 'not_configured';
  lastSync?: string;
  recordCount?: number;
  icon: React.ReactNode;
  fields: IntegrationField[];
}

interface IntegrationField {
  id: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'boolean' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

const integrationTemplates: Integration[] = [
  {
    id: 'dynamics-crm',
    name: 'Dynamics 365 CRM',
    type: 'Microsoft',
    category: 'Customer Relationship Management',
    description: 'Sync customer accounts, opportunities, contacts, and revenue data',
    status: 'not_configured',
    icon: <Building className="w-5 h-5" />,
    fields: [
      { id: 'url', label: 'Organization URL', type: 'text', required: true, placeholder: 'https://yourorg.crm.dynamics.com', description: 'Your Dynamics 365 organization URL' },
      { id: 'clientId', label: 'Client ID', type: 'text', required: true, description: 'Azure AD application client ID' },
      { id: 'clientSecret', label: 'Client Secret', type: 'password', required: true, description: 'Azure AD application client secret' },
      { id: 'tenantId', label: 'Tenant ID', type: 'text', required: true, description: 'Azure AD tenant identifier' },
      { id: 'syncFrequency', label: 'Sync Frequency', type: 'select', required: true, options: ['15min', '1hour', '4hours', 'daily'], description: 'How often to sync data' },
      { id: 'entities', label: 'Entities to Sync', type: 'textarea', required: true, placeholder: 'account, opportunity, contact, lead', description: 'Comma-separated list of CRM entities' }
    ]
  },
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    type: 'Third Party',
    category: 'Customer Relationship Management',
    description: 'Import accounts, opportunities, and customer success data from Salesforce',
    status: 'not_configured',
    icon: <Cloud className="w-5 h-5" />,
    fields: [
      { id: 'instanceUrl', label: 'Instance URL', type: 'text', required: true, placeholder: 'https://yourinstance.salesforce.com' },
      { id: 'username', label: 'Username', type: 'text', required: true },
      { id: 'password', label: 'Password', type: 'password', required: true },
      { id: 'securityToken', label: 'Security Token', type: 'password', required: true, description: 'Salesforce security token for API access' },
      { id: 'sandbox', label: 'Sandbox Environment', type: 'boolean', required: false, description: 'Enable if connecting to sandbox' },
      { id: 'objects', label: 'Objects to Sync', type: 'textarea', required: true, placeholder: 'Account, Opportunity, Contact, Case', description: 'Salesforce objects to monitor' }
    ]
  },
  {
    id: 'power-bi',
    name: 'Power BI',
    type: 'Microsoft',
    category: 'Business Intelligence',
    description: 'Connect to Power BI datasets, reports, and dashboards for business metrics',
    status: 'not_configured',
    icon: <ChartBar className="w-5 h-5" />,
    fields: [
      { id: 'workspaceId', label: 'Workspace ID', type: 'text', required: true, description: 'Power BI workspace identifier' },
      { id: 'datasetIds', label: 'Dataset IDs', type: 'textarea', required: true, placeholder: 'dataset-1-id\ndataset-2-id', description: 'Line-separated list of dataset IDs to monitor' },
      { id: 'refreshSchedule', label: 'Refresh Schedule', type: 'select', required: true, options: ['real-time', '15min', '1hour', 'daily'] },
      { id: 'reportFilters', label: 'Report Filters', type: 'textarea', required: false, placeholder: 'Region=North America\nProduct=Azure', description: 'Optional filters to apply to reports' }
    ]
  },
  {
    id: 'fabric',
    name: 'Microsoft Fabric',
    type: 'Microsoft',
    category: 'Data Platform',
    description: 'Access Fabric lakehouses, warehouses, and real-time analytics for comprehensive data insights',
    status: 'not_configured',
    icon: <Database className="w-5 h-5" />,
    fields: [
      { id: 'workspaceId', label: 'Fabric Workspace ID', type: 'text', required: true },
      { id: 'lakehouseId', label: 'Lakehouse ID', type: 'text', required: false, description: 'OneLake lakehouse for file-based analytics' },
      { id: 'warehouseId', label: 'Warehouse ID', type: 'text', required: false, description: 'Fabric warehouse for SQL analytics' },
      { id: 'kqlEndpoint', label: 'KQL Database Endpoint', type: 'text', required: false, placeholder: 'https://yourcluster.kusto.windows.net', description: 'Real-time analytics endpoint' },
      { id: 'dataStreams', label: 'Data Streams', type: 'textarea', required: false, placeholder: 'customer-signals\nproduct-telemetry\nrevenue-metrics', description: 'Real-time data streams to monitor' }
    ]
  },
  {
    id: 'azure-sql',
    name: 'Azure SQL Database',
    type: 'Microsoft',
    category: 'Database',
    description: 'Connect to Azure SQL databases for operational and transactional data',
    status: 'not_configured',
    icon: <Database className="w-5 h-5" />,
    fields: [
      { id: 'server', label: 'Server Name', type: 'text', required: true, placeholder: 'yourserver.database.windows.net' },
      { id: 'database', label: 'Database Name', type: 'text', required: true },
      { id: 'username', label: 'Username', type: 'text', required: true },
      { id: 'password', label: 'Password', type: 'password', required: true },
      { id: 'tables', label: 'Tables to Monitor', type: 'textarea', required: true, placeholder: 'dbo.Accounts\ndbo.Signals\ndbo.CustomerInteractions', description: 'Database tables to sync for signal generation' },
      { id: 'querySchedule', label: 'Query Schedule', type: 'select', required: true, options: ['5min', '15min', '1hour', '4hours'], description: 'How often to query for new data' }
    ]
  },
  {
    id: 'azure-data-lake',
    name: 'Azure Data Lake',
    type: 'Microsoft',
    category: 'Data Storage',
    description: 'Access structured and unstructured data from Azure Data Lake Gen2',
    status: 'not_configured',
    icon: <Cloud className="w-5 h-5" />,
    fields: [
      { id: 'accountName', label: 'Storage Account Name', type: 'text', required: true },
      { id: 'containerName', label: 'Container Name', type: 'text', required: true },
      { id: 'accessKey', label: 'Access Key', type: 'password', required: true },
      { id: 'pathPattern', label: 'File Path Pattern', type: 'text', required: true, placeholder: '/signals/{yyyy}/{MM}/{dd}/*.json', description: 'Pattern for signal data files' },
      { id: 'fileFormat', label: 'File Format', type: 'select', required: true, options: ['json', 'parquet', 'csv', 'avro'], description: 'Format of data files in the lake' }
    ]
  },
  {
    id: 'azure-monitor',
    name: 'Azure Monitor',
    type: 'Microsoft',
    category: 'Monitoring & Observability',
    description: 'Collect application and infrastructure metrics for customer health signals',
    status: 'not_configured',
    icon: <Activity className="w-5 h-5" />,
    fields: [
      { id: 'subscriptionId', label: 'Subscription ID', type: 'text', required: true },
      { id: 'resourceGroup', label: 'Resource Group', type: 'text', required: true },
      { id: 'workspaceId', label: 'Log Analytics Workspace ID', type: 'text', required: true },
      { id: 'metricFilters', label: 'Metric Filters', type: 'textarea', required: false, placeholder: 'Percentage CPU\nMemory working set\nRequests/Sec\nResponse Time', description: 'Specific metrics to monitor for customer health' },
      { id: 'alertRules', label: 'Alert Rules to Monitor', type: 'textarea', required: false, placeholder: 'High CPU Usage\nMemory Pressure\nApplication Errors', description: 'Existing alert rules to incorporate' }
    ]
  },
  {
    id: 'azure-application-insights',
    name: 'Application Insights',
    type: 'Microsoft',
    category: 'Application Performance',
    description: 'Monitor application performance and user behavior for customer experience signals',
    status: 'not_configured',
    icon: <Activity className="w-5 h-5" />,
    fields: [
      { id: 'instrumentationKey', label: 'Instrumentation Key', type: 'text', required: true },
      { id: 'connectionString', label: 'Connection String', type: 'text', required: true },
      { id: 'customEvents', label: 'Custom Events', type: 'textarea', required: false, placeholder: 'user_login\nfeature_usage\nerror_rate', description: 'Custom telemetry events to track' },
      { id: 'performanceCounters', label: 'Performance Counters', type: 'textarea', required: false, placeholder: 'response_time\nthroughput\nerror_rate\navailability', description: 'Key performance indicators' }
    ]
  },
  {
    id: 'rest-api',
    name: 'Custom REST API',
    type: 'Custom',
    category: 'API Integration',
    description: 'Connect to any REST API endpoint for custom data sources and third-party systems',
    status: 'not_configured',
    icon: <Globe className="w-5 h-5" />,
    fields: [
      { id: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'https://api.yourdomain.com' },
      { id: 'apiKey', label: 'API Key', type: 'password', required: false },
      { id: 'authType', label: 'Authentication Type', type: 'select', required: true, options: ['none', 'api-key', 'bearer-token', 'basic-auth', 'oauth2'] },
      { id: 'endpoints', label: 'Endpoints to Monitor', type: 'textarea', required: true, placeholder: '/api/v1/accounts\n/api/v1/signals\n/api/v1/health\n/api/v1/usage', description: 'API endpoints that provide customer data' },
      { id: 'pollInterval', label: 'Poll Interval', type: 'select', required: true, options: ['1min', '5min', '15min', '1hour'], description: 'How frequently to poll the API' },
      { id: 'dataMapping', label: 'Data Mapping', type: 'textarea', required: false, placeholder: 'account_id -> customerId\nhealth_score -> overallHealth', description: 'Map API fields to SignalCX schema' }
    ]
  },
  {
    id: 'azure-synapse',
    name: 'Azure Synapse Analytics',
    type: 'Microsoft',
    category: 'Data Warehouse',
    description: 'Connect to Synapse dedicated and serverless SQL pools for analytical data',
    status: 'not_configured',
    icon: <Database className="w-5 h-5" />,
    fields: [
      { id: 'workspaceName', label: 'Synapse Workspace Name', type: 'text', required: true },
      { id: 'sqlPoolName', label: 'SQL Pool Name', type: 'text', required: false, description: 'Leave empty for serverless' },
      { id: 'serverlessEndpoint', label: 'Serverless SQL Endpoint', type: 'text', required: false },
      { id: 'storageAccount', label: 'Storage Account', type: 'text', required: true, description: 'Associated storage account for data lake' },
      { id: 'views', label: 'Views/Tables to Query', type: 'textarea', required: true, placeholder: 'customer_metrics_view\nsignal_aggregates_view\nrevenue_analytics', description: 'Analytical views containing customer insights' }
    ]
  }
];

export function IntegrationWizard() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [integrations, setIntegrations] = useKV<Integration[]>('integrations', []);
  
  const safeIntegrations = integrations || [];

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <Warning className="w-4 h-4 text-red-600" />;
      default:
        return <Plug className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Not Configured</Badge>;
    }
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setFormData({});
    setActiveTab('configure');
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration) return;

    try {
      // Validate required fields
      const missingFields = selectedIntegration.fields
        .filter(field => field.required && !formData[field.id])
        .map(field => field.label);

      if (missingFields.length > 0) {
        toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Update integration with form data and mark as pending
      const updatedIntegration: Integration = {
        ...selectedIntegration,
        status: 'pending',
        lastSync: new Date().toISOString()
      };

      // Update integrations list
      const updatedIntegrations = safeIntegrations.filter(i => i.id !== selectedIntegration.id);
      updatedIntegrations.push(updatedIntegration);
      setIntegrations(updatedIntegrations);

      // Simulate connection process
      setTimeout(() => {
        const finalIntegration: Integration = {
          ...updatedIntegration,
          status: Math.random() > 0.2 ? 'connected' : 'error', // 80% success rate
          recordCount: Math.floor(Math.random() * 10000) + 1000,
          lastSync: new Date().toISOString()
        };

        setIntegrations(prev => {
          const updated = (prev || []).filter(i => i.id !== selectedIntegration.id);
          updated.push(finalIntegration);
          return updated;
        });

        if (finalIntegration.status === 'connected') {
          toast.success(`${selectedIntegration.name} connected successfully`);
        } else {
          toast.error(`Failed to connect ${selectedIntegration.name}. Please check your configuration.`);
        }
      }, 3000);

      toast.info(`Connecting to ${selectedIntegration.name}...`);
      setActiveTab('overview');
      setSelectedIntegration(null);

    } catch (error) {
      console.error('Error saving integration:', error);
      toast.error('Failed to save integration configuration');
    }
  };

  const handleTestConnection = async () => {
    if (!selectedIntegration) return;

    toast.info('Testing connection...');
    
    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      if (success) {
        toast.success('Connection test successful!');
      } else {
        toast.error('Connection test failed. Please check your configuration.');
      }
    }, 2000);
  };

  const connectedCount = safeIntegrations.filter(i => i.status === 'connected').length;
  const totalRecords = safeIntegrations
    .filter(i => i.status === 'connected')
    .reduce((sum, i) => sum + (i.recordCount || 0), 0);

  const categorizedIntegrations = integrationTemplates.reduce((acc, template) => {
    const existing = safeIntegrations.find(i => i.id === template.id);
    const integration = existing || template;
    
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs px-3 py-1">
          <Gear className="w-4 h-4 mr-2" />
          Integrations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-primary" />
            Data Integration Center
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-visible">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{connectedCount}</div>
                    <div className="text-sm text-muted-foreground">Active Integrations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{totalRecords.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Records Synced</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('overview')}
              >
                <Database className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={activeTab === 'configure' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('overview')}
                disabled={!selectedIntegration}
              >
                <Gear className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button
                variant={activeTab === 'security' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('security')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 overflow-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Data Integration Center</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Globe className="w-4 h-4 mr-2" />
                      Quick Setup Wizard
                    </Button>
                    <Button size="sm">
                      <Plug className="w-4 h-4 mr-2" />
                      Add Custom Integration
                    </Button>
                  </div>
                </div>

                {/* Quick Setup Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-visible bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">Microsoft Stack</h4>
                          <p className="text-xs text-blue-700">Complete Microsoft integration</p>
                        </div>
                      </div>
                      <p className="text-sm text-blue-800 mb-3">
                        Dynamics 365, Power BI, Fabric, Azure Monitor, and Application Insights
                      </p>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Setup Microsoft Stack
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-visible bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Database className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900">Data Platform</h4>
                          <p className="text-xs text-green-700">Connect your data sources</p>
                        </div>
                      </div>
                      <p className="text-sm text-green-800 mb-3">
                        Azure SQL, Data Lake, Synapse Analytics, and API endpoints
                      </p>
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Setup Data Platform
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-visible bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Cloud className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-900">Third Party</h4>
                          <p className="text-xs text-orange-700">External system connections</p>
                        </div>
                      </div>
                      <p className="text-sm text-orange-800 mb-3">
                        Salesforce, custom APIs, and other external data sources
                      </p>
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        Setup Third Party
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {Object.entries(categorizedIntegrations).map(([category, integrations]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-muted-foreground">{category}</h4>
                      <Badge variant="outline" className="text-xs">
                        {integrations.filter(i => i.status === 'connected').length} of {integrations.length} connected
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {integrations.map((integration) => (
                        <Card key={integration.id} className="border-visible hover:shadow-md transition-all duration-200 hover:border-primary/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  integration.status === 'connected' ? 'bg-green-100' : 
                                  integration.status === 'pending' ? 'bg-yellow-100' :
                                  integration.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                                }`}>
                                  {integration.icon}
                                </div>
                                <div>
                                  <h5 className="font-medium">{integration.name}</h5>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {integration.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(integration.status)}
                                {getStatusBadge(integration.status)}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {integration.description}
                            </p>

                            {integration.status === 'connected' && (
                              <div className="text-xs text-muted-foreground mb-3 space-y-1">
                                <div className="flex justify-between">
                                  <span>Records:</span> 
                                  <span className="font-medium">{integration.recordCount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Last sync:</span> 
                                  <span className="font-medium">{new Date(integration.lastSync!).toLocaleString()}</span>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={integration.status === 'connected' ? 'outline' : 'default'}
                                className="flex-1"
                                onClick={() => handleConfigureIntegration(integration)}
                              >
                                {integration.status === 'connected' ? 'Reconfigure' : 'Configure'}
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                              {integration.status === 'connected' && (
                                <Button size="sm" variant="outline" className="px-3">
                                  <Activity className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'configure' && selectedIntegration && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveTab('overview');
                      setSelectedIntegration(null);
                    }}
                  >
                    ← Back
                  </Button>
                  <div className="flex items-center gap-2">
                    {selectedIntegration.icon}
                    <h3 className="text-lg font-semibold">{selectedIntegration.name}</h3>
                    {getStatusBadge(selectedIntegration.status)}
                  </div>
                </div>

                <Card className="border-visible">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gear className="w-5 h-5" />
                      Connection Configuration
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure your {selectedIntegration.name} connection to start syncing data
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedIntegration.fields.map((field) => (
                        <div key={field.id} className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                          <Label htmlFor={field.id} className="flex items-center gap-1 font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                          </Label>
                          
                          {field.type === 'text' || field.type === 'password' ? (
                            <Input
                              id={field.id}
                              type={field.type}
                              placeholder={field.placeholder}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className={`transition-all duration-200 ${formData[field.id] ? 'border-green-300' : ''}`}
                            />
                          ) : field.type === 'select' ? (
                            <Select
                              value={formData[field.id] || ''}
                              onValueChange={(value) => handleFieldChange(field.id, value)}
                            >
                              <SelectTrigger className={`transition-all duration-200 ${formData[field.id] ? 'border-green-300' : ''}`}>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === 'textarea' ? (
                            <Textarea
                              id={field.id}
                              placeholder={field.placeholder}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              rows={3}
                              className={`transition-all duration-200 ${formData[field.id] ? 'border-green-300' : ''}`}
                            />
                          ) : field.type === 'boolean' ? (
                            <div className="flex items-center space-x-3 p-3 border rounded-lg">
                              <Switch
                                id={field.id}
                                checked={formData[field.id] || false}
                                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                              />
                              <Label htmlFor={field.id} className="text-sm cursor-pointer">
                                {field.description || 'Enable this option'}
                              </Label>
                            </div>
                          ) : null}
                          
                          {field.description && field.type !== 'boolean' && (
                            <p className="text-xs text-muted-foreground flex items-start gap-1">
                              <Activity className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              {field.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleTestConnection} 
                          variant="outline" 
                          className="flex-1"
                          disabled={!formData || Object.keys(formData).length === 0}
                        >
                          <Activity className="w-4 h-4 mr-2" />
                          Test Connection
                        </Button>
                        <Button 
                          onClick={handleSaveIntegration} 
                          className="flex-1"
                          disabled={!formData || Object.keys(formData).length === 0}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Save & Connect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Security & Compliance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-visible">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Data Encryption
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Encryption at Rest</span>
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Encryption in Transit</span>
                          <Badge className="bg-green-100 text-green-800">TLS 1.3</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Key Management</span>
                          <Badge className="bg-green-100 text-green-800">Azure Key Vault</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-visible">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Access Control
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Multi-Factor Authentication</span>
                          <Badge className="bg-green-100 text-green-800">Required</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Role-Based Access</span>
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>API Rate Limiting</span>
                          <Badge className="bg-green-100 text-green-800">1000/hour</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-visible">
                  <CardHeader>
                    <CardTitle>Compliance Standards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['SOC 2 Type II', 'GDPR', 'HIPAA', 'ISO 27001'].map((standard) => (
                        <div key={standard} className="text-center p-3 border rounded-lg">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">{standard}</p>
                          <p className="text-xs text-muted-foreground">Compliant</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
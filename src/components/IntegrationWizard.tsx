import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  Globe, 
  CheckCircle,
  Clock,
  Plug,
  ChartBar,
  Buildings,
  Gear,
  Shield,
  Activity,
  Cloud,
  ArrowLeft
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  category: string;
  type: 'Microsoft' | 'Third Party';
  description: string;
  status: 'connected' | 'pending' | 'error' | 'not_configured';
  lastSync?: string;
  icon: React.ReactNode;
  fields: IntegrationField[];
}

interface IntegrationField {
  id: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

const integrationTemplates: Integration[] = [
  {
    id: 'dynamics-crm',
    name: 'Microsoft Dynamics 365 CRM',
    category: 'Customer Relationship',
    type: 'Microsoft',
    description: 'Connect to Dynamics 365 for customer data and engagement insights',
    status: 'not_configured',
    icon: <Buildings className="w-5 h-5" />,
    fields: [
      { id: 'url', label: 'Dynamics URL', type: 'text', required: true, placeholder: 'https://your-org.crm.dynamics.com' },
      { id: 'clientId', label: 'Client ID', type: 'text', required: true },
      { id: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { id: 'syncFrequency', label: 'Sync Frequency', type: 'select', required: true, options: ['Every 15 minutes', 'Hourly', 'Daily'] }
    ]
  },
  {
    id: 'salesforce-crm',
    name: 'Salesforce CRM',
    category: 'Customer Relationship',
    type: 'Third Party',
    description: 'Import account and opportunity data from Salesforce',
    status: 'not_configured',
    icon: <Cloud className="w-5 h-5" />,
    fields: [
      { id: 'username', label: 'Username', type: 'text', required: true },
      { id: 'password', label: 'Password', type: 'password', required: true },
      { id: 'securityToken', label: 'Security Token', type: 'password', required: true },
      { id: 'objects', label: 'Objects to Sync', type: 'textarea', required: true, placeholder: 'Account, Opportunity, Contact' }
    ]
  },
  {
    id: 'power-bi',
    name: 'Microsoft Power BI',
    category: 'Business Intelligence',
    type: 'Microsoft',
    description: 'Connect to Power BI datasets and reports for analytics',
    status: 'not_configured',
    icon: <ChartBar className="w-5 h-5" />,
    fields: [
      { id: 'workspaceId', label: 'Workspace ID', type: 'text', required: true },
      { id: 'datasetId', label: 'Dataset ID', type: 'text', required: true },
      { id: 'refreshSchedule', label: 'Refresh Schedule', type: 'select', required: true, options: ['Real-time', 'Hourly', 'Daily'] }
    ]
  },
  {
    id: 'microsoft-fabric',
    name: 'Microsoft Fabric',
    category: 'Data Platform',
    type: 'Microsoft',
    description: 'Access unified analytics from Microsoft Fabric lakehouse',
    status: 'not_configured',
    icon: <Database className="w-5 h-5" />,
    fields: [
      { id: 'tenantId', label: 'Tenant ID', type: 'text', required: true },
      { id: 'lakehouseId', label: 'Lakehouse ID', type: 'text', required: false },
      { id: 'kqlEndpoint', label: 'KQL Endpoint', type: 'text', required: false }
    ]
  },
  {
    id: 'azure-sql',
    name: 'Azure SQL Database',
    category: 'Database',
    type: 'Microsoft',
    description: 'Connect to Azure SQL databases for customer data',
    status: 'not_configured',
    icon: <Database className="w-5 h-5" />,
    fields: [
      { id: 'server', label: 'Server Name', type: 'text', required: true, placeholder: 'your-server.database.windows.net' },
      { id: 'database', label: 'Database Name', type: 'text', required: true },
      { id: 'username', label: 'Username', type: 'text', required: true },
      { id: 'password', label: 'Password', type: 'password', required: true }
    ]
  },
  {
    id: 'azure-data-lake',
    name: 'Azure Data Lake',
    category: 'Data Platform',
    type: 'Microsoft',
    description: 'Access structured and unstructured data from Azure Data Lake',
    status: 'not_configured',
    icon: <Cloud className="w-5 h-5" />,
    fields: [
      { id: 'accountName', label: 'Storage Account Name', type: 'text', required: true },
      { id: 'accessKey', label: 'Access Key', type: 'password', required: true },
      { id: 'containerName', label: 'Container Name', type: 'text', required: true },
      { id: 'fileFormat', label: 'File Format', type: 'select', required: true, options: ['Parquet', 'CSV', 'JSON', 'Delta'] }
    ]
  },
  {
    id: 'azure-monitor',
    name: 'Azure Monitor',
    category: 'Monitoring',
    type: 'Microsoft',
    description: 'Collect application and infrastructure metrics for customer health insights',
    status: 'not_configured',
    icon: <Activity className="w-5 h-5" />,
    fields: [
      { id: 'subscriptionId', label: 'Subscription ID', type: 'text', required: true },
      { id: 'resourceGroup', label: 'Resource Group', type: 'text', required: true },
      { id: 'logAnalyticsWorkspace', label: 'Log Analytics Workspace', type: 'text', required: false }
    ]
  },
  {
    id: 'custom-api',
    name: 'Custom REST API',
    category: 'API Integration',
    type: 'Third Party',
    description: 'Connect to any REST API for custom data sources',
    status: 'not_configured',
    icon: <Globe className="w-5 h-5" />,
    fields: [
      { id: 'endpoint', label: 'API Endpoint', type: 'text', required: true, placeholder: 'https://api.example.com' },
      { id: 'apiKey', label: 'API Key', type: 'password', required: true },
      { id: 'authType', label: 'Authentication Type', type: 'select', required: true, options: ['Bearer Token', 'API Key', 'Basic Auth'] },
      { id: 'dataMapping', label: 'Data Mapping', type: 'textarea', required: true, placeholder: 'JSON field mappings...' }
    ]
  }
];

export function IntegrationWizard() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [integrations, setIntegrations] = useKV<Integration[]>('integrations', []);
  
  const safeIntegrations = integrations || [];

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <Activity className="w-4 h-4 text-red-600" />;
      default:
        return <Plug className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Connecting</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Not Configured</Badge>;
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration) return;

    setIsConnecting(true);

    try {
      // Validate required fields
      const missingFields = selectedIntegration.fields
        .filter(field => field.required && !formData[field.id])
        .map(field => field.label);

      if (missingFields.length > 0) {
        toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
        setIsConnecting(false);
        return;
      }

      // Update integration with form data and mark as pending
      const updatedIntegration: Integration = {
        ...selectedIntegration,
        status: 'pending',
        lastSync: new Date().toISOString()
      };

      // Add or update integration
      const existingIndex = safeIntegrations.findIndex(i => i.id === selectedIntegration.id);
      let updatedIntegrations: Integration[];
      
      if (existingIndex >= 0) {
        updatedIntegrations = [...safeIntegrations];
        updatedIntegrations[existingIndex] = updatedIntegration;
      } else {
        updatedIntegrations = [...safeIntegrations, updatedIntegration];
      }
      
      setIntegrations(updatedIntegrations);

      // Simulate connection process
      setTimeout(() => {
        const finalIntegration: Integration = {
          ...updatedIntegration,
          status: Math.random() > 0.2 ? 'connected' : 'error',
          lastSync: new Date().toISOString()
        };

        setIntegrations(prev => {
          const updated = (prev || []).map(i => 
            i.id === selectedIntegration.id ? finalIntegration : i
          );
          return updated;
        });

        if (finalIntegration.status === 'connected') {
          toast.success(`${selectedIntegration.name} connected successfully`);
        } else {
          toast.error(`Failed to connect ${selectedIntegration.name}. Please check your credentials.`);
        }
        setIsConnecting(false);
      }, 3000);

      toast.info(`Connecting to ${selectedIntegration.name}...`);
      
    } catch (error) {
      console.error('Error saving integration:', error);
      toast.error('Failed to save integration configuration');
      setIsConnecting(false);
    }
  };

  const handleTestConnection = () => {
    if (!selectedIntegration) return;
    
    toast.info('Testing connection...');
    
    setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        toast.success('Connection test successful!');
      } else {
        toast.error('Connection test failed. Please check your configuration.');
      }
    }, 2000);
  };

  const connectedCount = safeIntegrations.filter(i => i.status === 'connected').length;
  const pendingCount = safeIntegrations.filter(i => i.status === 'pending').length;

  const handleQuickSetup = (template: Integration) => {
    const existing = safeIntegrations.find(i => i.id === template.id);
    setSelectedIntegration(existing || template);
    setActiveTab('configure');
    setFormData({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Gear className="w-4 h-4 mr-2" />
          Integration Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="w-5 h-5" />
            Integration Settings
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-visible">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connected</span>
                    <Badge variant="outline">{connectedCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending</span>
                    <Badge variant="outline">{pendingCount}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </Button>
              <Button
                className="w-full justify-start"
                variant={activeTab === 'configure' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('configure')}
              >
                Configure
              </Button>
              <Button
                className="w-full justify-start"
                variant={activeTab === 'security' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('security')}
              >
                Security
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3 overflow-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Available Integrations</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Quick Setup Wizard
                    </Button>
                    <Button size="sm">
                      Add Custom Integration
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-visible bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Buildings className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">Microsoft Ecosystem</h4>
                          <p className="text-sm text-blue-700">Native integrations</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        Setup Microsoft
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-visible bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Database className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900">Data Platforms</h4>
                          <p className="text-sm text-green-700">Analytics & warehousing</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        Setup Data Platform
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-visible bg-orange-50 border-orange-200 md:col-span-2">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-900">Third Party & Custom</h4>
                          <p className="text-sm text-orange-800 mb-3">
                            Connect external systems and APIs
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        Setup Third Party
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {Object.entries(
                  integrationTemplates.reduce((acc, integration) => {
                    acc[integration.category] = acc[integration.category] || [];
                    acc[integration.category].push(integration);
                    return acc;
                  }, {} as Record<string, Integration[]>)
                ).map(([category, integrations]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <h4 className="font-medium">{category}</h4>
                      <Badge variant="outline">{integrations.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {integrations.map((integration) => {
                        const configuredIntegration = safeIntegrations.find(i => i.id === integration.id);
                        const displayIntegration = configuredIntegration || integration;
                        
                        return (
                          <Card key={integration.id} className="border-visible hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    integration.type === 'Microsoft' ? 'bg-blue-100' : 'bg-gray-100'
                                  }`}>
                                    {integration.icon}
                                  </div>
                                  <div>
                                    <h5 className="font-medium">{integration.name}</h5>
                                    <Badge variant="outline" className="text-xs">
                                      {integration.type}
                                    </Badge>
                                  </div>
                                </div>
                                {getStatusBadge(displayIntegration.status)}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {integration.description}
                              </p>
                              
                              {displayIntegration.lastSync && (
                                <p className="text-xs text-muted-foreground mb-3">
                                  Last sync: <span className="font-medium">{new Date(displayIntegration.lastSync).toLocaleString()}</span>
                                </p>
                              )}
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={displayIntegration.status === 'connected' ? 'outline' : 'default'}
                                  onClick={() => handleQuickSetup(integration)}
                                  className="flex-1"
                                >
                                  {displayIntegration.status === 'connected' ? 'Reconfigure' : 'Configure'}
                                </Button>
                                <Button size="sm" variant="outline">
                                  Test
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'configure' && selectedIntegration && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedIntegration(null);
                      setActiveTab('overview');
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>

                <Card className="border-visible">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {selectedIntegration.icon}
                      {selectedIntegration.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedIntegration.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedIntegration.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        
                        {field.type === 'select' ? (
                          <Select
                            value={formData[field.id] || ''}
                            onValueChange={(value) => handleFieldChange(field.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                          />
                        ) : (
                          <Input
                            id={field.id}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className={`${field.required && !formData[field.id] ? 'border-red-200' : ''}`}
                          />
                        )}
                        
                        {field.description && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {field.description}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    <div className="border-t pt-6">
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleSaveIntegration}
                          disabled={!formData || isConnecting}
                          className="flex-1"
                        >
                          {isConnecting ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Save & Connect
                            </>
                          )}
                        </Button>
                        
                        <Button variant="outline" onClick={handleTestConnection}>
                          Test Connection
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-visible">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Encryption
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Data in Transit</span>
                          <Badge className="bg-green-100 text-green-800">
                            TLS 1.3
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Data at Rest</span>
                          <Badge className="bg-green-100 text-green-800">
                            AES-256
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Key Management</span>
                          <Badge className="bg-green-100 text-green-800">
                            Azure Key Vault
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-visible">
                    <CardHeader>
                      <CardTitle>Access Control</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Authentication</span>
                          <Badge className="bg-green-100 text-green-800">OAuth 2.0</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Authorization</span>
                          <Badge className="bg-green-100 text-green-800">RBAC</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">MFA</span>
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-visible">
                  <CardHeader>
                    <CardTitle>Compliance Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['SOC 2 Type II', 'GDPR', 'HIPAA', 'ISO 27001'].map((cert) => (
                        <div key={cert} className="text-center">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">{cert}</p>
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
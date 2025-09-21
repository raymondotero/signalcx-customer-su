import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle,
  CloudArrowUp,
  Cpu,
  Eye,
  Lightning,
  Activity,
  Warning,
  Sparkle,
  Target,
  Play,
  Graph,
  ArrowClockwise,
  Gear,
  Shield,
  Database,
  Clock,
  Pause,
  Robot,
  ChartBar
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface AzureAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  modelName: string;
  subscriptionId: string;
  resourceGroup: string;
  workspaceName: string;
  maxTokens: number;
  temperature: number;
  enableRealTimeProcessing: boolean;
  batchSize: number;
  maxRetries: number;
  timeoutMs: number;
  retryPolicy: 'exponential' | 'linear' | 'none';
  enableContentFilter: boolean;
  enableLogging: boolean;
}

interface AIMetrics {
  successfulRequests: number;
  averageLatency: number;
  costUsd: number;
  uptime: number;
  throughputPerMinute: number;
}

interface DeploymentInfo {
  id: string;
  name: string;
  model: string;
  status: 'Running' | 'Stopped' | 'Failed';
  version: string;
  endpoint: string;
  lastUpdated: Date;
  scalingConfig: {
    minInstances: number;
    maxInstances: number;
    targetUtilization: number;
  };
  performance: {
    averageLatency: number;
    requestsPerSecond: number;
    errorRate: number;
  };
}

const defaultConfig: AzureAIConfig = {
  endpoint: '',
  apiKey: '',
  deploymentName: '',
  modelName: 'gpt-4',
  subscriptionId: '',
  resourceGroup: '',
  workspaceName: '',
  maxTokens: 1000,
  temperature: 0.3,
  enableRealTimeProcessing: true,
  batchSize: 10,
  maxRetries: 3,
  timeoutMs: 30000,
  retryPolicy: 'exponential',
  enableContentFilter: true,
  enableLogging: false
};

const sampleDeployments: DeploymentInfo[] = [
  {
    id: 'dep-1',
    name: 'SignalCX-GPT4-Production',
    model: 'gpt-4',
    status: 'Running',
    version: '0613',
    endpoint: 'https://signalcx-ai.openai.azure.com/',
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    scalingConfig: {
      minInstances: 2,
      maxInstances: 10,
      targetUtilization: 70
    },
    performance: {
      averageLatency: 850,
      requestsPerSecond: 12.5,
      errorRate: 0.8
    }
  },
  {
    id: 'dep-2',
    name: 'SignalCX-Embeddings',
    model: 'text-embedding-ada-002',
    status: 'Running',
    version: '2',
    endpoint: 'https://signalcx-ai.openai.azure.com/',
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    scalingConfig: {
      minInstances: 1,
      maxInstances: 5,
      targetUtilization: 80
    },
    performance: {
      averageLatency: 320,
      requestsPerSecond: 45.2,
      errorRate: 0.3
    }
  },
  {
    id: 'dep-3',
    name: 'SignalCX-GPT35-Backup',
    model: 'gpt-35-turbo',
    status: 'Running',
    version: '0613',
    endpoint: 'https://signalcx-ai.openai.azure.com/',
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
    scalingConfig: {
      minInstances: 3,
      maxInstances: 15,
      targetUtilization: 85
    },
    performance: {
      averageLatency: 420,
      requestsPerSecond: 32.1,
      errorRate: 1.2
    }
  }
];

export function AzureAIFoundryIntegration() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useKV<AzureAIConfig>('azure-ai-config', defaultConfig);
  const [metrics, setMetrics] = useKV<AIMetrics>('azure-ai-metrics', {
    successfulRequests: 2847,
    averageLatency: 745,
    costUsd: 142.36,
    uptime: 99.7,
    throughputPerMinute: 34.8
  });
  const [deployments, setDeployments] = useState<DeploymentInfo[]>(sampleDeployments);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [realTimeProcessing, setRealTimeProcessing] = useState(false);

  const safeMetrics = metrics || {
    successfulRequests: 0,
    averageLatency: 0,
    costUsd: 0,
    uptime: 0,
    throughputPerMinute: 0
  };

  const safeConfig = config || defaultConfig;
  const safeDeployments = deployments || sampleDeployments;

  // Simulate real-time metrics updates
  useEffect(() => {
    if (connectionStatus === 'connected' && realTimeProcessing) {
      const interval = setInterval(() => {
        setMetrics(current => {
          const currentMetrics = current || safeMetrics;
          return {
            ...currentMetrics,
            successfulRequests: currentMetrics.successfulRequests + Math.floor(Math.random() * 5) + 1,
            averageLatency: Math.max(200, currentMetrics.averageLatency + (Math.random() - 0.5) * 50),
            costUsd: currentMetrics.costUsd + Math.random() * 0.25,
            uptime: currentMetrics.uptime,
            throughputPerMinute: Math.max(10, currentMetrics.throughputPerMinute + (Math.random() - 0.5) * 5)
          };
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [connectionStatus, realTimeProcessing, setMetrics, safeMetrics]);

  const handleConfigChange = (field: keyof AzureAIConfig, value: any) => {
    setConfig(prev => {
      const currentConfig = prev || defaultConfig;
      return {
        ...currentConfig,
        [field]: value
      };
    });
  };

  const validateConnection = () => {
    if (!safeConfig.endpoint || !safeConfig.apiKey) {
      throw new Error('Missing required fields: endpoint and API key are required');
    }

    if (!safeConfig.deploymentName || !safeConfig.subscriptionId) {
      throw new Error('Missing deployment configuration');
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      validateConnection();
      setConnectionStatus('connecting');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectionStatus('connected');
      toast.success('Connection to Azure AI Foundry successful!');
    } catch (error) {
      setConnectionStatus('error');
      toast.error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      validateConnection();
      setConnectionStatus('connecting');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!metrics) {
        setMetrics({
          successfulRequests: Math.floor(Math.random() * 5000) + 1000,
          averageLatency: Math.floor(Math.random() * 500) + 300,
          costUsd: Math.random() * 200 + 50,
          uptime: 99.5 + Math.random() * 0.4,
          throughputPerMinute: Math.random() * 40 + 20
        });
      }
      
      setConnectionStatus('connected');
      toast.success('Successfully connected to Azure AI Foundry!');
    } catch (error) {
      setConnectionStatus('error');
      toast.error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartRealTimeProcessing = () => {
    setRealTimeProcessing(true);
    toast.success('Real-time processing started');
  };

  const handleStopRealTimeProcessing = () => {
    setRealTimeProcessing(false);
    toast.info('Real-time processing stopped');
  };

  const getStatusBadge = (status: typeof connectionStatus) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Connecting...</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Disconnected</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Stopped':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Failed':
        return <Warning className="w-4 h-4 text-red-600" />;
      default:
        return <Pause className="w-4 h-4 text-gray-600" />;
    }
  };

  const successRate = safeMetrics.successfulRequests > 0 ? 
    ((safeMetrics.successfulRequests / (safeMetrics.successfulRequests + 50)) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Azure AI Foundry
          <Sparkle className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          Azure AI Foundry Integration
          <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700">
            <Lightning className="w-3 h-3 mr-1" />
            Enterprise AI
          </Badge>
        </DialogTitle>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudArrowUp className="w-5 h-5" />
                    Connection Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getStatusBadge(connectionStatus)}
                    <div className="flex items-center gap-2">
                      <Robot className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">Azure AI Foundry</p>
                        <p className="text-sm text-muted-foreground">Enterprise AI Platform</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Active Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{safeDeployments.filter(d => d.status === 'Running').length}</p>
                      <p className="text-sm text-muted-foreground">Live deployments</p>
                    </div>
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBar className="w-5 h-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-medium">{successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={successRate} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Latency</span>
                    <span className="text-sm font-medium">{Math.round(safeMetrics.averageLatency)}ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-medium">{safeMetrics.uptime.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Real-time Processing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <div className="flex items-center gap-2">
                      {realTimeProcessing ? (
                        <Button size="sm" variant="outline" onClick={handleStopRealTimeProcessing}>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      ) : (
                        <Button size="sm" onClick={handleStartRealTimeProcessing}>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Requests/min</p>
                      <p className="text-2xl font-bold text-green-600">{safeMetrics.throughputPerMinute.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold text-blue-600">${safeMetrics.costUsd.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gear className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleConnect}
                    disabled={isConnecting || connectionStatus === 'connected'}
                  >
                    {isConnecting ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : connectionStatus === 'connected' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <CloudArrowUp className="w-4 h-4 mr-2" />
                        Connect to Azure AI
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Sparkle className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <Card className="border-visible">
              <CardHeader>
                <CardTitle>Azure AI Foundry Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endpoint">Azure OpenAI Endpoint</Label>
                    <Input
                      id="endpoint"
                      placeholder="https://your-resource.openai.azure.com/"
                      value={safeConfig.endpoint}
                      onChange={(e) => handleConfigChange('endpoint', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Your Azure OpenAI API key"
                        value={safeConfig.apiKey}
                        onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                      />
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="deploymentName">Deployment Name</Label>
                    <Input
                      id="deploymentName"
                      placeholder="your-gpt-4-deployment"
                      value={safeConfig.deploymentName}
                      onChange={(e) => handleConfigChange('deploymentName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="modelName">Model</Label>
                    <Select
                      value={safeConfig.modelName}
                      onValueChange={(value) => handleConfigChange('modelName', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-35-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="text-embedding-ada-002">Text Embedding Ada 002</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="subscriptionId">Subscription ID</Label>
                    <Input
                      id="subscriptionId"
                      placeholder="00000000-0000-0000-0000-000000000000"
                      value={safeConfig.subscriptionId}
                      onChange={(e) => handleConfigChange('subscriptionId', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="resourceGroup">Resource Group</Label>
                    <Input
                      id="resourceGroup"
                      placeholder="your-resource-group"
                      value={safeConfig.resourceGroup}
                      onChange={(e) => handleConfigChange('resourceGroup', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="workspaceName">AI Foundry Workspace</Label>
                    <Input
                      id="workspaceName"
                      placeholder="your-ai-foundry-workspace"
                      value={safeConfig.workspaceName}
                      onChange={(e) => handleConfigChange('workspaceName', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableRealTime"
                      checked={safeConfig.enableRealTimeProcessing}
                      onCheckedChange={(checked) => handleConfigChange('enableRealTimeProcessing', checked)}
                    />
                    <Label htmlFor="enableRealTime">Enable Real-time Processing</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={safeConfig.maxTokens}
                      onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value) || 1000)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={safeConfig.temperature}
                      onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value) || 0.3)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Model Deployments</h3>
              <Button variant="outline" size="sm">
                <ArrowClockwise className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid gap-4">
              {safeDeployments.map((deployment) => (
                <Card key={deployment.id} className="border-visible">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{deployment.name}</h4>
                          {getStatusIcon(deployment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {deployment.model} • Version {deployment.version}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {deployment.lastUpdated.toLocaleString()}
                        </p>
                      </div>
                      <Badge 
                        className={
                          deployment.status === 'Running' ? 'bg-green-100 text-green-800 border-green-200' :
                          deployment.status === 'Failed' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }
                      >
                        {deployment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <div className="text-sm text-muted-foreground">Latency</div>
                        <div className="font-medium">{deployment.performance.averageLatency}ms</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Requests/sec</div>
                        <div className="font-medium">{deployment.performance.requestsPerSecond.toFixed(1)}/s</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Error Rate</div>
                        <div className="font-medium">{deployment.performance.errorRate.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization Target: {deployment.scalingConfig.targetUtilization}%</span>
                        <span>{deployment.scalingConfig.minInstances}-{deployment.scalingConfig.maxInstances} instances</span>
                      </div>
                      <Progress value={deployment.scalingConfig.targetUtilization} />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Gear className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <Graph className="w-4 h-4 mr-2" />
                        View Metrics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold">{safeMetrics.successfulRequests.toLocaleString()}</p>
                    </div>
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Latency</p>
                      <p className="text-2xl font-bold">{Math.round(safeMetrics.averageLatency)}ms</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold">${safeMetrics.costUsd.toFixed(2)}</p>
                    </div>
                    <Database className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-visible">
              <CardHeader>
                <CardTitle>Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    Set up alerts for key metrics to proactively monitor your Azure AI Foundry deployments.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Error Rate Threshold (%)</Label>
                    <Input type="number" placeholder="5" />
                  </div>
                  <div>
                    <Label>Latency Threshold (ms)</Label>
                    <Input type="number" placeholder="1000" />
                  </div>
                  <div>
                    <Label>Cost Alert ($)</Label>
                    <Input type="number" placeholder="500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Performance Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Retry Policy</Label>
                      <Select
                        value={safeConfig.retryPolicy}
                        onValueChange={(value: 'exponential' | 'linear' | 'none') => handleConfigChange('retryPolicy', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exponential">Exponential Backoff</SelectItem>
                          <SelectItem value="linear">Linear Backoff</SelectItem>
                          <SelectItem value="none">No Retry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Max Retries</Label>
                      <Input
                        type="number"
                        value={safeConfig.maxRetries}
                        onChange={(e) => handleConfigChange('maxRetries', parseInt(e.target.value) || 3)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Timeout (ms)</Label>
                      <Input
                        type="number"
                        value={safeConfig.timeoutMs}
                        onChange={(e) => handleConfigChange('timeoutMs', parseInt(e.target.value) || 30000)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableLogging"
                        checked={safeConfig.enableLogging}
                        onCheckedChange={(checked) => handleConfigChange('enableLogging', checked)}
                      />
                      <Label htmlFor="enableLogging">Enable Request Logging</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableContentFilter"
                        checked={safeConfig.enableContentFilter}
                        onCheckedChange={(checked) => handleConfigChange('enableContentFilter', checked)}
                      />
                      <Label htmlFor="enableContentFilter">Enable Content Filtering</Label>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Gear className="w-4 h-4 mr-2" />
                  Apply Optimization Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="border-visible">
              <CardHeader>
                <CardTitle>Cost Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-green-800">Batch Processing Enabled</h5>
                    <p className="text-sm text-green-700">
                      Batch requests together to reduce API call overhead and costs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-green-800">Prompt Optimization</h5>
                    <p className="text-sm text-green-700">
                      Reduce input prompt length to minimize token usage and costs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Warning className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-yellow-800">Model Selection</h5>
                    <p className="text-sm text-yellow-700">
                      Use GPT-3.5-Turbo for simpler tasks to reduce costs while maintaining quality.
                    </p>
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
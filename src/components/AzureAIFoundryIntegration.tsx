import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle,
  Clock,
  CloudArrowUp,
  ChartBar,
  Cpu,
  Eye,
  EyeSlash,
  Gear,
  Lightning,
  Shield,
  Activity,
  Database,
  Warning,
  Key,
  Sparkle,
  Robot,
  Target,
  ArrowClockwise,
  Play,
  Pause,
  Graph
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
  enableRealTimeProcessing: boolean;
  maxTokens: number;
  temperature: number;
  enableLogging: boolean;
  enableContentFilter: boolean;
  batchSize: number;
  retryPolicy: 'exponential' | 'linear' | 'none';
  maxRetries: number;
  timeoutMs: number;
}

interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  tokensUsed: number;
  costUsd: number;
  lastRequest: string;
  uptime: number;
  errorRate: number;
  throughputPerMinute: number;
}

interface ModelDeployment {
  name: string;
  model: string;
  version: string;
  status: 'Running' | 'Stopped' | 'Failed' | 'Deploying';
  endpoint: string;
  lastUpdated: string;
  scalingConfig: {
    minInstances: number;
    maxInstances: number;
    targetUtilization: number;
  };
  performance: {
    requestsPerSecond: number;
    averageLatency: number;
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
  enableRealTimeProcessing: true,
  maxTokens: 4000,
  temperature: 0.3,
  enableLogging: true,
  enableContentFilter: true,
  batchSize: 10,
  retryPolicy: 'exponential',
  maxRetries: 3,
  timeoutMs: 30000
};

const sampleDeployments: ModelDeployment[] = [
  {
    name: 'signalcx-gpt4-main',
    model: 'gpt-4',
    version: '0613',
    status: 'Running',
    endpoint: 'https://signalcx-eastus.openai.azure.com/openai/deployments/signalcx-gpt4-main',
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    scalingConfig: {
      minInstances: 2,
      maxInstances: 10,
      targetUtilization: 70
    },
    performance: {
      requestsPerSecond: 12.5,
      averageLatency: 850,
      errorRate: 0.02
    }
  },
  {
    name: 'signalcx-embeddings',
    model: 'text-embedding-ada-002',
    version: '2',
    status: 'Running',
    endpoint: 'https://signalcx-eastus.openai.azure.com/openai/deployments/signalcx-embeddings',
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    scalingConfig: {
      minInstances: 1,
      maxInstances: 5,
      targetUtilization: 80
    },
    performance: {
      requestsPerSecond: 45.2,
      averageLatency: 120,
      errorRate: 0.001
    }
  },
  {
    name: 'signalcx-analysis',
    model: 'gpt-35-turbo',
    version: '0613',
    status: 'Running',
    endpoint: 'https://signalcx-eastus.openai.azure.com/openai/deployments/signalcx-analysis',
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    scalingConfig: {
      minInstances: 3,
      maxInstances: 15,
      targetUtilization: 60
    },
    performance: {
      requestsPerSecond: 28.7,
      averageLatency: 450,
      errorRate: 0.015
    }
  }
];

export function AzureAIFoundryIntegration() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useKV<AzureAIConfig>('azure-ai-config', defaultConfig);
  const [metrics, setMetrics] = useKV<AIMetrics>('azure-ai-metrics', {
    totalRequests: 1247,
    successfulRequests: 1223,
    failedRequests: 24,
    averageLatency: 685,
    tokensUsed: 2847293,
    costUsd: 142.36,
    lastRequest: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    uptime: 99.8,
    errorRate: 1.9,
    throughputPerMinute: 42.3
  });
  const [deployments, setDeployments] = useKV<ModelDeployment[]>('azure-ai-deployments', sampleDeployments);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [realTimeProcessing, setRealTimeProcessing] = useState(false);

  const safeConfig = config || defaultConfig;
  const safeMetrics = metrics || {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
    tokensUsed: 0,
    costUsd: 0,
    lastRequest: '',
    uptime: 0,
    errorRate: 0,
    throughputPerMinute: 0
  };
  const safeDeployments = deployments || [];

  // Simulate real-time metrics updates
  useEffect(() => {
    if (connectionStatus === 'connected' && realTimeProcessing) {
      const interval = setInterval(() => {
        setMetrics(prev => {
          const current = prev || safeMetrics;
          return {
            ...current,
            totalRequests: current.totalRequests + Math.floor(Math.random() * 3) + 1,
            successfulRequests: current.successfulRequests + Math.floor(Math.random() * 3) + 1,
            averageLatency: Math.max(200, current.averageLatency + (Math.random() - 0.5) * 50),
            tokensUsed: current.tokensUsed + Math.floor(Math.random() * 1000) + 500,
            costUsd: parseFloat((current.costUsd + Math.random() * 0.5).toFixed(2)),
            lastRequest: new Date().toISOString(),
            throughputPerMinute: Math.max(0, current.throughputPerMinute + (Math.random() - 0.5) * 5)
          };
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [connectionStatus, realTimeProcessing, setMetrics, safeMetrics]);

  const handleConfigChange = (field: keyof AzureAIConfig, value: any) => {
    setConfig(prev => ({
      ...(prev || defaultConfig),
      [field]: value
    }));
  };

  const validateConnection = async (): Promise<boolean> => {
    if (!safeConfig.endpoint || !safeConfig.apiKey || !safeConfig.deploymentName) {
      throw new Error('Missing required configuration: endpoint, API key, and deployment name are required');
    }

    // Validate endpoint format
    if (!safeConfig.endpoint.includes('.openai.azure.com')) {
      throw new Error('Endpoint should be an Azure OpenAI service endpoint (*.openai.azure.com)');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% success rate for demo
    if (Math.random() < 0.9) {
      return true;
    } else {
      throw new Error('Authentication failed. Please verify your API key and endpoint.');
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      await validateConnection();
      setConnectionStatus('connected');
      toast.success('Azure AI Foundry connection successful!');
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
      await validateConnection();
      setConnectionStatus('connected');
      
      // Initialize metrics if successful
      if (!metrics) {
        setMetrics({
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageLatency: 0,
          tokensUsed: 0,
          costUsd: 0,
          lastRequest: new Date().toISOString(),
          uptime: 100,
          errorRate: 0,
          throughputPerMinute: 0
        });
      }
      
      toast.success('Azure AI Foundry integration configured successfully!');
    } catch (error) {
      setConnectionStatus('error');
      toast.error(`Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartRealTimeProcessing = () => {
    setRealTimeProcessing(true);
    toast.success('Real-time AI processing started');
  };

  const handleStopRealTimeProcessing = () => {
    setRealTimeProcessing(false);
    toast.info('Real-time AI processing stopped');
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  const getDeploymentStatusIcon = (status: ModelDeployment['status']) => {
    switch (status) {
      case 'Running':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Deploying':
        return <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />;
      case 'Failed':
        return <Warning className="w-4 h-4 text-red-600" />;
      case 'Stopped':
        return <Pause className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const successRate = safeMetrics.totalRequests > 0 ? 
    ((safeMetrics.successfulRequests / safeMetrics.totalRequests) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Brain className="w-4 h-4 mr-2" />
          Azure AI Foundry
          {connectionStatus === 'connected' && realTimeProcessing && (
            <Sparkle className="w-3 h-3 ml-2 text-blue-600 animate-pulse" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Azure AI Foundry Integration
            {getStatusBadge()}
            {realTimeProcessing && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Lightning className="w-3 h-3 mr-1" />
                Real-time Active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Connection Status</p>
                      <p className="text-lg font-semibold capitalize">{connectionStatus}</p>
                    </div>
                    <Activity className={`w-8 h-8 ${
                      connectionStatus === 'connected' ? 'text-green-600' : 
                      connectionStatus === 'error' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Deployments</p>
                      <p className="text-lg font-semibold">{safeDeployments.filter(d => d.status === 'Running').length}</p>
                    </div>
                    <Robot className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-lg font-semibold">{safeMetrics.totalRequests.toLocaleString()}</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBar className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={successRate} className="w-20" />
                      <span className="text-sm font-medium">{successRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Latency</span>
                    <span className="text-sm font-medium">{Math.round(safeMetrics.averageLatency)}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Throughput</span>
                    <span className="text-sm font-medium">{safeMetrics.throughputPerMinute.toFixed(1)}/min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tokens Used</span>
                    <span className="text-sm font-medium">{safeMetrics.tokensUsed.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Resource Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compute Units</span>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="w-20" />
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <div className="flex items-center gap-2">
                      <Progress value={62} className="w-20" />
                      <span className="text-sm font-medium">62%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage I/O</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-20" />
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Network Bandwidth</span>
                    <div className="flex items-center gap-2">
                      <Progress value={38} className="w-20" />
                      <span className="text-sm font-medium">38%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lightning className="w-5 h-5" />
                    Real-time AI Processing
                  </span>
                  <div className="flex items-center gap-2">
                    {realTimeProcessing ? (
                      <Button size="sm" variant="outline" onClick={handleStopRealTimeProcessing}>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Processing
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleStartRealTimeProcessing} disabled={connectionStatus !== 'connected'}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Processing
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{safeMetrics.throughputPerMinute.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Requests/min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${safeMetrics.costUsd.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{safeMetrics.uptime.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{safeMetrics.errorRate.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <Card className="border-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gear className="w-5 h-5" />
                  Azure AI Foundry Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="endpoint">Azure OpenAI Endpoint *</Label>
                      <Input
                        id="endpoint"
                        placeholder="https://your-resource.openai.azure.com/"
                        value={safeConfig.endpoint}
                        onChange={(e) => handleConfigChange('endpoint', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="apiKey">API Key *</Label>
                      <div className="relative">
                        <Input
                          id="apiKey"
                          type={showApiKey ? 'text' : 'password'}
                          placeholder="Your Azure OpenAI API key"
                          value={safeConfig.apiKey}
                          onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="deploymentName">Deployment Name *</Label>
                      <Input
                        id="deploymentName"
                        placeholder="your-gpt-4-deployment"
                        value={safeConfig.deploymentName}
                        onChange={(e) => handleConfigChange('deploymentName', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="modelName">Model Name</Label>
                      <Select
                        value={safeConfig.modelName}
                        onValueChange={(value) => handleConfigChange('modelName', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4-32k">GPT-4-32K</SelectItem>
                          <SelectItem value="gpt-35-turbo">GPT-3.5-Turbo</SelectItem>
                          <SelectItem value="gpt-35-turbo-16k">GPT-3.5-Turbo-16K</SelectItem>
                          <SelectItem value="text-embedding-ada-002">Text Embedding Ada 002</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subscriptionId">Subscription ID</Label>
                      <Input
                        id="subscriptionId"
                        placeholder="Your Azure subscription ID"
                        value={safeConfig.subscriptionId}
                        onChange={(e) => handleConfigChange('subscriptionId', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="resourceGroup">Resource Group</Label>
                      <Input
                        id="resourceGroup"
                        placeholder="signalcx-rg"
                        value={safeConfig.resourceGroup}
                        onChange={(e) => handleConfigChange('resourceGroup', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="workspaceName">AI Foundry Workspace</Label>
                      <Input
                        id="workspaceName"
                        placeholder="signalcx-ai-workspace"
                        value={safeConfig.workspaceName}
                        onChange={(e) => handleConfigChange('workspaceName', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableRealTimeProcessing"
                        checked={safeConfig.enableRealTimeProcessing}
                        onCheckedChange={(checked) => handleConfigChange('enableRealTimeProcessing', checked)}
                      />
                      <Label htmlFor="enableRealTimeProcessing">Enable Real-time Processing</Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={safeConfig.maxTokens}
                      onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
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
                      onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={safeConfig.batchSize}
                      onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={handleConnect}
                    disabled={isConnecting || !safeConfig.endpoint || !safeConfig.apiKey}
                    className="flex-1"
                  >
                    {isConnecting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <CloudArrowUp className="w-4 h-4 mr-2" />
                        Save & Connect
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !safeConfig.endpoint || !safeConfig.apiKey}
                  >
                    {isTestingConnection ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Sparkle className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Model Deployments</h3>
              <Button size="sm" variant="outline">
                <ArrowClockwise className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid gap-4">
              {safeDeployments.map((deployment) => (
                <Card key={deployment.name} className="border-visible">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{deployment.name}</h4>
                          {getDeploymentStatusIcon(deployment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {deployment.model} v{deployment.version}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(deployment.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                      <Badge 
                        className={
                          deployment.status === 'Running' ? 'bg-green-100 text-green-800' :
                          deployment.status === 'Deploying' ? 'bg-yellow-100 text-yellow-800' :
                          deployment.status === 'Failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {deployment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Requests/sec</div>
                        <div className="text-lg font-semibold">{deployment.performance.requestsPerSecond}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Avg Latency</div>
                        <div className="text-lg font-semibold">{deployment.performance.averageLatency}ms</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Error Rate</div>
                        <div className="text-lg font-semibold">{(deployment.performance.errorRate * 100).toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Instances</div>
                        <div className="text-lg font-semibold">
                          {deployment.scalingConfig.minInstances}-{deployment.scalingConfig.maxInstances}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization Target</span>
                        <span>{deployment.scalingConfig.targetUtilization}%</span>
                      </div>
                      <Progress value={deployment.scalingConfig.targetUtilization} />
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Gear className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <Graph className="w-4 h-4 mr-2" />
                          View Metrics
                        </Button>
                        <Button size="sm" variant="outline">
                          <Activity className="w-4 h-4 mr-2" />
                          Logs
                        </Button>
                      </div>
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
                      <p className="text-2xl font-bold">{safeMetrics.totalRequests.toLocaleString()}</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
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
                    <Clock className="w-8 h-8 text-yellow-600" />
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
                    Set up alerts for key metrics to proactively monitor your AI services
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Error Rate Threshold (%)</Label>
                    <Input type="number" placeholder="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Latency Threshold (ms)</Label>
                    <Input type="number" placeholder="2000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Alert Threshold ($)</Label>
                    <Input type="number" placeholder="1000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Token Usage Alert</Label>
                    <Input type="number" placeholder="1000000" />
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
                    <h4 className="font-medium">Model Configuration</h4>
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
                        onChange={(e) => handleConfigChange('maxRetries', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Timeout (ms)</Label>
                      <Input
                        type="number"
                        value={safeConfig.timeoutMs}
                        onChange={(e) => handleConfigChange('timeoutMs', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Quality & Safety</h4>
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

                <div className="pt-4 border-t">
                  <Button onClick={() => toast.success('Optimization settings saved')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Optimization Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-visible">
              <CardHeader>
                <CardTitle>Cost Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900">Use Batch Processing</h5>
                    <p className="text-sm text-blue-700">
                      Batch multiple requests together to reduce per-request overhead and improve cost efficiency.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-green-900">Optimize Token Usage</h5>
                    <p className="text-sm text-green-700">
                      Reduce input prompt length and use more efficient prompt engineering techniques.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Warning className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-yellow-900">Consider Model Selection</h5>
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
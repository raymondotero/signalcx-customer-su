import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Buildings, Link, Shield, CheckCircle, Warning, Gear } from '@phosphor-icons/react';
import { dynamics365Service, Dynamics365Config } from '@/services/dynamics365Integration';
import { toast } from 'sonner';

export function Dynamics365ConfigDialog() {
  const [config, setConfig] = useState<Dynamics365Config>(dynamics365Service.getConfig());
  const [isOpen, setIsOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(dynamics365Service.isConnected());

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
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
                      <li>• <strong>Rich Context Transfer:</strong> Include AI reasoning, Microsoft solutions, and estimated values</li>
                      <li>• <strong>Smart Probability Calculation:</strong> Auto-calculate close probability based on priority and confidence</li>
                      <li>• <strong>Comprehensive Description:</strong> Transfer account context, suggested actions, and delivery motions</li>
                      <li>• <strong>Seamless Workflow:</strong> Create opportunities from any NBA recommendation with one click</li>
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
                    <li>• <strong>Full Functionality:</strong> Experience the complete workflow without actual D365 connection</li>
                    <li>• <strong>Console Logging:</strong> View all API payloads and responses in browser console</li>
                    <li>• <strong>Toast Notifications:</strong> See realistic success/error messages for all operations</li>
                  </ul>
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
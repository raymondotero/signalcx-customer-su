import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, Sele
import { 
  Database, 
  Globe, 
  CheckC
  Clock,
  Plug,
  ChartBa
  Building
  Sparkle
import { us

  id: string;
  type:
  descripti
  lastSync?:
  icon: 
}
interf
  label: s
  required: boolean;
  options?: string[];
}

    id: 'dynamics-crm',
    type: 'Mi
    description
    icon: <Buil
      { id: 'url', 
      { id: 'clientSec
      { id: 'syncFrequency', label: 'Sync Frequency', type: 'se
    ]
  {
    name: 'Salesforce CR
    category: 'Customer Relat
 

      { id: 'username', labe
      { id: '
      { id: 'obj
  },
    id: 'power-bi',
    type: 'Microsoft',
    description: 'Con
    icon: <ChartBar cla
 

    ]
  {
    name: 'Microsoft Fa
    category: 'Data Platform'
    status: 'not_confi
    fields: [
      { id: 'lakehouseId', label: 'Lakehouse ID', type: 'text', required: f
      { id: 'kqlEndpoint', la
    ]
  {
    name: 'Azure SQL Database',
    category: 'Database',
    status: 'not_configured',
    fields: [
      { id: 'database', label: 'Database Name', type: 'text', required: true },
     
    
  }
    id: 'azure-data-l
    type: 'Microsoft',
    description: 'Access
    icon: <Cloud cla
      { id: 'accountName', label: 'Storage Account Name', type: 'text', requi
      { id: 'accessKey', labe
      { id: 'fileFormat', label: 'File F
  },
    id: 'azure-monitor',
    type: 'Microsoft',
    description: 'Collect application and infrastructure metrics for customer 
    icon: <Activity className="w-5 h-5" />,
      { id: 'subscriptionId', label: 'Subscription ID', type: 'text', required: true },
     
    
  }
    id: 'azure-appl
    type: 'Microsoft'
    description: 'Moni
    icon: <Activity classN
      { id: 'instrumentationKey', label: 'Instrumentation Key', type: 'text', req
      { id: 'customEvents', l
    ]
  {
    name: 'Custom REST API',
    category: 'API Integration',
    status: 'not_configured',
    f
    
   
      { id: 'data
  },
    id: 'azure-synapse
    type: 'Microsoft',
    description: 'Connect to Synapse dedicated and serverless SQL pools for analy
    icon: <Database className
      { id: 'workspaceName', label: 'Synaps
      { id: '
      { id: 'views', label: 'Views/Tables to Query', type: 'textarea', required: true, p
  }

  const [open, setOpen] = useState(false);
  con
  co
  c
  const getStatusIco
      case 'connected':
      case 'pending':
      case 'error':
      default:
    }

    switch (s
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-20
        return <Badge className="bg-red-100 text-red-800 border-red-200">E
        return <Badge variant="outline">Not Configured</Badge>;
  };
  con
    
  }
  const handleFieldChange 
  };
  const handleSaveInte

      // Validate required fields
        .filter(field => fiel

        toast
      }
      // Update integration with form data and mark as pending
        ...selectedIntegration,
        lastSync: new Date().toISOString()

    
   
      // Simulate connec
        const finalIntegra
          status: Math
          lastSync: new Dat

          const updated = (pr
          return updated;

          toast.success(`${selectedIntegration.name} connected successfully`);
          toast.error(`Failed to connect ${selectedIntegration.name}. Please check yo
      }, 3000);
      toast.info(`Connecting to ${selectedIntegration.name}...`);
     
    
   
  };
  const handleTestConnection

    
    setTimeout(() => {
      if (success) {
      } else {
      }
  };
  const connectedCount = safeIntegrations.filter(i => i.status === 'connecte
    .filter(i => i.status === 'connected')

    const existing = safeIntegrations.find(i => i.id === template.id);
    
   
  

  return (
      <DialogTrigger asChild>
          <Gear className="w-4 h-4 mr-2" />
        </Button>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidd
          <DialogTitle className="flex items-center gap-2">
  
        </DialogHeader>

          <div className="lg:col-span-1 space-y-4">
              <CardCo
                  <div 
                    <div className="text-sm text-muted-foreground"
                  <di
                    <div className="text-sm text-muted-foregr
                </d
            </Card>
            <d
                variant={activeTab === 'overview' ? 'defau
     
    

                variant={activeTab === 'configure' ? 'default
                onCli
              >
                Configure
              <Button
                className="w-full justify-start"
              >
                Security
            </

     
    

                    <Button size="sm" variant="outline">
                      Quick Setup Wizard
                    
                      Add Cust
    

                <div className="grid grid-cols-1 md:grid-cols-
                    <CardContent className="p-4">
    

                          <h4 className="font
                        </div>

         
                        Setup Mic
                    </CardContent>

                    <CardContent cl

                        </div>
                          <h4 className="font-semibold text-green-900">Data Platfor
               
       

                        Setup Data Platform
                    </CardContent>

                    <CardC
                        <div className="w-
        

                        </div>
                      <p className="text-sm text-orange-800 mb-3">
                      </p>
                        Setup Third Party

                </div>
                {Object.
                    <div className="flex items-
                      <Badge var
                      </Badge>
                    <div className="grid grid-cols-1 md:grid-col
                        <Card key={integrati
          

                                 
                                }`}>
                                </div>
                         
           

                              <div className="flex ite
                                {getStatusBadge(integration.status)}
                
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
         
               

                                  <span className="font-medium">{
                               
                                  <


                              <Button
                                variant={integration.status ==
     
    

                                <Button size
                                </But

                        </Card>
    
                ))}
            )}
            {activeTab === 'configure' && selectedIntegration 
                <div
                    variant="ghost"
              
                      setSelectedIntegration(null);
       
             
    

                </div>
                <Card className="border
                    <CardTitle className="
                      Connection Configuration

                    </p>
                  <CardContent className="space-y-6">
                      {selectedIntegration.fi
    
                            {field.re
                          
     
                              type={field.type}
               
                              className={`

          
                            >
                             
                              <SelectContent>
                                  <SelectIt
                      
                 
                      
                              id={field.id}
                      
                              rows={3}
                            />
                            <div cl
                        
                       

                              </Label>
                         
                          {field.description && fie
                              <Activity class
                            </p>
                        </div>
                    </div>
                    <div className="border-t pt-6">
                        <Button 
                        
                          disabled={!formData |
                          <Activity className="w-4 h-4 mr-2" />
                        </Button>
                        
                      
                          <C
                   

                </Card>
            )}
            {activeTab === 'security' && (
                <h3 className="text-lg font-semi
                <div className="grid grid-cols-1 md:grid
               
                        <Shield className="w-5 h-5" /
                      </
                    <Ca
                     
                          <Badge className="bg-green-100 text-green-800">
                        <div className="flex ite
                          <Badge className="bg-green-100
                        <div className="flex it
               
                      </div>
                  </Card>
                  <Card
                     
                        Access Control
                    </CardHeader>
                      <div className="space-y-3">
               
                        </div>
                        
                       
                  
                

                </div>
                <Card className="border-visible">
                    <CardTitle>Compliance 
                  <CardContent>
                      {['SOC 2 Type II', 'GDPR', 'HIPAA', 'ISO 2700
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb
                          <p classNa
                      ))}
                  </CardContent>
              </div>
          </div>

  );



































































































































































































































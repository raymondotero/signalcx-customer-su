import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Lightbu
  Brain, 
  Database,
  Users,
  Shield,
  FileText,
  ChatCir
} from '@p
interface G
  title
    {

         

     
        
             
         
                  <ChartLine className="w-4 h-4" />
                </CardTitle>
              <C
                
          
            </Card>
          
            <h4 className=
              <li>1. Start by selecting an account from the main dashbo
              <li>3. Use the Business Value Das
              <li>5. Execute workflow
          </div>
      )
    {
      title: 'Account Management',
      content: (
          <div>
            <p className="text-sm text-muted-foreground 
            </p>
          
            
            </CardHeader>
              <div classNa
                <span className="text-xs">Health score 70-100, low risk
              <div className="flex items-center gap
                <span className="text-xs
              <div className
                <span class
            </CardContent>
          
            <CardHeader>
            </CardHeader>
              <li>5. Execute workflow
          </div>
      )
    {
      title: 'Account Management',
      content: (
          <div>
            <p className="text-sm text-muted-foreground 
            </p>
          
            
            </CardHeader>
              <div classNa
                <span className="text-xs">Health score 70-100, low risk
              <div className="flex items-center gap
                <span className="text-xs
              <div className
                <span class
            </CardContent>
          
            <CardHeader>
            </CardHeader>
              <p><strong>ARR:</strong> Annual Recurring 
                </div>
               
                </div>
                  <Badge variant="outline" className="bg-red-5
                </div>
            </Ca
          
          
            </CardHeader>
              <p><strong
              <p><strong>3. Approve:</strong> Use the adaptive card to approve or 
              <p><strong>
          </Card>
          <div className="bg-purple-50 p-4 rounded-lg b
            <p className="text-xs text-purple-700">
              contract data, and industry benchmarks to generate contextually 
          </div>
      )
    {
      title: 'Business Value Signals',
      content: (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
            </p>
          
            <Card classNam
                <
          
              </CardHeader>
                <p><stro
                <p><strong>Data Signals:</strong> Usage patterns, fe
                <p><stron
            </Card>
            <Card className="border-visible">
                <CardTitle className="text-sm flex items-center gap-2">
                  Signal Criticality
              </CardHeader>
                <div className="flex items-center gap-2">
                  <span>Cr
                <
          
                <div className="flex items-center gap-2">
                  <span>Good: Performing well</span>
              </CardContent>
          </div>
          <Card className="border-visible">
              <CardTitle className="text-sm">Setting Custom Targets</CardTitle>
            <CardContent className="text-xs space-y-2">
              <p>
              <p
          </Ca
       
      
     
              <l
          </div>
      )
    {
      title: 'Workflow Automation',
      content: 
          <div>
            <p className="text-sm text-muted-foreground mb-4">
            </p>
          
            <Car
          
              <div className="space-y-2">
                  <p cla
                </div>
                  <p clas
                </div>
                  <p className="font-medi
                </div>
                  <p className="font-medium text-xs">Risk Mitigation</p>
                </div>
            </CardCont
          
            <CardHeader>
            </CardHeader>
              <p><stro
              <p><strong>3. Approval Gate:</strong> Micro
              <p><strong>5. Monitoring:</strong> Track progress and outcomes in real-time</p>
          </Card>
          <div classNa
            <p className="text-xs text-orange-700">
              demonstrates the end-to-end process from AI recommendation to execution.
          </div>
      )
    {
      title: 'Data Integra
      content: (
          
            <p className="text-sm text-mute
            </p>
          
            <CardHeader>
            </CardHeader>
              <p><strong>CRM Systems:</strong> Salesforce, Dynamics 365, HubSpot</p>
              <p><strong>Data Platforms:</strong> Snowflake, Databricks, AWS, GCP</p>
              <p><strong>Monitoring Tools:</strong> Azure Monitor, Datadog, Splunk</p>
          </Card>
          <Card className="border-visible">
              <CardTitle c
            <Card
          
              <p><strong>4. Test:</strong> Validate connections and data quality
            </CardContent>
          
            <CardHeader>
            </CardHeader>
              <p
              <p
            </
       
    },
     
      icon: <Shield 
        <div className="space-y-4">
            <h3 className="text-lg font-semi
              Qu
          </div>
          <Card
              <CardTitle className="text-sm">AI Processing Issues</CardTitle>
            <CardContent className="text-xs space-y-2">
              <p><strong>Solution:</strong> Check system health status and refresh the page</p>
              <p
              <S
          
          </Card>
          <Card className="border-visible">
              <CardTitle c
            <CardContent className="text-xs space-y-2">
              <p><strong>Solution:</strong> Use "Re
              <p><strong>Issue:</st
              <Separator cla
              <p><strong>So
          </Card>
          <Card className="border-visible">
              <CardTitle className="text-sm">Performance Optimization</CardTitle>
            <CardContent className="text-xs space-y-2">
              <p>• Clear browser cache if experiencing slow loading</p>
              <p>• Use "Reset Demo" to clear accumulated data</p>
          </Card>
      )
    {
      title: 'Support & Training',
      content: (
          <div>
            <p className="text-sm text-muted-for
            </p>
          
            <Card className
                <CardTitle className="text-sm flex items-
                  Support Contacts
              </CardHeader>
                <p><strong>Technical Support:</strong> support@signal
                <p><st
              </CardContent>
            
              <CardHeader>
                  <Vid
                </CardTitle>
              <CardContent className="text-xs space-y-2">
                <p>• AI workflow training modules</p
                <p>• C
            </Card>
          
            <Car
          
              </CardTitle>
            <CardContent
              <p>• Signal catalog reference guide</p>
              <p>• Data m
            </CardContent>
          
            <h4 className="font-medium text-sm mb-2 text-blue-800
              Pro Tips for Success
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Join t
              <li
          
        </div>
    }

    <Dialog open={open} onOpenChange={setOpen}>
        <Button 
          size="sm"
        >
          Guide M
      </DialogTr
        <Dialo
       
      
     
          {/* Sidebar 
            <ScrollArea className="
                {guideSections.map((secti
                
                    className="w-fu
               
                      {section.icon}
                    </div>
                ))}
            </Sc
          
          
              <div className="pr-4">
              </div>
          </div>
        
          <div className="flex items-center gap
              <Play className="w-3 h-3 mr
            </Badge>
          </div>
          <div className="flex items-center gap-2">
              variant=
              onClick
              Close Guide
          </div>
      </DialogContent>
  );














































































































































































































































































































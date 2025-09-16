import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  CurrencyDollar, 
  TrendUp, 
  Clock, 
  Target, 
  Users, 
  CheckCircle,
  ArrowRight,
  Lightning,
  Briefcase,
  Shield,
  Calendar
} from '@phosphor-icons/react';
import { Account, ExpansionOpportunity } from '@/types';
import { MeetingScheduler } from './MeetingScheduler';
import { ROICalculator } from './ROICalculator';

interface ExpansionOpportunitiesDialogProps {
  account: Account;
  children: React.ReactNode;
}

export function ExpansionOpportunitiesDialog({ account, children }: ExpansionOpportunitiesDialogProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<ExpansionOpportunity | null>(null);

  if (!account.expansionOpportunities || account.expansionOpportunities.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const getPriorityColor = (probability: string) => {
    switch (probability) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'upsell': return <TrendUp className="w-4 h-4" />;
      case 'cross-sell': return <ArrowRight className="w-4 h-4" />;
      case 'user-expansion': return <Users className="w-4 h-4" />;
      case 'feature-upgrade': return <Lightning className="w-4 h-4" />;
      case 'geographic-expansion': return <Target className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CurrencyDollar className="w-5 h-5 text-green-600" />
            Expansion Opportunities - {account.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opportunities List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Available Opportunities</h3>
              <Badge className="bg-green-50 text-green-700 border-green-200">
                Total: {formatCurrency(account.expansionOpportunity)}
              </Badge>
            </div>

            {account.expansionOpportunities.map((opportunity, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedOpportunity === opportunity 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedOpportunity(opportunity)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(opportunity.category)}
                      <CardTitle className="text-base">{opportunity.description}</CardTitle>
                    </div>
                    <Badge className={getPriorityColor(opportunity.probability)}>
                      {opportunity.probability} probability
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CurrencyDollar className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">{formatCurrency(opportunity.value)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{opportunity.timeline}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {opportunity.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <MeetingScheduler opportunity={opportunity} account={account}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule Meeting
                      </Button>
                    </MeetingScheduler>
                    <ROICalculator 
                      onCalculationComplete={(solution, metrics) => {
                        console.log('ROI calculated for opportunity:', opportunity.description, solution, metrics);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Opportunity Details */}
          <div className="space-y-4">
            {selectedOpportunity ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Opportunity Details</h3>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {getCategoryIcon(selectedOpportunity.category)}
                      {selectedOpportunity.description}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Value</p>
                        <p className="text-xl font-semibold text-green-600">
                          {formatCurrency(selectedOpportunity.value)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                        <p className="text-lg font-medium">{selectedOpportunity.timeline}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="activities" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="activities">Activities</TabsTrigger>
                        <TabsTrigger value="solutions">Solutions</TabsTrigger>
                        <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
                        <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
                        <TabsTrigger value="success">Success</TabsTrigger>
                      </TabsList>

                      <TabsContent value="activities" className="space-y-3">
                        <h4 className="font-medium">Required CSAM/AE Activities</h4>
                        <div className="space-y-2">
                          {selectedOpportunity.requiredActivities.map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{activity}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="solutions" className="space-y-3">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium mb-2">Microsoft Solutions</h4>
                            <div className="space-y-1">
                              {selectedOpportunity.microsoftSolutions.map((solution, idx) => (
                                <Badge key={idx} variant="outline" className="mr-2 mb-1">
                                  {solution}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Delivery Motions</h4>
                            <div className="space-y-1">
                              {selectedOpportunity.deliveryMotions.map((motion, idx) => (
                                <Badge key={idx} className="mr-2 mb-1 bg-blue-50 text-blue-700 border-blue-200">
                                  {motion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="roi" className="space-y-3">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Business Case Analysis</h4>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Estimated Value: {formatCurrency(selectedOpportunity.value)}
                            </Badge>
                          </div>
                          
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-3">
                              Use our automated ROI calculator to build a compelling business case for this expansion opportunity.
                            </p>
                            <ROICalculator 
                              onCalculationComplete={(solution, metrics) => {
                                console.log('ROI calculated for:', solution, metrics);
                                // Could integrate with opportunity tracking here
                              }}
                            />
                          </div>

                          <div className="space-y-3">
                            <h5 className="font-medium text-sm">Quick Business Impact Estimate</h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-600 font-medium">Potential Annual Savings</p>
                                <p className="text-lg font-semibold text-blue-800">
                                  {formatCurrency(selectedOpportunity.value * 0.3)}
                                </p>
                              </div>
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs text-green-600 font-medium">Productivity Gain</p>
                                <p className="text-lg font-semibold text-green-800">15-25%</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <h5 className="font-medium text-sm text-orange-800 mb-2">💡 Business Case Tips</h5>
                            <ul className="text-xs text-orange-700 space-y-1">
                              <li>• Focus on measurable productivity gains and cost reductions</li>
                              <li>• Include competitive advantages and risk mitigation benefits</li>
                              <li>• Align technology capabilities with business strategy</li>
                              <li>• Consider implementation timeline and change management</li>
                            </ul>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="stakeholders" className="space-y-3">
                        <h4 className="font-medium">Key Stakeholders Required</h4>
                        <div className="space-y-2">
                          {selectedOpportunity.stakeholdersRequired.map((stakeholder, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">{stakeholder}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="success" className="space-y-3">
                        <h4 className="font-medium">Success Criteria</h4>
                        <div className="space-y-2">
                          {selectedOpportunity.successCriteria.map((criteria, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{criteria}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-3">
                          <h4 className="font-medium">Next Steps</h4>
                          <MeetingScheduler 
                            opportunity={selectedOpportunity} 
                            account={account}
                          >
                            <Button className="w-full">
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Stakeholder Meeting
                            </Button>
                          </MeetingScheduler>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="flex items-center justify-center h-64">
                <CardContent className="text-center">
                  <ArrowRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select an opportunity from the left to view detailed information
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
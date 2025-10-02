import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  FloppyDisk, 
  ArrowSquareOut, 
  CurrencyDollar, 
  Calendar, 
  User, 
  Target, 
  TrendUp,
  CheckCircle,
  Clock,
  Warning,
  ChartBar,
  Buildings,
  Note,
  Activity,
  Phone,
  EnvelopeSimple,
  ShareNetwork,
  Plus,
  Minus
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface Opportunity {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  closeDate: string;
  owner: string;
  source: 'signal_expansion' | 'account_growth' | 'retention_save' | 'new_business' | 'referral';
  d365RecordId?: string;
  created: string;
  lastModified: string;
  notes: string[];
  signals: string[];
  nextAction: string;
  competitorInfo?: string;
  budgetConfirmed: boolean;
  decisionMaker: string;
  timeline: string;
}

interface D365OpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: Opportunity | null;
  onSave?: (opportunity: Opportunity) => void;
}

interface ActivityItem {
  id: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'task';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status?: 'completed' | 'pending' | 'overdue';
}

export const D365OpportunityDialog: React.FC<D365OpportunityDialogProps> = ({
  open,
  onOpenChange,
  opportunity,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedOpportunity, setEditedOpportunity] = useState<Opportunity | null>(null);
  const [newNote, setNewNote] = useState('');
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Initialize edited opportunity when dialog opens
  useEffect(() => {
    if (opportunity) {
      setEditedOpportunity({ ...opportunity });
      
      // Generate sample activities
      const sampleActivities: ActivityItem[] = [
        {
          id: 'act-1',
          type: 'call',
          title: 'Discovery Call',
          description: 'Initial needs assessment and technical requirements discussion',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user: opportunity.owner,
          status: 'completed'
        },
        {
          id: 'act-2',
          type: 'email',
          title: 'Proposal Follow-up',
          description: 'Sent detailed proposal and ROI analysis to decision maker',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user: opportunity.owner,
          status: 'completed'
        },
        {
          id: 'act-3',
          type: 'meeting',
          title: 'Executive Presentation',
          description: 'Present final solution to executive committee',
          timestamp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          user: opportunity.owner,
          status: 'pending'
        },
        {
          id: 'act-4',
          type: 'task',
          title: 'Contract Review',
          description: 'Legal team to review final contract terms',
          timestamp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          user: 'Legal Team',
          status: 'pending'
        }
      ];
      
      setActivities(sampleActivities);
    }
  }, [opportunity]);

  const handleSave = async () => {
    if (!editedOpportunity) return;
    
    setLoading(true);
    
    // Simulate D365 API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedOpportunity = {
      ...editedOpportunity,
      lastModified: new Date().toISOString()
    };
    
    onSave?.(updatedOpportunity);
    setEditMode(false);
    setLoading(false);
    
    toast.success('Opportunity updated in Dynamics 365 CRM');
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !editedOpportunity) return;
    
    const updatedOpportunity = {
      ...editedOpportunity,
      notes: [...editedOpportunity.notes, newNote.trim()]
    };
    
    setEditedOpportunity(updatedOpportunity);
    setNewNote('');
    
    // Add activity for the note
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'note',
      title: 'Note Added',
      description: newNote.trim(),
      timestamp: new Date().toISOString(),
      user: 'Current User',
      status: 'completed'
    };
    
    setActivities([newActivity, ...activities]);
    toast.success('Note added to opportunity');
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospecting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'qualification': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'proposal': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'negotiation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed_won': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed_lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note': return <Note className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <EnvelopeSimple className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'task': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!opportunity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <Buildings className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Dynamics 365 CRM - Opportunity</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {opportunity.d365RecordId || 'Not yet synced to D365'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!editMode ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditMode(false);
                      setEditedOpportunity(opportunity);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FloppyDisk className="w-4 h-4 mr-1" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://dynamics.microsoft.com', '_blank')}
              >
                <ArrowSquareOut className="w-4 h-4 mr-1" />
                Open in D365
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="details" className="h-full flex flex-col">
            <TabsList className="flex-shrink-0 grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="details" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Opportunity Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Opportunity Name</label>
                        {editMode ? (
                          <Input
                            value={editedOpportunity?.title || ''}
                            onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, title: e.target.value } : null)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm mt-1 p-2 bg-muted rounded">{opportunity.title}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Account</label>
                        <p className="text-sm mt-1 p-2 bg-muted rounded">{opportunity.accountName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Value</label>
                          {editMode ? (
                            <Input
                              type="number"
                              value={editedOpportunity?.value || 0}
                              onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, value: parseInt(e.target.value) || 0 } : null)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm mt-1 p-2 bg-muted rounded font-semibold text-green-600">
                              ${(opportunity.value / 1000000).toFixed(1)}M
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium">Probability</label>
                          {editMode ? (
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={editedOpportunity?.probability || 0}
                              onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, probability: parseInt(e.target.value) || 0 } : null)}
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{opportunity.probability}%</span>
                              </div>
                              <Progress value={opportunity.probability} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Stage</label>
                          {editMode ? (
                            <Select
                              value={editedOpportunity?.stage || 'prospecting'}
                              onValueChange={(value) => setEditedOpportunity(prev => prev ? { ...prev, stage: value as any } : null)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="prospecting">Prospecting</SelectItem>
                                <SelectItem value="qualification">Qualification</SelectItem>
                                <SelectItem value="proposal">Proposal</SelectItem>
                                <SelectItem value="negotiation">Negotiation</SelectItem>
                                <SelectItem value="closed_won">Closed Won</SelectItem>
                                <SelectItem value="closed_lost">Closed Lost</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={getStageColor(opportunity.stage)} variant="outline">
                              {opportunity.stage.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium">Close Date</label>
                          {editMode ? (
                            <Input
                              type="date"
                              value={editedOpportunity?.closeDate?.split('T')[0] || ''}
                              onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, closeDate: e.target.value } : null)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm mt-1 p-2 bg-muted rounded">
                              {new Date(opportunity.closeDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Owner</label>
                        <p className="text-sm mt-1 p-2 bg-muted rounded flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {opportunity.owner}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Stakeholders & Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Stakeholders & Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Decision Maker</label>
                        {editMode ? (
                          <Input
                            value={editedOpportunity?.decisionMaker || ''}
                            onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, decisionMaker: e.target.value } : null)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm mt-1 p-2 bg-muted rounded">{opportunity.decisionMaker}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Timeline</label>
                        {editMode ? (
                          <Input
                            value={editedOpportunity?.timeline || ''}
                            onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, timeline: e.target.value } : null)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm mt-1 p-2 bg-muted rounded">{opportunity.timeline}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Budget Confirmed</label>
                        {opportunity.budgetConfirmed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-600" />
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Next Action</label>
                        {editMode ? (
                          <Textarea
                            value={editedOpportunity?.nextAction || ''}
                            onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, nextAction: e.target.value } : null)}
                            className="mt-1"
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm mt-1 p-2 bg-muted rounded">{opportunity.nextAction}</p>
                        )}
                      </div>

                      {opportunity.competitorInfo && (
                        <div>
                          <label className="text-sm font-medium">Competition</label>
                          <p className="text-sm mt-1 p-2 bg-orange-50 border border-orange-200 rounded">
                            <Warning className="w-4 h-4 inline mr-1 text-orange-600" />
                            {opportunity.competitorInfo}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Signals and Notes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendUp className="w-5 h-5" />
                        AI Signals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {opportunity.signals.map((signal, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            <span className="text-sm">{signal}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Note className="w-5 h-5" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {editMode && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a note..."
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                            />
                            <Button size="sm" onClick={handleAddNote}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {(editedOpportunity?.notes || opportunity.notes).map((note, index) => (
                            <div key={index} className="p-2 bg-muted rounded text-sm">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activities" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`p-2 rounded-full ${getActivityStatusColor(activity.status)} bg-current/10`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{activity.title}</h4>
                              <Badge variant="outline" className={getActivityStatusColor(activity.status)}>
                                {activity.status || 'completed'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{activity.user}</span>
                              <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChartBar className="w-5 h-5" />
                        AI Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800">High Win Probability</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Strong technical champion support and confirmed budget indicate {opportunity.probability}% likelihood of closing.
                        </p>
                      </div>

                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendUp className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Expansion Opportunity</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Usage signals indicate potential for additional 40% expansion within 12 months.
                        </p>
                      </div>

                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-orange-800">Time Sensitive</span>
                        </div>
                        <p className="text-sm text-orange-700">
                          Executive presentation scheduled. Prepare competitive differentiation materials.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Risk Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Competition Risk</span>
                            <span className="text-sm text-orange-600">Medium</span>
                          </div>
                          <Progress value={40} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Budget Risk</span>
                            <span className="text-sm text-green-600">Low</span>
                          </div>
                          <Progress value={15} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Timeline Risk</span>
                            <span className="text-sm text-yellow-600">Medium</span>
                          </div>
                          <Progress value={35} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Technical Risk</span>
                            <span className="text-sm text-green-600">Low</span>
                          </div>
                          <Progress value={10} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="forecast" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CurrencyDollar className="w-5 h-5" />
                      Revenue Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-700">
                          ${((opportunity.value * opportunity.probability / 100) / 1000000).toFixed(1)}M
                        </div>
                        <p className="text-sm text-green-600">Weighted Value</p>
                      </div>

                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">
                          {Math.ceil((new Date(opportunity.closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <p className="text-sm text-blue-600">Days to Close</p>
                      </div>

                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-700">
                          {opportunity.probability}%
                        </div>
                        <p className="text-sm text-purple-600">Win Probability</p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <h4 className="font-medium">Quarterly Impact</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">Q1 2024 Pipeline</span>
                          <span className="font-medium">${(opportunity.value / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">Expected Revenue</span>
                          <span className="font-medium text-green-600">
                            ${((opportunity.value * opportunity.probability / 100) / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">Expansion Potential</span>
                          <span className="font-medium text-blue-600">
                            ${((opportunity.value * 0.4) / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
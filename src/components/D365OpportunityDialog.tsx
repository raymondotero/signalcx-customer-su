import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  X,
  ArrowSquareOut,
  Calendar,
  Target,
  CheckCircle,
  Warning,
  Buildings,
  Activity,
  Envelope,
  Plus,
  TrendUp,
  User,
  Clock,
  ChartBar,
  NotePencil
} from '@phosphor-icons/react';

interface D365Opportunity {
  id: string;
  accountName: string;
  value: number;
  probability: number;
  owner: string;
  d365RecordId?: string;
  lastModified: string;
  signals: string[];
  competitorInfo?: string;
  decisionMaker?: string;
  stage: string;
  closeDate: string;
  timeline?: string;
  notes?: string[];
}

interface D365OpportunityDialogProps {
  open: boolean;
  opportunity: D365Opportunity | null;
  onOpenChange: (open: boolean) => void;
}

interface ActivityItem {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status?: 'completed' | 'pending' | 'scheduled';
}

const D365OpportunityDialog: React.FC<D365OpportunityDialogProps> = ({
  open,
  opportunity,
  onOpenChange
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedOpportunity, setEditedOpportunity] = useState<D365Opportunity | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (opportunity) {
      setEditedOpportunity({ ...opportunity });
      // Generate sample activities
      const sampleActivities: ActivityItem[] = [
        {
          id: 'act-1',
          type: 'call',
          title: 'Initial Discovery Call',
          description: 'Initial discovery call with stakeholders to understand requirements',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          user: opportunity.owner,
          status: 'completed'
        },
        {
          id: 'act-2',
          type: 'email',
          title: 'Proposal Follow-up',
          description: 'Sent detailed proposal with pricing and implementation timeline',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          user: opportunity.owner,
          status: 'completed'
        },
        {
          id: 'act-3',
          type: 'meeting',
          title: 'Contract Discussion',
          description: 'Present final proposal and discuss contract terms',
          timestamp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          user: opportunity.owner,
          status: 'scheduled'
        }
      ];
      setActivities(sampleActivities);
    }
  }, [opportunity]);

  const handleSaveChanges = () => {
    if (!editedOpportunity) return;

    const updatedOpportunity = {
      ...editedOpportunity,
      lastModified: new Date().toISOString()
    };

    setEditMode(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !editedOpportunity) return;

    const updatedOpportunity = {
      ...editedOpportunity,
      notes: [...(editedOpportunity.notes || []), newNote]
    };
    setEditedOpportunity(updatedOpportunity);
    setNewNote('');

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'note',
      title: 'Note Added',
      description: newNote,
      timestamp: new Date().toISOString(),
      user: 'Current User',
      status: 'completed'
    };
    setActivities([newActivity, ...activities]);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospecting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'proposal': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'negotiation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'closed_won': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed_lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Activity className="w-4 h-4" />;
      case 'email': return <Envelope className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'note': return <NotePencil className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'scheduled': return 'text-blue-600';
      case 'pending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (!opportunity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Buildings className="w-5 h-5 text-primary" />
              <div>
                <DialogTitle className="text-xl">Dynamics 365 CRM - Opportunity</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {opportunity.d365RecordId || 'Not yet synced to D365'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveChanges}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditMode(true)}
                >
                  Edit Opportunity
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open('#', '_blank')}
              >
                <ArrowSquareOut className="w-4 h-4 mr-1" />
                Open in D365
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Opportunity Details</TabsTrigger>
            <TabsTrigger value="activities">Activities & Timeline</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Account Name</label>
                    {editMode ? (
                      <Input
                        value={editedOpportunity?.accountName || ''}
                        onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, accountName: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded">{opportunity.accountName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Opportunity Value</label>
                    {editMode ? (
                      <Input
                        type="number"
                        value={editedOpportunity?.value || 0}
                        onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, value: Number(e.target.value) } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded font-medium">
                        ${opportunity.value.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Probability</label>
                    {editMode ? (
                      <div className="mt-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editedOpportunity?.probability || 0}
                          onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, probability: Number(e.target.value) } : null)}
                        />
                        <Progress value={editedOpportunity?.probability || 0} className="mt-2" />
                      </div>
                    ) : (
                      <div className="mt-1">
                        <p className="p-2 bg-muted rounded">{opportunity.probability}%</p>
                        <Progress value={opportunity.probability} className="mt-2" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stage</label>
                    {editMode ? (
                      <Select
                        value={editedOpportunity?.stage || ''}
                        onValueChange={(value) => setEditedOpportunity(prev => prev ? { ...prev, stage: value } : null)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospecting">Prospecting</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="closed_won">Closed Won</SelectItem>
                          <SelectItem value="closed_lost">Closed Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <Badge className={getStageColor(opportunity.stage)}>
                          {opportunity.stage.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
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
                      <p className="mt-1 p-2 bg-muted rounded">
                        {new Date(opportunity.closeDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Key Stakeholders & Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Key Stakeholders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Opportunity Owner</label>
                    {editMode ? (
                      <Input
                        value={editedOpportunity?.owner || ''}
                        onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, owner: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded">{opportunity.owner}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Decision Maker</label>
                    {editMode ? (
                      <Input
                        value={editedOpportunity?.decisionMaker || ''}
                        onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, decisionMaker: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded">{opportunity.decisionMaker || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timeline</label>
                    <div className="mt-1 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Discovery Complete</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="text-sm">Proposal Pending</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Competitor Info</label>
                    {editMode ? (
                      <Textarea
                        value={editedOpportunity?.competitorInfo || ''}
                        onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, competitorInfo: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded text-sm">
                        {opportunity.competitorInfo || 'No competitor information'}
                      </p>
                    )}
                  </div>
                  {opportunity.signals && opportunity.signals.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Connected Signals</label>
                      <div className="mt-2 space-y-1">
                        {opportunity.signals.map((signal, index) => (
                          <Badge key={index} variant="outline" className="mr-2">
                            {signal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Signals Analysis */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendUp className="w-5 h-5" />
                    Signal Analysis & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {opportunity.signals.map((signal, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{signal}</p>
                          <p className="text-xs text-muted-foreground">
                            Impact: High confidence signal for opportunity progression
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <NotePencil className="w-5 h-5" />
                    Notes & Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a note about this opportunity..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {(editedOpportunity?.notes || []).map((note, index) => (
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

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${getActivityStatusColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.title}</h4>
                          <Badge variant="outline" className={getActivityStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Win Probability Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBar className="w-5 h-5" />
                    Win Probability Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Engagement Score</span>
                    <span className="text-lg font-bold text-green-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-sm text-green-700">
                    High engagement based on recent activities and stakeholder involvement
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Timeline Alignment</span>
                    <span className="text-lg font-bold text-blue-600">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <p className="text-sm text-blue-700">
                    Timeline matches typical sales cycle for this account size
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Budget Fit</span>
                    <span className="text-lg font-bold text-orange-600">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-sm text-orange-700">
                    Opportunity value within expected budget range for account
                  </p>
                </CardContent>
              </Card>

              {/* Key Success Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Key Success Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Executive Sponsor Identified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Budget Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Warning className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Technical Validation Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Legal Review Scheduled</span>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Forecast */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendUp className="w-5 h-5" />
                    Revenue Forecast Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${Math.round(opportunity.value * (opportunity.probability / 100)).toLocaleString()}
                      </div>
                      <p className="text-sm text-green-700 mt-1">Weighted Revenue</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">Q2 2024</div>
                      <p className="text-sm text-blue-700 mt-1">Expected Close</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        ${Math.round(opportunity.value * 0.3).toLocaleString()}
                      </div>
                      <p className="text-sm text-purple-700 mt-1">Annual Expansion</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Risk Mitigation Recommendations</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">Schedule technical validation call</span>
                        <Badge variant="outline">High Priority</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">Confirm decision timeline with stakeholders</span>
                        <Badge variant="outline">Medium Priority</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default D365OpportunityDialog;
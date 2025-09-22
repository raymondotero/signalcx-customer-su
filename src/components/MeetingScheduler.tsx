import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Envelope, MapPin, VideoCamera, Plus, ChatTeardropText } from '@phosphor-icons/react';
import { ExpansionOpportunity, Account } from '@/types';
import { toast } from 'sonner';

interface MeetingSchedulerProps {
  opportunity: ExpansionOpportunity;
  account: Account;
  children: React.ReactNode;
}

interface MeetingDetails {
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  description: string;
  meetingType: 'teams' | 'onsite' | 'phone';
  location?: string;
  agenda: string[];
}

export function MeetingScheduler({ opportunity, account, children }: MeetingSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetails>({
    title: `Expansion Discussion: ${opportunity.description}`,
    date: '',
    time: '',
    duration: '60',
    attendees: [],
    description: `Strategic meeting to discuss ${opportunity.description} expansion opportunity with ${account.name}.`,
    meetingType: 'teams',
    location: '',
    agenda: [
      'Opportunity overview and business case',
      'Technical requirements discussion',
      'Timeline and implementation planning',
      'Next steps and follow-up actions'
    ]
  });
  const [newAttendee, setNewAttendee] = useState('');
  const [newAgendaItem, setNewAgendaItem] = useState('');

  // Suggest relevant attendees based on stakeholders and account team
  const suggestedAttendees = [
    account.csam,
    account.ae,
    ...opportunity.stakeholdersRequired.map(role => `${role} (${account.name})`),
    'Solution Architect',
    'Technical Specialist',
    'Customer Success Manager'
  ];

  const today = new Date().toISOString().split('T')[0];

  const addAttendee = () => {
    if (newAttendee && !meetingDetails.attendees.includes(newAttendee)) {
      setMeetingDetails(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee]
      }));
      setNewAttendee('');
    }
  };

  const removeAttendee = (attendee: string) => {
    setMeetingDetails(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== attendee)
    }));
  };

  const addSuggestedAttendee = (attendee: string) => {
    if (!meetingDetails.attendees.includes(attendee)) {
      setMeetingDetails(prev => ({
        ...prev,
        attendees: [...prev.attendees, attendee]
      }));
    }
  };

  const addAgendaItem = () => {
    if (newAgendaItem && !meetingDetails.agenda.includes(newAgendaItem)) {
      setMeetingDetails(prev => ({
        ...prev,
        agenda: [...prev.agenda, newAgendaItem]
      }));
      setNewAgendaItem('');
    }
  };

  const removeAgendaItem = (item: string) => {
    setMeetingDetails(prev => ({
      ...prev,
      agenda: prev.agenda.filter(a => a !== item)
    }));
  };

  const scheduleMeeting = () => {
    // In a real app, this would integrate with calendar systems
    const meetingData = {
      ...meetingDetails,
      accountId: account.id,
      opportunityId: `${opportunity.category}-${Date.now()}`,
      estimatedValue: opportunity.value,
      createdAt: new Date().toISOString()
    };
    
    console.log('Meeting scheduled:', meetingData);
    
    toast.success('Meeting scheduled successfully! Calendar invite will be sent.');
    setIsOpen(false);
  };

  const canSchedule = meetingDetails.date && meetingDetails.time && meetingDetails.attendees.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule Expansion Meeting
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Meeting Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <VideoCamera className="w-4 h-4" />
                  Meeting Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input
                    id="title"
                    value={meetingDetails.title}
                    onChange={(e) => setMeetingDetails(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      min={today}
                      value={meetingDetails.date}
                      onChange={(e) => setMeetingDetails(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={meetingDetails.time}
                      onChange={(e) => setMeetingDetails(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select
                      value={meetingDetails.duration}
                      onValueChange={(value) => setMeetingDetails(prev => ({ ...prev, duration: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Meeting Type</Label>
                    <Select
                      value={meetingDetails.meetingType}
                      onValueChange={(value: 'teams' | 'onsite' | 'phone') => 
                        setMeetingDetails(prev => ({ ...prev, meetingType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teams">Microsoft Teams</SelectItem>
                        <SelectItem value="onsite">On-site Meeting</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {meetingDetails.meetingType === 'onsite' && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter meeting location"
                      value={meetingDetails.location || ''}
                      onChange={(e) => setMeetingDetails(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={meetingDetails.description}
                    onChange={(e) => setMeetingDetails(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Attendees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Add Attendee</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email address"
                      value={newAttendee}
                      onChange={(e) => setNewAttendee(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addAttendee()}
                    />
                    <Button onClick={addAttendee} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Current Attendees */}
                {meetingDetails.attendees.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Attendees</Label>
                    <div className="flex flex-wrap gap-2">
                      {meetingDetails.attendees.map((attendee, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeAttendee(attendee)}
                        >
                          {attendee} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Attendees */}
                <div className="space-y-2">
                  <Label>Suggested Attendees</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedAttendees.filter(attendee => !meetingDetails.attendees.includes(attendee)).map((attendee, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addSuggestedAttendee(attendee)}
                      >
                        + {attendee}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Agenda & Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ChatTeardropText className="w-4 h-4" />
                  Meeting Agenda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Add Agenda Item</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter agenda item"
                      value={newAgendaItem}
                      onChange={(e) => setNewAgendaItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addAgendaItem()}
                    />
                    <Button onClick={addAgendaItem} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Agenda Items</Label>
                  <div className="space-y-2">
                    {meetingDetails.agenda.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span className="text-sm">{index + 1}. {item}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAgendaItem(item)}
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meeting Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
                  <h4 className="font-medium text-lg mb-2">{meetingDetails.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{meetingDetails.description}</p>
                  
                  {meetingDetails.date && meetingDetails.time && (
                    <div className="mb-3">
                      <p className="text-sm text-blue-700 font-medium">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {new Date(`${meetingDetails.date}T${meetingDetails.time}`).toLocaleDateString()} at{' '}
                        {new Date(`${meetingDetails.date}T${meetingDetails.time}`).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} ({meetingDetails.duration} min)
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {meetingDetails.meetingType === 'teams' ? '🎥 Teams Meeting' : 
                         meetingDetails.meetingType === 'onsite' ? '🏢 On-site Meeting' : '📞 Phone Call'}
                      </p>
                    </div>
                  )}

                  {meetingDetails.attendees.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-purple-700">
                        <Users className="w-4 h-4 inline mr-1" />
                        Attendees ({meetingDetails.attendees.length})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {meetingDetails.attendees.slice(0, 3).join(', ')}
                        {meetingDetails.attendees.length > 3 && ` +${meetingDetails.attendees.length - 3} more`}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <MapPin className="w-3 h-3 mr-1" />
                      ${(opportunity.value / 1000000).toFixed(1)}M Opportunity
                    </Badge>
                    <Button 
                      onClick={scheduleMeeting}
                      disabled={!canSchedule}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Envelope className="w-4 h-4 mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
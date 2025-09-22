import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, VideoCamera, MapPin, Envelope, Users, CheckCircle } from '@phosphor-icons/react';
import { Account } from '@/types';
import { toast } from 'sonner';
import { outlookIntegration } from '@/services/outlookIntegration';
import { useKV } from '@github/spark/hooks';

interface QuickMeetingSchedulerProps {
  account: Account;
  children: React.ReactNode;
}

const MEETING_TYPES = {
  'quarterly-review': {
    title: 'Quarterly Business Review',
    duration: '90',
    agenda: [
      'Account performance review',
      'Health score analysis',
      'Expansion opportunities discussion',
      'Success plan updates',
      'Q&A and next steps'
    ]
  },
  'health-check': {
    title: 'Account Health Check',
    duration: '60',
    agenda: [
      'Current health score review',
      'Risk factors identification',
      'Mitigation strategies',
      'Support needs assessment'
    ]
  },
  'expansion-discussion': {
    title: 'Expansion Opportunity Discussion',
    duration: '60',
    agenda: [
      'Growth opportunities overview',
      'Solution alignment',
      'Implementation timeline',
      'Business case development'
    ]
  },
  'renewal-planning': {
    title: 'Contract Renewal Planning',
    duration: '75',
    agenda: [
      'Contract status review',
      'Renewal timeline',
      'Value demonstration',
      'Terms discussion',
      'Next steps planning'
    ]
  },
  'escalation-resolution': {
    title: 'Issue Resolution Meeting',
    duration: '45',
    agenda: [
      'Issue overview and impact',
      'Resolution strategy',
      'Timeline and responsibilities',
      'Follow-up plan'
    ]
  }
};

export function QuickMeetingScheduler({ account, children }: QuickMeetingSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [meetingType, setMeetingType] = useState<keyof typeof MEETING_TYPES>('quarterly-review');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [format, setFormat] = useState<'teams' | 'onsite' | 'phone'>('teams');
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [integrations] = useKV<any[]>('integrations', []);
  
  const selectedMeetingType = MEETING_TYPES[meetingType];
  
  // Check if Outlook integration is available
  const outlookConnected = integrations?.find(i => i.id === 'microsoft-outlook' && i.status === 'connected');

  useEffect(() => {
    if (outlookConnected) {
      outlookIntegration.setIntegrations(integrations || []);
    }
  }, [integrations, outlookConnected]);

  const loadAvailableTimeSlots = async () => {
    if (!outlookConnected) return;
    
    setIsLoadingSlots(true);
    try {
      const attendees = [
        `${account.csam}@company.com`,
        `${account.ae}@company.com`
      ];
      
      const slots = await outlookIntegration.getAvailableTimeSlots(
        attendees,
        parseInt(selectedMeetingType.duration),
        7
      );
      
      setAvailableSlots(slots);
      
      if (slots.length > 0) {
        toast.success(`Found ${slots.length} available time slots`);
      }
    } catch (error) {
      console.error('Failed to load time slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleScheduleWithOutlook = async () => {
    if (!date || !time) {
      toast.error('Please select a date and time for the meeting');
      return;
    }

    if (!outlookConnected) {
      toast.error('Outlook integration not configured. Using fallback method.');
      handleScheduleMeeting('outlook');
      return;
    }

    try {
      const success = await outlookIntegration.scheduleCustomerMeeting(
        account.name,
        account.csam,
        account.ae,
        selectedMeetingType.title,
        parseInt(selectedMeetingType.duration)
      );

      if (success) {
        toast.success(`Meeting scheduled successfully via Outlook integration`);
        setIsOpen(false);
      } else {
        toast.error('Failed to schedule meeting via Outlook integration');
      }
    } catch (error) {
      console.error('Error scheduling with Outlook:', error);
      toast.error('Error scheduling meeting. Please try again.');
    }
  };

  const generateCalendarLink = (platform: 'outlook' | 'google') => {
    const startDate = new Date(`${date}T${time}`);
    const endDate = new Date(startDate.getTime() + parseInt(selectedMeetingType.duration) * 60000);
    
    const formatDateTime = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const details = encodeURIComponent(
      `Account: ${account.name}\n` +
      `Industry: ${account.industry}\n` +
      `ARR: $${(account.arr / 1000000).toFixed(1)}M\n` +
      `Health Score: ${account.healthScore}/100\n` +
      `Status: ${account.status}\n\n` +
      `CSAM: ${account.csam}\n` +
      `AE: ${account.ae}\n\n` +
      `Meeting Type: ${format.toUpperCase()}\n` +
      `Duration: ${selectedMeetingType.duration} minutes\n\n` +
      `Agenda:\n${selectedMeetingType.agenda.map(item => `• ${item}`).join('\n')}`
    );

    const attendeeEmails = [account.csam, account.ae].filter(Boolean).join(',');
    const title = `${selectedMeetingType.title} - ${account.name}`;
    
    if (platform === 'outlook') {
      return `https://outlook.live.com/calendar/0/deeplink/compose?` +
        `subject=${encodeURIComponent(title)}&` +
        `startdt=${formatDateTime(startDate)}&` +
        `enddt=${formatDateTime(endDate)}&` +
        `body=${details}&` +
        `to=${encodeURIComponent(attendeeEmails)}`;
    } else {
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&` +
        `text=${encodeURIComponent(title)}&` +
        `dates=${formatDateTime(startDate)}/${formatDateTime(endDate)}&` +
        `details=${details}&` +
        `add=${encodeURIComponent(attendeeEmails)}`;
    }
  };

  const handleScheduleMeeting = (platform: 'outlook' | 'google') => {
    if (!date || !time) {
      toast.error('Please select a date and time for the meeting');
      return;
    }

    const url = generateCalendarLink(platform);
    window.open(url, '_blank');
    
    toast.success(`${platform === 'outlook' ? 'Outlook' : 'Google'} calendar invitation created for ${account.name}`);
    setIsOpen(false);
  };

  const getMeetingIcon = () => {
    switch (format) {
      case 'teams': return <VideoCamera className="w-4 h-4" />;
      case 'onsite': return <MapPin className="w-4 h-4" />;
      case 'phone': return <Clock className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'bg-green-100 text-green-800 border-green-200';
      case 'Watch': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'At Risk': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Schedule Meeting - {account.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Industry</p>
                  <p>{account.industry}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">ARR</p>
                  <p className="font-mono">${(account.arr / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Health Score</p>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          account.healthScore >= 80 ? 'bg-green-500' : 
                          account.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${account.healthScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{account.healthScore}</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(account.status)}>
                    {account.status}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">CSAM</p>
                  <p>{account.csam}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">AE</p>
                  <p>{account.ae}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meeting Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Meeting Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Meeting Purpose</Label>
                    <Select
                      value={meetingType}
                      onValueChange={(value: keyof typeof MEETING_TYPES) => setMeetingType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quarterly-review">Quarterly Business Review</SelectItem>
                        <SelectItem value="health-check">Account Health Check</SelectItem>
                        <SelectItem value="expansion-discussion">Expansion Discussion</SelectItem>
                        <SelectItem value="renewal-planning">Renewal Planning</SelectItem>
                        <SelectItem value="escalation-resolution">Issue Resolution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        min={today}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select
                      value={format}
                      onValueChange={(value: 'teams' | 'onsite' | 'phone') => setFormat(value)}
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
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Meeting Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Duration: {selectedMeetingType.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getMeetingIcon()}
                      <span className="font-medium">Format: {format.charAt(0).toUpperCase() + format.slice(1)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Agenda</Label>
                    <div className="space-y-1">
                      {selectedMeetingType.agenda.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="font-medium text-muted-foreground">{index + 1}.</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Attendees</Label>
                    <div className="space-y-1">
                      <Badge variant="secondary" className="mr-2 mb-1">
                        <Users className="w-3 h-3 mr-1" />
                        CSAM: {account.csam}
                      </Badge>
                      <Badge variant="secondary" className="mr-2 mb-1">
                        <Users className="w-3 h-3 mr-1" />
                        AE: {account.ae}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Schedule Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {getMeetingIcon()}
                Create Calendar Invitation
                {outlookConnected && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Outlook Connected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outlookConnected && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Available Time Slots</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={loadAvailableTimeSlots}
                      disabled={isLoadingSlots}
                    >
                      {isLoadingSlots ? 'Loading...' : 'Find Available Times'}
                    </Button>
                  </div>
                  
                  {availableSlots.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto">
                      {availableSlots.slice(0, 8).map((slot, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            setDate(slot.toISOString().split('T')[0]);
                            setTime(slot.toTimeString().slice(0, 5));
                          }}
                        >
                          {slot.toLocaleDateString()} {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {date && time && (
                <div className="text-center p-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {new Date(`${date}T${time}`).toLocaleDateString()} at{' '}
                    {new Date(`${date}T${time}`).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} ({selectedMeetingType.duration} min)
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                {outlookConnected ? (
                  <Button
                    onClick={handleScheduleWithOutlook}
                    className="w-full"
                    disabled={!date || !time}
                  >
                    <Envelope className="w-4 h-4 mr-2" />
                    Schedule with Outlook Integration
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleScheduleMeeting('outlook')}
                      className="w-full"
                      disabled={!date || !time}
                    >
                      <Envelope className="w-4 h-4 mr-2" />
                      Outlook Calendar
                    </Button>
                    <Button
                      onClick={() => handleScheduleMeeting('google')}
                      variant="outline"
                      className="w-full"
                      disabled={!date || !time}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Google Calendar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
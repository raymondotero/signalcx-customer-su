interface Integration {
  id: string;
  name: string;
  category: string;
  type: 'Microsoft' | 'Third Party';
  description: string;
  status: 'connected' | 'pending' | 'error' | 'not_configured' | 'testing' | 'authenticating';
  lastSync?: string;
  lastError?: string;
  icon: React.ReactNode;
  fields: any[];
  credentials?: Record<string, string>;
  connectionData?: {
    lastTestDate?: string;
    dataQuality?: number;
    recordCount?: number;
    apiVersion?: string;
    permissions?: string[];
  };
  realTimeCapable?: boolean;
  authMethod?: 'oauth' | 'api_key' | 'basic' | 'certificate';
  oauthUrl?: string;
  documentationUrl?: string;
}

interface CalendarEvent {
  subject: string;
  body: string;
  start: Date;
  end: Date;
  attendees: string[];
  location?: string;
  isOnlineMeeting?: boolean;
  onlineMeetingProvider?: 'teamsForBusiness';
}

interface EmailMessage {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  importance?: 'low' | 'normal' | 'high';
}

export class OutlookIntegrationService {
  private static instance: OutlookIntegrationService;
  private integrations: Integration[] = [];
  private initialized = false;

  static getInstance(): OutlookIntegrationService {
    if (!OutlookIntegrationService.instance) {
      OutlookIntegrationService.instance = new OutlookIntegrationService();
    }
    return OutlookIntegrationService.instance;
  }

  async initialize() {
    if (this.initialized) return;
    this.integrations = [];
    this.initialized = true;
  }

  setIntegrations(integrations: Integration[]) {
    this.integrations = integrations;
  }

  getOutlookIntegration(): Integration | null {
    return this.integrations.find(i => i.id === 'microsoft-outlook' && i.status === 'connected') || null;
  }

  async createCalendarEvent(event: CalendarEvent): Promise<boolean> {
    const outlookIntegration = this.getOutlookIntegration();
    
    if (!outlookIntegration) {
      console.warn('Outlook integration not configured or connected');
      return false;
    }

    if (outlookIntegration.credentials?.enableCalendar !== 'true') {
      console.warn('Calendar integration is not enabled');
      return false;
    }

    try {
      // In a real implementation, this would call Microsoft Graph API
      await this.simulateGraphAPICall('POST', '/me/events', event, outlookIntegration);
      
      console.log('Calendar event created successfully:', event.subject);
      return true;
      
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return false;
    }
  }

  async sendEmail(email: EmailMessage): Promise<boolean> {
    const outlookIntegration = this.getOutlookIntegration();
    
    if (!outlookIntegration) {
      console.warn('Outlook integration not configured or connected');
      return false;
    }

    if (outlookIntegration.credentials?.enableEmail !== 'true') {
      console.warn('Email integration is not enabled');
      return false;
    }

    try {
      // In a real implementation, this would call Microsoft Graph API
      await this.simulateGraphAPICall('POST', '/me/sendMail', email, outlookIntegration);
      
      console.log('Email sent successfully:', email.subject);
      return true;
      
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async scheduleCustomerMeeting(
    accountName: string,
    csam: string,
    ae: string,
    purpose: string,
    duration: number = 60
  ): Promise<boolean> {
    const now = new Date();
    const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const event: CalendarEvent = {
      subject: `${purpose} - ${accountName}`,
      body: `
        <h3>${purpose}</h3>
        <p><strong>Account:</strong> ${accountName}</p>
        <p><strong>CSAM:</strong> ${csam}</p>
        <p><strong>AE:</strong> ${ae}</p>
        
        <h4>Meeting Agenda:</h4>
        <ul>
          <li>Account health review</li>
          <li>Recent activity discussion</li>
          <li>Action items and next steps</li>
          <li>Q&A session</li>
        </ul>
        
        <p><em>This meeting was automatically scheduled by SignalCX based on account signals.</em></p>
      `,
      start: startTime,
      end: endTime,
      attendees: [
        `${csam}@company.com`,
        `${ae}@company.com`
      ],
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness'
    };

    return this.createCalendarEvent(event);
  }

  async sendHealthScoreAlert(
    accountName: string,
    currentScore: number,
    previousScore: number,
    recipients: string[]
  ): Promise<boolean> {
    const scoreChange = currentScore - previousScore;
    const alertType = scoreChange < -10 ? 'Critical' : scoreChange < -5 ? 'Warning' : 'Information';
    
    const email: EmailMessage = {
      to: recipients,
      subject: `[${alertType}] Health Score Alert: ${accountName}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: ${scoreChange < -10 ? '#D13438' : scoreChange < -5 ? '#FF8C00' : '#0078D4'};">
            Health Score Alert
          </h2>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>${accountName}</h3>
            <p><strong>Current Health Score:</strong> ${currentScore}/100</p>
            <p><strong>Previous Health Score:</strong> ${previousScore}/100</p>
            <p><strong>Change:</strong> <span style="color: ${scoreChange < 0 ? '#D13438' : '#107C10'};">
              ${scoreChange > 0 ? '+' : ''}${scoreChange} points
            </span></p>
          </div>
          
          <h4>Recommended Actions:</h4>
          <ul>
            <li>Review recent account activity and signals</li>
            <li>Schedule customer check-in meeting</li>
            <li>Analyze potential risk factors</li>
            <li>Generate Next Best Action recommendations</li>
          </ul>
          
          <p>
            <a href="${window.location.origin}" style="background: #0078D4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View in SignalCX
            </a>
          </p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This alert was automatically generated by SignalCX based on account health score changes.
          </p>
        </div>
      `,
      isHtml: true,
      importance: scoreChange < -10 ? 'high' : 'normal'
    };

    return this.sendEmail(email);
  }

  async sendExpansionOpportunityNotification(
    accountName: string,
    opportunityValue: string,
    solution: string,
    recipients: string[]
  ): Promise<boolean> {
    const email: EmailMessage = {
      to: recipients,
      subject: `🚀 Expansion Opportunity: ${accountName} - ${opportunityValue}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #107C10;">New Expansion Opportunity Identified</h2>
          
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #107C10;">
            <h3 style="margin: 0; color: #0d5d0d;">${accountName}</h3>
            <p style="margin: 10px 0;"><strong>Solution:</strong> ${solution}</p>
            <p style="margin: 10px 0;"><strong>Estimated Value:</strong> <span style="font-size: 18px; font-weight: bold; color: #107C10;">${opportunityValue}</span></p>
          </div>
          
          <h4>Why Now?</h4>
          <ul>
            <li>Account signals indicate readiness for expansion</li>
            <li>Strong technical adoption and engagement</li>
            <li>Positive health score trends</li>
            <li>Strategic alignment with customer initiatives</li>
          </ul>
          
          <h4>Next Steps:</h4>
          <ol>
            <li>Review detailed opportunity analysis in SignalCX</li>
            <li>Schedule expansion discussion with stakeholders</li>
            <li>Prepare tailored solution presentation</li>
            <li>Coordinate with technical teams for demos</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}" style="background: #107C10; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Opportunity Details
            </a>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This opportunity was identified by SignalCX AI based on account signals and engagement patterns.
          </p>
        </div>
      `,
      isHtml: true,
      importance: 'high'
    };

    return this.sendEmail(email);
  }

  async scheduleQBR(
    accountName: string,
    csam: string,
    ae: string,
    customerContacts: string[] = []
  ): Promise<boolean> {
    const qbrDate = new Date();
    qbrDate.setDate(qbrDate.getDate() + 7); // Schedule for next week
    qbrDate.setHours(14, 0, 0, 0); // 2 PM

    const endTime = new Date(qbrDate.getTime() + 90 * 60 * 1000); // 90 minutes

    const event: CalendarEvent = {
      subject: `Quarterly Business Review - ${accountName}`,
      body: `
        <h2>Quarterly Business Review</h2>
        <p><strong>Account:</strong> ${accountName}</p>
        
        <h3>Meeting Agenda:</h3>
        <ol>
          <li><strong>Welcome & Introductions</strong> (10 min)</li>
          <li><strong>Account Performance Review</strong> (20 min)
            <ul>
              <li>Health score trends and analysis</li>
              <li>Usage metrics and adoption patterns</li>
              <li>Key achievements and milestones</li>
            </ul>
          </li>
          <li><strong>Success Stories & Value Realization</strong> (15 min)</li>
          <li><strong>Challenges & Support Needs</strong> (15 min)</li>
          <li><strong>Roadmap & Future Plans</strong> (20 min)
            <ul>
              <li>Upcoming features and releases</li>
              <li>Expansion opportunities</li>
              <li>Strategic initiatives alignment</li>
            </ul>
          </li>
          <li><strong>Action Items & Next Steps</strong> (10 min)</li>
        </ol>
        
        <h3>Attendees:</h3>
        <ul>
          <li><strong>Microsoft Team:</strong> ${csam} (CSAM), ${ae} (AE)</li>
          ${customerContacts.length > 0 ? `<li><strong>Customer Team:</strong> ${customerContacts.join(', ')}</li>` : ''}
        </ul>
        
        <p><em>Meeting materials and agenda will be shared 24 hours in advance.</em></p>
      `,
      start: qbrDate,
      end: endTime,
      attendees: [
        `${csam}@company.com`,
        `${ae}@company.com`,
        ...customerContacts
      ],
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness'
    };

    return this.createCalendarEvent(event);
  }

  private async simulateGraphAPICall(
    method: string,
    endpoint: string,
    data: any,
    integration: Integration
  ): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
    
    // Log the simulated API call
    console.log('📧 Outlook Graph API Call Simulated:', {
      method,
      endpoint,
      timestamp: new Date().toISOString(),
      tenantId: integration.credentials?.tenantId,
      permissions: integration.credentials?.permissions?.split(',').map(p => p.trim()),
      dataType: endpoint.includes('/events') ? 'Calendar Event' : 
                endpoint.includes('/sendMail') ? 'Email' : 'Unknown',
      integration: {
        calendarEnabled: integration.credentials?.enableCalendar === 'true',
        emailEnabled: integration.credentials?.enableEmail === 'true',
        timeZone: integration.credentials?.timeZone
      }
    });

    // Simulate occasional API failures (3% chance)
    if (Math.random() < 0.03) {
      throw new Error('Microsoft Graph API throttling. Please try again later.');
    }
  }

  async getAvailableTimeSlots(
    attendeeEmails: string[],
    duration: number = 60,
    daysAhead: number = 7
  ): Promise<Date[]> {
    const outlookIntegration = this.getOutlookIntegration();
    
    if (!outlookIntegration) {
      console.warn('Outlook integration not configured');
      return [];
    }

    try {
      // In a real implementation, this would call Microsoft Graph findMeetingTimes API
      await this.simulateGraphAPICall('POST', '/me/calendar/getSchedule', 
        { schedules: attendeeEmails, duration }, outlookIntegration);
      
      // Simulate available time slots
      const slots: Date[] = [];
      for (let day = 1; day <= daysAhead; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);
        
        // Generate 2-3 available slots per day (business hours)
        const hoursOptions = [9, 10, 14, 15, 16];
        const availableHours = hoursOptions.slice(0, Math.floor(Math.random() * 3) + 2);
        
        for (const hour of availableHours) {
          const slot = new Date(date);
          slot.setHours(hour, 0, 0, 0);
          slots.push(slot);
        }
      }
      
      return slots.sort((a, b) => a.getTime() - b.getTime());
      
    } catch (error) {
      console.error('Failed to get available time slots:', error);
      return [];
    }
  }
}

// Export singleton instance
export const outlookIntegration = OutlookIntegrationService.getInstance();

// Initialize on module load
outlookIntegration.initialize();
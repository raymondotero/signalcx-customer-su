import { useKV } from '@github/spark/hooks';

interface Integration {
  id: string;
  status: 'conn
  lastError?: strin
  fields: any[];
  connectionData?: {
    dataQuality?: number;
    apiVersion?: str
  };
  authMethod?: 'oauth' |
  documentationU

  title: string;
  type: 'info' | 'success'
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

interface TeamsMessage {
  title: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  buttons?: Array<{
  private initial
    value: string;
    style?: 'default' | 'positive' | 'destructive';
  }>;
 

  async initialize() {
  type: "AdaptiveCard";
  version: "1.5";
  body: any[];
      this.integra
}

export class TeamsIntegrationService {
  private static instance: TeamsIntegrationService;
  private integrations: Integration[] = [];

  static getInstance(): TeamsIntegrationService {
    if (!TeamsIntegrationService.instance) {
      TeamsIntegrationService.instance = new TeamsIntegrationService();
    }
    return TeamsIntegrationService.instance;
   

  async initialize() {
    // Load integration settings
    try {
      if (typeof window !== 'undefined' && window.spark?.kv) {
        const storedIntegrations = await window.spark.kv.get('integrations') || [];
        this.integrations = Array.isArray(storedIntegrations) ? storedIntegrations : [];
      await th
        this.integrations = [];
      r
    } catch (error) {
      console.error('Failed to load Teams integration settings:', error);
      this.integrations = [];
  }
  }

  getTeamsIntegration(): Integration | null {
    return this.integrations.find(i => i.id === 'microsoft-teams' && i.status === 'connected') || null;
  }

  async sendMessage(message: TeamsMessage): Promise<boolean> {
    const teamsIntegration = this.getTeamsIntegration();
    
    if (!teamsIntegration) {
      console.warn('Teams integration not configured or connected');
      return false;
    }

    try {
      // Create adaptive card for the message
      const card = this.createAdaptiveCard(message);
    co
      // In a real implementation, this would send via Microsoft Graph API
      // For demo purposes, we'll simulate the API call
      await this.simulateTeamsAPICall(card, teamsIntegration);
      
      console.log('Teams message sent successfully:', message.title);
    const card: Ad
      
      body: [
      console.error('Failed to send Teams message:', error);
      return false;
    }
   

                  type: "
    title: string,
                    {
    details: Record<string, any>,
    approvalId: string
  ): Promise<boolean> {
    const teamsIntegration = this.getTeamsIntegration();
    
    if (!teamsIntegration) {
      console.warn('Teams integration not configured for approvals');
      return false;
    }

    try {
      const card = this.createApprovalCard(title, description, details, approvalId);
      await this.simulateTeamsAPICall(card, teamsIntegration);
      
      console.log('Teams approval card sent:', title);
                  
      
            }
      console.error('Failed to send Teams approval card:', error);
        {
    }
   

  private createAdaptiveCard(message: TeamsMessage): AdaptiveCard {
    const colorMap = {
      info: '#0078D4',
      success: '#107C10',
      warning: '#FF8C00',
      error: '#D13438'
      

    const card: AdaptiveCard = {
      type: "AdaptiveCard",
      version: "1.5",
      body: [
        {
          type: "Container",
          style: "emphasis",
          items: [
        style
              type: "ColumnSet",
    }
                {
                  type: "Column",
                  width: "auto",
                  items: [
                    {
    approvalId: string
                      url: "https://cdn-icons-png.flaticon.com/512/2111/2111615.png",
      type: "AdaptiveCard",
                      style: "Person"
                    }
                  ]
          items: [
                {
              text: "🔔 Approval 
                  width: "stretch",
                  items: [
                    {
          items: [
                      text: "SignalCX",
                      weight: "Bolder",
                      size: "Medium"
                    },
                    {
                      type: "TextBlock",
                      text: new Date().toLocaleString(),
              text: description,
                      color: "Accent"
                    }
                  ]
        {
              ]
          ite
          ]
          
        {
          type: "Container",
          items: [
        }
              type: "TextBlock",
              text: message.title,
              size: "Large",
              weight: "Bolder",
              color: message.type === 'error' ? 'Attention' : 'Default'
          },
            {
        {
              text: message.text,
              wrap: true,
              size: "Medium"
            }
          ]
        }
      ]
    };

    // Add action buttons if provided
    if (message.buttons && message.buttons.length > 0) {
      card.actions = message.buttons.map(button => ({
        type: "Action.Submit",
        title: button.text,
        data: {
    // Log the simulated API ca
          style: button.style || 'default'
      card
        style: button.style === 'positive' ? 'positive' : 
               button.style === 'destructive' ? 'destructive' : 'default'
      }));
     

    return card;
  }

  private createApprovalCard(
  async sendNBAApp
    description: string,
    details: Record<string, any>,
    approvalId: string
  ): AdaptiveCard {
    const card: AdaptiveCard = {
      type: "AdaptiveCard",
      version: "1.5",
      body: [
        {
      },
          style: "emphasis",
  }
            {
              type: "TextBlock",
              text: "🔔 Approval Required",
    accountId: string
              weight: "Bolder",
              color: "Attention"
            }
          ]
        },
      but
          type: "Container",
          value: `
            {
              type: "TextBlock",
              text: title,
              size: "Large",
              weight: "Bolder"
            },
            {
              type: "TextBlock",
              text: description,
    solution: string,
              size: "Medium"
    return th
          ]
      type
        {
          type: "Container",
          style: "accent",
        },
            {
              type: "FactSet",
              facts: Object.entries(details).map(([key, value]) => ({
                title: key,
                value: String(value)
              }))
            }
export cons
        }
teamsInt
      actions: [

          type: "Action.Submit",
          title: "✅ Approve",
          data: {
            action: "approve",
            approvalId: approvalId

          style: "positive"


          type: "Action.Submit",
          title: "❌ Reject",
          data: {
            action: "reject",
            approvalId: approvalId
          },
          style: "destructive"
        },
        {
          type: "Action.OpenUrl",
          title: "📋 View Details",
          url: `${window.location.origin}?account=${details.accountId || ''}`

      ]



  }

  private async simulateTeamsAPICall(card: AdaptiveCard, integration: Integration): Promise<void> {

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Log the simulated API call
    console.log('🔗 Teams API Call Simulated:', {
      endpoint: integration.credentials?.webhookUrl || 'Graph API',
      cardType: card.body[0]?.style === 'emphasis' ? 'Notification' : 'Standard',
      timestamp: new Date().toISOString(),
      integration: {
        tenantId: integration.credentials?.tenantId,
        teamId: integration.credentials?.defaultTeamId,
        messageFormat: integration.credentials?.messageFormat

    });

    // Simulate occasional API failures (5% chance)

      throw new Error('Teams API rate limit exceeded. Please try again later.');

  }

  async sendNBAApproval(

    nbaTitle: string,

    accountId: string

    return this.sendApprovalCard(
      `Next Best Action Approval: ${accountName}`,
      `A new Next Best Action has been generated and requires approval before execution.`,

        'Account': accountName,
        'Action': nbaTitle,
        'Estimated Impact': impact,

        'Generated': new Date().toLocaleString()

      `nba-${accountId}-${Date.now()}`

  }

  async sendHealthAlert(
    accountName: string,
    currentScore: number,
    previousScore: number,
    accountId: string
  ): Promise<boolean> {
    const scoreChange = currentScore - previousScore;
    const alertType = scoreChange < -10 ? 'error' : scoreChange < -5 ? 'warning' : 'info';
    
    return this.sendMessage({
      title: `Health Score Alert: ${accountName}`,
      text: `Account health score changed from ${previousScore} to ${currentScore} (${scoreChange > 0 ? '+' : ''}${scoreChange} points)`,
      type: alertType,
      buttons: [
        {
          text: 'View Account',
          value: `view-account-${accountId}`,

        },

          text: 'Generate Action Plan',
          value: `generate-plan-${accountId}`,
          style: 'positive'

      ]

  }

  async sendExpansionOpportunity(

    opportunityValue: string,

    accountId: string
  ): Promise<boolean> {
    return this.sendMessage({
      title: `🚀 Expansion Opportunity: ${accountName}`,
      text: `New expansion opportunity identified with estimated value of ${opportunityValue} for ${solution}.`,

      buttons: [

          text: 'Review Opportunity',
          value: `review-opportunity-${accountId}`,
          style: 'positive'

        {
          text: 'Schedule Meeting',
          value: `schedule-meeting-${accountId}`,
          style: 'default'
        }

    });

}

// Export singleton instance
export const teamsIntegration = TeamsIntegrationService.getInstance();


teamsIntegration.initialize();
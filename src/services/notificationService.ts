import { teamsIntegration } from './teamsIntegration';
import { outlookIntegration } from './outlookIntegration';
import { Account } from '@/types';

export interface NotificationContext {
  integrations: any[];
  currentUser?: {
    email: string;
    name: string;
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private context: NotificationContext = { integrations: [] };

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  setContext(context: NotificationContext) {
    this.context = context;
    teamsIntegration.setIntegrations(context.integrations);
    outlookIntegration.setIntegrations(context.integrations);
  }

  async notifyHealthScoreChange(
    account: Account,
    previousScore: number,
    newScore: number
  ): Promise<void> {
    const scoreChange = newScore - previousScore;
    const isSignificant = Math.abs(scoreChange) >= 5;
    const isCritical = scoreChange <= -10;
    
    if (!isSignificant) return;

    const recipients = [
      `${account.csam}@company.com`,
      `${account.ae}@company.com`
    ];

    const promises: Promise<boolean>[] = [];

    // Send Teams notification
    const teamsConnected = this.context.integrations.find(
      i => i.id === 'microsoft-teams' && i.status === 'connected'
    );

    if (teamsConnected) {
      promises.push(
        teamsIntegration.sendHealthAlert(
          account.name,
          newScore,
          previousScore,
          account.id
        )
      );
    }

    // Send Outlook email for critical changes
    const outlookConnected = this.context.integrations.find(
      i => i.id === 'microsoft-outlook' && i.status === 'connected'
    );

    if (outlookConnected && isCritical) {
      promises.push(
        outlookIntegration.sendHealthScoreAlert(
          account.name,
          newScore,
          previousScore,
          recipients
        )
      );
    }

    try {
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      console.log(`Health score notification sent to ${successCount}/${promises.length} channels`);
    } catch (error) {
      console.error('Error sending health score notifications:', error);
    }
  }

  async notifyExpansionOpportunity(
    account: Account,
    opportunityValue: string,
    solution: string
  ): Promise<void> {
    const recipients = [
      `${account.csam}@company.com`,
      `${account.ae}@company.com`,
      'expansion-team@company.com'
    ];

    const promises: Promise<boolean>[] = [];

    // Teams notification
    const teamsConnected = this.context.integrations.find(
      i => i.id === 'microsoft-teams' && i.status === 'connected'
    );

    if (teamsConnected) {
      promises.push(
        teamsIntegration.sendExpansionOpportunity(
          account.name,
          opportunityValue,
          solution,
          account.id
        )
      );
    }

    // Outlook email notification
    const outlookConnected = this.context.integrations.find(
      i => i.id === 'microsoft-outlook' && i.status === 'connected'
    );

    if (outlookConnected) {
      promises.push(
        outlookIntegration.sendExpansionOpportunityNotification(
          account.name,
          opportunityValue,
          solution,
          recipients
        )
      );
    }

    try {
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      console.log(`Expansion opportunity notification sent to ${successCount}/${promises.length} channels`);
    } catch (error) {
      console.error('Error sending expansion opportunity notifications:', error);
    }
  }

  async scheduleQBR(account: Account): Promise<void> {
    const outlookConnected = this.context.integrations.find(
      i => i.id === 'microsoft-outlook' && i.status === 'connected'
    );

    if (!outlookConnected) {
      console.warn('Outlook integration not available for QBR scheduling');
      return;
    }

    try {
      const success = await outlookIntegration.scheduleQBR(
        account.name,
        account.csam,
        account.ae,
        [] // Customer contacts would be fetched from CRM
      );

      if (success) {
        console.log(`QBR scheduled successfully for ${account.name}`);
        
        // Also send Teams notification if available
        const teamsConnected = this.context.integrations.find(
          i => i.id === 'microsoft-teams' && i.status === 'connected'
        );

        if (teamsConnected) {
          await teamsIntegration.sendMessage({
            title: `📅 QBR Scheduled: ${account.name}`,
            text: `Quarterly Business Review has been scheduled for ${account.name}. Check your Outlook calendar for details.`,
            type: 'info',
            buttons: [
              {
                text: 'View Calendar',
                value: 'view-calendar',
                style: 'default'
              }
            ]
          });
        }
      }
    } catch (error) {
      console.error('Error scheduling QBR:', error);
    }
  }

  async notifyRiskEscalation(
    account: Account,
    riskLevel: 'medium' | 'high' | 'critical',
    riskFactors: string[]
  ): Promise<void> {
    const recipients = [
      `${account.csam}@company.com`,
      `${account.ae}@company.com`
    ];

    // Add management for high/critical risks
    if (riskLevel === 'high' || riskLevel === 'critical') {
      recipients.push('cs-management@company.com');
    }

    const promises: Promise<boolean>[] = [];

    // Teams alert
    const teamsConnected = this.context.integrations.find(
      i => i.id === 'microsoft-teams' && i.status === 'connected'
    );

    if (teamsConnected) {
      promises.push(
        teamsIntegration.sendMessage({
          title: `⚠️ Risk Alert: ${account.name}`,
          text: `${riskLevel.toUpperCase()} risk level detected for ${account.name}. Risk factors: ${riskFactors.join(', ')}`,
          type: riskLevel === 'critical' ? 'error' : 'warning',
          buttons: [
            {
              text: 'View Account',
              value: `view-account-${account.id}`,
              style: 'default'
            },
            {
              text: 'Create Action Plan',
              value: `create-plan-${account.id}`,
              style: 'positive'
            }
          ]
        })
      );
    }

    // Email for high/critical risks
    const outlookConnected = this.context.integrations.find(
      i => i.id === 'microsoft-outlook' && i.status === 'connected'
    );

    if (outlookConnected && (riskLevel === 'high' || riskLevel === 'critical')) {
      promises.push(
        outlookIntegration.sendEmail({
          to: recipients,
          subject: `🚨 ${riskLevel.toUpperCase()} Risk Alert: ${account.name}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2 style="color: ${riskLevel === 'critical' ? '#D13438' : '#FF8C00'};">
                Risk Alert - Immediate Action Required
              </h2>
              
              <div style="background: ${riskLevel === 'critical' ? '#fee' : '#ffe'} ; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${riskLevel === 'critical' ? '#D13438' : '#FF8C00'};">
                <h3 style="margin: 0;">${account.name}</h3>
                <p style="margin: 10px 0;"><strong>Risk Level:</strong> <span style="text-transform: uppercase; font-weight: bold;">${riskLevel}</span></p>
                <p style="margin: 10px 0;"><strong>Health Score:</strong> ${account.healthScore}/100</p>
                <p style="margin: 10px 0;"><strong>ARR:</strong> $${(account.arr / 1000000).toFixed(1)}M</p>
              </div>
              
              <h4>Risk Factors Identified:</h4>
              <ul>
                ${riskFactors.map(factor => `<li>${factor}</li>`).join('')}
              </ul>
              
              <h4>Immediate Actions Required:</h4>
              <ol>
                <li>Schedule emergency customer call within 24 hours</li>
                <li>Review recent support tickets and escalations</li>
                <li>Analyze usage patterns and adoption metrics</li>
                <li>Prepare retention strategy and recovery plan</li>
                ${riskLevel === 'critical' ? '<li><strong>Escalate to executive team</strong></li>' : ''}
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}?account=${account.id}" style="background: ${riskLevel === 'critical' ? '#D13438' : '#FF8C00'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Account Details
                </a>
              </div>
              
              <hr style="margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">
                This alert was automatically generated by SignalCX based on account risk indicators.
              </p>
            </div>
          `,
          isHtml: true,
          importance: 'high'
        })
      );
    }

    try {
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      console.log(`Risk escalation notification sent to ${successCount}/${promises.length} channels`);
    } catch (error) {
      console.error('Error sending risk escalation notifications:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
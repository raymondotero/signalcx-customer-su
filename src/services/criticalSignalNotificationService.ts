import { Signal, Account } from '@/types';
import { toast } from 'sonner';

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    signalTypes: string[];
    severityLevels: string[];
    accountValueThreshold?: number;
    minimumValue?: number;
  };
  actions: {
    createToastAlert: boolean;
    sendEmailNotification: boolean;
    sendTeamsNotification: boolean;
    escalateToManager: boolean;
    createWorkflowTask: boolean;
    scheduleFollowup: boolean;
  };
  escalationRules: {
    escalateAfterCount: number;
    timeToEscalate: number; // minutes
    escalationRecipients: string[];
  };
  cooldownPeriod: number; // minutes
}

export interface CriticalSignalEvent {
  id: string;
  timestamp: string;
  signal: Signal;
  account: Account;
  triggeredRules: NotificationRule[];
  notificationsSent: {
    email: boolean;
    teams: boolean;
    toast: boolean;
  };
  escalated: boolean;
  acknowledged: boolean;
}

export class CriticalSignalNotificationService {
  private events: CriticalSignalEvent[] = [];
  private cooldownMap: Map<string, number> = new Map();

  private defaultRules: NotificationRule[] = [
    {
      id: 'critical-churn-risk',
      name: 'Critical Churn Risk Alert',
      description: 'Immediate notification for critical churn risk signals',
      enabled: true,
      conditions: {
        signalTypes: ['churn_risk', 'health_decline', 'contract_risk'],
        severityLevels: ['critical', 'high'],
        accountValueThreshold: 1000000, // $1M+ accounts
      },
      actions: {
        createToastAlert: true,
        sendEmailNotification: true,
        sendTeamsNotification: true,
        escalateToManager: true,
        createWorkflowTask: true,
        scheduleFollowup: true,
      },
      escalationRules: {
        escalateAfterCount: 1,
        timeToEscalate: 15, // 15 minutes
        escalationRecipients: ['manager@company.com', 'director@company.com'],
      },
      cooldownPeriod: 30 // 30 minutes cooldown
    },
    {
      id: 'high-value-account-alert',
      name: 'High Value Account Alert',
      description: 'Special monitoring for high-value accounts',
      enabled: true,
      conditions: {
        signalTypes: ['usage_decline', 'support_escalation', 'license_violation'],
        severityLevels: ['high', 'medium'],
        accountValueThreshold: 5000000, // $5M+ accounts
      },
      actions: {
        createToastAlert: true,
        sendEmailNotification: true,
        sendTeamsNotification: false,
        escalateToManager: false,
        createWorkflowTask: true,
        scheduleFollowup: true,
      },
      escalationRules: {
        escalateAfterCount: 2,
        timeToEscalate: 60, // 1 hour
        escalationRecipients: ['csm@company.com'],
      },
      cooldownPeriod: 60 // 1 hour cooldown
    }
  ];

  async processSignal(signal: Signal, account: Account): Promise<CriticalSignalEvent | null> {
    const triggeredRules = this.evaluateRules(signal, account);

    if (triggeredRules.length === 0) {
      return null;
    }

    // Check cooldown period for this account
    if (this.isAccountInCooldown(account.id, triggeredRules)) {
      console.log(`Account ${account.name} is in cooldown period, skipping notifications`);
      return null;
    }

    // Create critical signal event
    const event: CriticalSignalEvent = {
      id: `event-${Date.now()}-${signal.id}`,
      timestamp: new Date().toISOString(),
      signal,
      account,
      triggeredRules,
      notificationsSent: {
        email: false,
        teams: false,
        toast: false
      },
      escalated: false,
      acknowledged: false
    };

    // Send notifications based on triggered rules
    await this.sendNotifications(event);

    // Add to events history
    this.events.unshift(event);

    // Keep only recent 100 events
    this.events = this.events.slice(0, 100);

    // Set cooldown period
    this.setCooldown(account.id, triggeredRules);

    return event;
  }

  private evaluateRules(signal: Signal, account: Account): NotificationRule[] {
    return this.defaultRules.filter(rule => {
      if (!rule.enabled) return false;

      // Check signal type
      if (!rule.conditions.signalTypes.includes(signal.type)) return false;

      // Check severity level
      if (!rule.conditions.severityLevels.includes(signal.severity)) return false;

      // Check account value threshold if specified
      if (rule.conditions.accountValueThreshold && account.arr < rule.conditions.accountValueThreshold) {
        return false;
      }

      // Check minimum signal value if specified
      if (rule.conditions.minimumValue && signal.value !== undefined && signal.value < rule.conditions.minimumValue) {
        return false;
      }

      return true;
    });
  }

  private isAccountInCooldown(accountId: string, rules: NotificationRule[]): boolean {
    const now = Date.now();
    const cooldownKey = `${accountId}-${rules.map(r => r.id).join('-')}`;
    const cooldownUntil = this.cooldownMap.get(cooldownKey);
    
    return cooldownUntil ? now < cooldownUntil : false;
  }

  private setCooldown(accountId: string, rules: NotificationRule[]): void {
    const now = Date.now();
    const maxCooldown = Math.max(...rules.map(r => r.cooldownPeriod));
    const cooldownKey = `${accountId}-${rules.map(r => r.id).join('-')}`;
    
    this.cooldownMap.set(cooldownKey, now + (maxCooldown * 60 * 1000));
  }

  private async sendNotifications(event: CriticalSignalEvent): Promise<void> {
    for (const rule of event.triggeredRules) {
      try {
        if (rule.actions.createToastAlert) {
          this.sendToastNotification(event);
          event.notificationsSent.toast = true;
        }

        if (rule.actions.sendEmailNotification) {
          await this.sendEmailNotification(event, rule);
          event.notificationsSent.email = true;
        }

        if (rule.actions.sendTeamsNotification) {
          await this.sendTeamsNotification(event, rule);
          event.notificationsSent.teams = true;
        }

        console.log(`Sent notifications for rule ${rule.name} to account ${event.account.name}`);
      } catch (error) {
        console.error(`Failed to send notification for rule ${rule.name}:`, error);
      }
    }
  }

  private sendToastNotification(event: CriticalSignalEvent): void {
    const severity = event.signal.severity;
    const message = `🚨 ${event.signal.description} - ${event.account.name}`;
    
    if (severity === 'critical') {
      toast.error(message, {
        duration: 10000,
        action: {
          label: 'View Details',
          onClick: () => {
            console.log('Navigate to signal details:', event.signal.id);
          }
        }
      });
    } else if (severity === 'high') {
      toast.warning(message, {
        duration: 8000,
        action: {
          label: 'Review',
          onClick: () => {
            console.log('Navigate to signal details:', event.signal.id);
          }
        }
      });
    } else {
      toast.info(message, {
        duration: 5000
      });
    }
  }

  private async sendEmailNotification(event: CriticalSignalEvent, rule: NotificationRule): Promise<void> {
    // Simulate email sending
    console.log(`📧 Email notification sent for ${event.signal.description}`);
    console.log(`Recipients: ${rule.escalationRules.escalationRecipients.join(', ')}`);

    // In a real implementation, you would integrate with your email service
    // await emailService.send({
    //   to: rule.escalationRules.escalationRecipients,
    //   subject: `Critical Signal Alert: ${event.account.name}`,
    //   body: this.generateEmailTemplate(event, rule)
    // });
  }

  private async sendTeamsNotification(event: CriticalSignalEvent, rule: NotificationRule): Promise<void> {
    // Simulate Teams notification
    console.log(`🔔 Teams notification sent for ${event.signal.description}`);

    // In a real implementation, you would send to Teams webhook
    // await teamsService.sendAdaptiveCard({
    //   webhook: process.env.TEAMS_WEBHOOK_URL,
    //   card: this.generateTeamsCard(event, rule)
    // });
  }

  getRecentEvents(limit: number = 50): CriticalSignalEvent[] {
    return this.events.slice(0, limit);
  }

  acknowledgeEvent(eventId: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.acknowledged = true;
      return true;
    }
    return false;
  }

  getRules(): NotificationRule[] {
    return [...this.defaultRules];
  }

  updateRule(ruleId: string, updates: Partial<NotificationRule>): boolean {
    const ruleIndex = this.defaultRules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      this.defaultRules[ruleIndex] = { ...this.defaultRules[ruleIndex], ...updates };
      return true;
    }
    return false;
  }

  clearCooldowns(): void {
    this.cooldownMap.clear();
  }

  getUnacknowledgedCount(): number {
    return this.events.filter(e => !e.acknowledged).length;
  }

  getCriticalAlertsCount(): number {
    return this.events.filter(e => 
      e.signal.severity === 'critical' && !e.acknowledged
    ).length;
  }

  // Additional methods for CriticalSignalMonitor compatibility
  getNotificationRules(): NotificationRule[] {
    return this.getRules();
  }

  getStats() {
    const totalEvents = this.events.length;
    const criticalEvents = this.events.filter(e => e.signal.severity === 'critical').length;
    const unacknowledged = this.getUnacknowledgedCount();
    const recentEvents = this.events.filter(e => {
      const eventTime = new Date(e.timestamp);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return eventTime > hourAgo;
    }).length;

    return {
      totalEvents,
      criticalEvents,
      unacknowledged,
      recentEvents,
      averageResponseTime: 2.3, // Mock metric in minutes
      escalationRate: ((criticalEvents / Math.max(totalEvents, 1)) * 100).toFixed(1)
    };
  }

  updateNotificationRule(ruleId: string, updates: Partial<NotificationRule>): boolean {
    return this.updateRule(ruleId, updates);
  }
}

export const criticalSignalNotificationService = new CriticalSignalNotificationService();
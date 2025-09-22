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
    categories?: string[];
    valueThresholds?: {
      operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
      value: number;
    }[];
  };
  actions: {
    sendEmailNotification: boolean;
    sendTeamsNotification: boolean;
    createToastAlert: boolean;
    escalateToManagement: boolean;
    scheduleFollowup: boolean;
    createWorkflowAction: boolean;
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

class CriticalSignalNotificationService {
  private static instance: CriticalSignalNotificationService;
  private events: CriticalSignalEvent[] = [];
  private accountCooldowns = new Map<string, Date>();

  private constructor() {}

  static getInstance(): CriticalSignalNotificationService {
    if (!CriticalSignalNotificationService.instance) {
      CriticalSignalNotificationService.instance = new CriticalSignalNotificationService();
    }
    return CriticalSignalNotificationService.instance;
  }

  // Default notification rules for critical signals
  private defaultRules: NotificationRule[] = [
    {
      id: 'critical-churn-risk',
      name: 'Critical Churn Risk',
      description: 'Alert for critical churn risk signals that require immediate attention',
      enabled: true,
      conditions: {
        signalTypes: ['churn_risk', 'usage', 'support'],
        severityLevels: ['critical', 'high'],
      },
      actions: {
        sendEmailNotification: true,
        sendTeamsNotification: true,
        createToastAlert: true,
        escalateToManagement: true,
        scheduleFollowup: true,
        createWorkflowAction: true
      },
      escalationRules: {
        escalateAfterCount: 1,
        timeToEscalate: 15, // 15 minutes
        escalationRecipients: ['support-management@company.com', 'cs-management@company.com']
      },
      cooldownPeriod: 15 // 15 minutes cooldown
    },
    {
      id: 'high-value-account-risk',
      name: 'High-Value Account Risk',
      description: 'Special alert for high-value accounts (>$10M ARR) showing any risk signals',
      enabled: true,
      conditions: {
        signalTypes: ['churn_risk', 'health_decline', 'usage', 'support', 'engagement'],
        severityLevels: ['critical', 'high', 'medium'],
      },
      actions: {
        sendEmailNotification: true,
        sendTeamsNotification: true,
        createToastAlert: true,
        escalateToManagement: true,
        scheduleFollowup: true,
        createWorkflowAction: true
      },
      escalationRules: {
        escalateAfterCount: 1,
        timeToEscalate: 5, // 5 minutes for high-value accounts
        escalationRecipients: ['vp-cs@company.com', 'ceo@company.com']
      },
      cooldownPeriod: 30 // 30 minutes cooldown
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
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }

    // Set cooldown for account
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

      // Check category if specified
      if (rule.conditions.categories && signal.category && 
          !rule.conditions.categories.includes(signal.category)) {
        return false;
      }

      // Check value thresholds if specified
      if (rule.conditions.valueThresholds) {
        for (const threshold of rule.conditions.valueThresholds) {
          const signalValue = typeof signal.value === 'number' ? signal.value : 0;

          switch (threshold.operator) {
            case 'gt':
              if (!(signalValue > threshold.value)) return false;
              break;
            case 'lt':
              if (!(signalValue < threshold.value)) return false;
              break;
            case 'eq':
              if (!(signalValue === threshold.value)) return false;
              break;
            case 'gte':
              if (!(signalValue >= threshold.value)) return false;
              break;
            case 'lte':
              if (!(signalValue <= threshold.value)) return false;
              break;
          }
        }
      }

      // Check if account is high-value for special rules
      if (rule.id === 'high-value-account-risk' && account.arr < 10000000) {
        return false; // Only trigger for accounts with >$10M ARR
      }

      return true;
    });
  }

  private async sendNotifications(event: CriticalSignalEvent): Promise<void> {
    try {
      const triggeredRules = event.triggeredRules;
      const shouldSendEmail = triggeredRules.some(rule => rule.actions.sendEmailNotification);
      const shouldSendTeams = triggeredRules.some(rule => rule.actions.sendTeamsNotification);
      const shouldCreateToast = triggeredRules.some(rule => rule.actions.createToastAlert);
      const shouldEscalate = triggeredRules.some(rule => rule.actions.escalateToManagement);

      // Send toast notification (always available)
      if (shouldCreateToast) {
        toast.error(
          `🚨 Critical Signal: ${event.signal.description}`,
          {
            description: `Account: ${event.account.name} - ${event.triggeredRules.map(r => r.name).join(', ')}`,
            duration: 10000,
            action: {
              label: 'View Details',
              onClick: () => {
                // Could trigger a modal or navigation to details
              }
            }
          }
        );
        event.notificationsSent.toast = true;
      }

      // Send email notification
      if (shouldSendEmail) {
        // In real implementation, this would integrate with email service
        console.log(`Sending email notification for critical signal: ${event.signal.description}`);
        event.notificationsSent.email = true;
      }

      // Send Teams notification
      if (shouldSendTeams) {
        // In real implementation, this would integrate with Teams webhook
        console.log(`Sending Teams notification for critical signal: ${event.signal.description}`);
        event.notificationsSent.teams = true;
      }

      // Handle escalation
      if (shouldEscalate) {
        event.escalated = true;
        console.log(`Escalating critical signal to management: ${event.signal.description}`);
      }

    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  private isAccountInCooldown(accountId: string, triggeredRules: NotificationRule[]): boolean {
    const lastNotification = this.accountCooldowns.get(accountId);
    if (!lastNotification) return false;

    // Use the shortest cooldown period from triggered rules
    const shortestCooldown = Math.min(...triggeredRules.map(rule => rule.cooldownPeriod));
    const cooldownMs = shortestCooldown * 60 * 1000; // Convert to milliseconds

    return Date.now() - lastNotification.getTime() < cooldownMs;
  }

  private setCooldown(accountId: string, triggeredRules: NotificationRule[]): void {
    this.accountCooldowns.set(accountId, new Date());
  }

  acknowledgeEvent(eventId: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.acknowledged = true;
      return true;
    }
    return false;
  }

  getRecentEvents(limit: number = 50): CriticalSignalEvent[] {
    return this.events.slice(0, limit);
  }

  getCriticalEvents(limit: number = 20): CriticalSignalEvent[] {
    return this.events
      .filter(event => event.signal.severity === 'critical')
      .slice(0, limit);
  }

  getNotificationRules(): NotificationRule[] {
    return [...this.defaultRules];
  }

  updateNotificationRule(ruleId: string, updates: Partial<NotificationRule>): boolean {
    const ruleIndex = this.defaultRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex !== -1) {
      this.defaultRules[ruleIndex] = { ...this.defaultRules[ruleIndex], ...updates };
      return true;
    }
    return false;
  }

  getStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(event => new Date(event.timestamp) > last24Hours);
    
    return {
      total: this.events.length,
      recent: recentEvents.length,
      critical: this.events.filter(event => event.signal.severity === 'critical').length,
      acknowledged: this.events.filter(event => event.acknowledged).length,
      escalated: this.events.filter(event => event.escalated).length
    };
  }
}

export const criticalSignalNotificationService = CriticalSignalNotificationService.getInstance();
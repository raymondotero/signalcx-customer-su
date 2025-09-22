import { Signal, Account } from '@/types';
import { toast } from 'sonner';

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    signalTypes: Signal['type'][];
    severityLevels: Signal['severity'][];
    categories?: Signal['category'][];
    valueThresholds?: Array<{
      field: string;
      operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
      value: number;
    }>;
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
  signal: Signal;
  account: Account;
  triggeredRules: NotificationRule[];
  timestamp: string;
  notificationsSent: {
    email: boolean;
    teams: boolean;
    toast: boolean;
  };
  escalated: boolean;
  acknowledged: boolean;
  acknowledgedAt?: string;
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
        signalTypes: ['churn_risk', 'risk', 'usage', 'financial'],
        severityLevels: ['medium', 'high', 'critical'],
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
        timeToEscalate: 10, // 10 minutes for high-value accounts
        escalationRecipients: ['support-management@company.com', 'cs-management@company.com']
      },
      cooldownPeriod: 15 // 15 minutes cooldown
    },
    {
      id: 'critical-support-escalation',
      name: 'Critical Support Escalation',
      description: 'Escalation for critical support and technical issues',
      enabled: true,
      conditions: {
        signalTypes: ['risk', 'support'],
        severityLevels: ['critical'],
      },
      actions: {
        sendEmailNotification: true,
        sendTeamsNotification: true,
        createToastAlert: true,
        escalateToManagement: true,
        scheduleFollowup: false,
        createWorkflowAction: true
      },
      escalationRules: {
        escalateAfterCount: 1,
        timeToEscalate: 5, // 5 minutes for critical technical issues
        escalationRecipients: ['support-management@company.com', 'cs-management@company.com']
      },
      cooldownPeriod: 15 // 15 minutes cooldown
    },
    {
      id: 'financial-payment-issues',
      name: 'Financial & Payment Issues',
      description: 'Alert for financial and billing-related critical signals',
      enabled: true,
      conditions: {
        signalTypes: ['financial', 'billing'],
        severityLevels: ['high', 'critical'],
      },
      actions: {
        sendEmailNotification: true,
        sendTeamsNotification: true,
        createToastAlert: true,
        escalateToManagement: false,
        scheduleFollowup: true,
        createWorkflowAction: false
      },
      escalationRules: {
        escalateAfterCount: 2,
        timeToEscalate: 30, // 30 minutes
        escalationRecipients: ['billing@company.com', 'finance@company.com']
      },
      cooldownPeriod: 120 // 2 hours cooldown
    },
    {
      id: 'usage-decline-alert',
      name: 'Significant Usage Decline',
      description: 'Alert for significant usage drops that may indicate account risk',
      enabled: true,
      conditions: {
        signalTypes: ['usage', 'engagement'],
        severityLevels: ['high', 'critical'],
        valueThresholds: [
          {
            field: 'value',
            operator: 'lt',
            value: -25 // 25% decline
          }
        ]
      },
      actions: {
        sendEmailNotification: false,
        sendTeamsNotification: true,
        createToastAlert: true,
        escalateToManagement: false,
        scheduleFollowup: true,
        createWorkflowAction: true
      },
      escalationRules: {
        escalateAfterCount: 3,
        timeToEscalate: 60, // 1 hour
        escalationRecipients: ['cs-management@company.com']
      },
      cooldownPeriod: 240 // 4 hours cooldown
    }
  ];

  async processSignal(signal: Signal, account: Account): Promise<CriticalSignalEvent | null> {
    // Check if signal matches any notification rules
    const triggeredRules = this.evaluateRules(signal, account);
    
    if (triggeredRules.length === 0) {
      return null; // No rules triggered
    }

    // Check cooldown period for this account
    if (this.isAccountInCooldown(account.id, triggeredRules)) {
      console.log(`Account ${account.name} is in cooldown period, skipping notifications`);
      return null;
    }

    // Create critical signal event
    const event: CriticalSignalEvent = {
      id: `event-${Date.now()}-${signal.id}`,
      signal,
      account,
      triggeredRules,
      timestamp: new Date().toISOString(),
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
    const { signal, account, triggeredRules } = event;

    // Determine which notifications to send based on triggered rules
    const shouldSendEmail = triggeredRules.some(rule => rule.actions.sendEmailNotification);
    const shouldSendTeams = triggeredRules.some(rule => rule.actions.sendTeamsNotification);
    const shouldCreateToast = triggeredRules.some(rule => rule.actions.createToastAlert);
    const shouldEscalate = triggeredRules.some(rule => rule.actions.escalateToManagement);

    try {
      // Send toast notification (always works)
      if (shouldCreateToast) {
        toast.error(
          `🚨 Critical Signal: ${signal.description} for ${account.name}`,
          {
            duration: 10000,
            action: {
              label: 'View Details',
              onClick: () => console.log('Viewing signal details:', signal)
            }
          }
        );
        event.notificationsSent.toast = true;
      }

      // Send Teams notification (simulated)
      if (shouldSendTeams) {
        console.log(`Sending Teams notification for critical signal: ${signal.description}`);
        // In real implementation, this would integrate with Microsoft Teams API
        event.notificationsSent.teams = true;
      }

      // Send email notification (simulated)
      if (shouldSendEmail) {
        console.log(`Sending email notification for critical signal: ${signal.description}`);
        // In real implementation, this would integrate with email service
        event.notificationsSent.email = true;
      }

      // Handle escalation
      if (shouldEscalate) {
        console.log(`Escalating critical signal to management: ${signal.description}`);
        event.escalated = true;
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
    const cooldownMs = shortestCooldown * 60 * 1000; // Convert minutes to milliseconds
    
    return Date.now() - lastNotification.getTime() < cooldownMs;
  }

  private setCooldown(accountId: string, triggeredRules: NotificationRule[]): void {
    this.accountCooldowns.set(accountId, new Date());
  }

  acknowledgeEvent(eventId: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.acknowledged = true;
      event.acknowledgedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  getRecentEvents(limit: number = 20): CriticalSignalEvent[] {
    return this.events.slice(0, limit);
  }

  getEventsByAccount(accountId: string, limit: number = 10): CriticalSignalEvent[] {
    return this.events
      .filter(e => e.account.id === accountId)
      .slice(0, limit);
  }

  getNotificationRules(): NotificationRule[] {
    return [...this.defaultRules];
  }

  updateNotificationRule(ruleId: string, updates: Partial<NotificationRule>): boolean {
    const ruleIndex = this.defaultRules.findIndex(r => r.id === ruleId);
    if (ruleIndex >= 0) {
      this.defaultRules[ruleIndex] = { ...this.defaultRules[ruleIndex], ...updates };
      return true;
    }
    return false;
  }

  clearCooldowns(): void {
    this.accountCooldowns.clear();
  }

  getStats() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => new Date(e.timestamp) > last24h);
    
    return {
      totalEvents: this.events.length,
      last24Hours: recentEvents.length,
      acknowledged: this.events.filter(e => e.acknowledged).length,
      escalated: this.events.filter(e => e.escalated).length,
      criticalSignals: this.events.filter(e => e.signal.severity === 'critical').length,
      topSignalTypes: this.getTopSignalTypes(recentEvents),
      topAccounts: this.getTopAccountsBySignals(recentEvents)
    };
  }

  private getTopSignalTypes(events: CriticalSignalEvent[]) {
    const typeCount: Record<string, number> = {};
    events.forEach(e => {
      typeCount[e.signal.type] = (typeCount[e.signal.type] || 0) + 1;
    });

    return Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  private getTopAccountsBySignals(events: CriticalSignalEvent[]) {
    const accountCount: Record<string, { name: string; count: number }> = {};
    events.forEach(e => {
      if (!accountCount[e.account.id]) {
        accountCount[e.account.id] = { name: e.account.name, count: 0 };
      }
      accountCount[e.account.id].count++;
    });
    
    return Object.values(accountCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

export const criticalSignalNotificationService = CriticalSignalNotificationService.getInstance();
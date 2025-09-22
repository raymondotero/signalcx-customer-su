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
    sendTeamsNotification: boolean;
    sendEmailNotification: boolean;
    createToastAlert: boolean;
    escalateToManagement: boolean;
    scheduleFollowup: boolean;
    createWorkflowAction: boolean;
  };
  escalationRules?: {
    escalateAfterCount: number;
    timeToEscalate: number; // minutes
    escalationRecipients: string[];
  };
  cooldownPeriod?: number; // minutes
}

export interface CriticalSignalEvent {
  id: string;
  signal: Signal;
  account: Account;
  triggeredRules: NotificationRule[];
  timestamp: string;
  notificationsSent: {
    teams: boolean;
    email: boolean;
    toast: boolean;
  };
  escalated: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;
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
        sendTeamsNotification: true,
        sendEmailNotification: true,
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
        signalTypes: ['churn_risk', 'usage', 'financial', 'support'],
        severityLevels: ['medium', 'high', 'critical'],
      },
      actions: {
        sendTeamsNotification: true,
        sendEmailNotification: true,
        createToastAlert: true,
        escalateToManagement: true,
        scheduleFollowup: true,
        createWorkflowAction: false
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
        signalTypes: ['support', 'risk'],
        severityLevels: ['critical'],
      },
      actions: {
        sendTeamsNotification: true,
        sendEmailNotification: true,
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
        sendTeamsNotification: true,
        sendEmailNotification: true,
        createToastAlert: true,
        escalateToManagement: false,
        scheduleFollowup: true,
        createWorkflowAction: false
      },
      cooldownPeriod: 120 // 2 hours cooldown
    },
    {
      id: 'usage-decline-alert',
      name: 'Significant Usage Decline',
      description: 'Alert for significant usage drops that may indicate account risk',
      enabled: true,
      conditions: {
        signalTypes: ['usage'],
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
        sendTeamsNotification: true,
        sendEmailNotification: false,
        createToastAlert: true,
        escalateToManagement: false,
        scheduleFollowup: true,
        createWorkflowAction: true
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

    // Check cooldown for this account
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
        teams: false,
        email: false,
        toast: false
      },
      escalated: false,
      acknowledged: false
    };

    // Send notifications based on triggered rules
    await this.sendNotifications(event);

    // Add to events history
    this.events.unshift(event);
    
    // Keep only last 100 events
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
          !rule.conditions.categories.includes(signal.category)) return false;

      // Check value thresholds if specified
      if (rule.conditions.valueThresholds && signal.value !== undefined) {
        const thresholdMet = rule.conditions.valueThresholds.some(threshold => {
          switch (threshold.operator) {
            case 'gt': return signal.value! > threshold.value;
            case 'lt': return signal.value! < threshold.value;
            case 'eq': return signal.value! === threshold.value;
            case 'gte': return signal.value! >= threshold.value;
            case 'lte': return signal.value! <= threshold.value;
            default: return false;
          }
        });
        if (!thresholdMet) return false;
      }

      // Special condition for high-value accounts (>$10M ARR)
      if (rule.id === 'high-value-account-risk' && account.arr < 10000000) {
        return false;
      }

      return true;
    });
  }

  private isAccountInCooldown(accountId: string, rules: NotificationRule[]): boolean {
    const lastNotification = this.accountCooldowns.get(accountId);
    if (!lastNotification) return false;

    const minCooldown = Math.min(...rules.map(r => r.cooldownPeriod || 60));
    const cooldownEnd = new Date(lastNotification.getTime() + minCooldown * 60 * 1000);
    
    return new Date() < cooldownEnd;
  }

  private setCooldown(accountId: string, rules: NotificationRule[]): void {
    this.accountCooldowns.set(accountId, new Date());
  }

  private async sendNotifications(event: CriticalSignalEvent): Promise<void> {
    const { signal, account, triggeredRules } = event;
    const promises: Promise<any>[] = [];

    // Determine notification actions from triggered rules
    const shouldSendTeams = triggeredRules.some(r => r.actions.sendTeamsNotification);
    const shouldSendEmail = triggeredRules.some(r => r.actions.sendEmailNotification);
    const shouldShowToast = triggeredRules.some(r => r.actions.createToastAlert);
    const shouldEscalate = triggeredRules.some(r => r.actions.escalateToManagement);

    // Send Teams notification
    if (shouldSendTeams) {
      promises.push(this.sendTeamsNotification(event));
    }

    // Send email notification
    if (shouldSendEmail) {
      promises.push(this.sendEmailNotification(event));
    }

    // Show toast notification
    if (shouldShowToast) {
      this.sendToastNotification(event);
      event.notificationsSent.toast = true;
    }

    // Handle escalation
    if (shouldEscalate) {
      promises.push(this.handleEscalation(event));
    }

    try {
      const results = await Promise.allSettled(promises);
      
      // Update notification status based on results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (index === 0 && shouldSendTeams) event.notificationsSent.teams = true;
          else if ((index === 0 && !shouldSendTeams) || (index === 1 && shouldSendTeams)) {
            event.notificationsSent.email = true;
          }
        }
      });

    } catch (error) {
      console.error('Error sending critical signal notifications:', error);
    }
  }

  private async sendTeamsNotification(event: CriticalSignalEvent): Promise<boolean> {
    const { signal, account } = event;
    
    const urgencyEmoji = {
      'low': '🟡',
      'medium': '🟠', 
      'high': '🔴',
      'critical': '🚨'
    };

    const message = {
      title: `${urgencyEmoji[signal.severity]} Critical Signal Alert: ${account.name}`,
      text: `**Signal Type:** ${signal.type.replace('_', ' ').toUpperCase()}\n**Severity:** ${signal.severity.toUpperCase()}\n**Description:** ${signal.description}\n**Account ARR:** $${(account.arr / 1000000).toFixed(1)}M\n**Health Score:** ${account.healthScore}/100`,
      type: signal.severity === 'critical' ? 'error' : 'warning' as const,
      actions: [
        {
          text: 'View Account Details',
          value: `view-account-${account.id}`,
          style: 'default' as const
        },
        {
          text: 'Acknowledge Alert',
          value: `acknowledge-${event.id}`,
          style: 'positive' as const
        },
        {
          text: 'Create Action Plan',
          value: `action-plan-${account.id}`,
          style: 'default' as const
        }
      ]
    };

    try {
      // This would connect to the actual Teams integration
      console.log('Sending Teams notification:', message);
      return true;
    } catch (error) {
      console.error('Error sending Teams notification:', error);
      return false;
    }
  }

  private async sendEmailNotification(event: CriticalSignalEvent): Promise<boolean> {
    const { signal, account, triggeredRules } = event;
    
    const recipients = [
      `${account.csam}@company.com`,
      `${account.ae}@company.com`
    ];

    // Add escalation recipients if needed
    const escalationRecipients = triggeredRules
      .filter(r => r.escalationRules)
      .flatMap(r => r.escalationRules!.escalationRecipients);
    
    recipients.push(...escalationRecipients);

    const urgencyColor = {
      'low': '#FFA500',
      'medium': '#FF8C00',
      'high': '#DC143C',
      'critical': '#B22222'
    };

    try {
      // This would connect to the actual email service
      console.log('Sending email notification to:', recipients);
      console.log('Subject:', `Critical Signal Alert - ${account.name}`);
      console.log('Signal:', signal.description);
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  private sendToastNotification(event: CriticalSignalEvent): void {
    const { signal, account } = event;
    
    const urgencyEmoji = {
      'low': '🟡',
      'medium': '🟠',
      'high': '🔴', 
      'critical': '🚨'
    };

    const message = `${urgencyEmoji[signal.severity]} Critical Signal - ${account.name}: ${signal.description}`;
    
    const toastOptions = {
      duration: signal.severity === 'critical' ? 10000 : 8000,
      action: {
        label: 'View Details',
        onClick: () => {
          toast.info(`Account: ${account.name} | Type: ${signal.type} | Severity: ${signal.severity}`, {
            duration: 5000
          });
        }
      }
    };

    if (signal.severity === 'critical') {
      toast.error(message, toastOptions);
    } else {
      toast.warning(message, toastOptions);
    }
  }

  private async handleEscalation(event: CriticalSignalEvent): Promise<void> {
    const { signal, account, triggeredRules } = event;

    const escalationRules = triggeredRules.filter(r => r.escalationRules);
    
    for (const rule of escalationRules) {
      if (rule.escalationRules) {
        // Schedule escalation after specified time
        setTimeout(async () => {
          if (!event.acknowledged) {
            await this.escalateAlert(event, rule);
          }
        }, rule.escalationRules.timeToEscalate * 60 * 1000);
      }
    }
  }

  private async escalateAlert(event: CriticalSignalEvent, rule: NotificationRule): Promise<void> {
    const { signal, account } = event;
    
    console.log(`Escalating alert for ${account.name} - Rule: ${rule.name}`);
    
    // Send escalation notification to management
    if (rule.escalationRules) {
      try {
        // This would send to management/executive team
        const escalationMessage = {
          title: `🚨 ESCALATED ALERT: ${account.name}`,
          text: `Critical signal has not been acknowledged within ${rule.escalationRules.timeToEscalate} minutes.\n\n**Account:** ${account.name}\n**ARR:** $${(account.arr / 1000000).toFixed(1)}M\n**Signal:** ${signal.description}\n**Severity:** ${signal.severity.toUpperCase()}\n\n**IMMEDIATE ACTION REQUIRED**`,
          recipients: rule.escalationRules.escalationRecipients
        };
        
        console.log('Sending escalation notification:', escalationMessage);
        
        event.escalated = true;
        
      } catch (error) {
        console.error('Error escalating alert:', error);
      }
    }
  }

  // Public methods for managing notifications
  acknowledgeEvent(eventId: string, acknowledgedBy: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.acknowledged = true;
      event.acknowledgedBy = acknowledgedBy;
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
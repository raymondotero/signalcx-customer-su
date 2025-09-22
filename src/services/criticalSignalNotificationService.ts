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
    timeToEscalate: number;
  };
  actions: {
    sendEmailNotification: boolean;
    sendTeamsNotification: boolean;
    createWorkflowTask: boolean;
    escalateToManager: boolean;
    scheduleFollowup: boolean;
  };
  escalationRules: {
    escalateAfter: number; // minutes
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
  private initialized = false;

  private defaultRules: NotificationRule[] = [
    {
      id: 'critical-churn-risk',
      name: 'Critical Churn Risk Alert',
      description: 'Alerts for signals indicating immediate churn risk',
      enabled: true,
      conditions: {
        signalTypes: ['churn_risk', 'health_decline', 'usage_drop'],
        severityLevels: ['critical'],
        accountValueThreshold: 1000000,
        timeToEscalate: 15
      },
      actions: {
        sendEmailNotification: true,
        sendTeamsNotification: true,
        createWorkflowTask: true,
        escalateToManager: true,
        scheduleFollowup: true,
      },
      escalationRules: {
        escalateAfter: 30,
        escalationRecipients: ['csm-manager@company.com', 'vp-cs@company.com']
      },
      cooldownPeriod: 120 // 2 hours cooldown
    },
    {
      id: 'high-value-account-alert',
      name: 'High-Value Account Alert',
      description: 'Special monitoring for high-value accounts',
      enabled: true,
      conditions: {
        signalTypes: ['renewal_risk', 'stakeholder_change', 'support_escalation'],
        severityLevels: ['high', 'medium'],
        accountValueThreshold: 5000000,
        timeToEscalate: 60
      },
      actions: {
        sendEmailNotification: true,
        sendTeamsNotification: false,
        createWorkflowTask: true,
        escalateToManager: false,
        scheduleFollowup: true,
      },
      escalationRules: {
        escalateAfter: 120,
        escalationRecipients: ['senior-csm@company.com']
      },
      cooldownPeriod: 60 // 1 hour cooldown
    }
  ];

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;
    
    // Initialize with some sample events for demo
    this.events = [
      {
        id: 'event-1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        signal: {
          id: 'sig-1',
          type: 'churn_risk',
          severity: 'critical',
          description: 'Critical health score decline detected',
          accountId: 'acc-1',
          accountName: 'TechCorp Solutions',
          timestamp: new Date().toISOString(),
          category: 'risk',
          value: 25,
          trend: 'declining',
          metadata: {}
        },
        account: {
          id: 'acc-1',
          name: 'TechCorp Solutions',
          industry: 'Technology',
          arr: 12500000,
          healthScore: 45,
          status: 'At Risk' as const,
          contractEnd: '2024-12-31',
          csam: 'Sarah Johnson',
          ae: 'Mike Chen',
          lastActivity: new Date().toISOString(),
          expansionOpportunity: 2500000
        },
        triggeredRules: [this.defaultRules[0]],
        notificationsSent: {
          email: true,
          teams: true,
          toast: true
        },
        escalated: false,
        acknowledged: false
      }
    ];
    
    this.initialized = true;
  }

  processSignal = async (signal: Signal, account: Account): Promise<CriticalSignalEvent | null> => {
    if (!this.checkInitialized()) return null;
    
    const triggeredRules = this.evaluateRules(signal, account);
    if (triggeredRules.length === 0) {
      return null;
    }

    // Check cooldown period for this account
    if (this.isInCooldown(account.id)) {
      console.log(`Account ${account.name} is in cooldown period, skipping notification`);
      return null;
    }

    // Create critical signal event
    const event: CriticalSignalEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    // Add to events
    this.events.unshift(event);

    // Set cooldown
    this.setCooldown(account.id, triggeredRules);

    console.log(`Critical signal processed for ${account.name}: ${signal.description}`);
    return event;
  }

  private evaluateRules(signal: Signal, account: Account): NotificationRule[] {
    return this.defaultRules.filter(rule => {
      if (!rule.enabled) return false;

      // Check signal type
      if (!rule.conditions.signalTypes.includes(signal.type)) return false;

      // Check severity level
      if (!rule.conditions.severityLevels.includes(signal.severity)) return false;

      // Check account value threshold
      if (rule.conditions.accountValueThreshold && account.arr < rule.conditions.accountValueThreshold) {
        return false;
      }

      return true;
    });
  }

  private isInCooldown(accountId: string): boolean {
    const now = Date.now();
    const cooldownEnd = this.cooldownMap.get(accountId) || 0;
    return cooldownEnd > now;
  }

  private setCooldown(accountId: string, rules: NotificationRule[]): void {
    const now = Date.now();
    const cooldownKey = `${accountId}`;
    const maxCooldown = Math.max(...rules.map(r => r.cooldownPeriod));
    this.cooldownMap.set(cooldownKey, now + (maxCooldown * 60 * 1000));
  }

  private async sendNotifications(event: CriticalSignalEvent): Promise<void> {
    for (const rule of event.triggeredRules) {
      try {
        if (rule.actions.sendEmailNotification) {
          await this.sendEmailNotification(event, rule);
          event.notificationsSent.email = true;
        }

        if (rule.actions.sendTeamsNotification) {
          await this.sendTeamsNotification(event, rule);
          event.notificationsSent.teams = true;
        }

        if (rule.actions.createWorkflowTask) {
          this.sendToastNotification(event);
          event.notificationsSent.toast = true;
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

  private checkInitialized(): boolean {
    if (!this.initialized) {
      console.warn('CriticalSignalNotificationService not initialized');
      return false;
    }
    return true;
  }

  getRecentEvents(limit: number = 50): CriticalSignalEvent[] {
    if (!this.checkInitialized()) return [];
    return this.events.slice(0, limit);
  }

  acknowledgeEvent(eventId: string): boolean {
    if (!this.checkInitialized()) return false;
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

  clearEvents(): void {
    if (!this.checkInitialized()) return;
    this.events = [];
    this.cooldownMap.clear();
  }

  getUnacknowledgedCount(): number {
    if (!this.checkInitialized()) return 0;
    return this.events.filter(e => !e.acknowledged).length;
  }

  getCriticalAlertsCount(): number {
    if (!this.checkInitialized()) return 0;
    return this.events.filter(e => 
      e.signal.severity === 'critical' && !e.acknowledged
    ).length;
  }

  getNotificationRules(): NotificationRule[] {
    return this.getRules();
  }

  getStats() {
    if (!this.checkInitialized()) {
      return {
        totalEvents: 0,
        unacknowledged: 0,
        criticalSignals: 0,
        acknowledged: 0,
        last24Hours: 0,
        topSignalTypes: [],
        topAccounts: [],
        avgResponseTime: 0
      };
    }

    const totalEvents = this.events.length;
    const unacknowledged = this.getUnacknowledgedCount();
    const criticalSignals = this.getCriticalAlertsCount();
    const acknowledged = this.events.filter(e => e.acknowledged).length;
    
    // Calculate events in last 24 hours
    const last24Hours = this.events.filter(e => {
      const eventTime = new Date(e.timestamp).getTime();
      const now = Date.now();
      return (now - eventTime) <= (24 * 60 * 60 * 1000);
    }).length;
    
    // Get top signal types in last 24 hours
    const last24HourEvents = this.events.filter(e => {
      const eventTime = new Date(e.timestamp).getTime();
      const now = Date.now();
      return (now - eventTime) <= (24 * 60 * 60 * 1000);
    });
    
    const signalTypeCounts = last24HourEvents.reduce((acc, event) => {
      const type = event.signal.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topSignalTypes = Object.entries(signalTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Get most active accounts in last 24 hours
    const accountCounts = last24HourEvents.reduce((acc, event) => {
      const name = event.account.name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topAccounts = Object.entries(accountCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const avgResponseTime = totalEvents > 0 ? 
      this.events
        .filter(e => e.acknowledged)
        .reduce((sum, e) => {
          const created = new Date(e.timestamp).getTime();
          // Assume acknowledgment happens after 5-30 minutes for demo
          const responseTime = Math.random() * 25 + 5;
          return sum + responseTime;
        }, 0) / Math.max(this.events.filter(e => e.acknowledged).length, 1)
      : 0;

    return {
      totalEvents,
      unacknowledged,
      criticalSignals,
      acknowledged,
      last24Hours,
      topSignalTypes,
      topAccounts,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }

  updateNotificationRule(ruleId: string, updates: Partial<NotificationRule>): boolean {
    return this.updateRule(ruleId, updates);
  }
}

export const criticalSignalNotificationService = new CriticalSignalNotificationService();
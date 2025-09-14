import { Signal } from '@/types';

// Business value signal definitions organized by category
export const SIGNAL_CATALOG = {
  cost: [
    'Cloud Spend Variance',
    'Idle Resource Ratio', 
    'Reserved Coverage',
    'Rightsizing Opportunity',
    'License Utilization',
    'Data Egress Cost Spike',
    'Savings Plan Coverage',
    'Storage Tier Mix',
    'CPU Utilization',
    'GPU Utilization',
    'Commitment Burn Rate',
    'Unit Cost per Active User',
    'FinOps Score',
    'Tagging Compliance',
    'SaaS Seats Utilization',
    'Invoice Dispute Rate',
    'Forecast Accuracy',
    'Host Density',
    'Spot/Preemptible Usage',
    'Environment Duplication',
    ...Array.from({length: 20}, (_, i) => `Cost Signal ${i + 21}`)
  ],
  agility: [
    'Release Frequency',
    'Lead Time for Changes',
    'Change Failure Rate',
    'MTTR Application',
    'Deployment Automation Coverage',
    'API Time-to-First-Call',
    'Onboarding TTV',
    'Feature Cycle Time',
    'Backlog Age > 90d',
    'Experiment Velocity',
    'Blue/Green Coverage',
    'Canary Adoption',
    'Trunk-Based Adoption',
    'Infrastructure-as-Code Coverage',
    'Build Time P95',
    'Test Automation Coverage',
    'Rollback Time',
    'Hotfix Frequency',
    'SRE Toil Hours',
    'Service Catalog Coverage',
    ...Array.from({length: 20}, (_, i) => `Agility Signal ${i + 21}`)
  ],
  data: [
    'AI Agent Usage Rate',
    'Data Freshness (Hours)',
    'P13N Feature Use',
    'Event Tracking Coverage',
    'MAU/WAU Ratio',
    'DAU/MAU Stickiness',
    'API Calls 30d',
    'Dashboard Views 30d',
    'Goals Configured',
    'Digital Journey Completions',
    'Feature Flag Adoption',
    'Search Success Rate',
    'Time-on-Task',
    'Conversion Rate',
    'Churn Predict Score',
    'Recommendation CTR',
    'CoPilot Invocation Rate',
    'Data Quality Score',
    'Schema Drift Incidents',
    'ETL Failure Rate',
    'Edge Latency P95',
    'Mobile Crash Rate',
    'SDK Version Currency',
    'Session Replay Coverage',
    'A/B Test Running',
    'Customer Effort Score',
    'CSAT (Transactional)',
    'NPS (Relationship)',
    'Support Deflection via AI',
    'Self-Serve Completion',
    ...Array.from({length: 20}, (_, i) => `Data Signal ${i + 31}`)
  ],
  risk: [
    'Open Critical Vulns',
    'MFA Coverage',
    'SSO/SCIM Coverage',
    'Privileged Accounts w/o MFA',
    'PenTest Findings Open',
    'DPO/Legal Requests Open',
    'Data Residency Breaches',
    'Audit Findings Open',
    'Backup Success Rate',
    'RPO Compliance',
    'RTO Compliance',
    'DR Test Pass Rate',
    'PII Access Outliers',
    'SLA Uptime 30d',
    'Latency P95 SLO',
    'P1 Ticket Rate',
    'Change Management Violations',
    'Secrets in Repo Incidents',
    'Certificate Expiry < 30d',
    'BYOK/KMS Coverage',
    ...Array.from({length: 20}, (_, i) => `Risk Signal ${i + 21}`)
  ],
  culture: [
    'Executive Sponsor Present',
    'Champion Count',
    'Training Hours Last 90d',
    'Certifications Earned',
    'Office Hours Attendance',
    'QBR Cadence',
    'Joint Success Plan Updated',
    'CSM Touches Last 14d',
    'Stakeholder Map Completeness',
    'Adoption Committee Active',
    'Voice of Customer Participation',
    'Roadmap Feedback Items',
    'Internal Comms Open Rate',
    'Enablement NPS',
    'Community Posts/Month',
    'Shadow IT Requests',
    'Pilot Cohort Active',
    'OKRs Aligned',
    'Change Readiness Score',
    'Escalation Heat Index',
    ...Array.from({length: 10}, (_, i) => `Culture Signal ${i + 21}`)
  ]
} as const;

// Helper functions for signal generation
export const getRandomSignalName = (category: keyof typeof SIGNAL_CATALOG): string => {
  const signals = SIGNAL_CATALOG[category];
  return signals[Math.floor(Math.random() * signals.length)];
};

export const generateRandomValue = (signalName: string): { value: number; unit?: string; target?: number } => {
  // Cost signals - typically percentages or dollar amounts
  if (signalName.includes('Coverage') || signalName.includes('Utilization') || signalName.includes('Compliance')) {
    return {
      value: Math.random() * 100,
      unit: '%',
      target: 80 + Math.random() * 20 // Target between 80-100%
    };
  }
  
  if (signalName.includes('Cost') || signalName.includes('Spend')) {
    return {
      value: 10000 + Math.random() * 90000,
      unit: '$',
      target: 50000
    };
  }
  
  // Agility signals - time-based or frequency
  if (signalName.includes('Time') || signalName.includes('MTTR')) {
    return {
      value: Math.random() * 120, // Minutes
      unit: 'min',
      target: 15
    };
  }
  
  if (signalName.includes('Frequency')) {
    return {
      value: Math.random() * 50,
      unit: 'per month',
      target: 20
    };
  }
  
  // Data signals - mostly percentages and rates
  if (signalName.includes('Rate') || signalName.includes('Ratio')) {
    return {
      value: Math.random() * 100,
      unit: '%',
      target: 75 + Math.random() * 20
    };
  }
  
  if (signalName.includes('Score')) {
    return {
      value: Math.random() * 100,
      unit: 'score',
      target: 80
    };
  }
  
  // Risk signals - counts and percentages
  if (signalName.includes('Open') || signalName.includes('Findings')) {
    return {
      value: Math.floor(Math.random() * 20),
      unit: 'count',
      target: 0
    };
  }
  
  // Culture signals - counts and percentages
  if (signalName.includes('Count') || signalName.includes('Hours')) {
    return {
      value: Math.floor(Math.random() * 100),
      unit: 'count',
      target: 50
    };
  }
  
  // Default
  return {
    value: Math.random() * 100,
    unit: '%',
    target: 85
  };
};

export const getSeverityFromValue = (value: number, target: number | undefined, category: string): Signal['severity'] => {
  if (!target) return 'medium';
  
  const deviation = Math.abs(value - target) / target;
  
  // For risk category, higher values are worse
  if (category === 'risk') {
    if (value > target * 2) return 'critical';
    if (value > target * 1.5) return 'high';
    if (value > target) return 'medium';
    return 'low';
  }
  
  // For other categories, deviation from target determines severity
  if (deviation > 0.5) return 'critical';
  if (deviation > 0.3) return 'high';
  if (deviation > 0.1) return 'medium';
  return 'low';
};

export const getTrendFromHistory = (): Signal['trend'] => {
  const trends: Signal['trend'][] = ['improving', 'stable', 'declining'];
  return trends[Math.floor(Math.random() * trends.length)];
};

export const generateBusinessValueSignal = (accountId: string, accountName: string): Signal => {
  const categories = Object.keys(SIGNAL_CATALOG) as Array<keyof typeof SIGNAL_CATALOG>;
  const category = categories[Math.floor(Math.random() * categories.length)];
  const signalName = getRandomSignalName(category);
  const { value, unit, target } = generateRandomValue(signalName);
  const severity = getSeverityFromValue(value, target, category);
  const trend = getTrendFromHistory();
  
  // Generate contextual description based on signal
  const description = generateSignalDescription(signalName, value, unit, trend, severity);
  
  return {
    id: `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    accountId,
    accountName,
    type: category,
    signalName,
    description,
    value,
    unit,
    severity,
    category,
    trend,
    target,
    timestamp: new Date().toISOString(),
    metadata: {
      autoGenerated: true,
      category,
      businessValueSignal: true
    }
  };
};

const generateSignalDescription = (
  signalName: string, 
  value: number, 
  unit?: string, 
  trend?: Signal['trend'],
  severity?: Signal['severity']
): string => {
  const valueStr = unit ? `${Math.round(value * 100) / 100}${unit}` : Math.round(value * 100) / 100;
  const trendStr = trend ? ` (${trend})` : '';
  
  // Generate contextual descriptions based on signal type
  if (signalName.includes('Coverage')) {
    return `${signalName} is at ${valueStr}${trendStr}. ${severity === 'critical' ? 'Immediate action required.' : severity === 'high' ? 'Review recommended.' : 'Within acceptable range.'}`;
  }
  
  if (signalName.includes('Cost') || signalName.includes('Spend')) {
    return `${signalName} detected at ${valueStr}${trendStr}. ${severity === 'critical' ? 'Budget variance requires immediate review.' : 'Monitor for optimization opportunities.'}`;
  }
  
  if (signalName.includes('Utilization')) {
    return `${signalName} measured at ${valueStr}${trendStr}. ${value < 50 ? 'Potential for optimization.' : value > 90 ? 'Consider scaling resources.' : 'Operating efficiently.'}`;
  }
  
  if (signalName.includes('Time') || signalName.includes('MTTR')) {
    return `${signalName} is ${valueStr}${trendStr}. ${severity === 'high' ? 'Performance impact detected.' : 'Within SLA targets.'}`;
  }
  
  if (signalName.includes('Score')) {
    return `${signalName} rated at ${valueStr}${trendStr}. ${value > 80 ? 'Excellent performance.' : value > 60 ? 'Good performance.' : 'Improvement opportunities identified.'}`;
  }
  
  return `${signalName}: ${valueStr}${trendStr}. Current performance ${severity === 'low' ? 'meets expectations' : severity === 'medium' ? 'requires monitoring' : 'needs attention'}.`;
};
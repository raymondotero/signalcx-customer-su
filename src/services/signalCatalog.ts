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
  
  // For risk category and "Open" signals, higher values are worse
  if (category === 'risk' || target === 0) {
    if (value > target * 5) return 'critical';
    if (value > target * 3) return 'high';
    if (value > target * 1.5) return 'medium';
    return 'low';
  }
  
  // For coverage/utilization signals, lower values are worse
  if (target >= 80) { // Usually percentage targets
    if (value < target * 0.5) return 'critical';
    if (value < target * 0.7) return 'high';
    if (value < target * 0.9) return 'medium';
    return 'low';
  }
  
  // For other categories, deviation from target determines severity
  if (deviation > 0.6) return 'critical';
  if (deviation > 0.4) return 'high';
  if (deviation > 0.2) return 'medium';
  return 'low';
};

export const getTrendFromHistory = (): Signal['trend'] => {
  const trends: Signal['trend'][] = ['improving', 'stable', 'declining'];
  return trends[Math.floor(Math.random() * trends.length)];
};

// Industry-specific signal mappings for more realistic demo data
export const INDUSTRY_SPECIFIC_SIGNALS = {
  'Technology': ['API Time-to-First-Call', 'Deployment Automation Coverage', 'Feature Cycle Time', 'Build Time P95', 'Test Automation Coverage'],
  'Financial Services': ['PII Access Outliers', 'Data Residency Breaches', 'Audit Findings Open', 'MFA Coverage', 'SSO/SCIM Coverage'],
  'Healthcare': ['Data Residency Breaches', 'PII Access Outliers', 'Audit Findings Open', 'Backup Success Rate', 'Certificate Expiry < 30d'],
  'Manufacturing': ['Rightsizing Opportunity', 'CPU Utilization', 'Host Density', 'Environment Duplication', 'Infrastructure-as-Code Coverage'],
  'Retail': ['Conversion Rate', 'Customer Effort Score', 'MAU/WAU Ratio', 'Search Success Rate', 'Mobile Crash Rate'],
  'Education': ['DAU/MAU Stickiness', 'Feature Flag Adoption', 'Training Hours Last 90d', 'Enablement NPS', 'Community Posts/Month'],
  'Automotive': ['Edge Latency P95', 'Mobile Crash Rate', 'Data Quality Score', 'ETL Failure Rate', 'Schema Drift Incidents'],
  'Agriculture': ['Data Freshness (Hours)', 'Dashboard Views 30d', 'API Calls 30d', 'Event Tracking Coverage', 'Data Quality Score'],
  'Energy': ['Infrastructure-as-Code Coverage', 'SLA Uptime 30d', 'Change Management Violations', 'DR Test Pass Rate', 'Latency P95 SLO']
};

export const generateIndustrySpecificSignal = (accountId: string, accountName: string, industry: string, forcedSeverity?: Signal['severity']): Signal => {
  const industrySignals = INDUSTRY_SPECIFIC_SIGNALS[industry as keyof typeof INDUSTRY_SPECIFIC_SIGNALS];
  
  if (industrySignals && industrySignals.length > 0) {
    const signalName = industrySignals[Math.floor(Math.random() * industrySignals.length)];
    
    // Determine category based on signal name
    let category: keyof typeof SIGNAL_CATALOG = 'data';
    for (const [cat, signals] of Object.entries(SIGNAL_CATALOG)) {
      if (signals.includes(signalName)) {
        category = cat as keyof typeof SIGNAL_CATALOG;
        break;
      }
    }
    
    const { value, unit, target } = generateRealisticValue(signalName, forcedSeverity);
    const severity = forcedSeverity || getSeverityFromValue(value, target, category);
    const trend = getTrendFromHistory();
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
        businessValueSignal: true,
        industrySpecific: true,
        industry,
        lastUpdated: new Date().toISOString()
      }
    };
  }
  
  // Fallback to regular signal generation
  return generateBusinessValueSignal(accountId, accountName, forcedSeverity);
};

export const generateBusinessValueSignal = (accountId: string, accountName: string, forcedSeverity?: Signal['severity']): Signal => {
  const categories = Object.keys(SIGNAL_CATALOG) as Array<keyof typeof SIGNAL_CATALOG>;
  const category = categories[Math.floor(Math.random() * categories.length)];
  const signalName = getRandomSignalName(category);
  
  // Generate value with more realistic distribution
  const { value, unit, target } = generateRealisticValue(signalName, forcedSeverity);
  const severity = forcedSeverity || getSeverityFromValue(value, target, category);
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
      businessValueSignal: true,
      lastUpdated: new Date().toISOString()
    }
  };
};

// Enhanced value generation for more realistic demo data
export const generateRealisticValue = (signalName: string, forcedSeverity?: Signal['severity']): { value: number; unit?: string; target?: number } => {
  let baseResult = generateRandomValue(signalName);
  
  // Ensure we have a target value for calculations
  const target = baseResult.target || 100;
  
  // Adjust values based on forced severity for demo purposes
  if (forcedSeverity) {
    switch (forcedSeverity) {
      case 'critical':
        // Generate values that would be critical
        if (signalName.includes('Coverage') || signalName.includes('Utilization') || signalName.includes('Compliance')) {
          baseResult.value = target * 0.3 + Math.random() * 0.2 * target;
        } else if (signalName.includes('Open') || signalName.includes('Findings') || signalName.includes('Vulns')) {
          baseResult.value = target * 3 + Math.random() * 10; // High counts are critical
        } else if (signalName.includes('Time') || signalName.includes('MTTR') || signalName.includes('Lead Time')) {
          baseResult.value = target * 2 + Math.random() * target;
        } else if (signalName.includes('Cost') || signalName.includes('Spend')) {
          baseResult.value = target * 1.5 + Math.random() * target;
        }
        break;
      case 'high':
        if (signalName.includes('Coverage') || signalName.includes('Utilization') || signalName.includes('Compliance')) {
          baseResult.value = target * 0.6 + Math.random() * 0.2 * target;
        } else if (signalName.includes('Open') || signalName.includes('Findings') || signalName.includes('Vulns')) {
          baseResult.value = target * 1.5 + Math.random() * 5;
        } else if (signalName.includes('Time') || signalName.includes('MTTR') || signalName.includes('Lead Time')) {
          baseResult.value = target * 1.3 + Math.random() * 0.5 * target;
        } else if (signalName.includes('Cost') || signalName.includes('Spend')) {
          baseResult.value = target * 1.2 + Math.random() * 0.3 * target;
        }
        break;
      case 'medium':
        // Keep base values with slight variance
        baseResult.value = target * (0.8 + Math.random() * 0.4);
        break;
      case 'low':
        if (signalName.includes('Coverage') || signalName.includes('Utilization') || signalName.includes('Compliance')) {
          baseResult.value = target * 0.95 + Math.random() * 0.1 * target;
        } else if (signalName.includes('Open') || signalName.includes('Findings') || signalName.includes('Vulns')) {
          baseResult.value = Math.random() * 2; // Very low counts
        } else {
          baseResult.value = target * 0.9 + Math.random() * 0.2 * target;
        }
        break;
    }
  }
  
  return baseResult;
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
  
  // Generate contextual descriptions based on signal type and severity
  if (signalName.includes('Coverage') || signalName.includes('Compliance')) {
    const impactMsg = severity === 'critical' ? 'Critical compliance gap detected - immediate action required.' :
                     severity === 'high' ? 'Coverage below target - review and optimize.' :
                     severity === 'medium' ? 'Moderate improvement opportunity.' :
                     'Meeting compliance targets.';
    return `${signalName} is at ${valueStr}${trendStr}. ${impactMsg}`;
  }
  
  if (signalName.includes('Cost') || signalName.includes('Spend')) {
    const impactMsg = severity === 'critical' ? 'Significant budget variance - immediate cost review needed.' :
                     severity === 'high' ? 'Cost optimization opportunity identified.' :
                     'Within expected spending range.';
    return `${signalName} detected at ${valueStr}${trendStr}. ${impactMsg}`;
  }
  
  if (signalName.includes('Utilization')) {
    const impactMsg = value < 30 ? 'Significant underutilization - consider downsizing resources.' :
                     value < 50 ? 'Potential for resource optimization.' :
                     value > 90 ? 'High utilization - consider scaling resources.' :
                     'Operating within optimal range.';
    return `${signalName} measured at ${valueStr}${trendStr}. ${impactMsg}`;
  }
  
  if (signalName.includes('Time') || signalName.includes('MTTR') || signalName.includes('Lead Time')) {
    const impactMsg = severity === 'critical' ? 'Performance severely impacted - immediate attention required.' :
                     severity === 'high' ? 'Performance degradation detected.' :
                     'Meeting performance targets.';
    return `${signalName} is ${valueStr}${trendStr}. ${impactMsg}`;
  }
  
  if (signalName.includes('Score') || signalName.includes('NPS') || signalName.includes('CSAT')) {
    const impactMsg = value > 80 ? 'Excellent customer satisfaction.' :
                     value > 60 ? 'Good performance with room for improvement.' :
                     value > 40 ? 'Customer satisfaction concerns identified.' :
                     'Critical customer satisfaction issues require immediate attention.';
    return `${signalName} rated at ${valueStr}${trendStr}. ${impactMsg}`;
  }
  
  if (signalName.includes('Open') || signalName.includes('Findings') || signalName.includes('Vulns')) {
    const impactMsg = severity === 'critical' ? 'High volume of open issues - prioritize resolution.' :
                     severity === 'high' ? 'Elevated issue count requires attention.' :
                     'Issue volume within acceptable range.';
    return `${signalName}: ${valueStr}${trendStr}. ${impactMsg}`;
  }
  
  if (signalName.includes('Rate') || signalName.includes('Frequency')) {
    const impactMsg = severity === 'critical' ? 'Rate significantly outside target range.' :
                     severity === 'high' ? 'Performance trending away from target.' :
                     severity === 'medium' ? 'Minor deviation from target performance.' :
                     'Performance within expected range.';
    return `${signalName}: ${valueStr}${trendStr}. ${impactMsg}`;
  }
  
  // Default business-focused description
  const impactMsg = severity === 'critical' ? 'Critical business impact - immediate intervention required.' :
                   severity === 'high' ? 'Significant impact on business objectives.' :
                   severity === 'medium' ? 'Moderate business impact - monitor closely.' :
                   'Performance aligns with business expectations.';
  
  return `${signalName}: ${valueStr}${trendStr}. ${impactMsg}`;
};
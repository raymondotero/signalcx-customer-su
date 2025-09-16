export interface QuarterlyARR {
  quarter: string; // e.g., "Q1 2024"
  arr: number;
  growth: number; // percentage growth from previous quarter
  date: string; // ISO date string
}

export interface ARRTrend {
  quarters: QuarterlyARR[];
  totalGrowth: number; // total growth over the period
  averageQuarterlyGrowth: number; // average quarterly growth rate
  trend: 'accelerating' | 'steady' | 'declining';
  seasonality?: {
    bestQuarter: string;
    worstQuarter: string;
  };
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  arr: number;
  healthScore: number;
  status: 'Good' | 'Watch' | 'At Risk';
  csam: string;
  ae: string;
  contractEnd: string;
  lastActivity: string;
  expansionOpportunity: number;
  arrHistory?: QuarterlyARR[];
  arrTrend?: ARRTrend;
}

export interface AIRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'engagement' | 'retention' | 'expansion' | 'support' | 'onboarding' | 'optimization';
  targetAccounts: string[];
  estimatedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  successMetrics: string[];
  reasoning: string;
}

export interface SignalAnalysis {
  impact: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  affectedAccountsCount: number;
  businessValueAtRisk: string;
  error?: string;
}

export interface Signal {
  id: string;
  timestamp: string;
  accountId: string;
  accountName: string;
  type: 'engagement' | 'usage' | 'support' | 'financial' | 'feature_request' | 'churn_risk' | 'billing' | 'feature' | 'cost' | 'agility' | 'data' | 'risk' | 'culture';
  signalName?: string;
  description: string;
  value?: number;
  unit?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category?: 'cost' | 'agility' | 'data' | 'risk' | 'culture';
  trend?: 'improving' | 'stable' | 'declining';
  target?: number;
  metadata?: Record<string, any>;
  aiRecommendations?: AIRecommendation[];
  aiAnalysis?: SignalAnalysis;
}

export interface NextBestAction {
  id: string;
  accountId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'engagement' | 'retention' | 'expansion' | 'support' | 'onboarding';
  estimatedImpact: string;
  effort: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  reasoning: string;
  generatedAt: string;
  createdAt?: string;
  timeToComplete?: string;
  assignedTo?: string;
}

export interface MemoryEntry {
  id: string;
  timestamp: string;
  type: 'approval_requested' | 'workflow_executed' | 'signal_processed' | 'nba_generated' | 'approval_decided';
  accountId?: string;
  accountName?: string;
  description: string;
  metadata?: Record<string, any>;
  outcome: 'success' | 'failure' | 'pending' | 'rejected';
}

export interface AdaptiveCard {
  type: string;
  version: string;
  accountId?: string;
  accountName?: string;
  requestedBy?: string;
  requestedAt?: string;
  action?: string;
  reasoning?: string;
  estimatedImpact?: string;
  body: Array<{
    type: string;
    text?: string;
    size?: string;
    weight?: string;
    color?: string;
    columns?: Array<{
      type: string;
      width: string;
      items: Array<{
        type: string;
        text: string;
        size?: string;
        weight?: string;
      }>;
    }>;
  }>;
  actions: Array<{
    type: string;
    title: string;
    style?: string;
    data: Record<string, any>;
  }>;
}

// Legacy type alias for compatibility
export type AgentMemoryEntry = MemoryEntry;
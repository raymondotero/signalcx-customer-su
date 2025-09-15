export interface Account {
  id: string;
  name: string;
  arr: number;
  healthScore: number;
  status: 'Good' | 'Watch' | 'At Risk';
  industry: string;
  csam: string;
  ae: string;
  lastActivity: string;
  contractEnd: string;
  expansionOpportunity: number;
}

export interface Signal {
  id: string;
  accountId: string;
  accountName: string;
  type: 'cost' | 'agility' | 'data' | 'risk' | 'culture' | 'usage' | 'engagement' | 'support' | 'billing' | 'feature';
  signalName: string;
  description: string;
  value: number;
  unit?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  category: 'cost' | 'agility' | 'data' | 'risk' | 'culture';
  trend?: 'improving' | 'stable' | 'declining';
  target?: number;
  metadata?: Record<string, any>;
}

export interface NextBestAction {
  id: string;
  accountId: string;
  title: string;
  description: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'retention' | 'expansion' | 'engagement' | 'support';
  estimatedImpact: string;
  timeToComplete: string;
  assignedTo?: string;
  createdAt: string;
}

export interface AgentMemoryEntry {
  id: string;
  timestamp: string;
  type: 'nba_generated' | 'workflow_executed' | 'approval_requested' | 'approval_decided';
  accountId?: string;
  accountName?: string;
  description: string;
  metadata?: Record<string, any>;
  outcome?: 'success' | 'failure' | 'pending';
}

export interface AdaptiveCard {
  type: 'approval';
  accountId: string;
  accountName: string;
  action: string;
  reasoning: string;
  estimatedImpact: string;
  requestedBy: string;
  requestedAt: string;
}
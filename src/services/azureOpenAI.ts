import { Account, Signal, NextBestAction, MemoryEntry } from '@/types';

export interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion?: string;
}

export interface RecommendationContext {
  account: Account;
  recentSignals: Signal[];
  historicalNBAs: NextBestAction[];
  agentMemory: MemoryEntry[];
}

export interface SmartRecommendation {
  nba: NextBestAction;
  confidence: number;
  rationale: string;
  supportingSignals: Signal[];
  riskFactors: string[];
  successProbability: number;
}

export class AzureOpenAIService {
  private config: AzureOpenAIConfig;

  constructor(config?: Partial<AzureOpenAIConfig>) {
    // Use environment variables or fallback to mock config for demo
    this.config = {
      endpoint: config?.endpoint || 'https://signalcx-aoai.openai.azure.com/',
      apiKey: config?.apiKey || 'demo-key',
      deployment: config?.deployment || 'gpt-4o-mini',
      apiVersion: config?.apiVersion || '2024-02-15-preview',
      ...config
    };
  }

  /**
   * Generate intelligent NBA recommendations using Azure OpenAI
   */
  async generateSmartRecommendations(context: RecommendationContext): Promise<SmartRecommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(context);
      const response = await (window as any).spark.llm(prompt, 'gpt-4o', true);
      const parsed = JSON.parse(response);
      
      return this.parseRecommendations(parsed.recommendations, context);
    } catch (error) {
      console.error('Error generating smart recommendations:', error);
      return this.generateFallbackRecommendations(context);
    }
  }

  /**
   * Analyze signals in real-time and generate contextual insights
   */
  async analyzeSignalsRealTime(signals: Signal[], accounts: Account[]): Promise<{
    insights: string[];
    urgentActions: NextBestAction[];
    riskAlerts: { accountId: string; risk: string; severity: 'medium' | 'high' | 'critical' }[];
  }> {
    try {
      const prompt = this.buildSignalAnalysisPrompt(signals, accounts);
      const response = await (window as any).spark.llm(prompt, 'gpt-4o', true);
      const parsed = JSON.parse(response);
      
      return {
        insights: parsed.insights || [],
        urgentActions: parsed.urgentActions || [],
        riskAlerts: parsed.riskAlerts || []
      };
    } catch (error) {
      console.error('Error analyzing signals:', error);
      return {
        insights: ['Signal analysis temporarily unavailable'],
        urgentActions: [],
        riskAlerts: []
      };
    }
  }

  /**
   * Generate adaptive orchestration plans
   */
  async generateOrchestrationPlan(nba: NextBestAction, context: RecommendationContext): Promise<{
    steps: Array<{
      id: string;
      title: string;
      description: string;
      order: number;
      estimatedDuration: string;
      dependencies: string[];
      assignedTo?: string;
    }>;
    timeline: string;
    riskMitigation: string[];
    successMetrics: string[];
  }> {
    try {
      const prompt = this.buildOrchestrationPrompt(nba, context);
      const response = await (window as any).spark.llm(prompt, 'gpt-4o', true);
      const parsed = JSON.parse(response);
      
      return {
        steps: parsed.steps || [],
        timeline: parsed.timeline || 'Timeline not available',
        riskMitigation: parsed.riskMitigation || [],
        successMetrics: parsed.successMetrics || []
      };
    } catch (error) {
      console.error('Error generating orchestration plan:', error);
      return {
        steps: [],
        timeline: 'Plan generation failed',
        riskMitigation: [],
        successMetrics: []
      };
    }
  }

  /**
   * Provide conversational AI assistance
   */
  async getAIAssistance(query: string, context: RecommendationContext): Promise<string> {
    try {
      const prompt = (window as any).spark.llmPrompt`You are SignalCX AI, an expert Customer Success assistant. 
      
      Account Context: ${JSON.stringify(context.account, null, 2)}
      Recent Signals: ${JSON.stringify(context.recentSignals.slice(0, 5), null, 2)}
      
      User Query: ${query}
      
      Provide a helpful, actionable response that leverages the account context. Be specific and professional.`;
      
      return await (window as any).spark.llm(prompt, 'gpt-4o-mini');
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      return 'I apologize, but I am temporarily unable to provide assistance. Please try again in a moment.';
    }
  }

  private buildRecommendationPrompt(context: RecommendationContext): string {
    return (window as any).spark.llmPrompt`You are an expert Customer Success AI analyzing account health and generating Next Best Actions.

Account Profile:
- Name: ${context.account.name}
- Industry: ${context.account.industry}
- ARR: $${context.account.arr.toLocaleString()}
- Health Score: ${context.account.healthScore}/100
- Status: ${context.account.status}
- CSM: ${context.account.csm}
- Contract End: ${context.account.contractEnd}
- Last Activity: ${context.account.lastActivity}

Recent Signals (last 7 days):
${JSON.stringify(context.recentSignals, null, 2)}

Historical NBA Performance:
${JSON.stringify(context.historicalNBAs.slice(0, 3), null, 2)}

Agent Memory (recent actions):
${JSON.stringify(context.agentMemory.slice(0, 5), null, 2)}

Generate 2-3 intelligent Next Best Action recommendations. Each should be highly contextual, data-driven, and actionable.

Return a JSON object with this exact structure:
{
  "recommendations": [
    {
      "nba": {
        "id": "nba_${Date.now()}_1",
        "accountId": "${context.account.id}",
        "title": "Specific, actionable title",
        "description": "Detailed description with context",
        "priority": "high|medium|low|critical",
        "category": "engagement|retention|expansion|support|onboarding",
        "estimatedImpact": "Specific measurable impact",
        "effort": "low|medium|high",
        "suggestedActions": ["Action 1", "Action 2", "Action 3"],
        "reasoning": "Data-driven reasoning with signal references",
        "generatedAt": "${new Date().toISOString()}",
        "timeToComplete": "Estimated timeline",
        "assignedTo": "Suggested owner"
      },
      "confidence": 0.85,
      "rationale": "Why this recommendation is high confidence",
      "supportingSignals": ["signal_id_1", "signal_id_2"],
      "riskFactors": ["Potential risk 1", "Potential risk 2"],
      "successProbability": 0.78
    }
  ]
}`;
  }

  private buildSignalAnalysisPrompt(signals: Signal[], accounts: Account[]): string {
    return (window as any).spark.llmPrompt`You are a real-time Customer Success AI analyzing incoming signals for immediate insights and urgent actions.

Recent Signals (last 30 minutes):
${JSON.stringify(signals.slice(0, 10), null, 2)}

Account Context:
${JSON.stringify(accounts.slice(0, 5), null, 2)}

Analyze these signals for:
1. Immediate insights and patterns
2. Urgent actions needed within 24 hours
3. Risk alerts requiring immediate attention

Return a JSON object with this structure:
{
  "insights": [
    "Pattern or insight from signal analysis"
  ],
  "urgentActions": [
    {
      "id": "urgent_${Date.now()}_1",
      "accountId": "account_id",
      "title": "Urgent action title",
      "description": "What needs to be done immediately",
      "priority": "critical",
      "category": "support|retention|engagement",
      "estimatedImpact": "Immediate impact if completed",
      "effort": "low|medium|high",
      "suggestedActions": ["Immediate step 1", "Immediate step 2"],
      "reasoning": "Why this is urgent based on signals",
      "generatedAt": "${new Date().toISOString()}",
      "timeToComplete": "Within 24 hours"
    }
  ],
  "riskAlerts": [
    {
      "accountId": "account_id",
      "risk": "Specific risk description",
      "severity": "medium|high|critical"
    }
  ]
}`;
  }

  private buildOrchestrationPrompt(nba: NextBestAction, context: RecommendationContext): string {
    return (window as any).spark.llmPrompt`You are a Customer Success workflow orchestration AI. Create a detailed execution plan for this NBA.

Next Best Action:
${JSON.stringify(nba, null, 2)}

Account Context:
${JSON.stringify(context.account, null, 2)}

Create a step-by-step orchestration plan with timeline, dependencies, and risk mitigation.

Return a JSON object with this structure:
{
  "steps": [
    {
      "id": "step_1",
      "title": "Step title",
      "description": "Detailed step description",
      "order": 1,
      "estimatedDuration": "2 hours",
      "dependencies": [],
      "assignedTo": "CSM|Support|Account Manager"
    }
  ],
  "timeline": "Overall timeline estimate",
  "riskMitigation": ["Risk mitigation strategy 1"],
  "successMetrics": ["Metric to measure success"]
}`;
  }

  private parseRecommendations(recommendations: any[], context: RecommendationContext): SmartRecommendation[] {
    return recommendations.map(rec => ({
      nba: {
        ...rec.nba,
        id: rec.nba.id || `nba_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        accountId: context.account.id,
        generatedAt: new Date().toISOString()
      },
      confidence: rec.confidence || 0.75,
      rationale: rec.rationale || 'AI-generated recommendation',
      supportingSignals: context.recentSignals.filter(s => 
        rec.supportingSignals?.includes(s.id) || s.accountId === context.account.id
      ),
      riskFactors: rec.riskFactors || [],
      successProbability: rec.successProbability || 0.70
    }));
  }

  private generateFallbackRecommendations(context: RecommendationContext): SmartRecommendation[] {
    const { account, recentSignals } = context;
    
    const recommendations: SmartRecommendation[] = [];
    
    // Health-based recommendations
    if (account.healthScore < 70) {
      recommendations.push({
        nba: {
          id: `fallback_${Date.now()}_health`,
          accountId: account.id,
          title: 'Health Score Recovery Plan',
          description: `Account health score is ${account.healthScore}/100. Immediate intervention required.`,
          priority: account.healthScore < 50 ? 'critical' : 'high',
          category: 'retention',
          estimatedImpact: 'Prevent churn, improve satisfaction',
          effort: 'medium',
          suggestedActions: [
            'Schedule health score review call',
            'Analyze usage patterns',
            'Identify success blockers'
          ],
          reasoning: 'Low health score indicates potential churn risk',
          generatedAt: new Date().toISOString(),
          timeToComplete: '3-5 days',
          assignedTo: account.csm
        },
        confidence: 0.80,
        rationale: 'Health score below optimal threshold',
        supportingSignals: recentSignals.filter(s => s.severity === 'high' || s.severity === 'critical'),
        riskFactors: ['Potential churn if not addressed'],
        successProbability: 0.75
      });
    }
    
    return recommendations;
  }
}

// Singleton instance
export const azureOpenAI = new AzureOpenAIService();
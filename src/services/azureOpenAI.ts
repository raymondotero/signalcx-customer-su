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
      
      // Check if spark is available
      if (!(window as any).spark || !(window as any).spark.llm) {
        console.warn('Spark AI service not available, using fallback recommendations');
        return this.generateFallbackRecommendations(context);
      }
      
      const response = await (window as any).spark.llm(prompt, 'gpt-4o', true);
      const parsed = JSON.parse(response);
      
      return this.parseRecommendations(parsed.recommendations || [], context);
    } catch (error) {
      console.error('Error generating smart recommendations:', error);
      return this.generateFallbackRecommendations(context);
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
      // Check if spark is available
      if (!(window as any).spark || !(window as any).spark.llm) {
        throw new Error('Spark AI service not available');
      }
      
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
        steps: [
          {
            id: 'step_1',
            title: 'Preparation',
            description: 'Gather context and prepare for execution',
            order: 1,
            estimatedDuration: '30 minutes',
            dependencies: [],
            assignedTo: 'CSM'
          },
          {
            id: 'step_2',
            title: 'Execute Action',
            description: nba.description,
            order: 2,
            estimatedDuration: '1-2 hours',
            dependencies: ['step_1'],
            assignedTo: nba.assignedTo || 'CSM'
          },
          {
            id: 'step_3',
            title: 'Follow-up',
            description: 'Monitor results and plan next steps',
            order: 3,
            estimatedDuration: '1 hour',
            dependencies: ['step_2'],
            assignedTo: 'CSM'
          }
        ],
        timeline: nba.timeToComplete || '3-5 days',
        riskMitigation: ['Regular check-ins with stakeholders'],
        successMetrics: ['Improved engagement metrics', 'Positive stakeholder feedback']
      };
    }
  }

  /**
   * Provide conversational AI assistance
   */
  async getAIAssistance(query: string, context: RecommendationContext): Promise<string> {
    try {
      // Check if spark is available
      if (!(window as any).spark || !(window as any).spark.llmPrompt || !(window as any).spark.llm) {
        return 'I apologize, but the AI assistance service is currently unavailable. Please try again later.';
      }
      
      const prompt = (window as any).spark.llmPrompt`You are SignalCX AI, an expert Customer Success assistant. 
      
      Account Context: ${JSON.stringify(context.account, null, 2)}
      Recent Signals: ${JSON.stringify(context.recentSignals.slice(0, 5), null, 2)}
      Recent Actions: ${JSON.stringify(context.historicalNBAs.slice(0, 3), null, 2)}
      
      Question: ${query}
      
      Provide a helpful, specific answer based on the account context. Keep it concise but actionable.`;
      
      return await (window as any).spark.llm(prompt, 'gpt-4o');
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      return 'I apologize, but I am currently unable to process your request. Please try again later or contact support for assistance.';
    }
  }

  /**
   * Analyze signals in real-time
   */
  async analyzeSignalsRealTime(signals: Signal[], accounts: Account[]): Promise<{
    insights: string[];
    risks: Array<{ accountId: string; risk: string; severity: 'medium' | 'high' | 'critical' }>;
    recommendations: Array<{ accountId: string; action: string; priority: 'low' | 'medium' | 'high'; effort: 'low' | 'medium' | 'high'; estimatedImpact: string }>;
  }> {
    try {
      // Check if spark is available
      if (!(window as any).spark || !(window as any).spark.llm) {
        console.warn('Spark AI service not available, using basic signal analysis');
        return {
          insights: ['Signal analysis temporarily unavailable - using basic pattern detection'],
          risks: [],
          recommendations: []
        };
      }
      
      const prompt = this.buildSignalAnalysisPrompt(signals, accounts);
      const response = await (window as any).spark.llm(prompt, 'gpt-4o', true);
      const parsed = JSON.parse(response);
      
      return {
        insights: parsed.insights || [],
        risks: parsed.risks || [],
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('Error analyzing signals:', error);
      return {
        insights: ['Signal analysis temporarily unavailable'],
        risks: [],
        recommendations: []
      };
    }
  }

  private buildRecommendationPrompt(context: RecommendationContext): string {
    return (window as any).spark.llmPrompt`You are an AI Customer Success expert with deep knowledge of Microsoft's solution portfolio. Analyze this account and generate 2-3 smart NBA recommendations.

Account Information:
${JSON.stringify(context.account, null, 2)}

Recent Signals (last 10):
${JSON.stringify(context.recentSignals, null, 2)}

Historical NBAs:
${JSON.stringify(context.historicalNBAs, null, 2)}

Agent Memory:
${JSON.stringify(context.agentMemory, null, 2)}

For expansion opportunities, recommend specific Microsoft solutions and delivery motions based on:
- Account industry: ${context.account.industry}
- Account size (ARR): $${context.account.arr.toLocaleString()}
- Current health score: ${context.account.healthScore}/100

Microsoft Solution Portfolio:
- AI & Analytics: Azure OpenAI Service, Microsoft Copilot for Microsoft 365, Azure AI Services, Microsoft Fabric
- Security & Compliance: Microsoft Purview, Microsoft Sentinel, Microsoft Defender suite, Azure AD Premium
- Cloud Infrastructure: Azure Hybrid Cloud, Azure Arc, Azure VMware Solution
- Productivity: Microsoft Teams Premium, Microsoft Viva Suite, Power Platform
- Data & Analytics: Microsoft Fabric, Azure Synapse Analytics, Power BI Premium

Delivery Motions to Consider:
- AI Acceleration Workshop, Copilot Readiness Assessment, Security Risk Assessment
- Cloud Adoption Framework Workshop, Modern Work Assessment, Data Estate Modernization Workshop
- Well-Architected Review, Zero Trust Workshop, Power Platform Center of Excellence

Generate recommendations as a JSON object with this structure:
{
  "recommendations": [
    {
      "nba": {
        "title": "Concise action title",
        "description": "Detailed description of the action",
        "priority": "low|medium|high|critical",
        "category": "engagement|retention|expansion|support|onboarding",
        "estimatedImpact": "Expected business impact",
        "effort": "low|medium|high",
        "suggestedActions": ["Specific step 1", "Specific step 2"],
        "reasoning": "Why this action is recommended",
        "timeToComplete": "1-2 weeks",
        "assignedTo": "${context.account.csam}",
        "microsoftSolutions": ["Solution 1", "Solution 2"] (only for expansion category),
        "deliveryMotions": ["Motion 1", "Motion 2"] (only for expansion category),
        "partnerMotions": ["Partner motion 1"] (only for expansion category)
      },
      "confidence": 0.85,
      "rationale": "Why this recommendation is valuable",
      "supportingSignals": ["signal_id_1", "signal_id_2"],
      "riskFactors": ["Potential risk 1"],
      "successProbability": 0.80
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

  private buildSignalAnalysisPrompt(signals: Signal[], accounts: Account[]): string {
    return (window as any).spark.llmPrompt`Analyze these recent signals across accounts and provide insights.

Signals:
${JSON.stringify(signals.slice(0, 20), null, 2)}

Accounts:
${JSON.stringify(accounts.slice(0, 10), null, 2)}

Provide analysis as JSON:
{
  "insights": ["General insight about patterns", "Another insight"],
  "risks": [
    {
      "accountId": "account_id",
      "risk": "Specific risk description with business value context",
      "severity": "medium|high|critical",
      "category": "cost|agility|data|risk|culture"
    }
  ],
  "recommendations": [
    {
      "accountId": "account_id",
      "action": "Specific recommended action",
      "priority": "low|medium|high",
      "effort": "low|medium|high",
      "estimatedImpact": "Expected impact description"
    }
  ]
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
          assignedTo: account.csam
        },
        confidence: 0.80,
        rationale: 'Health score below optimal threshold',
        supportingSignals: recentSignals.filter(s => s.severity === 'high' || s.severity === 'critical'),
        riskFactors: ['Potential churn if not addressed'],
        successProbability: 0.75
      });
    }

    // Status-based recommendations
    if (account.status === 'At Risk') {
      recommendations.push({
        nba: {
          id: `fallback_${Date.now()}_atrisk`,
          accountId: account.id,
          title: 'Critical Account Recovery',
          description: `Account marked as "At Risk". Immediate escalation and intervention required.`,
          priority: 'critical',
          category: 'retention',
          estimatedImpact: 'Prevent churn, restore account confidence',
          effort: 'high',
          suggestedActions: [
            'Schedule emergency stakeholder call',
            'Review recent issues and escalations',
            'Create detailed recovery plan'
          ],
          reasoning: 'At-risk status requires immediate executive attention',
          generatedAt: new Date().toISOString(),
          timeToComplete: '1-2 weeks',
          assignedTo: account.csam
        },
        confidence: 0.85,
        rationale: 'Account in at-risk status requires immediate intervention',
        supportingSignals: recentSignals.filter(s => s.severity === 'critical'),
        riskFactors: ['High churn probability'],
        successProbability: 0.60
      });
    } else if (account.status === 'Watch') {
      recommendations.push({
        nba: {
          id: `fallback_${Date.now()}_watch`,
          accountId: account.id,
          title: 'Proactive Engagement Plan',
          description: `Account on "Watch" status. Increase engagement to prevent issues.`,
          priority: 'high',
          category: 'engagement',
          estimatedImpact: 'Improve satisfaction, prevent escalation',
          effort: 'medium',
          suggestedActions: [
            'Increase check-in frequency',
            'Review feature adoption',
            'Identify success roadblocks'
          ],
          reasoning: 'Proactive intervention can prevent account deterioration',
          generatedAt: new Date().toISOString(),
          timeToComplete: '1 week',
          assignedTo: account.csam
        },
        confidence: 0.75,
        rationale: 'Watch status indicates need for increased attention',
        supportingSignals: recentSignals.filter(s => s.severity === 'medium' || s.severity === 'high'),
        riskFactors: ['Potential degradation without intervention'],
        successProbability: 0.80
      });
    }

    // Contract expiration recommendations
    const contractEnd = new Date(account.contractEnd);
    const monthsToExpire = (contractEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsToExpire <= 6 && monthsToExpire > 0) {
      recommendations.push({
        nba: {
          id: `fallback_${Date.now()}_renewal`,
          accountId: account.id,
          title: 'Contract Renewal Preparation',
          description: `Contract expires in ${Math.round(monthsToExpire)} months. Begin renewal discussions.`,
          priority: monthsToExpire <= 3 ? 'high' : 'medium',
          category: 'retention',
          estimatedImpact: 'Secure renewal, identify expansion opportunities',
          effort: 'medium',
          suggestedActions: [
            'Schedule renewal kickoff meeting',
            'Prepare ROI documentation',
            'Identify expansion opportunities'
          ],
          reasoning: 'Proactive renewal process improves success rates',
          generatedAt: new Date().toISOString(),
          timeToComplete: '2-4 weeks',
          assignedTo: account.csam
        },
        confidence: 0.70,
        rationale: 'Contract expiration approaching',
        supportingSignals: [],
        riskFactors: ['Renewal uncertainty'],
        successProbability: 0.85
      });
    }

    // Expansion opportunity recommendations
    if (account.expansionOpportunity && account.expansionOpportunity > 0 && account.status === 'Good') {
      // Determine Microsoft solutions based on account characteristics
      const getMicrosoftSolutions = () => {
        const solutions: string[] = [];
        const deliveryMotions: string[] = [];
        
        // AI/Analytics expansion opportunities
        if (account.industry === 'Technology' || account.industry === 'Healthcare' || account.industry === 'Financial Services') {
          solutions.push('Azure OpenAI Service', 'Microsoft Copilot for Microsoft 365', 'Azure AI Services');
          deliveryMotions.push('AI Acceleration Workshop', 'Copilot Readiness Assessment', 'Data & AI Strategy Session');
        }
        
        // Security & Compliance expansion
        if (account.industry === 'Financial Services' || account.industry === 'Healthcare' || account.industry === 'Government') {
          solutions.push('Microsoft Purview', 'Microsoft Sentinel', 'Microsoft Defender suite');
          deliveryMotions.push('Security Risk Assessment', 'Zero Trust Workshop', 'Compliance Readiness Review');
        }
        
        // Cloud Infrastructure expansion
        if (account.arr >= 500000) { // Large accounts
          solutions.push('Azure Hybrid Cloud', 'Azure Arc', 'Microsoft Fabric');
          deliveryMotions.push('Cloud Adoption Framework Workshop', 'Azure Migration Assessment', 'Well-Architected Review');
        }
        
        // Productivity & Collaboration
        solutions.push('Microsoft Teams Premium', 'Microsoft Viva Suite', 'Power Platform');
        deliveryMotions.push('Modern Work Assessment', 'Digital Employee Experience Workshop', 'Power Platform Center of Excellence');
        
        // Data & Analytics
        if (account.industry === 'Retail' || account.industry === 'Manufacturing' || account.industry === 'Financial Services') {
          solutions.push('Microsoft Fabric', 'Azure Synapse Analytics', 'Power BI Premium');
          deliveryMotions.push('Data Estate Modernization Workshop', 'Analytics Solution Design Session', 'Self-Service BI Enablement');
        }
        
        return { solutions: solutions.slice(0, 3), deliveryMotions: deliveryMotions.slice(0, 3) };
      };

      const { solutions, deliveryMotions } = getMicrosoftSolutions();
      
      recommendations.push({
        nba: {
          id: `fallback_${Date.now()}_expansion`,
          accountId: account.id,
          title: 'Microsoft Solution Expansion Opportunity',
          description: `Potential $${account.expansionOpportunity.toLocaleString()} expansion identified with Microsoft solutions. Recommended solutions: ${solutions.join(', ')}.`,
          priority: 'medium',
          category: 'expansion',
          estimatedImpact: `$${account.expansionOpportunity.toLocaleString()} ARR increase through ${solutions[0]} and complementary solutions`,
          effort: 'medium',
          suggestedActions: [
            `Conduct ${deliveryMotions[0]} to assess readiness`,
            `Present ${solutions[0]} business case with ROI projections`,
            `Schedule executive briefing on ${solutions.slice(0, 2).join(' and ')}`,
            `Engage Microsoft Partner or Solutions Architect for technical deep-dive`,
            `Develop phased deployment plan with success metrics`
          ],
          reasoning: `Strong account health (${account.healthScore}/100) and ${account.industry} industry fit supports expansion with Microsoft cloud solutions`,
          generatedAt: new Date().toISOString(),
          timeToComplete: '6-12 weeks',
          assignedTo: account.csam,
          microsoftSolutions: solutions,
          deliveryMotions: deliveryMotions,
          partnerMotions: [
            'Engage Microsoft Account Team for co-selling support',
            'Leverage Microsoft funding opportunities (Azure credits, proof-of-concept funding)',
            'Coordinate with Microsoft Technical Specialists for solution validation'
          ]
        },
        confidence: 0.75,
        rationale: `Healthy ${account.industry} account with strong expansion potential for Microsoft cloud and AI solutions`,
        supportingSignals: [],
        riskFactors: ['Competitive landscape', 'Budget approval cycles', 'Technical readiness'],
        successProbability: 0.75
      });
    }

    // Signal-based recommendations
    const criticalSignals = recentSignals.filter(s => s.severity === 'critical');
    if (criticalSignals.length > 0) {
      recommendations.push({
        nba: {
          id: `fallback_${Date.now()}_signals`,
          accountId: account.id,
          title: 'Critical Signal Resolution',
          description: `${criticalSignals.length} critical signals detected requiring immediate attention.`,
          priority: 'critical',
          category: 'support',
          estimatedImpact: 'Resolve urgent issues, improve satisfaction',
          effort: 'high',
          suggestedActions: [
            'Review all critical signals',
            'Prioritize by business impact',
            'Escalate to technical teams'
          ],
          reasoning: 'Critical signals indicate urgent operational issues',
          generatedAt: new Date().toISOString(),
          timeToComplete: '1-3 days',
          assignedTo: account.csam
        },
        confidence: 0.90,
        rationale: 'Critical signals require immediate attention',
        supportingSignals: criticalSignals,
        riskFactors: ['Service degradation', 'Customer frustration'],
        successProbability: 0.80
      });
    }

    // Default general recommendation if no specific issues found
    if (recommendations.length === 0) {
      recommendations.push({
        nba: {
          id: `fallback_${Date.now()}_general`,
          accountId: account.id,
          title: 'Regular Account Review',
          description: 'Conduct comprehensive account health check and engagement review.',
          priority: 'medium',
          category: 'engagement',
          estimatedImpact: 'Maintain strong relationship, identify opportunities',
          effort: 'low',
          suggestedActions: [
            'Schedule quarterly business review',
            'Review usage analytics',
            'Gather stakeholder feedback'
          ],
          reasoning: 'Regular engagement maintains account health',
          generatedAt: new Date().toISOString(),
          timeToComplete: '1-2 weeks',
          assignedTo: account.csam
        },
        confidence: 0.60,
        rationale: 'Standard account management best practice',
        supportingSignals: [],
        riskFactors: [],
        successProbability: 0.85
      });
    }
    
    return recommendations;
  }
}

// Singleton instance
export const azureOpenAI = new AzureOpenAIService();
import { NextBestAction, Account } from '@/types';
import { toast } from 'sonner';

export interface Dynamics365OpportunityData {
  name: string;
  description: string;
  accountName: string;
  accountId?: string;
  estimatedValue: string;
  priority: string;
  category: string;
  reasoning: string;
  solutions: string[];
  confidence?: number;
  targetImpact?: any;
  estimatedCloseDate?: string;
  probability?: number;
}

export interface Dynamics365Config {
  baseUrl: string;
  clientId: string;
  tenantId: string;
  environment: string;
  isConnected: boolean;
}

class Dynamics365IntegrationService {
  private config: Dynamics365Config = {
    baseUrl: 'https://yourorg.crm.dynamics.com',
    clientId: 'your-client-id',
    tenantId: 'your-tenant-id', 
    environment: 'prod',
    isConnected: false
  };

  /**
   * Initialize the Dynamics 365 connection
   */
  async initialize(): Promise<boolean> {
    try {
      // In a real implementation, this would authenticate with Dynamics 365
      // For demo purposes, we simulate a successful connection
      this.config.isConnected = true;
      
      console.log('Dynamics 365 integration initialized', this.config);
      return true;
    } catch (error) {
      console.error('Failed to initialize Dynamics 365 integration:', error);
      return false;
    }
  }

  /**
   * Check if Dynamics 365 is connected and ready
   */
  isConnected(): boolean {
    return this.config.isConnected;
  }

  /**
   * Create an opportunity in Dynamics 365 CRM from an NBA recommendation
   */
  async createOpportunity(nba: NextBestAction, account: Account, additionalData?: any): Promise<string | null> {
    if (!this.isConnected()) {
      toast.error('Dynamics 365 not connected. Please configure integration first.');
      return null;
    }

    try {
      const opportunityData = this.mapNBAToOpportunity(nba, account, additionalData);
      
      // Log the opportunity data for demonstration
      console.log('Creating Dynamics 365 Opportunity:', opportunityData);
      
      // In a real implementation, this would make an API call to Dynamics 365
      const opportunityId = await this.sendToD365(opportunityData);
      
      // Show success notification with opportunity details
      toast.success(
        `✅ Opportunity created in Dynamics 365: "${opportunityData.name}"`,
        {
          description: `Account: ${account.name} | Estimated Value: ${opportunityData.estimatedValue}`,
          duration: 6000
        }
      );

      // Add opportunity tracking to agent memory if available
      this.trackOpportunityCreation(opportunityId, opportunityData, account);

      return opportunityId;
    } catch (error) {
      console.error('Failed to create Dynamics 365 opportunity:', error);
      toast.error('Failed to create opportunity in Dynamics 365. Please try again.');
      return null;
    }
  }

  /**
   * Map NBA data to Dynamics 365 opportunity format
   */
  private mapNBAToOpportunity(nba: NextBestAction, account: Account, additionalData?: any): Dynamics365OpportunityData {
    // Extract estimated value from NBA description or use default
    const estimatedValue = this.extractEstimatedValue(nba.estimatedImpact);
    
    // Calculate probability based on priority and confidence
    const probability = this.calculateProbability(nba.priority, additionalData?.confidence);
    
    // Estimate close date based on effort and priority
    const estimatedCloseDate = this.calculateCloseDate(nba.effort, nba.priority);

    return {
      name: nba.title,
      description: this.buildOpportunityDescription(nba, account),
      accountName: account.name,
      accountId: account.id,
      estimatedValue,
      priority: nba.priority,
      category: nba.category,
      reasoning: nba.reasoning,
      solutions: nba.microsoftSolutions || [],
      confidence: additionalData?.confidence,
      targetImpact: additionalData?.targetImpact,
      estimatedCloseDate,
      probability
    };
  }

  /**
   * Build comprehensive opportunity description
   */
  private buildOpportunityDescription(nba: NextBestAction, account: Account): string {
    let description = `${nba.description}\n\n`;
    
    description += `**Account Context:**\n`;
    description += `- Health Score: ${account.healthScore}/100\n`;
    description += `- Current ARR: $${(account.arr / 1000000).toFixed(2)}M\n`;
    description += `- Status: ${account.status}\n`;
    description += `- Industry: ${account.industry}\n\n`;
    
    description += `**Recommendation Details:**\n`;
    description += `- Priority: ${nba.priority.toUpperCase()}\n`;
    description += `- Category: ${nba.category}\n`;
    description += `- Effort: ${nba.effort}\n`;
    description += `- Estimated Impact: ${nba.estimatedImpact}\n\n`;

    if (nba.suggestedActions?.length > 0) {
      description += `**Suggested Actions:**\n`;
      nba.suggestedActions.forEach((action, index) => {
        description += `${index + 1}. ${action}\n`;
      });
      description += '\n';
    }

    if (nba.microsoftSolutions && nba.microsoftSolutions.length > 0) {
      description += `**Microsoft Solutions:**\n`;
      nba.microsoftSolutions.forEach(solution => {
        description += `- ${solution}\n`;
      });
      description += '\n';
    }

    if (nba.deliveryMotions && nba.deliveryMotions.length > 0) {
      description += `**Delivery Motions:**\n`;
      nba.deliveryMotions.forEach(motion => {
        description += `- ${motion}\n`;
      });
      description += '\n';
    }

    description += `**AI Reasoning:**\n${nba.reasoning}\n\n`;
    description += `Generated by SignalCX AI on ${new Date().toLocaleString()}`;

    return description;
  }

  /**
   * Extract monetary value from impact string
   */
  private extractEstimatedValue(impact: string): string {
    // Look for patterns like $2.8M, $89M, etc.
    const valueMatch = impact.match(/\$([0-9.]+)([MK]?)/);
    if (valueMatch) {
      const [, amount, unit] = valueMatch;
      const multiplier = unit === 'M' ? 1000000 : unit === 'K' ? 1000 : 1;
      return `$${(parseFloat(amount) * multiplier).toLocaleString()}`;
    }
    
    // Default estimated value if no monetary amount found
    return '$100,000';
  }

  /**
   * Calculate probability based on priority and confidence
   */
  private calculateProbability(priority: string, confidence?: number): number {
    let baseProbability = 0;
    
    switch (priority) {
      case 'critical': baseProbability = 0.9; break;
      case 'high': baseProbability = 0.7; break;
      case 'medium': baseProbability = 0.5; break;
      case 'low': baseProbability = 0.3; break;
      default: baseProbability = 0.5;
    }

    // Adjust by confidence if available
    if (confidence) {
      baseProbability = (baseProbability + confidence) / 2;
    }

    return Math.min(Math.max(baseProbability * 100, 10), 95); // 10-95% range
  }

  /**
   * Calculate estimated close date based on effort and priority
   */
  private calculateCloseDate(effort: string, priority: string): string {
    let daysToAdd = 90; // Default 3 months

    // Adjust based on effort
    switch (effort) {
      case 'low': daysToAdd = 30; break;
      case 'medium': daysToAdd = 60; break;
      case 'high': daysToAdd = 120; break;
    }

    // Adjust based on priority (urgent items close faster)
    switch (priority) {
      case 'critical': daysToAdd = Math.max(daysToAdd * 0.5, 14); break;
      case 'high': daysToAdd = daysToAdd * 0.7; break;
    }

    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + daysToAdd);
    
    return closeDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  /**
   * Send opportunity data to Dynamics 365 (simulated)
   */
  private async sendToD365(opportunityData: Dynamics365OpportunityData): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would be:
    // const response = await fetch(`${this.config.baseUrl}/api/data/v9.2/opportunities`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json',
    //     'OData-MaxVersion': '4.0',
    //     'OData-Version': '4.0'
    //   },
    //   body: JSON.stringify({
    //     name: opportunityData.name,
    //     description: opportunityData.description,
    //     estimatedvalue: parseFloat(opportunityData.estimatedValue.replace(/[$,]/g, '')),
    //     closeprobability: opportunityData.probability,
    //     estimatedclosedate: opportunityData.estimatedCloseDate,
    //     // ... other Dynamics 365 specific fields
    //   })
    // });
    
    // Generate mock opportunity ID
    const opportunityId = `opp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ Opportunity created in Dynamics 365 with ID: ${opportunityId}`);
    
    return opportunityId;
  }

  /**
   * Track opportunity creation in agent memory
   */
  private trackOpportunityCreation(opportunityId: string, opportunityData: Dynamics365OpportunityData, account: Account): void {
    // In a real implementation, this would integrate with the agent memory system
    console.log('Tracking opportunity creation:', {
      opportunityId,
      accountId: account.id,
      accountName: account.name,
      opportunityName: opportunityData.name,
      estimatedValue: opportunityData.estimatedValue,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Configure Dynamics 365 connection settings
   */
  setConfig(config: Partial<Dynamics365Config>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): Dynamics365Config {
    return { ...this.config };
  }

  /**
   * Test the Dynamics 365 connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // In a real implementation, this would make a test API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('✅ Dynamics 365 connection test successful');
      return true;
    } catch (error) {
      console.error('Dynamics 365 connection test failed:', error);
      toast.error('❌ Dynamics 365 connection test failed');
      return false;
    }
  }
}

// Export singleton instance
export const dynamics365Service = new Dynamics365IntegrationService();

// Initialize on module load
dynamics365Service.initialize();
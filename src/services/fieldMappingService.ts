/**
 * Field Mapping Service for Dynamics 365 Integration
 * Handles custom field mapping between SignalCX customer success metrics 
 * and Dynamics 365 entity fields
 */

import { Account } from '@/types';

export interface D365FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  dataType: 'text' | 'number' | 'boolean' | 'date' | 'picklist';
  transformation?: string;
  isActive: boolean;
  description: string;
}

export interface CustomerSuccessData {
  accountId: string;
  health_score: number;
  health_trend: string;
  nps_score: number;
  satisfaction_rating: number;
  monthly_active_users: number;
  feature_adoption_rate: number;
  api_usage_growth: number;
  license_utilization: number;
  last_login_date: string;
  support_ticket_count: number;
  training_completion_rate: number;
  executive_engagement: string;
  arr_value: number;
  expansion_opportunity: number;
  payment_history: string;
  churn_risk_score: number;
  contract_end_date: string;
  competitive_threat: string;
  escalation_count: number;
}

export interface D365SyncResult {
  success: boolean;
  entityId?: string;
  entityType: 'account' | 'opportunity' | 'contact';
  mappingsApplied: number;
  errors?: string[];
  timestamp: string;
}

class FieldMappingService {
  private isDemo = true;

  /**
   * Extract customer success data from account information
   */
  extractCustomerSuccessData(account: Account): CustomerSuccessData {
    // In a real implementation, this would pull from various data sources
    // For demo purposes, generate realistic sample data based on account
    return {
      accountId: account.id,
      health_score: account.healthScore,
      health_trend: account.healthScore > 75 ? 'improving' : account.healthScore < 50 ? 'declining' : 'stable',
      nps_score: Math.max(0, account.healthScore - 20 + Math.random() * 10),
      satisfaction_rating: Math.round((account.healthScore / 20) + Math.random()),
      monthly_active_users: Math.round(account.arr / 1000 * (0.8 + Math.random() * 0.4)),
      feature_adoption_rate: Math.round(40 + (account.healthScore / 100) * 50 + Math.random() * 20),
      api_usage_growth: account.healthScore > 70 ? 15 + Math.random() * 25 : -5 + Math.random() * 20,
      license_utilization: Math.round(60 + (account.healthScore / 100) * 35 + Math.random() * 15),
      last_login_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      support_ticket_count: Math.round((100 - account.healthScore) / 10 + Math.random() * 5),
      training_completion_rate: Math.round(30 + (account.healthScore / 100) * 60 + Math.random() * 20),
      executive_engagement: account.healthScore > 75 ? 'high' : account.healthScore > 50 ? 'medium' : 'low',
      arr_value: account.arr,
      expansion_opportunity: account.healthScore > 70 ? account.arr * (0.15 + Math.random() * 0.25) : 0,
      payment_history: account.healthScore > 60 ? 'excellent' : account.healthScore > 40 ? 'good' : 'concerning',
      churn_risk_score: Math.max(0, 100 - account.healthScore + Math.random() * 20),
      contract_end_date: account.contractEnd,
      competitive_threat: account.healthScore < 50 ? 'high' : account.healthScore < 70 ? 'medium' : 'low',
      escalation_count: Math.round((100 - account.healthScore) / 20 + Math.random() * 3)
    };
  }

  /**
   * Apply field mappings to transform data for D365
   */
  applyFieldMappings(
    customerData: CustomerSuccessData, 
    mappings: D365FieldMapping[],
    entityType: 'account' | 'opportunity' | 'contact'
  ): Record<string, any> {
    const d365Data: Record<string, any> = {};
    const activeMappings = mappings.filter(m => m.isActive);

    for (const mapping of activeMappings) {
      const sourceValue = (customerData as any)[mapping.sourceField];
      
      if (sourceValue !== undefined && sourceValue !== null) {
        // Apply data type transformations
        let transformedValue = this.transformValue(sourceValue, mapping.dataType, mapping.transformation);
        
        // Apply any custom transformations
        if (mapping.transformation) {
          transformedValue = this.applyCustomTransformation(transformedValue, mapping.transformation);
        }
        
        d365Data[mapping.targetField] = transformedValue;
      }
    }

    return d365Data;
  }

  /**
   * Transform value based on target data type
   */
  private transformValue(value: any, dataType: string, transformation?: string): any {
    switch (dataType) {
      case 'number':
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      
      case 'text':
        return String(value);
      
      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value > 0;
        return ['true', 'yes', '1', 'on'].includes(String(value).toLowerCase());
      
      case 'date':
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'string') return new Date(value).toISOString();
        return new Date().toISOString();
      
      case 'picklist':
        return String(value);
      
      default:
        return value;
    }
  }

  /**
   * Apply custom transformation logic
   */
  private applyCustomTransformation(value: any, transformation: string): any {
    try {
      // Simple transformation expressions
      if (transformation.includes('*')) {
        const multiplier = parseFloat(transformation.replace('*', ''));
        return typeof value === 'number' ? value * multiplier : value;
      }
      
      if (transformation.includes('+')) {
        const addition = parseFloat(transformation.replace('+', ''));
        return typeof value === 'number' ? value + addition : value;
      }
      
      // Custom mapping functions could be added here
      return value;
    } catch (error) {
      console.warn('Transformation failed:', transformation, error);
      return value;
    }
  }

  /**
   * Sync customer success data to Dynamics 365
   */
  async syncToD365(
    account: Account,
    mappings: D365FieldMapping[],
    entityType: 'account' | 'opportunity' | 'contact' = 'account'
  ): Promise<D365SyncResult> {
    try {
      // Extract customer success data
      const customerData = this.extractCustomerSuccessData(account);
      
      // Apply field mappings
      const d365Data = this.applyFieldMappings(customerData, mappings, entityType);
      
      // In demo mode, simulate the sync
      if (this.isDemo) {
        return this.simulateD365Sync(account, d365Data, entityType, mappings);
      }
      
      // In production, make actual D365 API calls
      return this.performActualD365Sync(account, d365Data, entityType, mappings);
      
    } catch (error) {
      console.error('D365 sync failed:', error);
      return {
        success: false,
        entityType,
        mappingsApplied: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Simulate D365 sync for demo purposes
   */
  private async simulateD365Sync(
    account: Account,
    d365Data: Record<string, any>,
    entityType: 'account' | 'opportunity' | 'contact',
    mappings: D365FieldMapping[]
  ): Promise<D365SyncResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const mockEntityId = `${entityType}-${account.id}-${Date.now()}`;
    
    console.log('=== D365 Field Mapping Sync Simulation ===');
    console.log('Account:', account.name);
    console.log('Entity Type:', entityType);
    console.log('Mapped Data:', d365Data);
    console.log('Active Mappings:', mappings.filter(m => m.isActive));
    console.log('Mock Entity ID:', mockEntityId);
    
    return {
      success: true,
      entityId: mockEntityId,
      entityType,
      mappingsApplied: Object.keys(d365Data).length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Perform actual D365 sync (production implementation)
   */
  private async performActualD365Sync(
    account: Account,
    d365Data: Record<string, any>,
    entityType: 'account' | 'opportunity' | 'contact',
    mappings: D365FieldMapping[]
  ): Promise<D365SyncResult> {
    // This would contain the actual D365 REST API calls
    // For now, return a not implemented result
    throw new Error('Production D365 sync not implemented - use demo mode');
  }

  /**
   * Validate field mappings
   */
  validateMappings(mappings: D365FieldMapping[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const mapping of mappings) {
      if (!mapping.sourceField) {
        errors.push(`Mapping ${mapping.id}: Source field is required`);
      }
      
      if (!mapping.targetField) {
        errors.push(`Mapping ${mapping.id}: Target field is required`);
      }
      
      if (!mapping.dataType) {
        errors.push(`Mapping ${mapping.id}: Data type is required`);
      }
    }
    
    // Check for duplicate target fields
    const targetFields = mappings.filter(m => m.isActive).map(m => m.targetField);
    const duplicates = targetFields.filter((field, index) => targetFields.indexOf(field) !== index);
    
    if (duplicates.length > 0) {
      errors.push(`Duplicate target fields found: ${duplicates.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get field mapping statistics
   */
  getMappingStats(mappings: D365FieldMapping[]): {
    total: number;
    active: number;
    byDataType: Record<string, number>;
    byEntity: Record<string, number>;
  } {
    const stats = {
      total: mappings.length,
      active: mappings.filter(m => m.isActive).length,
      byDataType: {} as Record<string, number>,
      byEntity: {} as Record<string, number>
    };
    
    for (const mapping of mappings) {
      // Count by data type
      stats.byDataType[mapping.dataType] = (stats.byDataType[mapping.dataType] || 0) + 1;
      
      // Count by entity (inferred from target field naming)
      const entity = mapping.targetField.startsWith('new_') ? 'custom' : 'standard';
      stats.byEntity[entity] = (stats.byEntity[entity] || 0) + 1;
    }
    
    return stats;
  }

  /**
   * Enable or disable demo mode
   */
  setDemoMode(enabled: boolean): void {
    this.isDemo = enabled;
  }

  /**
   * Check if service is in demo mode
   */
  isDemoMode(): boolean {
    return this.isDemo;
  }
}

export const fieldMappingService = new FieldMappingService();
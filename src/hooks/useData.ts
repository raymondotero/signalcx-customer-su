import { useKV } from '@github/spark/hooks';
import { Account, NextBestAction, Signal, MemoryEntry } from '@/types';
import { generateBusinessValueSignal, generateIndustrySpecificSignal } from '@/services/signalCatalog';
import React, { useEffect } from 'react';

// Sample seed data - exported for reset functionality with realistic health score patterns
export const sampleAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    arr: 250000,
    healthScore: 85,
    status: 'Good',
    csam: 'Sarah Chen',
    ae: 'Michael Thompson',
    contractEnd: '2024-12-31',
    lastActivity: '2024-01-15',
    expansionOpportunity: 75000
  },
  {
    id: 'acc-2', 
    name: 'Global Manufacturing Inc',
    industry: 'Manufacturing',
    arr: 450000,
    healthScore: 68,
    status: 'Watch',
    csam: 'Mike Rodriguez',
    ae: 'Jennifer Davis',
    contractEnd: '2024-08-15',
    lastActivity: '2024-01-10',
    expansionOpportunity: 120000
  },
  {
    id: 'acc-3',
    name: 'FinanceFirst Bank',
    industry: 'Financial Services',
    arr: 800000,
    healthScore: 45,
    status: 'At Risk',
    csam: 'Lisa Wang',
    ae: 'Robert Martinez',
    contractEnd: '2024-06-30',
    lastActivity: '2024-01-05',
    expansionOpportunity: 200000
  },
  {
    id: 'acc-4',
    name: 'HealthTech Innovations',
    industry: 'Healthcare',
    arr: 320000,
    healthScore: 78,
    status: 'Good',
    csam: 'David Kim',
    ae: 'Amanda Foster',
    contractEnd: '2024-11-20',
    lastActivity: '2024-01-14',
    expansionOpportunity: 95000
  },
  {
    id: 'acc-5',
    name: 'RetailMax Corp',
    industry: 'Retail',
    arr: 150000,
    healthScore: 52,
    status: 'At Risk',
    csam: 'Emily Johnson',
    ae: 'Carlos Ruiz',
    contractEnd: '2024-05-15',
    lastActivity: '2024-01-08',
    expansionOpportunity: 30000
  },
  {
    id: 'acc-6',
    name: 'EduLearn Systems',
    industry: 'Education',
    arr: 180000,
    healthScore: 72,
    status: 'Watch',
    csam: 'Rachel Green',
    ae: 'Kevin Park',
    contractEnd: '2024-09-30',
    lastActivity: '2024-01-12',
    expansionOpportunity: 45000
  },
  {
    id: 'acc-7',
    name: 'Energy Solutions Ltd',
    industry: 'Energy',
    arr: 650000,
    healthScore: 88,
    status: 'Good',
    csam: 'Tom Wilson',
    ae: 'Lisa Anderson',
    contractEnd: '2025-02-28',
    lastActivity: '2024-01-16',
    expansionOpportunity: 180000
  },
  {
    id: 'acc-8',
    name: 'CloudFirst Technologies',
    industry: 'Technology',
    arr: 425000,
    healthScore: 41,
    status: 'At Risk',
    csam: 'Anna Lee',
    ae: 'Mark Johnson',
    contractEnd: '2024-07-10',
    lastActivity: '2024-01-06',
    expansionOpportunity: 85000
  },
  {
    id: 'acc-9',
    name: 'AgriTech Farms',
    industry: 'Agriculture',
    arr: 275000,
    healthScore: 76,
    status: 'Good',
    csam: 'Steve Miller',
    ae: 'Diana Ross',
    contractEnd: '2024-10-15',
    lastActivity: '2024-01-13',
    expansionOpportunity: 60000
  },
  {
    id: 'acc-10',
    name: 'TransportCorp',
    industry: 'Transportation',
    arr: 380000,
    healthScore: 63,
    status: 'Watch',
    csam: 'Julia Roberts',
    ae: 'Chris Evans',
    contractEnd: '2024-08-30',
    lastActivity: '2024-01-11',
    expansionOpportunity: 95000
  }
];

export function useAccounts() {
  const [accounts, setAccounts] = useKV<Account[]>('accounts', sampleAccounts);

  const updateAccount = (accountId: string, updates: Partial<Account>) => {
    setAccounts((prev) => 
      (prev || []).map(acc => acc.id === accountId ? { ...acc, ...updates } : acc)
    );
  };

  const addAccount = (account: Account) => {
    setAccounts((prev) => [...(prev || []), account]);
  };

  const resetAccounts = () => {
    setAccounts(sampleAccounts);
  };

  return {
    accounts: accounts || [],
    setAccounts,
    updateAccount,
    addAccount,
    resetAccounts
  };
}

export function useNBAs() {
  const [nbas, setNBAs] = useKV<NextBestAction[]>('nbas', []);

  const addNBA = (nba: NextBestAction) => {
    setNBAs((prev) => [...(prev || []), nba]);
  };

  const removeNBA = (nbaId: string) => {
    setNBAs((prev) => (prev || []).filter(nba => nba.id !== nbaId));
  };

  return {
    nbas: nbas || [],
    setNBAs,
    addNBA,
    removeNBA
  };
}

export function useSignals() {
  const [signals, setSignals] = useKV<Signal[]>('signals', []);

  const addSignal = (signal: Signal) => {
    setSignals((prev) => [...(prev || []), signal]);
  };

  const removeSignal = (signalId: string) => {
    setSignals((prev) => (prev || []).filter(signal => signal.id !== signalId));
  };

  return {
    signals: signals || [],
    setSignals,
    addSignal,
    removeSignal
  };
}

export function useAgentMemory() {
  const [memory, setMemory] = useKV<MemoryEntry[]>('agent-memory', []);

  const addMemoryEntry = (entry: MemoryEntry) => {
    setMemory((prev) => [...(prev || []), entry]);
  };

  const clearMemory = () => {
    setMemory([]);
  };

  return {
    memory: memory || [],
    setMemory,
    addMemoryEntry,
    clearMemory
  };
}

// Helper function to generate enhanced signals based on accounts
export function generateEnhancedSignals(accounts: Account[]): Signal[] {
  const signals: Signal[] = [];
  
  accounts.forEach(account => {
    // Generate 5-8 signals per account for demo purposes
    const signalCount = Math.floor(Math.random() * 4) + 5;
    
    for (let i = 0; i < signalCount; i++) {
      const signal = generateBusinessValueSignal(account.id, account.name);
      signals.push(signal);
    }
    
    // Add industry-specific signals
    const industrySignal = generateIndustrySpecificSignal(account.id, account.name, account.industry);
    signals.push(industrySignal);
  });
  
  return signals;
}
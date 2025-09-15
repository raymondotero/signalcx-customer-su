import { useKV } from '@github/spark/hooks';
import { Account, NextBestAction, Signal, MemoryEntry } from '@/types';
import { generateBusinessValueSignal } from '@/services/signalCatalog';
import React, { useEffect } from 'react';

// Sample seed data - exported for reset functionality
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
    healthScore: 65,
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
    arr: 180000,
    healthScore: 90,
    status: 'Good',
    csam: 'David Kim',
    ae: 'Amanda Foster',
    contractEnd: '2025-03-31',
    lastActivity: '2024-01-16',
    expansionOpportunity: 90000
  },
  {
    id: 'acc-5',
    name: 'RetailMax Corporation',
    industry: 'Retail',
    arr: 320000,
    healthScore: 72,
    status: 'Good',
    csam: 'Emily Johnson',
    ae: 'Christopher Lee',
    contractEnd: '2024-11-15',
    lastActivity: '2024-01-14',
    expansionOpportunity: 110000
  },
  {
    id: 'acc-6',
    name: 'CloudSoft Dynamics',
    industry: 'Technology',
    arr: 420000,
    healthScore: 78,
    status: 'Good',
    csam: 'Jessica Parker',
    ae: 'Daniel Wright',
    contractEnd: '2025-01-31',
    lastActivity: '2024-01-18',
    expansionOpportunity: 140000
  },
  {
    id: 'acc-7',
    name: 'AutoParts Universe',
    industry: 'Automotive',
    arr: 290000,
    healthScore: 55,
    status: 'Watch',
    csam: 'Carlos Hernandez',
    ae: 'Sarah Wilson',
    contractEnd: '2024-10-15',
    lastActivity: '2024-01-08',
    expansionOpportunity: 85000
  },
  {
    id: 'acc-8',
    name: 'EduTech Systems',
    industry: 'Education',
    arr: 150000,
    healthScore: 92,
    status: 'Good',
    csam: 'Maria Gonzales',
    ae: 'Kevin Brown',
    contractEnd: '2025-05-30',
    lastActivity: '2024-01-20',
    expansionOpportunity: 60000
  },
  {
    id: 'acc-9',
    name: 'AgriBusiness Connect',
    industry: 'Agriculture',
    arr: 380000,
    healthScore: 40,
    status: 'At Risk',
    csam: 'Ahmed Ali',
    ae: 'Rachel Green',
    contractEnd: '2024-07-31',
    lastActivity: '2024-01-03',
    expansionOpportunity: 150000
  },
  {
    id: 'acc-10',
    name: 'Energy Solutions Pro',
    industry: 'Energy',
    arr: 650000,
    healthScore: 88,
    status: 'Good',
    csam: 'Nina Petrov',
    ae: 'James Miller',
    contractEnd: '2024-12-15',
    lastActivity: '2024-01-17',
    expansionOpportunity: 220000
  }
];

export function useAccounts() {
  const [accounts, setAccounts] = useKV<Account[]>('signalcx-accounts', sampleAccounts);
  const [initialized, setInitialized] = useKV<boolean>('signalcx-initialized', false);
  
  // Ensure sample data is always loaded if accounts are empty
  React.useEffect(() => {
    if (!accounts || accounts.length === 0) {
      setAccounts(sampleAccounts);
    }
  }, [accounts, setAccounts]);
  
  // Initialize with seed business value signals
  useEffect(() => {
    if (!initialized && accounts && accounts.length > 0) {
      // Generate some initial business value signals for demo
      const initialSignals: Signal[] = [];
      
      accounts.forEach(account => {
        // Generate 2-3 business value signals per account
        for (let i = 0; i < 3; i++) {
          initialSignals.push(generateBusinessValueSignal(account.id, account.name));
        }
      });
      
      // Add signals to storage
      const signalsData = JSON.parse(localStorage.getItem('signalcx-signals') || '[]');
      if (signalsData.length === 0) {
        localStorage.setItem('signalcx-signals', JSON.stringify(initialSignals));
      }
      
      setInitialized(true);
    }
  }, [accounts, initialized, setInitialized]);
  
  const addAccount = (account: Account) => {
    setAccounts(currentAccounts => [...(currentAccounts || []), account]);
  };
  
  return { 
    accounts: accounts || [], 
    setAccounts,
    addAccount
  };
}

export function useNBAs() {
  const [nbas, setNBAs] = useKV<NextBestAction[]>('signalcx-nbas', []);
  
  const addNBA = (nba: NextBestAction) => {
    setNBAs(currentNBAs => [...(currentNBAs || []), nba]);
  };
  
  return { 
    nbas: nbas || [], 
    setNBAs,
    addNBA
  };
}

export function useSignals() {
  const [signals, setSignals] = useKV<Signal[]>('signalcx-signals', []);
  
  const addSignal = (signal: Signal) => {
    setSignals(currentSignals => [signal, ...(currentSignals || [])].slice(0, 50)); // Keep last 50 signals
  };
  
  return { 
    signals: signals || [], 
    setSignals, 
    addSignal 
  };
}

export function useAgentMemory() {
  const [memory, setMemory] = useKV<MemoryEntry[]>('signalcx-memory', []);
  
  const addMemoryEntry = (entry: MemoryEntry) => {
    setMemory(currentMemory => [entry, ...(currentMemory || [])]);
  };
  
  const clearMemory = () => {
    setMemory([]);
  };
  
  return { 
    memory: memory || [], 
    addMemoryEntry, 
    clearMemory 
  };
}
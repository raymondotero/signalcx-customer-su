import { useKV } from '@github/spark/hooks';
import { Account, Signal, NextBestAction, AgentMemoryEntry } from '@/types';

// Mock data for demo
const mockAccounts: Account[] = [
  {
    id: 'acc-001',
    name: 'Contoso Corp',
    arr: 250000,
    healthScore: 85,
    status: 'Good',
    industry: 'Technology',
    csm: 'Sarah Chen',
    lastActivity: '2024-01-15',
    contractEnd: '2024-12-31',
    expansionOpportunity: 75000
  },
  {
    id: 'acc-002',
    name: 'Fabrikam Industries',
    arr: 180000,
    healthScore: 65,
    status: 'Watch',
    industry: 'Manufacturing',
    csm: 'Mike Rodriguez',
    lastActivity: '2024-01-10',
    contractEnd: '2024-08-15',
    expansionOpportunity: 45000
  },
  {
    id: 'acc-003',
    name: 'Adventure Works',
    arr: 320000,
    healthScore: 45,
    status: 'At Risk',
    industry: 'Retail',
    csm: 'Emily Watson',
    lastActivity: '2024-01-05',
    contractEnd: '2024-06-30',
    expansionOpportunity: 0
  },
  {
    id: 'acc-004',
    name: 'Northwind Traders',
    arr: 420000,
    healthScore: 92,
    status: 'Good',
    industry: 'Logistics',
    csm: 'David Kim',
    lastActivity: '2024-01-16',
    contractEnd: '2025-03-31',
    expansionOpportunity: 125000
  },
  {
    id: 'acc-005',
    name: 'Wide World Importers',
    arr: 150000,
    healthScore: 55,
    status: 'Watch',
    industry: 'Import/Export',
    csm: 'Lisa Park',
    lastActivity: '2024-01-08',
    contractEnd: '2024-09-30',
    expansionOpportunity: 30000
  }
];

export const useAccounts = () => {
  const [accounts, setAccounts] = useKV<Account[]>('signalcx-accounts', mockAccounts);
  
  const addAccount = (account: Account) => {
    setAccounts(current => [...(current || []), account]);
  };
  
  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(current => 
      (current || []).map(acc => acc.id === id ? { ...acc, ...updates } : acc)
    );
  };
  
  return { accounts: accounts || [], setAccounts, addAccount, updateAccount };
};

export const useSignals = () => {
  const [signals, setSignals] = useKV<Signal[]>('signalcx-signals', []);
  
  const addSignal = (signal: Signal) => {
    setSignals(current => [signal, ...(current || []).slice(0, 49)]); // Keep last 50 signals
  };
  
  return { signals: signals || [], setSignals, addSignal };
};

export const useNBAs = () => {
  const [nbas, setNBAs] = useKV<NextBestAction[]>('signalcx-nbas', []);
  
  const addNBA = (nba: NextBestAction) => {
    setNBAs(current => [nba, ...(current || [])]);
  };
  
  return { nbas: nbas || [], setNBAs, addNBA };
};

export const useAgentMemory = () => {
  const [memory, setMemory] = useKV<AgentMemoryEntry[]>('signalcx-memory', []);
  
  const addMemoryEntry = (entry: AgentMemoryEntry) => {
    setMemory(current => [entry, ...(current || [])]);
  };
  
  const clearMemory = () => {
    setMemory([]);
  };
  
  return { memory: memory || [], setMemory, addMemoryEntry, clearMemory };
};
import React, { useEffect } from 'react';
import { useSignals, useAgentMemory } from '@/hooks/useData';
import { toast } from 'sonner';

export function useRealtimeNotifications() {
  const { signals } = useSignals();
  const { memory } = useAgentMemory();

  // Notify for critical signals
  useEffect(() => {
    const latestSignal = signals[0];
    if (latestSignal && (latestSignal.severity === 'critical' || latestSignal.severity === 'high')) {
      const message = `🚨 ${latestSignal.severity.toUpperCase()} Signal: ${latestSignal.description}`;
      toast.error(message, {
        duration: 8000,
        action: {
          label: "View Details",
          onClick: () => {
            // Could open a detailed view
            toast.info(`Account: ${latestSignal.accountName} (${latestSignal.accountId})`);
          }
        }
      });
    }
  }, [signals.length]);

  // Notify for approvals and workflows
  useEffect(() => {
    const latestMemory = memory[0];
    if (latestMemory && latestMemory.type === 'workflow_executed' && latestMemory.outcome === 'success') {
      toast.success(`✅ Workflow completed: ${latestMemory.description}`, {
        duration: 5000
      });
    }
  }, [memory.length]);

  return null; // This hook only provides side effects
}
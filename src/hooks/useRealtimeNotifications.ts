import React, { useEffect } from 'react';
import { useSignals, useAgentMemory, useAccounts } from '@/hooks/useData';
import { criticalSignalNotificationService } from '@/services/criticalSignalNotificationService';
import { toast } from 'sonner';

export function useRealtimeNotifications() {
  const { signals } = useSignals();
  const { memory } = useAgentMemory();
  const { accounts } = useAccounts();

  // Enhanced critical signal processing
  useEffect(() => {
    const latestSignal = signals[0];
    if (latestSignal && (latestSignal.severity === 'critical' || latestSignal.severity === 'high')) {
      // Find the corresponding account
      const account = accounts.find(acc => acc.id === latestSignal.accountId);
      
      if (account) {
        // Process the signal through the critical notification service
        if (criticalSignalNotificationService && typeof criticalSignalNotificationService.processSignal === 'function') {
          criticalSignalNotificationService.processSignal(latestSignal, account)
            .then(event => {
              if (event) {
                console.log('Critical signal event created:', event);
                
                // The notification service handles Teams/Email notifications
                // Only show toast if not already handled by the service
                if (!event.notificationsSent.toast) {
                  const message = `🚨 ${latestSignal.severity.toUpperCase()} Signal: ${latestSignal.description}`;
                  toast.error(message, {
                    duration: 8000,
                    action: {
                      label: "View Details",
                      onClick: () => {
                        toast.info(`Account: ${latestSignal.accountName} (${latestSignal.accountId})`);
                      }
                    }
                  });
                }
              }
            })
            .catch(error => {
              console.error('Error processing critical signal:', error);
              
              // Fallback to basic toast notification
              const message = `🚨 ${latestSignal.severity.toUpperCase()} Signal: ${latestSignal.description}`;
              toast.error(message, {
                duration: 8000,
                action: {
                  label: "View Details",
                  onClick: () => {
                    toast.info(`Account: ${latestSignal.accountName} (${latestSignal.accountId})`);
                  }
                }
              });
            });
        } else {
          console.warn('Critical signal notification service not properly initialized');
          // Fallback to basic toast notification
          const message = `🚨 ${latestSignal.severity.toUpperCase()} Signal: ${latestSignal.description}`;
          toast.error(message, {
            duration: 8000,
            action: {
              label: "View Details",
              onClick: () => {
                toast.info(`Account: ${latestSignal.accountName} (${latestSignal.accountId})`);
              }
            }
          });
        }
      } else {
        // Account not found, show basic notification
        const message = `🚨 ${latestSignal.severity.toUpperCase()} Signal: ${latestSignal.description}`;
        toast.error(message, {
          duration: 8000,
          action: {
            label: "View Details",
            onClick: () => {
              toast.info(`Account: ${latestSignal.accountName} (${latestSignal.accountId})`);
            }
          }
        });
      }
    }
  }, [signals.length, accounts]);

  // Enhanced workflow completion notifications
  useEffect(() => {
    const latestMemory = memory[0];
    if (latestMemory && latestMemory.type === 'workflow_executed' && latestMemory.outcome === 'success') {
      toast.success(`✅ Workflow completed: ${latestMemory.description}`, {
        duration: 5000
      });
    }
    
    // Also notify for critical approval requests
    if (latestMemory && latestMemory.type === 'approval_requested') {
      const account = accounts.find(acc => acc.id === latestMemory.accountId);
      if (account && account.arr > 50000000) { // High-value accounts ($50M+ ARR)
        toast.warning(`⚠️ High-value account approval request: ${latestMemory.description}`, {
          duration: 8000,
          action: {
            label: "Review",
            onClick: () => {
              toast.info(`Account: ${account.name} - ARR: $${(account.arr / 1000000).toFixed(1)}M`);
            }
          }
        });
      }
    }
  }, [memory.length, accounts]);

  return null; // This hook only provides side effects
}
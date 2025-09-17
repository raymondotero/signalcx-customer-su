import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Play, Pause, Pulse, Warning, Info, WarningCircle, Brain, TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import { Signal } from '@/types';
import { useSignals, useAccounts } from '@/hooks/useData';
import { useSignalProcessor } from '@/hooks/useSignalProcessor';
import { generateBusinessValueSignal } from '@/services/signalCatalog';
import { SignalDetailsDialog } from '@/components/SignalDetailsDialog';

export function LiveSignals() {
  const [isStreaming, setIsStreaming] = useState(true);
  const { signals, addSignal } = useSignals();
  const { accounts } = useAccounts();
  const { isProcessing } = useSignalProcessor();

  useEffect(() => {
    if (!isStreaming) return;

    const generateSignal = (): Signal => {
      const account = accounts[Math.floor(Math.random() * accounts.length)];
      if (!account) return null as any;

      // 70% chance for business value signals, 30% for legacy signals
      if (Math.random() < 0.7) {
        return generateBusinessValueSignal(account.id, account.name);
      }

      // Legacy signal types for compatibility
      const signalTypes = [
        {
          type: 'usage' as const,
          descriptions: [
            'User login frequency decreased by 40%',
            'Feature adoption rate increased by 25%',
            'API calls decreased significantly',
            'Dashboard views up 60% this week'
          ]
        },
        {
          type: 'engagement' as const,
          descriptions: [
            'No training sessions attended in 30 days',
            'Support ticket volume increased',
            'Product webinar attendance',
            'Community forum participation dropped'
          ]
        },
        {
          type: 'support' as const,
          descriptions: [
            'Critical support ticket opened',
            'Escalation to Tier 2 support',
            'Multiple tickets from same user',
            'Support satisfaction score: 2/5'
          ]
        },
        {
          type: 'financial' as const,
          descriptions: [
            'Payment method expires next month',
            'Invoice overdue by 15 days',
            'Billing inquiry submitted',
            'Downgrade request initiated'
          ]
        }
      ];

      const severities: Signal['severity'][] = ['low', 'medium', 'high', 'critical'];
      const selectedType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
      const description = selectedType.descriptions[Math.floor(Math.random() * selectedType.descriptions.length)];
      
      return {
        id: `signal-${Date.now()}-${Math.random()}`,
        accountId: account.id,
        accountName: account.name,
        type: selectedType.type,
        description,
        severity: severities[Math.floor(Math.random() * severities.length)],
        timestamp: new Date().toISOString()
      };
    };

    const interval = setInterval(() => {
      const signal = generateSignal();
      if (signal) {
        addSignal(signal);
      }
    }, 3000); // Generate signal every 3 seconds

    return () => clearInterval(interval);
  }, [isStreaming, accounts, addSignal]);

  const getSeverityIcon = (severity: Signal['severity']) => {
    switch (severity) {
      case 'critical': return <WarningCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <Warning className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Info className="w-4 h-4 text-blue-500" />;
      case 'low': return <Pulse className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: Signal['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: Signal['type']) => {
    switch (type) {
      case 'cost': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'agility': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'data': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'risk': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'culture': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'usage': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'engagement': return 'bg-green-100 text-green-800 border-green-200';
      case 'support': return 'bg-red-100 text-red-800 border-red-200';
      case 'financial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'feature_request': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'churn_risk': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend?: Signal['trend']) => {
    if (!trend) return null;
    switch (trend) {
      case 'improving': return <TrendUp className="w-3 h-3 text-green-500" />;
      case 'declining': return <TrendDown className="w-3 h-3 text-red-500" />;
      case 'stable': return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="h-[600px] flex flex-col border-visible w-full min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Pulse className={`w-5 h-5 ${isStreaming ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            Live Signals
            {isProcessing && (
              <Brain className="w-4 h-4 text-accent animate-pulse-ai" />
            )}
          </div>
          <Button
            onClick={() => setIsStreaming(!isStreaming)}
            variant={isStreaming ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0"
          >
            {isStreaming ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-4">
        <ScrollArea className="h-full w-full">
          <div className="space-y-3 pr-2">
            {signals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pulse className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No signals yet. {isStreaming ? 'Waiting for live data...' : 'Click Resume to start streaming.'}</p>
              </div>
            ) : (
              signals.map((signal, index) => (
                <div 
                  key={signal.id}
                  className={`border rounded-lg p-4 w-full min-w-0 ${index === 0 && isStreaming ? 'animate-pulse-ai border-accent' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                      {getSeverityIcon(signal.severity)}
                      <span className="font-medium text-sm truncate">{signal.accountName}</span>
                      {signal.signalName && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {signal.signalName}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                      {getTrendIcon(signal.trend)}
                      <Badge className={`${getSeverityColor(signal.severity)} text-xs`}>
                        {signal.severity}
                      </Badge>
                      <Badge className={`${getTypeColor(signal.type)} text-xs`}>
                        {signal.category || signal.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 break-words">{signal.description}</p>
                  
                  {signal.value !== undefined && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                      <span className="flex-shrink-0">
                        Current: <span className="font-medium">
                          {typeof signal.value === 'number' && signal.unit === '%' ? 
                            `${signal.value.toFixed(1)}${signal.unit}` : 
                            `${signal.value}${signal.unit}`
                          }
                        </span>
                      </span>
                      {signal.target !== undefined && (
                        <span className="flex-shrink-0">
                          Target: <span className="font-medium">
                            {typeof signal.target === 'number' && signal.unit === '%' ? 
                              `${signal.target.toFixed(1)}${signal.unit}` : 
                              `${signal.target}${signal.unit}`
                            }
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground flex-wrap gap-2">
                    <span className="truncate">Account ID: {signal.accountId}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span>{formatTime(signal.timestamp)}</span>
                      <SignalDetailsDialog signal={signal} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
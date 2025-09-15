import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Clock, CheckCircle, XCircle, ClockCounterClockwise, Trash } from '@phosphor-icons/react';
import { MemoryEntry } from '@/types';
import { useAgentMemory } from '@/hooks/useData';

export function AgentMemory() {
  const { memory, clearMemory } = useAgentMemory();

  const getTypeIcon = (type: MemoryEntry['type']) => {
    switch (type) {
      case 'nba_generated': return <Brain className="w-4 h-4 text-accent" />;
      case 'workflow_executed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approval_requested': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'approval_decided': return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getTypeLabel = (type: MemoryEntry['type']) => {
    switch (type) {
      case 'nba_generated': return 'NBA Generated';
      case 'workflow_executed': return 'Workflow Executed';
      case 'approval_requested': return 'Approval Requested';
      case 'approval_decided': return 'Approval Decided';
      case 'signal_processed': return 'Signal Processed';
    }
  };

  const getOutcomeIcon = (outcome?: MemoryEntry['outcome']) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failure': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getOutcomeColor = (outcome?: MemoryEntry['outcome']) => {
    switch (outcome) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'failure': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className="min-h-0 max-h-[var(--tab-content-height)] flex flex-col border-visible">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockCounterClockwise className="w-5 h-5 text-primary" />
            Agent Memory
          </div>
          <Button
            onClick={clearMemory}
            variant="outline"
            size="sm"
            disabled={memory.length === 0}
          >
            <Trash className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {memory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClockCounterClockwise className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No agent activity recorded yet</p>
                <p className="text-sm">Actions and decisions will appear here</p>
              </div>
            ) : (
              memory.map((entry, index) => (
                <div key={entry.id} className="relative">
                  {/* Timeline line */}
                  {index < memory.length - 1 && (
                    <div className="absolute left-6 top-8 bottom-0 w-px bg-border" />
                  )}
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      {getTypeIcon(entry.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{getTypeLabel(entry.type)}</span>
                            {entry.outcome && (
                              <Badge className={getOutcomeColor(entry.outcome)}>
                                {entry.outcome}
                              </Badge>
                            )}
                          </div>
                          {entry.accountName && (
                            <p className="text-xs text-muted-foreground mb-1">
                              Account: {entry.accountName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {entry.outcome && getOutcomeIcon(entry.outcome)}
                          <span>{formatRelativeTime(entry.timestamp)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                      
                      {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <details className="cursor-pointer">
                            <summary>View metadata</summary>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(entry.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        {formatTime(entry.timestamp)}
                      </div>
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
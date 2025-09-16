import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Warning, ArrowClockwise, Brain } from '@phosphor-icons/react';
import { getSparkAIStatus, waitForSpark, testSparkAI, SparkAIStatus } from '@/lib/sparkAI';
import { toast } from 'sonner';

interface SparkDiagnosticsProps {
  onStatusChange?: (isReady: boolean) => void;
}

export function SparkDiagnostics({ onStatusChange }: SparkDiagnosticsProps) {
  const [status, setStatus] = useState<SparkAIStatus | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkStatus = async () => {
    const currentStatus = getSparkAIStatus();
    setStatus(currentStatus);
    setLastCheck(new Date());
    
    const isReady = currentStatus.available && currentStatus.initialized && 
                   currentStatus.llmReady && currentStatus.promptReady;
    
    onStatusChange?.(isReady);
    
    return isReady;
  };

  const waitForSparkReady = async () => {
    setIsWaiting(true);
    toast.info('Waiting for Spark AI to initialize...', {
      description: 'This may take a few moments'
    });

    try {
      const isReady = await waitForSpark(15000, 1000); // Wait up to 15 seconds
      
      if (isReady) {
        const testPassed = await testSparkAI();
        if (testPassed) {
          toast.success('Spark AI is now ready!');
          await checkStatus();
        } else {
          throw new Error('Spark AI failed connectivity test');
        }
      } else {
        throw new Error('Spark AI did not initialize within the timeout period');
      }
    } catch (error) {
      console.error('Error waiting for Spark:', error);
      toast.error('Failed to initialize Spark AI', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsWaiting(false);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    checkStatus();
    
    // Check status periodically
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <Card className="border-visible">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Checking Spark AI status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isFullyReady = status.available && status.initialized && status.llmReady && status.promptReady;
  const hasPartialIssues = status.available && status.initialized && (!status.llmReady || !status.promptReady);
  const hasErrors = !status.available || !status.initialized;

  return (
    <Card className="border-visible">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Spark AI Diagnostics
          {isFullyReady && <Badge className="bg-green-100 text-green-800 text-xs">Ready</Badge>}
          {hasPartialIssues && <Badge className="bg-yellow-100 text-yellow-800 text-xs">Partial</Badge>}
          {hasErrors && <Badge className="bg-red-100 text-red-800 text-xs">Error</Badge>}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            {status.available ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <XCircle className="w-3 h-3 text-red-600" />
            )}
            <span>Runtime Available</span>
          </div>
          
          <div className="flex items-center gap-2">
            {status.initialized ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <XCircle className="w-3 h-3 text-red-600" />
            )}
            <span>Initialized</span>
          </div>
          
          <div className="flex items-center gap-2">
            {status.promptReady ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <XCircle className="w-3 h-3 text-red-600" />
            )}
            <span>Prompt Service</span>
          </div>
          
          <div className="flex items-center gap-2">
            {status.llmReady ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <XCircle className="w-3 h-3 text-red-600" />
            )}
            <span>LLM Service</span>
          </div>
        </div>

        {/* Error Information */}
        {status.error && (
          <Alert>
            <Warning className="w-4 h-4" />
            <AlertDescription className="text-xs">
              {status.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={checkStatus}
            className="text-xs h-7"
          >
            <ArrowClockwise className="w-3 h-3 mr-1" />
            Refresh Status
          </Button>

          {hasPartialIssues && (
            <Button
              size="sm"
              variant="outline"
              onClick={waitForSparkReady}
              disabled={isWaiting}
              className="text-xs h-7"
            >
              <Clock className={`w-3 h-3 mr-1 ${isWaiting ? 'animate-pulse' : ''}`} />
              {isWaiting ? 'Waiting...' : 'Wait for Ready'}
            </Button>
          )}

          {hasErrors && (
            <Button
              size="sm"
              variant="destructive"
              onClick={refreshPage}
              className="text-xs h-7"
            >
              <ArrowClockwise className="w-3 h-3 mr-1" />
              Refresh Page
            </Button>
          )}
        </div>

        {/* Last Check Time */}
        {lastCheck && (
          <div className="text-xs text-muted-foreground">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        )}

        {/* Ready Status */}
        {isFullyReady && (
          <div className="text-xs text-green-600 font-medium">
            ✅ All AI features are ready to use
          </div>
        )}
      </CardContent>
    </Card>
  );
}
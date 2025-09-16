import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, TestTube, Warning } from '@phosphor-icons/react';
import { getSparkAIStatus, testSparkAI } from '@/lib/sparkAI';
import { toast } from 'sonner';

export function SparkTestButton() {
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error' | 'dev-mode'>('idle');
  const [initialStatus, setInitialStatus] = useState<'checking' | 'done'>('checking');

  // Check initial status on mount
  useEffect(() => {
    const checkInitialStatus = () => {
      const status = getSparkAIStatus();
      const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
      const isPreview = window.location.hostname.includes('preview') || window.location.hostname.includes('staging');
      
      if (isDev || isPreview) {
        setTestResult('dev-mode');
      } else if (status.available && status.initialized && status.llmReady && status.promptReady) {
        setTestResult('success');
      }
      
      setInitialStatus('done');
    };

    // Small delay to let everything initialize
    const timer = setTimeout(checkInitialStatus, 500);
    return () => clearTimeout(timer);
  }, []);

  const performSparkTest = async () => {
    setIsTestingAI(true);
    setTestResult('idle');

    try {
      // First check status
      const status = getSparkAIStatus();
      console.log('Spark AI Status:', status);

      // Check if we're in development mode
      const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
      const isPreview = window.location.hostname.includes('preview') || window.location.hostname.includes('staging');

      if (!status.available || !status.initialized) {
        if (isDev || isPreview) {
          setTestResult('dev-mode');
          toast.info('Development Mode Detected', {
            description: 'Spark AI not available in development - this is normal. Fallback mode active.'
          });
          return;
        } else {
          throw new Error(status.error || 'Spark not available');
        }
      }

      if (!status.llmReady || !status.promptReady) {
        throw new Error('Spark AI services not ready');
      }

      // Perform actual AI test
      const testPassed = await testSparkAI();
      
      if (testPassed) {
        setTestResult('success');
        toast.success('Spark AI connection verified! ✅', {
          description: 'All AI services are working correctly'
        });
      } else {
        throw new Error('AI test call failed - check console for details');
      }
    } catch (error) {
      console.error('Spark AI test failed:', error);
      setTestResult('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Spark AI test failed: ${errorMessage}`, {
        description: 'Try refreshing the page or check console for details'
      });
    } finally {
      setIsTestingAI(false);
    }
  };

  const getStatusIcon = () => {
    switch (testResult) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'dev-mode': return <Warning className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (testResult) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'dev-mode': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (testResult) {
      case 'success': return 'AI Ready';
      case 'error': return 'AI Error';
      case 'dev-mode': return 'Dev Mode';
      default: return '';
    }
  };

  // Quick status check without full test
  const quickStatus = getSparkAIStatus();
  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname.includes('127.0.0.1') ||
    window.location.hostname.includes('preview') ||
    window.location.hostname.includes('staging')
  );
  const hasIssues = !quickStatus.available || !quickStatus.initialized || !quickStatus.llmReady || !quickStatus.promptReady;

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={performSparkTest}
        disabled={isTestingAI || initialStatus === 'checking'}
      >
        <TestTube className="w-4 h-4 mr-2" />
        {isTestingAI ? 'Testing...' : initialStatus === 'checking' ? 'Checking...' : 'Test AI'}
      </Button>
      
      {testResult !== 'idle' && initialStatus === 'done' && (
        <Badge className={getStatusColor()}>
          {getStatusIcon()}
          <span className="ml-1">
            {getStatusText()}
          </span>
        </Badge>
      )}
      
      {hasIssues && testResult === 'idle' && !isDev && initialStatus === 'done' && (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Warning className="w-3 h-3 mr-1" />
          AI Issues
        </Badge>
      )}
      
      {hasIssues && testResult === 'idle' && isDev && initialStatus === 'done' && (
        <Badge className="bg-blue-100 text-blue-800">
          <TestTube className="w-3 h-3 mr-1" />
          Dev Mode
        </Badge>
      )}
    </div>
  );
}
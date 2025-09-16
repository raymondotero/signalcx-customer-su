import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, TestTube, Warning } from '@phosphor-icons/react';
import { getSparkAIStatus, testSparkAI } from '@/lib/sparkAI';
import { toast } from 'sonner';

export function SparkTestButton() {
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  const performSparkTest = async () => {
    setIsTestingAI(true);
    setTestResult('idle');

    try {
      // First check status
      const status = getSparkAIStatus();
      console.log('Spark AI Status:', status);

      if (!status.available || !status.initialized) {
        throw new Error(status.error || 'Spark not available');
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
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (testResult) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Quick status check without full test
  const quickStatus = getSparkAIStatus();
  const hasIssues = !quickStatus.available || !quickStatus.initialized || !quickStatus.llmReady || !quickStatus.promptReady;

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={performSparkTest}
        disabled={isTestingAI}
      >
        <TestTube className="w-4 h-4 mr-2" />
        {isTestingAI ? 'Testing...' : 'Test AI'}
      </Button>
      
      {testResult !== 'idle' && (
        <Badge className={getStatusColor()}>
          {getStatusIcon()}
          <span className="ml-1">
            {testResult === 'success' ? 'AI Ready' : 'AI Error'}
          </span>
        </Badge>
      )}
      
      {hasIssues && testResult === 'idle' && (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Warning className="w-3 h-3 mr-1" />
          AI Issues
        </Badge>
      )}
    </div>
  );
}
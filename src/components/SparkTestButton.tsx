import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, TestTube } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function SparkTestButton() {
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  const testSparkAI = async () => {
    setIsTestingAI(true);
    setTestResult('idle');

    try {
      // Check if Spark is available
      if (!(window as any).spark) {
        throw new Error('Spark runtime not available');
      }

      if (!(window as any).spark.llm) {
        throw new Error('Spark LLM not available');
      }

      // Test Spark AI with a simple prompt
      const prompt = (window as any).spark.llmPrompt`Test message for SignalCX platform verification. Please respond with a JSON object containing a "message" field that includes the word "SignalCX".`;
      const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true);
      
      const parsed = JSON.parse(response);
      if (parsed.message && parsed.message.includes('SignalCX')) {
        setTestResult('success');
        toast.success('Spark AI connection verified! ✅');
      } else {
        throw new Error('Unexpected AI response format');
      }
    } catch (error) {
      console.error('Spark AI test failed:', error);
      setTestResult('error');
      toast.error('Spark AI test failed - check console for details');
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

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={testSparkAI}
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
    </div>
  );
}
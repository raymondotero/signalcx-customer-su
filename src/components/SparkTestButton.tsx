import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function SparkTestButton() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  const testSparkAI = async () => {
    setIsTesting(true);
    setTestResult('idle');
    
    try {
      // Test if spark global is available
      if (!(window as any).spark) {
        throw new Error('Spark global not available');
      }
      
      if (!(window as any).spark.llmPrompt) {
        throw new Error('Spark llmPrompt not available');
      }
      
      if (!(window as any).spark.llm) {
        throw new Error('Spark llm not available');
      }
      
      // Test a simple AI call
      const testPrompt = (window as any).spark.llmPrompt`Say "Hello from SignalCX!" in JSON format with a property called message.`;
      const response = await (window as any).spark.llm(testPrompt, 'gpt-4o-mini', true);
      
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
      setIsTesting(false);
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
        disabled={isTesting}
      >
        {isTesting ? 'Testing...' : 'Test AI'}
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
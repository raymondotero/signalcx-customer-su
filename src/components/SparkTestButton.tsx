import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
export function SparkTestButton() {
import { toast } from 'sonner';

export function SparkTestButton() {
  const [istesting, setIsTesting] = useState(false);
      if (!(window as any).spark) {

      if (!(window as any).spark.ll
      }
      if (!(window as any)
    
      // 
      const response = await (window as an
      const parsed = JSON.parse(res
        setTestResult('success');
      }
      
      console.error('Spark AI test failed:', 
      toast.error('Spark AI test failed - check console f
      s
  };
  const getStatusIcon = () => {
      case 'success': return <CheckCircle className
      d
  };
  const getStatusColor = () =>
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
  };
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
      setIsTestin(false);
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























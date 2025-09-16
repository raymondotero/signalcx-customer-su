import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function ForecastDemoButton() {
  const [isDemo, setIsDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const demoSteps = [
    'Analyzing current health scores...',
    'Calculating trend indicators...',
    'Applying industry factors...',
    'Generating confidence metrics...',
    'Finalizing predictions...'
  ];

  const runDemo = async () => {
    setIsDemo(true);
    setDemoStep(0);
    
    for (let i = 0; i < demoSteps.length; i++) {
      setDemoStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setIsDemo(false);
    toast.success('Forecast demo completed - all forecasts updated successfully!');
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={runDemo}
        disabled={isDemo}
        size="sm"
        variant="outline"
        className="relative"
      >
        {isDemo ? (
          <>
            <Target className="w-4 h-4 mr-2 animate-spin" />
            Demo Running...
          </>
        ) : (
          <>
            <Target className="w-4 h-4 mr-2" />
            Demo Forecast Update
          </>
        )}
      </Button>
      
      {isDemo && (
        <Badge variant="outline" className="animate-pulse">
          {demoSteps[demoStep]}
        </Badge>
      )}
      
      {!isDemo && (
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-xs text-muted-foreground">Ready</span>
        </div>
      )}
    </div>
  );
}
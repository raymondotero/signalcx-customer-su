import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChartLine, TrendUp } from '@phosphor-icons/react';
import { PredictiveHeatMap } from './PredictiveHeatMap';

interface PredictiveHeatMapDialogProps {
  trigger?: React.ReactNode;
}

export const PredictiveHeatMapDialog: React.FC<PredictiveHeatMapDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
    >
      <TrendUp className="w-4 h-4" />
      Predictive Heat Map
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChartLine className="w-5 h-5 text-primary" />
            Predictive Signal Heat Map - Future Trends Analysis
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <PredictiveHeatMap />
        </div>
      </DialogContent>
    </Dialog>
  );
};
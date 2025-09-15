import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
    width: typeof window !== 'undefined' ? window.innerWidth : 0,

  useEffect(() => {
      setDimensions({
        height: window.innerHeight,
    };
    w

  const getDeviceTy
    if (dimensions.width >= 768)
  };
  const device = getDeviceType();
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDeviceType = () => {
    if (dimensions.width >= 1024) return { type: 'Desktop', icon: Monitor, color: 'bg-green-100 text-green-800' };
    if (dimensions.width >= 768) return { type: 'Tablet', icon: Tablet, color: 'bg-blue-100 text-blue-800' };
    return { type: 'Mobile', icon: Smartphone, color: 'bg-orange-100 text-orange-800' };
  };

  const device = getDeviceType();
  const DeviceIcon = device.icon;

  const getBreakpointInfo = () => {
    if (dimensions.width >= 1280) return 'xl (1280px+)';
    if (dimensions.width >= 1024) return 'lg (1024px+)';
    if (dimensions.width >= 768) return 'md (768px+)';
    if (dimensions.width >= 640) return 'sm (640px+)';
    return 'xs (<640px)';
  };

  return (
        <div className="grid grid-cols-1 g
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <DeviceIcon className="w-4 h-4" />
          Responsive Height Testing
        </CardTitle>
        <div classN
      <CardContent className="space-y-3">
            <div className="flex gap-2">
          <div>
                variant="outline" 
            <div className="font-mono">{dimensions.width} × {dimensions.height}</div>
              >
          <div>
            <div className="font-medium text-muted-foreground">Breakpoint</div>
            <Badge variant="outline" className="text-xs">
              {getBreakpointInfo()}
            </Badge>
                
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Device Type:</span>
            <Badge className={device.color}>
              {device.type}
              Watch 
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <strong>Test Instructions:</strong> Resize your browser window to see components adapt their height automatically. 
          Watch the height indicators on each tab and observe smooth transitions.
        </div>

    </Card>

}
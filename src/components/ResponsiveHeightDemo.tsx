import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, DeviceTablet, Phone } from '@phosphor-icons/react';

interface Dimensions {
  width: number;
  height: number;
}

export function ResponsiveHeightDemo() {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDeviceType = () => {
    if (dimensions.width >= 1024) return { type: 'Desktop', icon: Monitor, color: 'bg-green-100 text-green-800' };
    if (dimensions.width >= 768) return { type: 'Tablet', icon: DeviceTablet, color: 'bg-blue-100 text-blue-800' };
    return { type: 'Mobile', icon: Phone, color: 'bg-orange-100 text-orange-800' };
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
    <Card className="border-visible mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <DeviceIcon className="w-4 h-4" />
          Responsive Height Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="font-medium text-muted-foreground">Viewport Size</div>
            <div className="font-mono">{dimensions.width} × {dimensions.height}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">Breakpoint</div>
            <Badge variant="outline" className="text-xs">
              {getBreakpointInfo()}
            </Badge>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">Device Type</div>
            <Badge className={device.color}>
              {device.type}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <strong>Test Instructions:</strong> Resize your browser window to see components adapt their height automatically. 
          Watch the height indicators on each tab and observe smooth transitions.
        </div>
      </CardContent>
    </Card>
  );
}
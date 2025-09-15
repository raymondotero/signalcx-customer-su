import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface HeightIndicatorProps {
  className?: string;
  label?: string;
  children: React.ReactNode;
}

export function HeightIndicator({ className = '', label = 'H', children }: HeightIndicatorProps) {
  const [elementHeight, setElementHeight] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const elementRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (elementRef.current) {
        setElementHeight(elementRef.current.offsetHeight);
      }
      setViewportHeight(window.innerHeight);
    };

    updateHeight();
    
    const resizeObserver = new ResizeObserver(updateHeight);
    const element = elementRef.current;
    
    if (element) {
      resizeObserver.observe(element);
    }
    
    window.addEventListener('resize', updateHeight);

    return () => {
      if (element) {
        resizeObserver.unobserve(element);
      }
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  const percentage = viewportHeight > 0 ? Math.round((elementHeight / viewportHeight) * 100) : 0;

  return (
    <div ref={elementRef} className={`w-full h-full relative ${className}`}>
      {children}
      <div className="absolute top-1 right-1 z-20 pointer-events-none">
        <Badge variant="outline" className="text-xs bg-background/90 backdrop-blur border-accent/50 text-accent-foreground">
          {label}: {elementHeight}px ({percentage}% viewport)
        </Badge>
      </div>
    </div>
  );
}
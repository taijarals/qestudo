import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressBarProps {
  children?: React.ReactNode;
  className?: string;
  value: number;
  colorClass?: string;
  bgColorClass?: string;
}

export function ProgressBar({ 
  value, 
  className, 
  colorClass = 'bg-blue-600',
  bgColorClass = 'bg-slate-100',
  ...props 
}: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full', bgColorClass, className)} {...props}>
      <div
        className={cn('h-full flex-1 transition-all duration-500 ease-in-out', colorClass)}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

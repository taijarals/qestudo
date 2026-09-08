import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'blue';
  onClick?: React.MouseEventHandler<HTMLDivElement> | (() => void) | any;
  key?: React.Key | string | number;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'bg-slate-100 text-slate-800': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-amber-100 text-amber-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
          'bg-blue-100 text-blue-800': variant === 'blue',
          'border border-slate-200 text-slate-800': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

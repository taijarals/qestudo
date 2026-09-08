const fs = require('fs');

const buttonCode = `import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | (() => void) | any;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-slate-100 text-slate-900 hover:bg-slate-200': variant === 'secondary',
          'border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700': variant === 'outline',
          'bg-transparent hover:bg-slate-100 text-slate-700': variant === 'ghost',
          'bg-red-50 text-red-600 hover:bg-red-100': variant === 'danger',
          'bg-green-500 text-white hover:bg-green-600': variant === 'success',
          'bg-orange-500 text-white hover:bg-orange-600': variant === 'warning',
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-12 px-8 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
`;

const badgeCode = `import React from 'react';
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
`;

const pbCode = `import React from 'react';
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
        style={{ width: \`\${safeValue}%\` }}
      />
    </div>
  );
}
`;

fs.writeFileSync('src/components/ui/Button.tsx', buttonCode);
fs.writeFileSync('src/components/ui/Badge.tsx', badgeCode);
fs.writeFileSync('src/components/ui/ProgressBar.tsx', pbCode);

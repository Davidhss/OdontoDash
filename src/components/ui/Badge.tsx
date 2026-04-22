import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'alert' | 'danger' | 'outline' | 'success';
  className?: string;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className,
  pulse = false
}) => {
  const variants = {
    primary: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
    secondary: 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20',
    alert: 'bg-accent-alert/10 text-accent-alert border-accent-alert/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    outline: 'bg-transparent text-text-secondary border-border-card',
  };

  return (
    <span className={cn(
      'px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 whitespace-nowrap',
      variants[variant],
      className
    )}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            variant === 'primary' ? 'bg-accent-primary' : 
            variant === 'success' ? 'bg-emerald-500' : 'bg-current'
          )}></span>
          <span className={cn(
            "relative inline-flex rounded-full h-1.5 w-1.5",
            variant === 'primary' ? 'bg-accent-primary' : 
            variant === 'success' ? 'bg-emerald-500' : 'bg-current'
          )}></span>
        </span>
      )}
      {children}
    </span>
  );
};

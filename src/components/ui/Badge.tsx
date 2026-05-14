import { cn } from '../../lib/utils';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neon' | 'outline' | 'purple' | 'blue' | 'red' | 'green' | 'gray';
  size?: 'xs' | 'sm' | 'default';
}

import { ReactNode } from 'react';

export function Badge({ children, className, variant = 'default', size = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-800 text-zinc-300',
    success: 'bg-green-500/10 text-green-500 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    error: 'bg-red-500/10 text-red-500 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    neon: 'bg-neon-green/10 text-neon-green border border-neon-green/20',
    purple: 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20',
    blue: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    red: 'bg-red-500/10 text-red-500 border border-red-500/20',
    green: 'bg-green-500/10 text-green-500 border border-green-500/20',
    gray: 'bg-zinc-800/10 text-zinc-500 border border-zinc-800/20',
    outline: 'border border-zinc-800 text-zinc-500 bg-transparent',
  };

  const sizes = {
    xs: 'px-1.5 py-0 text-[8px]',
    sm: 'px-2 py-0.5 text-[10px]',
    default: 'px-2.5 py-0.5 text-xs'
  };

  return (
    <span className={cn('inline-flex items-center rounded-full font-semibold uppercase tracking-wider', variants[variant as keyof typeof variants] || variants.default, sizes[size], className)}>
      {children}
    </span>
  );
}

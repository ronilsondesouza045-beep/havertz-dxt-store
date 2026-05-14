import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'neon-green' | 'neon-purple';
  onClick?: () => void;
}

export function Card({ children, className, variant = 'default', onClick }: CardProps) {
  const variants = {
    default: 'border-zinc-800 bg-zinc-900/40 backdrop-blur-sm',
    'neon-green': 'border-neon-green/20 bg-neon-green/5 shadow-[0_0_15px_rgba(57,255,20,0.05)]',
    'neon-purple': 'border-neon-purple/20 bg-neon-purple/5 shadow-[0_0_15px_rgba(188,19,254,0.05)]',
  };

  return (
    <div 
      className={cn('rounded-xl border p-6 transition-all', variants[variant], className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-zinc-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'flex w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white transition-all placeholder:text-zinc-500 focus:border-neon-green/50 focus:outline-none focus:ring-1 focus:ring-neon-green/20 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500/80">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

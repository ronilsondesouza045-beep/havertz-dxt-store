import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'neon' | 'neon-purple';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-zinc-100 text-black hover:bg-zinc-200 focus:ring-zinc-400',
      secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 focus:ring-zinc-600',
      outline: 'border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white',
      ghost: 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
      neon: 'bg-neon-green/10 text-neon-green border border-neon-green/50 hover:bg-neon-green/20 hover:neon-glow-green',
      'neon-purple': 'bg-neon-purple/10 text-neon-purple border border-neon-purple/50 hover:bg-neon-purple/20 hover:neon-glow-purple',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs md:text-xs',
      md: 'px-5 py-3 text-base md:px-4 md:py-2 md:text-sm',
      lg: 'px-8 py-4 text-lg md:px-6 md:py-3 md:text-base',
      icon: 'p-3 md:p-2',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:pointer-events-none active:scale-95',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

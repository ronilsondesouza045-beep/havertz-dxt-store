import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Package, 
  TrendingUp, 
  AlertCircle,
  LucideIcon 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type NoticeType = 'important' | 'security' | 'delivery' | 'observation' | 'alert';

interface NoticeItem {
  type: NoticeType;
  text: string;
}

interface InfoNoticeProps {
  notices: NoticeItem[];
  className?: string;
  variant?: 'list' | 'grid' | 'inline';
}

const config: Record<NoticeType, { icon: LucideIcon; color: string; bg: string; border: string; label: string; iconColor: string }> = {
  important: { 
    icon: AlertTriangle, 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500/5', 
    border: 'border-yellow-500/10',
    label: 'Informação Importante',
    iconColor: 'text-yellow-500'
  },
  security: { 
    icon: ShieldCheck, 
    color: 'text-blue-500', 
    bg: 'bg-blue-500/5', 
    border: 'border-blue-500/10',
    label: 'Segurança Garantida',
    iconColor: 'text-blue-500'
  },
  delivery: { 
    icon: Package, 
    color: 'text-green-500', 
    bg: 'bg-green-500/5', 
    border: 'border-green-500/10',
    label: 'Status de Entrega',
    iconColor: 'text-green-500'
  },
  observation: { 
    icon: TrendingUp, 
    color: 'text-purple-500', 
    bg: 'bg-purple-500/5', 
    border: 'border-purple-500/10',
    label: 'Observação Técnica',
    iconColor: 'text-purple-500'
  },
  alert: { 
    icon: AlertCircle, 
    color: 'text-red-500', 
    bg: 'bg-red-500/5', 
    border: 'border-red-500/10',
    label: 'Alerta Crítico',
    iconColor: 'text-red-500'
  }
};

export function InfoNotice({ notices, className, variant = 'list' }: InfoNoticeProps) {
  if (variant === 'inline') {
    return (
      <div className={cn("flex flex-wrap gap-4", className)}>
        {notices.map((notice, idx) => {
          const { icon: Icon, color, bg, border, iconColor } = config[notice.type];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all hover:bg-white/[0.02]",
                bg, border
              )}
            >
              <Icon size={12} className={iconColor} />
              <span className="text-[10px] font-black uppercase italic tracking-wider text-zinc-300">
                {notice.text}
              </span>
            </motion.div>
          );
        })}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {notices.map((notice, idx) => {
          const { icon: Icon, color, bg, border, label, iconColor } = config[notice.type];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "p-4 rounded-2xl border bg-zinc-950/50 backdrop-blur-sm group hover:border-zinc-700 transition-all",
                border
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("p-2 rounded-lg", bg)}>
                  <Icon size={18} className={iconColor} />
                </div>
                <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", color)}>
                  {label}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">
                {notice.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {notices.map((notice, idx) => {
        const { icon: Icon, color, bg, border, iconColor } = config[notice.type];
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "flex items-start gap-4 p-4 rounded-2xl border bg-zinc-950/20 backdrop-blur-sm hover:bg-zinc-900/40 transition-all group",
              border
            )}
          >
            <div className={cn("mt-0.5 p-2 rounded-xl shrink-0 group-hover:scale-110 transition-transform", bg)}>
              <Icon size={16} className={iconColor} />
            </div>
            <div>
              <p className="text-xs text-zinc-300 font-bold leading-relaxed italic uppercase tracking-tight">
                {notice.text}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

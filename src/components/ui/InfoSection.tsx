import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  UserX, 
  CheckCircle2, 
  Headphones, 
  Clock,
  Shield,
  SearchCheck,
  LucideIcon,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  icon: LucideIcon;
  text: string;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}

export const InfoBadge: React.FC<BadgeProps> = ({ icon: Icon, text, color = 'green' }) => {
  const colors = {
    green: { bg: 'bg-neon-green/5', border: 'border-neon-green/20', text: 'text-neon-green', icon: 'text-neon-green' },
    blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'text-blue-500' },
    yellow: { bg: 'bg-yellow-500/5', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: 'text-yellow-500' },
    red: { bg: 'bg-red-500/5', border: 'border-red-500/20', text: 'text-red-400', icon: 'text-red-500' },
    purple: { bg: 'bg-neon-purple/5', border: 'border-neon-purple/20', text: 'text-neon-purple', icon: 'text-neon-purple' },
  };

  const { bg, border, text: textColor, icon: iconColor } = colors[color];

  return (
    <motion.div
      whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-md transition-all",
        bg, border
      )}
    >
      <Icon size={14} className={iconColor} />
      <span className={cn("text-[10px] font-black uppercase italic tracking-widest leading-none", textColor)}>
        {text}
      </span>
    </motion.div>
  );
};

export function InfoBadgeRow() {
  const badges = [
    { icon: Zap, text: 'Entrega manual humanizada e segura', color: 'yellow' as const },
    { icon: Shield, text: 'Protocolos rigorosos de segurança', color: 'blue' as const },
    { icon: UserX, text: 'Zero acesso à conta (apenas ID)', color: 'red' as const },
    { icon: CheckCircle2, text: 'Confirmação manual imediata', color: 'green' as const },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {badges.map((badge, idx) => (
        <InfoBadge key={idx} icon={badge.icon} text={badge.text} color={badge.color} />
      ))}
    </div>
  );
}

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ icon: Icon, title, description, color = 'text-neon-green' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, borderColor: 'rgba(255, 255, 255, 0.1)' }}
      className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl group transition-all"
    >
      <div className={cn("p-3 rounded-2xl bg-zinc-950 w-fit mb-6 border border-zinc-800 group-hover:scale-110 transition-transform", color)}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2 group-hover:text-neon-green transition-colors">
        {title}
      </h3>
      <p className="text-sm text-zinc-400 font-medium italic leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

export function BenefitCards() {
  const benefits = [
    {
      icon: Headphones,
      title: 'Entrega Manual',
      description: 'Processo humanizado e organizado para garantir que cada pedido receba atenção exclusiva e segura.',
      color: 'text-neon-green'
    },
    {
      icon: ShieldCheck,
      title: 'Segurança Total',
      description: 'Não solicitamos senhas, tokens ou acessos. Utilizamos apenas dados públicos necessários para a entrega.',
      color: 'text-blue-500'
    },
    {
      icon: SearchCheck,
      title: 'Atendimento Elite',
      description: 'Cada transação é registrada e monitorada manualmente por nossa equipe especializada no mercado DXT.',
      color: 'text-neon-purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {benefits.map((benefit, idx) => (
        <BenefitCard 
          key={idx} 
          icon={benefit.icon} 
          title={benefit.title} 
          description={benefit.description} 
          color={benefit.color} 
        />
      ))}
    </div>
  );
}

export function NoticeSection({ title = "Protocolos de Operação", className }: { title?: string; className?: string }) {
  return (
    <section className={cn("py-20 space-y-16", className)}>
      <div className="space-y-8">
        <div className="flex items-center gap-4 justify-center">
            <div className="h-px bg-zinc-800 flex-1 max-w-[100px]" />
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] italic">{title}</h2>
            <div className="h-px bg-zinc-800 flex-1 max-w-[100px]" />
        </div>
        <InfoBadgeRow />
      </div>

      <BenefitCards />
    </section>
  );
}

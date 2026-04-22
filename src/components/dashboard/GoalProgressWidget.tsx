import React from 'react';
import { motion } from 'motion/react';
import { Target, TrendingUp } from 'lucide-react';
import { MetaMes } from '../../types';

interface GoalProgressWidgetProps {
  meta: MetaMes | null;
  totalLeads: number;
  totalConsultas: number;
  totalClientes: number;
  totalFaturamento: number;
  investimentoTotal: number;
}

interface GoalBarProps {
  label: string;
  current: number;
  target: number;
  prefix?: string;
  suffix?: string;
  color: string;
  delay: number;
}

const GoalBar: React.FC<GoalBarProps> = ({ label, current, target, prefix = '', suffix = '', color, delay }) => {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isAchieved = pct >= 100;

  const formatVal = (v: number) => {
    if (prefix === 'R$ ') return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    return `${prefix}${v.toLocaleString('pt-BR')}${suffix}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-secondary">{label}</span>
          {isAchieved && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 uppercase"
            >
              ✓ Meta
            </motion.span>
          )}
        </div>
        <span className="text-xs font-bold text-text-primary">
          {formatVal(current)}
          <span className="text-text-tertiary font-medium"> / {formatVal(target)}</span>
        </span>
      </div>

      <div className="h-2 bg-border-card rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: delay + 0.2, ease: 'easeOut' }}
          className="h-full rounded-full relative overflow-hidden"
          style={{ background: isAchieved ? `linear-gradient(90deg, #10B981, #34D399)` : `linear-gradient(90deg, ${color}CC, ${color})` }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          />
        </motion.div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-[10px] text-text-tertiary">{Math.round(pct)}% alcançado</span>
        {target > current && (
          <span className="text-[10px] text-text-tertiary">Faltam: {formatVal(target - current)}</span>
        )}
      </div>
    </motion.div>
  );
};

export const GoalProgressWidget: React.FC<GoalProgressWidgetProps> = ({
  meta, totalLeads, totalConsultas, totalClientes, totalFaturamento, investimentoTotal
}) => {
  if (!meta) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
          <Target size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary">Sem Meta Definida</h4>
          <p className="text-xs text-text-tertiary mt-1">Acesse <span className="text-accent-primary font-bold">Metas</span> para definir objetivos mensais</p>
        </div>
      </motion.div>
    );
  }

  const goals = [
    { label: 'Leads', current: totalLeads, target: meta.meta_leads, color: '#0A7E6A' },
    { label: 'Consultas', current: totalConsultas, target: meta.meta_consultas, color: '#0D9488' },
    { label: 'Fechados', current: totalClientes, target: meta.meta_clientes, color: '#10B981' },
    { label: 'Faturamento', current: totalFaturamento, target: Number(meta.meta_faturamento), prefix: 'R$ ', color: '#F59E0B' },
    { label: 'Investimento', current: investimentoTotal, target: Number(meta.meta_investimento), prefix: 'R$ ', color: '#EF4444' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-text-primary">Metas do Mês</h3>
          <p className="text-xs text-text-tertiary">Progresso atual</p>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary"
        >
          <Target size={18} />
        </motion.div>
      </div>

      <div className="space-y-4">
        {goals.map((g, i) => (
          <GoalBar key={g.label} {...g} delay={i * 0.1} />
        ))}
      </div>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'motion/react';

interface FunnelChartProps {
  data: { stage: string; count: number }[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  const maxValue = data[0]?.count || 1;
  const colors = ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'];

  return (
    <div className="glass-card rounded-2xl p-8 h-full">
      <h3 className="text-xl font-bold text-text-primary mb-2">Funil de Conversão</h3>
      <p className="text-sm text-text-secondary mb-8">Eficiência das etapas de vendas</p>

      <div className="space-y-6">
        {data.map((step, index) => {
          const width = (step.count / maxValue) * 100;
          const prevStep = data[index - 1];
          const conversion = prevStep && prevStep.count > 0 ? Math.round((step.count / prevStep.count) * 100) : null;

          return (
            <div key={step.stage} className="relative">
              {conversion !== null && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-text-tertiary bg-background-app px-2 py-0.5 rounded-full border border-border-card z-10">
                  {conversion}% conv.
                </div>
              )}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{step.stage}</span>
                <span className="text-sm font-bold text-text-primary">{step.count}</span>
              </div>
              <div className="h-3 bg-border-card/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${width}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

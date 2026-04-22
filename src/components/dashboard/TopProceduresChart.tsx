import React from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Stethoscope } from 'lucide-react';

interface TopProceduresChartProps {
  data: { label: string; value: number }[];
}

const COLORS = ['#0A7E6A', '#0D9488', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-card border border-border-card rounded-xl p-3 shadow-xl">
        <p className="text-sm font-bold text-text-primary">{payload[0].name}</p>
        <p className="text-xs text-text-secondary">{payload[0].value} leads</p>
        <p className="text-xs font-bold text-accent-primary">{payload[0].payload.percent?.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.08) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const TopProceduresChart: React.FC<TopProceduresChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6 h-[280px] flex items-center justify-center">
        <p className="text-text-tertiary text-sm">Sem dados de procedimentos</p>
      </div>
    );
  }

  const total = data.reduce((acc, d) => acc + d.value, 0);
  const enriched = data.map(d => ({ ...d, percent: (d.value / total) * 100 }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 h-[280px]"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-text-primary">Top Procedimentos</h3>
          <p className="text-xs text-text-tertiary">{total} leads • interesse declarado</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
          <Stethoscope size={18} />
        </div>
      </div>

      <div className="flex items-center gap-4 h-[180px]">
        <ResponsiveContainer width="50%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              dataKey="value"
              nameKey="label"
              labelLine={false}
              label={renderCustomLabel}
              animationBegin={0}
              animationDuration={1000}
            >
              {enriched.map((_, index) => (
                <Cell key={`procedure-cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-1.5 overflow-y-auto scrollbar-hide max-h-[180px]">
          {enriched.map((d, i) => (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2"
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-xs font-medium text-text-secondary flex-1 truncate">{d.label}</span>
              <span className="text-xs font-bold text-text-primary">{d.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

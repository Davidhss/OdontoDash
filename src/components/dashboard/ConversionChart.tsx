import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ConversionChartProps {
  data: { label: string; value: number; conversao: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-card border border-border-card rounded-xl p-3 shadow-xl">
        <p className="text-xs font-bold text-text-tertiary mb-2 uppercase">{label}</p>
        <p className="text-sm font-bold text-accent-primary">{payload[0]?.value} leads</p>
        <p className="text-xs text-emerald-500 font-bold">{payload[0]?.payload?.conversao}% conversão</p>
      </div>
    );
  }
  return null;
};

export const ConversionChart: React.FC<ConversionChartProps> = ({ data }) => {
  const COLORS = ['#0A7E6A', '#0D9488', '#10B981', '#34D399', '#6EE7B7'];

  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6 h-[320px] flex items-center justify-center">
        <p className="text-text-tertiary text-sm">Sem dados de fontes ainda</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 h-[320px]"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-text-primary">Leads por Fonte</h3>
          <p className="text-xs text-text-tertiary">Conversão por canal de captação</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
          <TrendingUp size={18} />
        </div>
      </div>

      <ResponsiveContainer width="100%" height="75%" minWidth={0} minHeight={0}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10,126,106,0.05)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
            {data.map((_, index) => (
              <Cell key={`conv-cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
            ))}
            <LabelList
              dataKey="conversao"
              position="top"
              formatter={(v: number) => `${v}%`}
              style={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

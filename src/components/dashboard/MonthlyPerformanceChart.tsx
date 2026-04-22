import React from 'react';
import { motion } from 'motion/react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface MonthlyPerformanceChartProps {
  data: { month: string; leads: number; clientes: number; faturamento: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-card border border-border-card rounded-xl p-4 shadow-xl min-w-[180px]">
        <p className="text-xs font-bold text-text-tertiary mb-3 uppercase tracking-wide">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={`tooltip-item-${p.dataKey}-${i}`} className="flex items-center justify-between gap-4 mb-1">
            <span className="text-xs font-medium" style={{ color: p.color }}>{p.name}</span>
            <span className="text-xs font-bold text-text-primary">
              {p.dataKey === 'faturamento' 
                ? `R$ ${Number(p.value).toLocaleString('pt-BR')}`
                : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlyPerformanceChart: React.FC<MonthlyPerformanceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6 h-[360px] flex items-center justify-center">
        <p className="text-text-tertiary text-sm">Sem dados históricos ainda</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 h-[360px]"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-text-primary">Performance Mensal</h3>
          <p className="text-xs text-text-tertiary">Comparativo dos últimos 6 meses</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
          <BarChart3 size={18} />
        </div>
      </div>

      <ResponsiveContainer width="100%" height="82%" minWidth={0} minHeight={0}>
        <ComposedChart data={data} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.08)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 9, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10,126,106,0.05)' }} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) => <span style={{ color: '#9CA3AF', fontWeight: 600 }}>{value}</span>}
          />
          <Bar yAxisId="left" dataKey="leads" name="Leads" fill="#0A7E6A" fillOpacity={0.7} radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar yAxisId="left" dataKey="clientes" name="Fechados" fill="#10B981" fillOpacity={0.9} radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="faturamento"
            name="Faturamento"
            stroke="#F59E0B"
            strokeWidth={2.5}
            dot={{ fill: '#F59E0B', r: 4, strokeWidth: 2, stroke: '#FFF' }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

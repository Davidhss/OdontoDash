import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface AngulationChartProps {
  data: { label: string; value: number }[];
}

export const AngulationChart: React.FC<AngulationChartProps> = ({ data }) => {
  const COLORS = ['#0A7E6A', '#0D9488', '#14B8A6', '#2DD4BF'];

  return (
    <div className="bg-background-card border border-border-card rounded-3xl p-6 h-[400px] flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-text-primary">Ângulo de Oferta</h3>
        <p className="text-sm text-text-tertiary">Origem dos leads por criativo</p>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              nameKey="label"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                fontSize: '12px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs font-medium text-text-secondary">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

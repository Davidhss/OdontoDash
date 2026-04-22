import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';

interface JourneyFunnelProps {
  data: { stage: string; count: number }[];
}

export const JourneyFunnel: React.FC<JourneyFunnelProps> = ({ data }) => {
  const COLORS = ['#0D9488', '#0A7E6A', '#065F46', '#064E3B', '#022C22'];

  return (
    <div className="bg-background-card border border-border-card rounded-3xl p-6 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Jornada do Consumidor</h3>
          <p className="text-sm text-text-tertiary">Fluxo de conversão por etapa da jornada</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="stage" 
              type="category" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: 'rgba(10, 126, 106, 0.05)' }}
              contentStyle={{
                backgroundColor: 'var(--background-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="count" 
              radius={[0, 8, 8, 0]} 
              barSize={32}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList 
                dataKey="count" 
                position="right" 
                style={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 700 }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

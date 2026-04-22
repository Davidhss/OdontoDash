import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface LeadsChartProps {
  data: { date: string; leads: number }[];
}

export const LeadsChart: React.FC<LeadsChartProps> = ({ data }) => {
  return (
    <div className="glass-card rounded-2xl p-8 h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-text-primary">Leads Captados</h3>
          <p className="text-sm text-text-secondary">Desempenho diário de captação nos últimos 30 dias</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-primary" />
            <span className="text-xs font-bold text-text-secondary uppercase">Volume Diário</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#111827', 
                border: '1px solid #1F2937', 
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#3B82F6', fontWeight: 700 }}
              labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontWeight: 600 }}
            />
            <Area 
              type="monotone" 
              dataKey="leads" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorLeads)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

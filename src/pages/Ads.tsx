import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  MousePointer2, 
  Users, 
  Plus,
  Calendar,
  DollarSign,
  Target,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useMetricasAds } from '../hooks/useMetricasAds';
import { Badge } from '../components/ui/Badge';
import { CountUp } from '../components/ui/CountUp';
import { cn, formatCurrency, formatNumber } from '../lib/utils';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Ads: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { metricas, loading, deleteMetrica, getTotaisMes } = useMetricasAds(format(selectedMonth, 'yyyy-MM'));

  const chartData = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayMetrics = metricas.filter(m => isSameDay(new Date(m.data_lancamento), day));
      const leads = dayMetrics.reduce((acc, curr) => acc + Number(curr.leads_gerados), 0);
      const inv = dayMetrics.reduce((acc, curr) => acc + Number(curr.investimento), 0);
      return {
        date: format(day, 'dd/MM'),
        investimento: inv,
        leads: leads,
        cpl: leads > 0 ? inv / leads : 0
      };
    });
  }, [metricas, selectedMonth]);

  const totais = useMemo(() => getTotaisMes(format(selectedMonth, 'yyyy-MM')), [getTotaisMes, selectedMonth]);

  const kpis = [
    { title: 'Investimento', value: totais.investimento, prefix: 'R$ ', icon: DollarSign, color: 'text-accent-primary' },
    { title: 'Leads Gerados', value: totais.leads, icon: Users, color: 'text-accent-secondary' },
    { title: 'CPL Médio', value: totais.leads > 0 ? totais.investimento / totais.leads : 0, prefix: 'R$ ', icon: Target, color: 'text-accent-alert' },
    { title: 'Cliques Totais', value: totais.cliques, icon: MousePointer2, color: 'text-emerald-500' },
  ];

  if (loading && metricas.length === 0) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Performance de Anúncios</h1>
          <p className="text-sm text-text-secondary">Gestão manual de métricas de tráfego pago</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={format(selectedMonth, 'yyyy-MM')}
            onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
            className="bg-background-card border border-border-card rounded-xl px-4 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-primary"
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{kpi.title}</span>
              <div className="p-2 rounded-lg bg-background-sidebar border border-border-card">
                <kpi.icon size={16} className={kpi.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-text-primary relative z-10">
              <CountUp value={kpi.value} prefix={kpi.prefix} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider">Investimento Diário</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A7E6A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0A7E6A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--background-card)', border: '1px solid var(--border-card)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="investimento" stroke="#0A7E6A" strokeWidth={3} fillOpacity={1} fill="url(#colorInv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider">CPL Diário vs Meta</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--background-card)', border: '1px solid var(--border-card)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <ReferenceLine y={15} label={{ value: 'Meta CPL (R$ 15)', position: 'right', fill: '#EF4444', fontSize: 10 }} stroke="#EF4444" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="cpl" stroke="#0D9488" strokeWidth={3} dot={{ fill: '#0D9488', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border-card flex items-center justify-between bg-background-sidebar/30">
          <h3 className="font-bold text-text-primary uppercase tracking-wider text-sm">Histórico de Lançamentos</h3>
          <Badge variant="primary">{metricas.length} Registros</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-card bg-background-sidebar/10">
                <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Campanha</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Foco</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Ângulo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Investimento</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Leads</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">CPL</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card/50">
              {metricas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-text-tertiary">
                    Nenhum lançamento encontrado para este mês.
                  </td>
                </tr>
              ) : (
                metricas.map((item) => (
                  <tr key={item.id} className="hover:bg-border-card/20 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-text-primary">{format(new Date(item.data_lancamento), 'dd/MM/yyyy')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">{item.campanha}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{item.procedimento_foco || 'Geral'}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-text-tertiary">{item.angulo_oferta || 'Direto'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-text-primary">{formatCurrency(Number(item.investimento))}</td>
                    <td className="px-6 py-4 text-sm font-bold text-text-primary">{item.leads_gerados}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-sm font-bold",
                        (Number(item.investimento) / item.leads_gerados) > 15 ? "text-danger" : "text-accent-primary"
                      )}>
                        {item.leads_gerados > 0 ? formatCurrency(Number(item.investimento) / item.leads_gerados) : 'R$ 0,00'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => deleteMetrica(item.id)}
                        className="p-2 hover:bg-danger/10 text-text-tertiary hover:text-danger rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ads;

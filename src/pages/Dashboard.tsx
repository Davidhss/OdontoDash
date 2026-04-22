import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { LeadsChart } from '../components/dashboard/LeadsChart';
import { FunnelChart } from '../components/dashboard/FunnelChart';
import { JourneyFunnel } from '../components/dashboard/JourneyFunnel';
import { AngulationChart } from '../components/dashboard/AngulationChart';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { ConversionChart } from '../components/dashboard/ConversionChart';
import { MonthlyPerformanceChart } from '../components/dashboard/MonthlyPerformanceChart';
import { GoalProgressWidget } from '../components/dashboard/GoalProgressWidget';
import { TopProceduresChart } from '../components/dashboard/TopProceduresChart';
import { EmptyStateDashboard } from '../components/dashboard/EmptyStateDashboard';
import { useDashboard } from '../hooks/useDashboard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useBusiness } from '../hooks/useBusiness';
import { 
  AlertCircle, Users, Calendar, DollarSign, TrendingUp, 
  Percent, XCircle, BarChart2, RefreshCw 
} from 'lucide-react';
import { cn } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const { kpis, loading, error, refresh } = useDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-background-card rounded-2xl border border-border-card text-center h-full min-h-[400px]">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-text-primary mb-2">Erro ao carregar dados</h3>
        <p className="text-text-secondary mb-6">{error}</p>
        <button 
          onClick={() => refresh()}
          className="flex items-center gap-2 px-6 py-3 bg-accent-primary text-background-app font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={`skel-card-${i}`} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={`skel-chart-lg-${i}`} className="h-[320px] bg-background-sidebar rounded-3xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={`skel-chart-md-${i}`} className="h-[280px] bg-background-sidebar rounded-3xl animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!kpis.hasData && !loading) {
    return <EmptyStateDashboard />;
  }

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            {activeBusiness?.nome || 'Dashboard'}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Visão geral do mês atual — atualizado em tempo real
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background-sidebar border border-border-card text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 transition-all text-sm font-bold"
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={{ duration: 0.8, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
          >
            <RefreshCw size={16} />
          </motion.div>
          Atualizar
        </motion.button>
      </motion.div>

      {/* Follow-up Alert */}
      {kpis.followUpAtrasado && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-accent-alert/10 to-orange-500/10 border border-accent-alert/30 p-4 rounded-2xl flex items-center gap-3 text-accent-alert shadow-lg"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <AlertCircle size={20} />
          </motion.div>
          <span className="font-bold text-sm">Atenção: Existem follow-ups pendentes que precisam da sua atenção!</span>
        </motion.div>
      )}

      {/* KPI Cards — Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}>
          <KpiCard
            title="Leads do Mês"
            value={kpis.totalLeads}
            delta="Novos contatos"
            isPositive={true}
            sparklineData={kpis.leadsPorDia.slice(-7).map(d => ({ val: d.leads }))}
            icon={<Users size={20} />}
          />
        </motion.div>
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}>
          <KpiCard
            title="Consultas Agendadas"
            value={kpis.totalConsultas}
            delta={`${kpis.totalLeads > 0 ? Math.round((kpis.totalConsultas / kpis.totalLeads) * 100) : 0}% dos leads`}
            isPositive={true}
            sparklineData={[]}
            subValue="Agendamentos ativos"
            icon={<Calendar size={20} />}
          />
        </motion.div>
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }}>
          <KpiCard
            title="Remuneração Blent"
            value={kpis.comissaoBlent + 1000}
            prefix="R$ "
            delta="Fixo R$ 1.000 + 10%"
            isPositive={true}
            sparklineData={[]}
            subValue="Estimativa do mês"
            badge="Comissão"
            icon={<DollarSign size={20} />}
          />
        </motion.div>
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }}>
          <KpiCard
            title="Faturamento"
            value={kpis.totalFaturamento}
            prefix="R$ "
            delta={`ROAS ${kpis.roasEstimado.toFixed(1)}x`}
            isPositive={kpis.roasEstimado >= 3}
            sparklineData={kpis.monthlyComparison.map(m => ({ val: m.faturamento }))}
            badge="Confirmado"
            icon={<TrendingUp size={20} />}
          />
        </motion.div>
      </div>

      {/* KPI Cards — Row 2 (Secondary metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Taxa de Conversão', value: `${kpis.taxaConversao}%`, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: Percent },
          { label: 'CPL Médio', value: `R$ ${kpis.cplMedio.toFixed(0)}`, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: BarChart2 },
          { label: 'Clientes Fechados', value: kpis.totalClientes, color: 'text-accent-primary', bg: 'bg-accent-primary/10', icon: Users },
          { label: 'Leads Perdidos', value: kpis.leadsPerdidos, color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.25 + i * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass-card rounded-2xl p-4 flex items-center gap-3"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', metric.bg, metric.color)}>
              <metric.icon size={18} />
            </div>
            <div>
              <div className={cn('text-xl font-black', metric.color)}>{metric.value}</div>
              <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">{metric.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.3 }} className="lg:col-span-2">
          <LeadsChart data={kpis.leadsPorDia} />
        </motion.div>
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.35 }}>
          <GoalProgressWidget
            meta={kpis.metaAtual}
            totalLeads={kpis.totalLeads}
            totalConsultas={kpis.totalConsultas}
            totalClientes={kpis.totalClientes}
            totalFaturamento={kpis.totalFaturamento}
            investimentoTotal={kpis.investimentoTotal}
          />
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.4 }}>
          <MonthlyPerformanceChart data={kpis.monthlyComparison} />
        </motion.div>
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.45 }}>
          <ConversionChart data={kpis.fonteData} />
        </motion.div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.5 }} className="lg:col-span-3">
          <JourneyFunnel data={kpis.jornadaData} />
        </motion.div>
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.55 }} className="lg:col-span-2">
          <TopProceduresChart data={kpis.procedimentoData} />
        </motion.div>
      </div>

      {/* Charts Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.6 }} className="lg:col-span-2">
          <FunnelChart data={kpis.funnelData} />
        </motion.div>
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.65 }}>
          <AngulationChart data={kpis.angulacaoData} />
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.7 }}>
        <ActivityFeed activities={kpis.atividadesRecentes} />
      </motion.div>
    </div>
  );
};

export default Dashboard;

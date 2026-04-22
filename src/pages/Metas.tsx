import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Target, TrendingUp, Users, DollarSign, Calendar, CheckCircle2, AlertCircle, Save, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMetas } from '../hooks/useMetas';
import { useDashboard } from '../hooks/useDashboard';
import { Badge } from '../components/ui/Badge';
import { CountUp } from '../components/ui/CountUp';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const Metas: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const { meta, loading: loadingMeta, upsertMeta } = useMetas(format(selectedMonth, 'yyyy-MM'));
  const { kpis: currentKpis, loading: loadingDashboard } = useDashboard(selectedMonth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    meta_leads: 0,
    meta_consultas: 0,
    meta_clientes: 0,
    meta_investimento: 0,
    meta_faturamento: 0
  });

  useEffect(() => {
    if (meta) {
      setFormData({
        meta_leads: meta.meta_leads || 0,
        meta_consultas: meta.meta_consultas || 0,
        meta_clientes: meta.meta_clientes || 0,
        meta_investimento: meta.meta_investimento || 0,
        meta_faturamento: meta.meta_faturamento || 0
      });
    } else {
      setFormData({
        meta_leads: 0,
        meta_consultas: 0,
        meta_clientes: 0,
        meta_investimento: 0,
        meta_faturamento: 0
      });
    }
  }, [meta]);

  const handleSave = async () => {
    const success = await upsertMeta(format(selectedMonth, 'yyyy-MM'), formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const metasCards = useMemo(() => [
    { 
      id: 'leads', 
      title: 'Leads Captados', 
      atual: currentKpis.totalLeads, 
      meta: formData.meta_leads, 
      icon: Users, 
      color: 'text-accent-primary',
      bg: 'bg-accent-primary/10'
    },
    { 
      id: 'consultas', 
      title: 'Consultas Agendadas', 
      atual: currentKpis.totalConsultas, 
      meta: formData.meta_consultas, 
      icon: Calendar, 
      color: 'text-accent-secondary',
      bg: 'bg-accent-secondary/10'
    },
    { 
      id: 'clientes', 
      title: 'Novos Clientes', 
      atual: currentKpis.totalClientes, 
      meta: formData.meta_clientes, 
      icon: CheckCircle2, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    { 
      id: 'faturamento', 
      title: 'Faturamento Bruto', 
      atual: currentKpis.totalFaturamento, 
      meta: formData.meta_faturamento, 
      icon: DollarSign, 
      color: 'text-accent-alert',
      bg: 'bg-accent-alert/10',
      isCurrency: true
    },
  ], [currentKpis, formData]);

  const changeMonth = (amount: number) => {
    setSelectedMonth(prev => amount > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Metas & Objetivos</h1>
          <p className="text-sm text-text-secondary">Defina e acompanhe o crescimento da clínica</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-background-card border border-border-card rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => changeMonth(-1)} className="p-2.5 hover:bg-border-card transition-colors text-text-secondary">
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 py-2 text-sm font-bold text-text-primary min-w-[140px] text-center uppercase tracking-widest">
              {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
            </div>
            <button onClick={() => changeMonth(1)} className="p-2.5 hover:bg-border-card transition-colors text-text-secondary">
              <ChevronRight size={20} />
            </button>
          </div>

          {isEditing ? (
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-accent-primary text-background-app px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20"
            >
              <Save size={18} />
              Salvar Metas
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-background-card border border-border-card px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-border-card transition-all text-text-primary"
            >
              <Edit3 size={18} />
              Editar Metas
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metasCards.map((meta, i) => {
          const percent = meta.meta > 0 ? Math.min(Math.round((meta.atual / meta.meta) * 100), 100) : 0;
          
          return (
            <motion.div
              key={meta.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-3xl space-y-8 relative overflow-hidden group"
            >
              <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 opacity-10", meta.color.replace('text-', 'bg-'))} />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <div className={cn("p-4 rounded-2xl border border-border-card/50 shadow-sm", meta.bg)}>
                    <meta.icon size={24} className={meta.color} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-lg">{meta.title}</h3>
                    <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Progresso Mensal</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("text-3xl font-black italic", meta.color)}>{percent}%</span>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  <span>Atual: <span className="text-text-primary">{meta.isCurrency ? formatCurrency(meta.atual) : formatNumber(meta.atual)}</span></span>
                  <span>Meta: <span className="text-text-primary">{meta.isCurrency ? formatCurrency(meta.meta) : formatNumber(meta.meta)}</span></span>
                </div>
                <div className="h-4 bg-background-app/50 rounded-full overflow-hidden border border-border-card/50 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={cn("h-full rounded-full shadow-sm", meta.color.replace('text-', 'bg-'))}
                  />
                </div>
              </div>

              {isEditing && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 pt-6 border-t border-border-card/50 relative z-10"
                >
                  <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3 block">Definir Novo Objetivo</label>
                  <div className="relative">
                    {meta.isCurrency && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-bold text-sm">R$</span>}
                    <input 
                      type="number"
                      value={formData[`meta_${meta.id}` as keyof typeof formData]}
                      onChange={(e) => setFormData({...formData, [`meta_${meta.id}`]: Number(e.target.value)})}
                      className={cn(
                        "w-full bg-background-app border border-border-card rounded-xl py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all",
                        meta.isCurrency ? "pl-10 pr-4" : "px-4"
                      )}
                      placeholder="0"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-8 rounded-3xl border-l-4 border-l-accent-alert">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-accent-alert/10 text-accent-alert">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Análise de Performance</h3>
            <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Insights do Dashboard</p>
          </div>
        </div>
        <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
          <p>
            Com base no ritmo atual de captação de leads ({currentKpis.totalLeads} até agora), a projeção indica que a meta de {metasCards[0].meta} leads 
            {currentKpis.totalLeads >= metasCards[0].meta ? ' já foi superada!' : ' será atingida em breve.'}
          </p>
          <p>
            A taxa de conversão de leads para clientes fechados está em 
            <span className="font-bold text-text-primary mx-1">
              {currentKpis.totalLeads > 0 ? ((currentKpis.totalClientes / currentKpis.totalLeads) * 100).toFixed(1) : 0}%
            </span>. 
            Mantenha o foco no registro de contatos para garantir que nenhum lead esfrie no pipeline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Metas;

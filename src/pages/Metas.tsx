import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, CheckCircle2, DollarSign, Calendar, AlertCircle, Save, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMetas } from '../hooks/useMetas';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente para Barra de Progresso Circular
const CircularProgress = ({ percent, colorClass, size = 160, strokeWidth = 16 }: { percent: number, colorClass: string, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border-card opacity-20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          className={colorClass}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={cn("text-4xl font-black italic", colorClass)}>{percent}%</span>
      </div>
    </div>
  );
};

const Metas: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const { meta, upsertMeta } = useMetas(format(selectedMonth, 'yyyy-MM'));
  const { kpis: currentKpis } = useDashboard(selectedMonth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    meta_consultas: 0,
    meta_clientes: 0,
    meta_faturamento: 0
  });

  useEffect(() => {
    if (meta) {
      setFormData({
        meta_consultas: meta.meta_consultas || 0,
        meta_clientes: meta.meta_clientes || 0,
        meta_faturamento: meta.meta_faturamento || 0
      });
    } else {
      setFormData({
        meta_consultas: 0,
        meta_clientes: 0,
        meta_faturamento: 0
      });
    }
  }, [meta]);

  const handleSave = async () => {
    // Manter as metas que não estão mais visíveis com o valor original para não zerá-las no BD
    const dataToSave = {
      ...meta,
      meta_consultas: formData.meta_consultas,
      meta_clientes: formData.meta_clientes,
      meta_faturamento: formData.meta_faturamento
    };
    // @ts-ignore - limpando campos desnecessários para upsert
    delete dataToSave.id; delete dataToSave.criado_em; delete dataToSave.mes_ano; delete dataToSave.business_id;

    const success = await upsertMeta(format(selectedMonth, 'yyyy-MM'), dataToSave);
    if (success) {
      setIsEditing(false);
    }
  };

  const metasCards = useMemo(() => [
    { 
      id: 'consultas', 
      title: 'Consultas Realizadas', 
      subtitle: 'Comparecimentos Reais',
      atual: currentKpis.totalConsultasRealizadas || 0, 
      meta: formData.meta_consultas, 
      icon: Calendar, 
      color: 'text-accent-primary',
      bg: 'bg-accent-primary/10',
      isPrimary: true
    },
    { 
      id: 'clientes', 
      title: 'Tratamentos Fechados', 
      subtitle: 'Novos Pacientes',
      atual: currentKpis.totalClientes, 
      meta: formData.meta_clientes, 
      icon: CheckCircle2, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    { 
      id: 'faturamento', 
      title: 'Faturamento Bruto', 
      subtitle: 'Receita Gerada',
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
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-accent-primary/20 text-accent-primary rounded-2xl shadow-inner">
            <Target size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Metas de Resultado</h1>
            <p className="text-sm text-text-secondary mt-1">Foque nas métricas primordiais para o crescimento da clínica.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-background-app border border-border-card rounded-2xl overflow-hidden shadow-sm">
            <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-border-card transition-colors text-text-secondary">
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 py-2 text-sm font-bold text-text-primary min-w-[140px] text-center uppercase tracking-widest">
              {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
            </div>
            <button onClick={() => changeMonth(1)} className="p-3 hover:bg-border-card transition-colors text-text-secondary">
              <ChevronRight size={20} />
            </button>
          </div>

          {isEditing ? (
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-accent-primary text-background-app px-6 py-3 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20"
            >
              <Save size={18} />
              Salvar Metas
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-background-card border border-border-card px-6 py-3 rounded-2xl font-bold text-sm hover:bg-border-card transition-all text-text-primary shadow-sm"
            >
              <Edit3 size={18} />
              Editar Metas
            </button>
          )}
        </div>
      </div>

      {/* Primary Goal Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {metasCards.map((meta, i) => {
          const percent = meta.meta > 0 ? Math.min(Math.round((meta.atual / meta.meta) * 100), 100) : 0;
          const isPrimary = meta.isPrimary;
          
          return (
            <motion.div
              key={meta.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "glass-card p-8 rounded-3xl relative overflow-hidden group flex flex-col items-center text-center",
                isPrimary ? "lg:col-span-3 lg:flex-row lg:text-left lg:justify-between lg:p-12 border-2 border-accent-primary/20" : ""
              )}
            >
              <div className={cn("absolute inset-0 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10", meta.bg)} />
              
              <div className={cn("flex flex-col", isPrimary ? "lg:w-1/2" : "w-full items-center mb-8")}>
                <div className={cn("p-4 rounded-2xl inline-flex shadow-sm mb-6", meta.bg, isPrimary ? "w-16 h-16 items-center justify-center" : "")}>
                  <meta.icon size={isPrimary ? 32 : 28} className={meta.color} />
                </div>
                
                <h3 className={cn("font-black text-text-primary", isPrimary ? "text-4xl mb-2" : "text-2xl mb-1")}>{meta.title}</h3>
                <p className="text-sm text-text-tertiary font-bold uppercase tracking-widest">{meta.subtitle}</p>

                {isPrimary && (
                  <div className="mt-8 p-4 bg-background-app rounded-2xl border border-border-card/50 flex items-center gap-4 max-w-sm">
                    <div className="p-2 bg-accent-secondary/10 text-accent-secondary rounded-lg">
                      <TrendingUp size={20} />
                    </div>
                    <div className="text-sm text-text-secondary leading-snug">
                      Focar nas <strong className="text-text-primary">Consultas Realizadas</strong> é o fator que mais impacta a conversão final de vendas.
                    </div>
                  </div>
                )}
              </div>

              <div className={cn("flex flex-col items-center relative z-10", isPrimary ? "" : "w-full")}>
                <CircularProgress 
                  percent={percent} 
                  colorClass={meta.color} 
                  size={isPrimary ? 240 : 180} 
                  strokeWidth={isPrimary ? 24 : 16} 
                />
                
                <div className="flex gap-8 mt-8 w-full justify-center">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Atual</p>
                    <p className="text-xl font-bold text-text-primary">
                      {meta.isCurrency ? formatCurrency(meta.atual) : formatNumber(meta.atual)}
                    </p>
                  </div>
                  <div className="w-px bg-border-card h-12"></div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Meta</p>
                    <p className="text-xl font-bold text-text-primary">
                      {meta.isCurrency ? formatCurrency(meta.meta) : formatNumber(meta.meta)}
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={cn("mt-6 w-full relative z-10", isPrimary ? "max-w-xs" : "")}
                  >
                    <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3 block text-center">Definir Novo Objetivo</label>
                    <div className="relative">
                      {meta.isCurrency && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-bold text-sm">R$</span>}
                      <input 
                        type="number"
                        value={formData[`meta_${meta.id}` as keyof typeof formData]}
                        onChange={(e) => setFormData({...formData, [`meta_${meta.id}`]: Number(e.target.value)})}
                        className={cn(
                          "w-full bg-background-app border border-border-card rounded-xl py-3 text-sm font-bold text-text-primary text-center outline-none focus:border-accent-primary transition-all",
                          meta.isCurrency ? "pl-10" : ""
                        )}
                        placeholder="0"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-8 rounded-3xl border-l-4 border-l-accent-primary/50 mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="p-3 rounded-xl bg-background-app border border-border-card text-text-primary">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Visão de Performance</h3>
            <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Insights do Funil</p>
          </div>
        </div>
        <div className="space-y-4 text-text-secondary leading-relaxed text-sm relative z-10 max-w-3xl">
          <p>
            As consultas realizadas são a métrica de ouro. Com {currentKpis.totalConsultasRealizadas} consultas já executadas, a projeção indica que a meta de {metasCards[0].meta} consultas 
            {currentKpis.totalConsultasRealizadas >= metasCards[0].meta ? ' já foi atingida e superada! Excelente trabalho na confirmação de agenda.' : ' está a caminho de ser atingida. Reforce as mensagens de lembrete 24h antes.'}
          </p>
          <p>
            Atualmente, a taxa de fechamento após a consulta está em 
            <span className="font-bold text-text-primary mx-1">
              {currentKpis.totalConsultasRealizadas > 0 ? ((currentKpis.totalClientes / currentKpis.totalConsultasRealizadas) * 100).toFixed(1) : 0}%
            </span> 
            (Tratamentos fechados / Consultas realizadas). Focar na qualidade do atendimento presencial garantirá que você alcance a meta de faturamento de {formatCurrency(metasCards[2].meta)}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Metas;
